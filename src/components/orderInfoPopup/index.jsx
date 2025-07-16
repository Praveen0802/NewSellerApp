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
  // Example usage in your parent component
  const orderData = [
    {
      order_details: {
        order_id: 2589,
        order_date: "2022-09-12T08:51:55.000000Z",
        order_status: 1,
        ticket_types: "E-Ticket",
        ticket_type_id: 2,
        delivered_by: null,
        days_in_event: "-",
      },
      address_details: {
        seller_id: 11,
        first_name: null,
        last_name: null,
        email: null,
        phone_number: null,
      },
      user_address_details: {
        id: 11,
        user_id: 11,
        first_name: "seo",
        last_name: "1boxoffice",
        country_code: "",
        phone_number: "3213214561",
        address: "MG Road",
        address_line2: null,
        address_line3: null,
        city: "1558",
        state: "17",
        zip_code: "560100",
        country: "101",
        address_type: "",
        primary_address: 1,
      },
      ticket_details: {
        description: "",
        venue: "Vodafone Arena",
        stadium_id: 248,
        match_date: "2023-05-26",
        match_time: "00:00",
        seat_category: "Away",
        ticket_types: "E-Ticket",
        ticket_type_id: 2,
        quantity: 2,
        ticket_price: 1,
        order_value: 2.2,
        currency_type: "GBP",
      },
      attendee_details: {
        booking_id: 2589,
        ticket_id: 2638,
        ticket_status: 2,
        ticket_file: "blog_medium_barc_jpg-1665220329.jpg",
        seat: null,
        serial: 2,
        ticket_upload_date: "2022-10-08 09:12:28",
        ticket_contact_number: null,
        email: "sivait28@gmail.com",
        phone: null,
      },
      listing_note: [
        {
          id: 7,
          name: "Concession Ticket - Child",
        },
      ],
      order_notes: null,
    },
  ];

  const [expandedVersion, setExpandedVersion] = useState(false);

  // Handle new array format data
  const data = orderData && orderData.length > 0 ? orderData[0] : null;

  if (!data) {
    return (
      <RightViewModal className={"!w-[600px]"} show={show} onClose={onClose}>
        <div className="p-4 text-center">
          <p>No order data available</p>
        </div>
      </RightViewModal>
    );
  }

  const {
    order_details,
    address_details,
    user_address_details,
    ticket_details,
    attendee_details,
    listing_note,
    order_notes,
  } = data;

  const ctaText = [
    { title: "Order Notes", cta: order_notes ? "View Note" : "+ Add Note" },
    {
      title: "Additional File",
      cta: attendee_details?.ticket_file ? "Download File" : "No File",
    },
  ];

  // Format order object for OrderValues component
  const orderObject = {
    order_id: order_details?.order_id,
    order_date: order_details?.order_date,
    order_status: order_details?.order_status === 1 ? "Active" : "Inactive",
    delivered_by: order_details?.delivered_by || "Not specified",
    days_to_event: order_details?.days_in_event,
    ticket_type: order_details?.ticket_types,
  };

  // Format customer details
  const customerName =
    user_address_details?.first_name && user_address_details?.last_name
      ? `${user_address_details.first_name} ${user_address_details.last_name}`
      : address_details?.first_name && address_details?.last_name
      ? `${address_details.first_name} ${address_details.last_name}`
      : "Not provided";

  const customerEmail =
    attendee_details?.email || address_details?.email || "Not provided";
  const mobileNumber =
    user_address_details?.phone_number ||
    address_details?.phone_number ||
    "Not provided";

  // Format benefits/restrictions from listing_note
  const benefits = listing_note?.map((note) => note.name) || [];

  const handleCollapseModal = () => {
    setExpandedVersion(!expandedVersion);
  };

  return (
    <RightViewModal className={"!w-[600px]"} show={show} onClose={onClose}>
      <div className={`w-[600px]`}>
        <div className={` overflow-auto rounded-md bg-white`}>
          <div className="flex items-center border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[24px]">
            <p className="text-[18px] text-[#323A70] ">
              Order ID: {order_details?.order_id}
            </p>
            <div className="flex items-center gap-2">
              <IconStore.close
                onClick={onClose}
                className="size-4 cursor-pointer stroke-[#130061]"
              />
            </div>
          </div>
          <div className="p-[24px] flex flex-col gap-4">
            {/* <CtaValues ctaText={ctaText} /> */}
            <div className={`flex ${expandedVersion ? "" : "flex-col "} gap-4`}>
              <div className={`${expandedVersion ? "w-1/2" : "w-full"}`}>
                <OrderValues orderObject={orderObject} />
              </div>
              <div className={`${expandedVersion ? "w-1/2 h-full" : "w-full"}`}>
                <CustomerDetails
                  customerEmail={customerEmail}
                  customerName={customerName}
                  mobileNumber={mobileNumber}
                />
              </div>
            </div>
            <OrderedTickets ticket_details={ticket_details} />
            {benefits.length > 0 && (
              <Benifits benefits_restrictions={benefits} />
            )}
          </div>
        </div>
      </div>
    </RightViewModal>
  );
};

export default OrderInfo;
