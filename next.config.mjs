// next.config.mjs
const nextConfig = {
  env: {
    API_BASE_URL: "https://seller.listmyticket.com/seller",
    DOMAIN_KEY:
      "Y7K9DzQDttNcQR4Pw+KTpE63M3LzUNB8Zql5MBL21T76E3gVHmWuSV+eKTJxp1z9",
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
