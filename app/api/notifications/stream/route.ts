import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/stream
 * Server-Sent Events pour les notifications in-app en temps réel.
 * Compatible Vercel (polling SSE — pas de WebSocket persistant).
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return new Response(
      JSON.stringify(createError(ErrorCode.UNAUTHORIZED, "Non authentifié")),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  let lastCheck = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      // Envoyer les notifications non lues au démarrage
      try {
        const initialNotifs = await prisma.notification.findMany({
          where: { user_id: userId, read_at: null },
          orderBy: { created_at: "desc" },
          take: 20,
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialNotifs)}\n\n`)
        );

        // Polling toutes les 10 secondes
        const interval = setInterval(async () => {
          try {
            const newNotifs = await prisma.notification.findMany({
              where: {
                user_id: userId,
                read_at: null,
                created_at: { gt: lastCheck },
              },
              orderBy: { created_at: "desc" },
            });

            lastCheck = new Date();

            if (newNotifs.length > 0) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(newNotifs)}\n\n`)
              );
            } else {
              // Heartbeat pour garder la connexion vivante
              controller.enqueue(encoder.encode(": ping\n\n"));
            }
          } catch {
            controller.enqueue(encoder.encode(": error\n\n"));
          }
        }, 10_000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          try { controller.close(); } catch {}
        });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
