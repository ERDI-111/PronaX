/**
 * Error codes the Google sign-in routes send back to /kycu as ?error=<code>,
 * with the message shown to the visitor. Plain data so both the server routes
 * and the login page can import it.
 */
export const GOOGLE_AUTH_ERRORS = {
  google_not_configured:
    'Kyçja me Google nuk është aktivizuar ende në këtë faqe. Administratori duhet të shtojë GOOGLE_CLIENT_ID dhe GOOGLE_CLIENT_SECRET në konfigurim. Ndërkohë mund të kyçeni me email dhe fjalëkalim.',
  google_config_invalid:
    'Konfigurimi i Google nuk është i saktë: GOOGLE_CLIENT_ID duhet të jetë ID-ja e klientit OAuth që mbaron me .apps.googleusercontent.com.',
  google_credentials_rejected:
    'Google refuzoi kredencialet e aplikacionit. Administratori duhet të kontrollojë GOOGLE_CLIENT_ID dhe GOOGLE_CLIENT_SECRET.',
  google_cancelled: 'Kyçja me Google u anulua. Mund të provoni përsëri.',
  google_session_expired:
    'Seanca e kyçjes me Google skadoi ose nuk u njoh. Ju lutem klikoni përsëri "Vazhdo me Google".',
  google_email_unverified:
    'Adresa email e kësaj llogarie Google nuk është e verifikuar. Verifikojeni te Google dhe provoni përsëri.',
  google_failed: 'Kyçja me Google dështoi. Ju lutem provoni përsëri pas pak.',
} as const;

export type GoogleAuthErrorCode = keyof typeof GOOGLE_AUTH_ERRORS;

export function getGoogleAuthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return Object.prototype.hasOwnProperty.call(GOOGLE_AUTH_ERRORS, code)
    ? GOOGLE_AUTH_ERRORS[code as GoogleAuthErrorCode]
    : null;
}
