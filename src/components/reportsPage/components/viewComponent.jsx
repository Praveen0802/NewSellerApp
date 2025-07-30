import Image from "next/image";
import React, { useState } from "react";
import plus from "../../../../public/plus.svg";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const ViewComponent = ({ item, onClick, hidePlus = false }) => {
  const [tooltipVisible, setTooltipVisible] = useState(null);

  const keyValues = [
    { key: "Pending Delivery", value: item?.keys?.pendingDelivery },
    { key: "Pending Payment", value: item?.keys?.pendingPayment },
    { key: "Total Revenue", value: item?.keys?.totalRevenue },
  ];

  return (
    <div className="p-4 border-[1px] border-[#eaeaf1] rounded-md flex flex-col gap-2">
      <div className="flex justify-between items-center pb-4 border-b-[1px] border-[#eaeaf1]">
        <div className="flex gap-2 items-center">
          <Image src={item?.icon} width={40} height={40} alt="logo" />
          <div className="flex flex-col">
            <p className="text-[20px] font-semibold">{item?.amount}</p>
            <p className="text-[#6A7097] text-[12px] font-normal">
              {item?.balance}
            </p>
          </div>
        </div>
        {!hidePlus && (
          <div
            onClick={() => onClick(item)}
            className="p-[8px] cursor-pointer rounded-md bg-[#F2F5FD]"
          >
            <Image
              src={plus}
              width={18}
              height={18}
              alt="plus"
              loading={"eager"}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {keyValues?.map((item, index) => {
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <p
                  className={`text-[#6A7097] w-[100px] text-[12px] font-normal`}
                >
                  {item?.key}
                </p>

                {/* <div className="relative">
                  <button
                    className="cursor-pointer"
                    onMouseEnter={() => setTooltipVisible(index)}
                    onMouseLeave={() => setTooltipVisible(null)}
                  >
                    <IconStore.exclamatory className="size-4 stroke-[#6A7097]" />
                  </button>

                  {tooltipVisible === index && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-max z-10">
                      {`${item?.key}: ${item?.value}`}
                    </div>
                  )}
                </div> */}
              </div>
              <p
                className={`${
                  item?.hold ? "text-[#E93042]" : "text-[#343432]"
                } text-[12px] font-semibold`}
              >
                {item?.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewComponent;
