/** The business WhatsApp number, digits only (country code first), as wa.me expects. */
export const WHATSAPP_NUMBER = '923077139528';

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
