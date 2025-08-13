import ukFlag from "../../../../../public/uk.svg";
import usFlag from "../../../../../public/us.svg";
import euFalg from "../../../../../public/eu.svg";
import Flag from "../../../../../public/flag.svg";
import ViewComponent from "@/components/reportsPage/components/viewComponent";
// import ViewComponent from "./ViewComponent";

const WalletOverview = (data) => {
  // Mock flag images (you'd replace these with your actual flag imports)
  const flagMap = {
    GBP: ukFlag,
    USD: usFlag,
    EUR: euFalg,
    AED: Flag,
  };


  const apiData = data?.txPay?.data || [];

  // const apiData = {
  //   overview: [
  //     {
  //       currency: "GBP",
  //       balance_amount: "£ 0.00",
  //       pending_orders: "0",
  //       pending_amount: "£ 300.00",
  //       confirmed_orders: "0",
  //     },
  //     {
  //       currency: "USD",
  //       balance_amount: "$ 0.00",
  //       pending_orders: "0",
  //       pending_amount: "$ 10.00",
  //       confirmed_orders: "0",
  //     },
  //     {
  //       currency: "EUR",
  //       balance_amount: "€ 0.00",
  //       pending_orders: "0",
  //       pending_amount: "€ 0.00",
  //       confirmed_orders: "0",
  //     },
  //     {
  //       currency: "AED",
  //       balance_amount: "د.إ 0.00",
  //       pending_orders: "0",
  //       pending_amount: "د.إ 1,000.00",
  //       confirmed_orders: "0",
  //     },
  //   ],
  // };

  const values = apiData.overview?.map((item) => {
    return {
      icon: flagMap[item.currency],
      amount: item.available_fund, // Changed from balance_amount to available_fund
      balance: "Available Fund",
      keys: {
        pendingDelivery: item?.pending_fund, // This is correct
        
      },
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {values?.map((item, index) => (
          <ViewComponent
            key={index}
            item={item}
            hidePlus={true} // This hides the plus button
          />
        ))}
      </div>
    </div>
  );
};

export default WalletOverview;
