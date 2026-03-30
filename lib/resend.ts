import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY manquant");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@noscoins.app";

/** Confirmation de réservation */
export async function sendBookingConfirmed(to: string, data: {
  clientName: string;
  venueName: string;
  eventDate: string;
  totalPrice: number;
  currency: string;
  bookingId: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Réservation confirmée — ${data.venueName}`,
    html: `
      <h2>Votre réservation est confirmée !</h2>
      <p>Bonjour ${data.clientName},</p>
      <p>Votre réservation pour <strong>${data.venueName}</strong> le <strong>${data.eventDate}</strong> est confirmée.</p>
      <p>Montant total : <strong>${data.totalPrice} ${data.currency}</strong></p>
      <p>Référence : <code>${data.bookingId}</code></p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}

/** Paiement reçu */
export async function sendPaymentReceived(to: string, data: {
  name: string;
  amount: number;
  currency: string;
  bookingId: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Paiement reçu — ${data.amount} ${data.currency}`,
    html: `
      <h2>Paiement reçu</h2>
      <p>Bonjour ${data.name},</p>
      <p>Nous avons bien reçu votre paiement de <strong>${data.amount} ${data.currency}</strong>.</p>
      <p>Référence réservation : <code>${data.bookingId}</code></p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}

/** Nouveau devis reçu (propriétaire) */
export async function sendNewQuote(to: string, data: {
  ownerName: string;
  venueName: string;
  clientName: string;
  eventDate: string;
  quoteId: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Nouvelle demande de devis — ${data.venueName}`,
    html: `
      <h2>Nouvelle demande de devis</h2>
      <p>Bonjour ${data.ownerName},</p>
      <p><strong>${data.clientName}</strong> souhaite réserver <strong>${data.venueName}</strong> pour le <strong>${data.eventDate}</strong>.</p>
      <p>Connectez-vous pour répondre sous 48h.</p>
      <p>Référence : <code>${data.quoteId}</code></p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}

/** Espace validé par l'admin */
export async function sendVenueValidated(to: string, data: {
  ownerName: string;
  venueName: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Votre espace "${data.venueName}" est validé !`,
    html: `
      <h2>Votre espace est validé</h2>
      <p>Bonjour ${data.ownerName},</p>
      <p>Votre espace <strong>${data.venueName}</strong> a été validé par notre équipe. Vous pouvez maintenant le publier.</p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}

/** Compte suspendu */
export async function sendAccountSuspended(to: string, data: {
  name: string;
  reason: string;
  until?: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Votre compte Noscoins a été suspendu",
    html: `
      <h2>Compte suspendu</h2>
      <p>Bonjour ${data.name},</p>
      <p>Votre compte a été suspendu${data.until ? ` jusqu'au <strong>${data.until}</strong>` : ""} pour le motif suivant :</p>
      <blockquote>${data.reason}</blockquote>
      <p>Pour contacter le support : support@noscoins.app</p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}

/** Lock expiré */
export async function sendLockExpired(to: string, data: {
  clientName: string;
  venueName: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Votre réservation de "${data.venueName}" a expiré`,
    html: `
      <h2>Créneau expiré</h2>
      <p>Bonjour ${data.clientName},</p>
      <p>Votre réservation temporaire pour <strong>${data.venueName}</strong> a expiré faute de paiement dans le délai imparti.</p>
      <p>Vous pouvez recommencer votre réservation sur noscoins.app.</p>
      <p>— L'équipe Noscoins</p>
    `,
  });
}
