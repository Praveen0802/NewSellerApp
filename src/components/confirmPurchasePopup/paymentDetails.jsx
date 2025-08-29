import Image from "next/image";
import React from "react";
import roundedChevron from "../../../public/rounded-chevron.svg";
import netBankingSupports from "../../../public/netBankingSupports.svg";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import { useDispatch, useSelector } from "react-redux";

const PaymentDetails = ({
  data,
  handlePaymentChange,
  selectedPayment,
  paymentDetails,
}) => {
  const dispatch = useDispatch();
  const { userRoles } = useSelector((state) => state.common);
  const isLmtPayAccessable = userRoles?.permission?.filter(
    (item) => item?.name == "lmt-pay" && item.is_can_access == 1
  );
  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const linkedCards = paymentDetails?.[1]?.linked_cards || [];
  const radioButtonFields = [
    {
      name: "SB Pay",
      component: (
        <div className="flex gap-4 items-center">
          <p className="text-[12px] text-gray-700">
            Available Balance:{" "}
            <b>
              {paymentDetails?.[0]?.wallet?.currencyIcons}
              {paymentDetails?.[0]?.wallet?.amount}
            </b>
          </p>
          {isLmtPayAccessable?.length > 0 && (
            <button
              onClick={() => {
                handleOpenAddWalletPopup();
              }}
              className="flex gap-2 bg-[#F0F1F5] cursor-pointer rounded-md py-[2px] px-[5px] items-center"
            >
              <Image src={roundedChevron} width={12} height={12} alt="logo" />
              <p className="text-[12px] font-normal">Deposit</p>
            </button>
          )}
        </div>
      ),
    },
    // ...linkedCards.map((item) => ({
    //   name: `${
    //     item.RecurringDetail.paymentMethodVariant === "mc"
    //       ? "Mastercard"
    //       : item.RecurringDetail.paymentMethodVariant === "visacredit"
    //       ? "Visa"
    //       : item.RecurringDetail.paymentMethodVariant === "amex"
    //       ? "American Express"
    //       : item.RecurringDetail.paymentMethodVariant
    //   } ****${item.RecurringDetail.card.number}`,
    //   component: (
    //     <div className="flex items-center">
    //       <img
    //         src={`https://cdf6519016.cdn.adyen.com/checkoutshopper/images/logos/${item.RecurringDetail.variant}.svg`}
    //         alt="Card Image"
    //         style={{ width: "50px", height: "auto", margin: "0 10px" }}
    //       />
    //       <p className="text-[12px] text-gray-700">
    //         **** **** **** {item.RecurringDetail.card.number}
    //       </p>
    //     </div>
    //   ),
    //   field: item,
    // })),
    {
      name: "New Credit or Debit Card",
      component: (
        <Image src={netBankingSupports} width={119} height={20} alt="logo" />
      ),
    },
  ];

  return (
    <div className="border border-gray-200 rounded-md">
      <p className="px-4 py-2 border-b border-gray-200 text-[14px] font-medium">
        Payment
      </p>
      <div>
        {radioButtonFields?.map((field, index) => (
          <label
            key={index}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
              index !== radioButtonFields?.length - 1
                ? "border-b border-gray-200"
                : ""
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                className="w-3 h-3 text-gray-600 cursor-pointer"
                checked={selectedPayment?.name === field?.name}
                onChange={() => handlePaymentChange(field)}
              />
              <div className="ml-3 flex items-center">
                <span className="text-gray-900 text-[13px] font-medium">
                  {field?.name}
                </span>
              </div>
            </div>
            {field?.component && (
              <div className="ml-auto">{field?.component}</div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentDetails;
