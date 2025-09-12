// next.config.mjs
const nextConfig = {
  env: {
    API_BASE_URL: "https://d3b3e0ab3951.ngrok-free.app/seller",
    DOMAIN_KEY:
      "jgcvdp9FwDg94kpEQY9yb9nnlOGW39srytB7YTOXHb1jnWfPf1za8Dr0FVqrM0BK",
    STRIPE_PUBLIC_KEY:
      process.env.NODE_ENV == "production"
        ? "pk_live_IKzWdgpARbjYumu6uSmtAE3V00PCBYRSbZ"
        : "pk_test_2OILO1IBPQEElum3BhNRLnqZ00w9hwCz6b",
    STRIPE_KEY_EUR:
      process.env.NODE_ENV == "production"
        ? "pk_live_IKzWdgpARbjYumu6uSmtAE3V00PCBYRSbZ"
        : "pk_test_2OILO1IBPQEElum3BhNRLnqZ00w9hwCz6b",
    STRIPE_KEY_GBP:
      process.env.NODE_ENV == "production"
        ? "pk_live_l17EQhnpfCmu0t7Wr7BJlU5Y"
        : "pk_test_2OILO1IBPQEElum3BhNRLnqZ00w9hwCz6b",
  },

  // Add the rewrites configuration using ES module syntax
  async rewrites() {
    return [
      {
        source: "/api/adyen/:path*",
        destination: "https://checkoutshopper-test.adyen.com/:path*",
      },
    ];
  },
};

export default nextConfig;
