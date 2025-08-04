// next.config.mjs
const nextConfig = {
  env: {
    API_BASE_URL: "https://seller.listmyticket.com/seller",
    DOMAIN_KEY:
      "jgcvdp9FwDg94kpEQY9yb9nnlOGW39srytB7YTOXHb1jnWfPf1za8Dr0FVqrM0BK",
    STRIPE_PUBLIC_KEY: "pk_test_2OILO1IBPQEElum3BhNRLnqZ00w9hwCz6b",
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
