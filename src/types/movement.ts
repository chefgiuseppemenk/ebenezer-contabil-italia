export interface Movement {
  id: string;
  tipo: "entrata" | "uscita";
  settore: string;
  metodo_pagamento: string;
  descrizione: string;
  importo: number;
  categoria: string;
  data: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  donazioni: "Donazioni",
  affitto: "Affitto",
  utenze: "Utenze",
  stipendi: "Stipendi",
  forniture: "Forniture",
  manutenzione: "Manutenzione",
  eventi: "Eventi",
  altro: "Altro",
};

export const SETTORE_LABELS: Record<string, string> = {
  bar: "Bar",
  libreria: "Libreria",
  decima_offerta: "Decima/Offerta",
};

export const METODO_LABELS: Record<string, string> = {
  sumup: "Sumup",
  contanti: "Contanti",
  paypal: "PayPal",
};
