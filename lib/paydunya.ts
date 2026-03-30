/**
 * Client PayDunya — Paiement Avec Redirection (PAR)
 * Documentation : https://paydunya.com/docs
 *
 * Flux :
 *  1. initiatePaydunyaPayment() → crée une facture, renvoie token + checkout_url
 *  2. Rediriger le client vers checkout_url
 *  3. PayDunya appelle PAYDUNYA_IPN_URL (POST) après paiement
 *  4. verifyPaydunyaIpn() confirme le statut via l'API
 */

const MASTER_KEY  = process.env.PAYDUNYA_MASTER_KEY!;
const PUBLIC_KEY  = process.env.PAYDUNYA_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY!;
const TOKEN       = process.env.PAYDUNYA_TOKEN!;
const MODE        = process.env.PAYDUNYA_MODE ?? "test"; // "test" | "live"

const BASE_URL =
  MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

const CHECKOUT_BASE =
  MODE === "live"
    ? "https://app.paydunya.com/checkout-invoice/confirm"
    : "https://app.paydunya.com/sandbox/checkout-invoice/confirm";

/** Headers communs exigés par l'API PayDunya */
function headers() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY":  MASTER_KEY,
    "PAYDUNYA-PUBLIC-KEY":  PUBLIC_KEY,
    "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
    "PAYDUNYA-TOKEN":       TOKEN,
  };
}

/** Plafonds BCEAO par opérateur (en FCFA) */
const OPERATOR_LIMITS: Record<string, number> = {
  orange_money: 1_000_000,
  mtn:          1_000_000,
  moov:           500_000,
  wave:         2_000_000,
};

export function checkPaydunyaLimit(amount: number, operator?: string): void {
  if (!operator) return;
  const limit = OPERATOR_LIMITS[operator];
  if (limit && amount > limit) {
    throw new Error(
      `Montant (${amount} FCFA) dépasse le plafond ${operator} (${limit} FCFA)`
    );
  }
}

export interface PaydunyaInitResponse {
  checkout_url:   string;
  token:          string;
  response_code:  string;
  response_text:  string;
}

/**
 * Crée une facture PAR et renvoie l'URL de paiement.
 */
export async function initiatePaydunyaPayment(params: {
  invoiceId:       string; // identifiant interne unique (booking-id + timestamp)
  amount:          number; // XOF — entier
  description:     string;
  customerName:    string;
  customerEmail?:  string;
  customerPhone:   string;
  returnUrl:       string;
  cancelUrl:       string;
  ipnUrl:          string;
  operator?:       string;
}): Promise<PaydunyaInitResponse> {
  checkPaydunyaLimit(params.amount, params.operator);

  const body = {
    invoice: {
      total_amount:  params.amount,
      description:   params.description,
    },
    store: {
      name:          "Noscoins",
      tagline:       "L'espace qui rassemble vos plus beaux moments.",
      postal_address: "noscoins.app",
    },
    actions: {
      cancel_url:    params.cancelUrl,
      return_url:    params.returnUrl,
      callback_url:  params.ipnUrl,
    },
    customer: {
      name:          params.customerName,
      phone:         params.customerPhone,
      ...(params.customerEmail ? { email: params.customerEmail } : {}),
    },
    custom_data: {
      invoice_id: params.invoiceId,
    },
  };

  const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify(body),
  });

  const data = await res.json();

  if (data.response_code !== "00") {
    throw new Error(`PayDunya erreur ${data.response_code}: ${data.response_text}`);
  }

  return {
    checkout_url:  `${CHECKOUT_BASE}/${data.token}`,
    token:         data.token,
    response_code: data.response_code,
    response_text: data.response_text,
  };
}

export interface PaydunyaIpnPayload {
  data: {
    bill: {
      hash:         string;
      status:       string; // "completed" | "pending" | "cancelled"
      total_amount: number;
      currency:     string;
      description:  string;
    };
    custom_data?: {
      invoice_id?: string;
    };
  };
}

/**
 * Confirme un paiement PayDunya via l'API (source de vérité).
 * À appeler depuis le webhook IPN — ne jamais faire confiance au payload seul.
 */
export async function verifyPaydunyaIpn(hash: string): Promise<{
  status:        string;
  total_amount:  number;
  currency:      string;
  invoice_id?:   string;
}> {
  const res = await fetch(`${BASE_URL}/checkout-invoice/confirm/${hash}`, {
    method:  "GET",
    headers: headers(),
  });

  const data = await res.json();

  if (data.response_code !== "00") {
    throw new Error(`PayDunya confirm erreur ${data.response_code}: ${data.response_text}`);
  }

  return {
    status:       data.status,
    total_amount: data.invoice?.total_amount ?? 0,
    currency:     data.invoice?.currency ?? "XOF",
    invoice_id:   data.custom_data?.invoice_id,
  };
}
