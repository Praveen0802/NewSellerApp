import React, { useState } from "react";
import FormFields from "../formFieldsComponent";
import { PriceUpdatewithQuantity } from "@/utils/apiHandler/request";

const PurchaseCard = ({
  data,
  selectedQuantity,
  setSelectedQuantity,
  totalAmount,
  setTotalAmount,
}) => {
  const { purchase = {} } = data;

  const [priceDetails, setPriceDetails] = useState(purchase?.price_breakdown);
  const handleChange = async (e, key) => {
    setSelectedQuantity(e);
    const response = await PriceUpdatewithQuantity("", data?.sNo, {
      currency: priceDetails?.currency,
      quantity: e,
    });
    setPriceDetails(response?.purchase?.price_breakdown);
 
    setTotalAmount(response?.purchase?.price_breakdown?.grand_total);
  };

  const quantityOptions = purchase?.split_list?.map((item) => {
    return {
      label: item,
      value: item,
    };
  });

  const listTotalView = [
    {
      key: "Quantity",
      component: (
        <div className="flex gap-4 items-center w-full">
          <FormFields
            formFields={[
              {
                type: "select",
                label: "Quantity",
                id: `quantity`,
                name: `quantity`,
                value: selectedQuantity || "",
                onChange: (e) => handleChange(e, "quantity"),
                className: `!py-1 !px-4 `,
                labelClassName: "!text-[12px] w-[50%] text-gray-600 block",
                placeholder: "DD",
                options: quantityOptions,
              },
            ]}
          />
          <p className="flex gap-1 whitespace-nowrap items-center">
            of {data?.quantity}
          </p>
        </div>
      ),
    },
    {
      key: "Ticket Price",
      value: priceDetails?.ticket_price,
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Subtotal",
      value: priceDetails?.sub_total,
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Service Fee",
      value: priceDetails?.service_fee || "0.00",
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Shipping",
      value: priceDetails?.shipping_fee || "0.00",
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Tax",
      value: priceDetails?.tax || "0.00",
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Payment Fee",
      value: priceDetails?.payment_fee || "0.00",
      // symbol: priceDetails?.currency_icon,
    },
    {
      key: "Total",
      value: priceDetails?.total_with_payment_fee,
      // symbol: priceDetails?.currency_icon,
    },
  ];
  return (
    <div className="border border-gray-200 rounded-md">
      <p className="px-4 py-2 border-b border-gray-200 text-[14px] font-medium">
        Review Purchase
      </p>
      <div className="p-4 flex flex-col gap-4">
        {listTotalView?.map((item, index) => {
          return (
            <div key={index} className="flex gap-4 items-center">
              <p className="text-[13px] w-[20%] font-normal text-gray-700">
                {item?.key}
              </p>
              <div
                className={`${
                  !item?.component && "bg-gray-300"
                }  flex items-center rounded-md w-[80%]`}
              >
                {item?.symbol && (
                  <p className="p-1 text-[13px] border-r-[0.5px] border-white">
                    {item?.symbol}
                  </p>
                )}
                {item?.component && item?.component}
                {item?.value && (
                  <p className="text-[13px] py-1 px-3">{item?.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseCard;
