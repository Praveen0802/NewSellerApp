import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState } from "react";
import Button from "../commonComponents/button";
import { convertSnakeCaseToCamelCase } from "@/utils/helperFunctions";
import Benifits from "../orderDetails/components/benifits";
import CustomModal from "../commonComponents/customModal";
import CtaValues from "../orderDetails/components/ctaValues";
import OrderValues from "../orderDetails/components/orderValues";
import CustomerDetails from "../orderDetails/components/customerDetails";
import OrderedTickets from "../orderDetails/components/orderedTickets";
import RightViewModal from "../commonComponents/rightViewModal";

const OrderInfo = ({ show, onClose }) => {
  const [expandedVersion, setExpandedVersion] = useState(false);
  const testingValues = {
    orderId: "6B1C74A9",
    date: "20/10/2024, 17:36:03",
    status: "Pending",
    deliverdBy: "24/10/2024",
    expectedPayoutDate: "09/11/2024",
    daysToevent: "24",
    customerName: "Customer Name",
    customerEmail: "hassanaliahmed727@gmail.com",
    eventName: "UFC 308 - Ilia Topuria vs d Max Holloway Abu Dhabi",
    venue: "Etihad Arena",
    eventDate: "26/10/2024",
    seatDetails: "Lower 105",
    ticketType: "E-ticket",
    quantity: "2",
    price: "£925.00",
    orderValue: "£925.00",
    benifits: [
      "Includes unlimited food and soft drinks",
      "VIP access 3 hours pre match",
      "Tickets yve you access to a private VIP bar",
      "VIP lounge access 1 hour post match",
      "12 Person Suite",
      "In-Seat Wait Service",
    ],
    billingAddress: "Manchester, GB",
    shippingAddress: "Manchester, GB",
  };
  const ctaText = [
    { title: "Order Notes", cta: "+ Add Note" },
    { title: "Additional File", cta: "Download File" },
  ];
  const {
    orderId,
    date,
    status,
    customerName,
    customerEmail,
    deliverdBy,
    daysToevent,
    expectedPayoutDate,
  } = testingValues;

  const orderObject = {
    order_id: orderId,
    order_date: date,
    order_status: status,
    delivery_by: deliverdBy,
    days_to_event: daysToevent,
    expected_payout_date: expectedPayoutDate,
  };

  const handleCollapseModal = () => {
    setExpandedVersion(!expandedVersion);
  };

  return (
    <RightViewModal
      className={"!w-[600px]"}
      show={show}
      onClose={onClose}
    >
      <div className={`w-[600px]`}>
        <div
          className={` overflow-auto rounded-md bg-white`}
        >
          <div className="flex items-center  border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[24px]">
            <p className="text-[18px] text-[#323A70] ">Order ID: {orderId}</p>
            <div className="flex items-center gap-2">
              
              <IconStore.close onClick={onClose} className="size-4 cursor-pointer stroke-[#130061]" />
            </div>
          </div>
          <div className="p-[24px] flex flex-col gap-4">
            <CtaValues ctaText={ctaText} />
            <div className={`flex ${expandedVersion ? "" : "flex-col "} gap-4`}>
              <div className={`${expandedVersion ? "w-1/2" : "w-full"}`}>
                <OrderValues orderObject={orderObject} />
              </div>
              <div className={`${expandedVersion ? "w-1/2 h-full" : "w-full"}`}>
                <CustomerDetails
                  customerEmail={customerEmail}
                  customerName={customerName}
                />
              </div>
            </div>
            <OrderedTickets testingValues={testingValues} />
            <Benifits testingValues={testingValues} />
          </div>
        </div>
      </div>
    </RightViewModal>
  );
};

export default OrderInfo;
