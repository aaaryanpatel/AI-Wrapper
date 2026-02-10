export const ALLOWED_DOMAIN = "@saskpolytech.ca";

export function isAllowedCollegeEmail(email) {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}
