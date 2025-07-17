import CurrencyOverview from "./CurrencyOverview";

const TXPay = (data) => {
  return (
    <div className="bg-white border-l-[1px] border-[#DADBE5] h-full">
      <div className="bg-[#F1F0FE] p-5">
        <p className="text-[18px] font-medium">TX Pay</p>
      </div>

      <div className="p-5">
        <CurrencyOverview data={data?.txPay} />
      </div>
    </div>
  );
};

export default TXPay;
