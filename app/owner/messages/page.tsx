"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  content: string | null;
  created_at: string;
  read_at: string | null;
  sender: { id: string; email: string; type: string };
  booking_id: string;
}

interface Booking {
  id: string;
  venue: { name: string };
  user: { email: string };
  status: string;
}

export default function OwnerMessagesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/bookings?role=owner")
      .then((r) => r.json())
      .then((d) => {
        const bs = (d.data ?? []).filter((b: Booking) => ["confirmed", "paid", "completed"].includes(b.status));
        setBookings(bs);
      });
    // Get own userId from token
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserId(d?.data?.userId));
  }, []);

  useEffect(() => {
    if (!selectedBookingId) return;
    fetch(`/api/messages?bookingId=${selectedBookingId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.data ?? []));
  }, [selectedBookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!content.trim() || !selectedBookingId) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: selectedBookingId, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((m) => [...m, data.data]);
      setContent("");
    }
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Messages
      </h1>

      <div className="flex gap-4 h-[600px]">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-2xl border border-[#ede7e0] overflow-y-auto flex-shrink-0">
          {bookings.length === 0 && (
            <p className="text-sm text-[#1A1410]/40 p-4">Aucune réservation active.</p>
          )}
          {bookings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBookingId(b.id)}
              className={`w-full text-left p-4 border-b border-[#ede7e0] last:border-0 hover:bg-[#FBF5F0] transition-colors ${
                selectedBookingId === b.id ? "bg-[#FBF5F0]" : ""
              }`}
            >
              <p className="text-sm font-medium text-[#1A1410] truncate">{b.venue?.name}</p>
              <p className="text-xs text-[#1A1410]/50 truncate">{b.user?.email}</p>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 bg-white rounded-2xl border border-[#ede7e0] flex flex-col">
          {!selectedBookingId ? (
            <div className="flex-1 flex items-center justify-center text-[#1A1410]/30 text-sm">
              Sélectionnez une réservation
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#ede7e0]">
                <p className="font-medium text-[#1A1410] text-sm">{selectedBooking?.venue?.name}</p>
                <p className="text-xs text-[#1A1410]/50">{selectedBooking?.user?.email}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isOwn = m.sender.id === userId;
                  return (
                    <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn ? "bg-[#C4622D] text-white rounded-br-sm" : "bg-[#FBF5F0] text-[#1A1410] rounded-bl-sm"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-[#ede7e0] flex gap-3">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="input flex-1 text-sm"
                  placeholder="Écrivez un message…"
                />
                <button onClick={sendMessage} className="btn-primary text-sm py-2 px-4">Envoyer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
