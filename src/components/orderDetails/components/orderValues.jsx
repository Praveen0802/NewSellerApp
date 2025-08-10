import { convertSnakeCaseToCamelCase } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";
import DisplayValues from "./displayValues";

const OrderValues = ({ 
  orderObject, 
  order_id_label = null, 
  ticketTypesList = [], 
  onTicketTypeChange = () => {} 
}) => {
  console.log(orderObject,'orderObject')
  return (
    <div className="border-[1px] border-[#E0E1EA] rounded-md">
      <p className="px-[16px] py-[12px] text-[16px] font-semibold text-[#343432] border-b-[1px] border-[#E0E1EA]">
        Order Details
      </p>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object?.entries(orderObject)?.map(([key, value], index) => {
          const copyKeys = key == "order_id";
          const orderStatusKey = key == "order_status";
          const deliveryKey = key == "delivery_by";
          
          return (
            <DisplayValues
              text={convertSnakeCaseToCamelCase(key)}
              copyKeys={copyKeys}
              orderStatusKey={orderStatusKey}
              orderObject={orderObject}
              deliveryKey={deliveryKey}
              ticketTypesList={ticketTypesList}
              onTicketTypeChange={onTicketTypeChange}
              value={key === "order_id" ? order_id_label || value : value}
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrderValues;