export const hideLeftMenuPages = [
  "/login",
  "/reset-password/token/[index]",
  "/verify-email/token/[index]",
  "/signup",
  "/kyc-verification",
];
export const hideHeaderPages = [
  "/login",
  "/reset-password/token/[index]",
  "/verify-email/token/[index]",
  "/signup",
  "/kyc-verification",
];

export const nonAuthRequiredAPI = [
  "/auth/login",
  "/auth/password/reset-request",
  "/auth/reset-password",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verify-email",
  "/settings/dialing-code",
  "/zoho-sign/embed",
  "/currencies",
  "/cities",
];

export const nonAuthRequiredPages = [
  "/reset-password/token/",
  "/verify-email/token/",
  "/signup",
];
