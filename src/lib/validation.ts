export type ContactField = "name" | "email" | "subject" | "message";
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

/**
 * Deliberately permissive. The job here is to catch an obvious slip before the
 * reader's mail client opens, not to adjudicate RFC 5322 — the only real test
 * of an address is whether mail to it arrives.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function validateContact(values: ContactValues): ContactErrors | null {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) errors.name = "Please add your name.";
  else if (name.length < 2) errors.name = "That looks too short to be a name.";

  if (!email) errors.email = "Please add an email address so I can reply.";
  else if (!EMAIL.test(email)) errors.email = "That address doesn't look right.";

  if (!subject) errors.subject = "Please add a subject.";
  else if (subject.length < 3) errors.subject = "Please add a little more detail.";

  if (!message) errors.message = "Please write a message.";
  else if (message.length < 10)
    errors.message = "Please write a bit more — at least a sentence.";

  return Object.keys(errors).length > 0 ? errors : null;
}
