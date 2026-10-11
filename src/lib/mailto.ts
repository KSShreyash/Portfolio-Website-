/**
 * Practical ceiling for a mailto: href.
 *
 * There is no spec limit, but Windows caps a shell-invoked URI around 2048
 * characters and several clients silently drop everything past it. Flagging a
 * long message is honest; letting the operating system quietly cut it in half
 * is not.
 */
export const MAILTO_LIMIT = 1800;

export interface MailtoInput {
  to: string;
  subject: string;
  body: string;
}

export interface MailtoResult {
  href: string;
  tooLong: boolean;
  length: number;
}

/**
 * Build a mailto href.
 *
 * `encodeURIComponent` rather than `URLSearchParams`: the latter is
 * form-encoding, which writes a space as "+" — correct for a query string,
 * wrong for a mail client, which shows the pluses to the reader.
 */
export function buildMailto({ to, subject, body }: MailtoInput): MailtoResult {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const href = `mailto:${to}?${query}`;
  return { href, tooLong: href.length > MAILTO_LIMIT, length: href.length };
}

/**
 * Practical ceiling for a Gmail compose URL. Browsers and Google both cope
 * with far more than a mailto, but not without limit.
 */
export const GMAIL_LIMIT = 7000;

/**
 * Build a Gmail web compose URL.
 *
 * `mailto:` only does anything for someone with a desktop mail client
 * registered with their operating system. For everyone else — which is most
 * people on a laptop — clicking send appears to do nothing at all. This opens
 * Gmail's compose window in the browser instead, with the message prefilled.
 *
 * Same `encodeURIComponent` reasoning as `buildMailto`: `URLSearchParams`
 * would write spaces as "+", and Gmail shows those to the reader verbatim.
 */
export function buildGmailCompose({
  to,
  subject,
  body,
}: MailtoInput): MailtoResult {
  const query = [
    "view=cm",
    "fs=1",
    `to=${encodeURIComponent(to)}`,
    `su=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(body)}`,
  ].join("&");
  const href = `https://mail.google.com/mail/?${query}`;
  return { href, tooLong: href.length > GMAIL_LIMIT, length: href.length };
}
