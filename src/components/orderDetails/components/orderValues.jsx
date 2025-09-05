import { convertSnakeCaseToCamelCase } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";
import DisplayValues from "./displayValues";

const OrderValues = ({
  orderObject,
  order_id_label = null,
  ticketTypesList = [],
  onTicketTypeChange = () => {},
  OrderValueObject = [], // Added this prop to receive the field definitions
}) => {

  // Function to format ISO date string to DD/MM/YYYY format
  const formatDeliveredByDate = (dateString) => {
    if (!dateString) return dateString;

    try {
      const date = new Date(dateString);
      // Check if it's a valid date
      if (isNaN(date.getTime())) return dateString;

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to get the formatted value based on the key
  const getFormattedValue = (key, value) => {
    if ( key == "payout_date") {
      return formatDeliveredByDate(value);
    }
    return value;
  };

  return (
    <div className="border-[1px] border-[#E0E1EA] rounded-md w-full">
      <p className="px-[12px] md:px-[16px] py-[12px] text-[14px] md:text-[16px] font-semibold text-[#343432] border-b-[1px] border-[#E0E1EA]">
        Order Details
      </p>
      
      {/* Mobile: Single column layout */}
      <div className="p-3 md:p-4 block md:hidden">
        <div className="space-y-4">
          {OrderValueObject?.map((fieldConfig, index) => {
            const { key, name } = fieldConfig;
            const value = orderObject[key];

            // Skip if the value doesn't exist in orderObject
            if (value === undefined || value === null) return null;

            const copyKeys = key === "order_id";
            const orderStatusKey = key === "order_status";
            const deliveryKey = key === "delivery_by";
            const formattedValue = getFormattedValue(key, value);

            return (
              <div key={index} className="w-full">
                <DisplayValues
                  text={name}
                  copyKeys={copyKeys}
                  orderStatusKey={orderStatusKey}
                  orderObject={orderObject}
                  deliveryKey={deliveryKey}
                  ticketTypesList={ticketTypesList}
                  onTicketTypeChange={onTicketTypeChange}
                  value={formattedValue}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop and Tablet: Two column grid layout */}
      <div className="p-4 hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {OrderValueObject?.map((fieldConfig, index) => {
            const { key, name } = fieldConfig;
            const value = orderObject[key];

            // Skip if the value doesn't exist in orderObject
            if (value === undefined || value === null) return null;

            const copyKeys = key === "order_id";
            const orderStatusKey = key === "order_status";
            const deliveryKey = key === "delivery_by";
            const formattedValue = getFormattedValue(key, value);

            return (
              <DisplayValues
                text={name}
                copyKeys={copyKeys}
                orderStatusKey={orderStatusKey}
                orderObject={orderObject}
                deliveryKey={deliveryKey}
                ticketTypesList={ticketTypesList}
                onTicketTypeChange={onTicketTypeChange}
                value={formattedValue}
                key={index}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderValues;