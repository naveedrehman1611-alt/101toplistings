/** Digits of a listing phone number left readable on the public site. */
const VISIBLE_DIGITS = 4;

/**
 * A listing's phone number with every digit after the first four (at most half
 * of them) replaced by a dot, e.g. "03077139416" → "0307 •••••••". Public reads
 * mask the number before it leaves the server, so the full number is in neither
 * the HTML nor the RSC payload. The owner dashboard and admin read the table
 * directly and keep it.
 */
export function maskPhone(phone: string | null | undefined): string | null {
  const value = phone?.trim();
  if (!value) return null;
  // Never more than half the digits, so even a short number is never whole.
  const visible = Math.min(VISIBLE_DIGITS, Math.floor(value.replace(/\D/g, '').length / 2));
  let seen = 0;
  let cut = -1;
  const masked = value.replace(/\d/g, (digit, index: number) => {
    seen += 1;
    if (seen === visible) cut = index + 1;
    return seen <= visible ? digit : '•';
  });
  // An unbroken run of digits reads better split where the dots begin.
  return cut > 0 && cut < masked.length && /^\d+$/.test(value)
    ? `${masked.slice(0, cut)} ${masked.slice(cut)}`
    : masked;
}
