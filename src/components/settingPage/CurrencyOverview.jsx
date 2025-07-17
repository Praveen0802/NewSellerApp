import { TrendingUp } from "lucide-react";

const CurrencyOverview = ({ data }) => {
  // Default data if none provided
  const defaultData = {
    success: true,
    data: {
      overview: [
        {
          currency: "GBP",
          available_fund: "£ 0.00",
          pending_fund: "£ 0.00",
          total_revenue: "£ 123,386.23",
          bank_account: [],
        },
        {
          currency: "USD",
          available_fund: "$ 0.00",
          pending_fund: "$ 0.00",
          total_revenue: "$ 150.00",
          bank_account: [],
        },
        {
          currency: "EUR",
          available_fund: "€ 0.00",
          pending_fund: "€ 0.00",
          total_revenue: "€ 9,871.63",
          bank_account: [],
        },
        {
          currency: "AED",
          available_fund: "د.إ 0.00",
          pending_fund: "د.إ 0.00",
          total_revenue: "د.إ 3,495.00",
          bank_account: [],
        },
      ],
    },
  };

  // Use provided data or default
  const apiData = data || defaultData;
  const currencyData = apiData.data?.overview || [];

  // Helper function to format currency values
  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return value.toString();
  };

  // Helper function to extract numeric value for calculations
  const getNumericValue = (currencyString) => {
    if (!currencyString) return 0;
    return parseFloat(currencyString.replace(/[^\d.-]/g, "")) || 0;
  };

  // Calculate total revenue across all currencies (for display purposes)
  const totalRevenue = currencyData.reduce((sum, currency) => {
    return sum + getNumericValue(currency.total_revenue);
  }, 0);

  if (!currencyData.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Currency Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">No currency data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Currency Overview
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {currencyData.length}{" "}
          {currencyData.length === 1 ? "currency" : "currencies"} available
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currencyData.map((currency, index) => (
            <div
              key={`${currency.currency}-${index}`}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currency.currency}
                </h3>
                <p className="text-sm text-gray-600">
                  {currency.bank_account?.length || 0} bank{" "}
                  {currency.bank_account?.length === 1 ? "account" : "accounts"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Fund</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(currency.available_fund)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Fund</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(currency.pending_fund)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Total Revenue
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(currency.total_revenue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyOverview;
