import React, { Fragment } from "react";
import DisplayValues from "./displayValues";

const OrderedTickets = ({ ticket_details }) => {
  if (!ticket_details) {
    return (
      <div className="border-[1px] border-[#E0E1EA] rounded-md">
        <p className="px-[16px] py-[12px] text-[16px] font-semibold text-[#343432] border-b-[1px] border-[#E0E1EA]">
          Tickets Ordered
        </p>
        <div className="p-4 text-center text-gray-500">
          No ticket details available
        </div>
      </div>
    );
  }

  // Helper function to clean price strings (remove currency symbols)
  const cleanPrice = (priceString) => {
    if (!priceString) return "0";
    return priceString.toString().replace(/[£$€]/g, "").trim();
  };

  const listingObject = [
    {
      name: "Event Name",
      text: ticket_details?.venue || "Not specified",
    },
    {
      name: "Event Venue",
      text: ticket_details?.venue || "Not specified",
    },
    {
      name: "Event Date",
      text: ticket_details?.match_date || "Not specified",
    },
    {
      name: "Event Time",
      text: ticket_details?.match_time || "Not specified",
    },
    {
      name: "Seat Details",
      text: ticket_details?.seat_category || "Not specified",
    },
    {
      values: [
        {
          name: "Ticket Type",
          text: ticket_details?.ticket_types || "Not specified",
        },
        {
          name: "Quantity",
          text: ticket_details?.quantity?.toString() || "0",
        },
      ],
      twoKeys: true,
    },
    {
      values: [
        {
          name: "Ticket Price",
          text:
            ticket_details?.ticket_price ||
            `${ticket_details?.currency_type || "GBP"} 0`,
        },
        {
          name: "Order Value",
          text:
            ticket_details?.order_value ||
            `${ticket_details?.currency_type || "GBP"} 0`,
        },
      ],
      twoKeys: true,
    },
  ];

  return (
    <div className="border-[1px] border-[#E0E1EA] rounded-md">
      <p className="px-[16px] py-[12px] text-[16px] font-semibold text-[#343432] border-b-[1px] border-[#E0E1EA]">
        Tickets Ordered
      </p>
      <div className="grid grid-cols-2 gap-4 p-4">
        {listingObject?.map((item, index) => {
          return (
            <Fragment key={index}>
              {item?.twoKeys ? (
                <div className="grid grid-cols-2 gap-4">
                  {item?.values?.map((valueItem, valueIndex) => {
                    return (
                      <DisplayValues
                        key={valueIndex}
                        text={valueItem?.name}
                        value={valueItem?.text}
                      />
                    );
                  })}
                </div>
              ) : (
                <DisplayValues text={item?.name} value={item?.text} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderedTickets;
