import Link from "next/link";
import WalletOverview from "./subjectDescriptionPopup/Txpay/WalletOverview";

const TXPayButton = () => {
  return (
    <button className="group inline-flex items-center text-white hover:text-white bg-[#343432] min-h-6  transition font-medium rounded text-sm px-2.5 py-0.5">
      <span
        className="mr-1.5 flex items-center justify-center fill-white"
        tabIndex="-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="11.455"
          viewBox="0 0 14 11.455"
          className="fill-white"
        >
          <path
            d="M12,11.455H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0H12a2,2,0,0,1,2,2v.227H3.182V3.5H14V5.091H5.091V6.364H14V7.955H7V9.228h7v.228A2,2,0,0,1,12,11.455Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <Link href="/reports/wallet">Go to SB Pay</Link>
    </button>
  );
};

const TXPay = (data) => {
  return (
    <div className="bg-white border-l-[1px] border-[#DADBE5] h-full">
      <div className="bg-gray-100 p-5 flex justify-between items-center cursor-pointer sticky top-0 z-10">
        <p className="text-[18px] font-medium">SB Pay</p>
        <TXPayButton />
      </div>

      <div className="p-5">
        <WalletOverview {...data} />
      </div>
    </div>
  );
};

export default TXPay;
