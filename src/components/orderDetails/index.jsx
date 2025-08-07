import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useEffect } from "react";
import Button from "../commonComponents/button";
import { convertSnakeCaseToCamelCase } from "@/utils/helperFunctions";
import OrderValues from "./components/orderValues";
import CustomerDetails from "./components/customerDetails";
import OrderedTickets from "./components/orderedTickets";
import Benifits from "./components/benifits";
import CustomModal from "../commonComponents/customModal";
import CtaValues from "./components/ctaValues";
import AttendeeDetails from "./components/attendeeDetails";
import PaymentOrderDetails from "./components/paymentOrderDetails";
import DownLoadYourTickets from "./components/downLoadYourTickets";

const OrderDetails = ({ show, onClose, data = {} }) => {
  const {
    order_details = {},
    customer_details = {},
    ticket_details = {},
    benefits_restrictions = [],
    attendee_details = [],
    payment_details = {},
    tickets = {},
  } = data;

  const [expandedVersion, setExpandedVersion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const orderId = order_details?.booking_no || order_details?.order_id;
  const ctaText = [
    { title: "Order Notes", cta: "+ Add Note" },
    { title: "Additional File", cta: "Download File" },
  ];

  const orderObject = {
    match_name: order_details?.match_name,
    match_date_time: order_details?.match_datetime,
    order_id: orderId,
    order_date: order_details?.booking_date,
    ticket_status: order_details?.ticket_status,
    order_status: order_details?.booking_status,
    delivery_by: order_details?.expected_ticket_delivery,
    days_to_event: order_details?.days_left_to_event,
  };

  const bookingId = order_details?.booking_status_id;

  const handleCollapseModal = () => {
    setIsTransitioning(true);
    setExpandedVersion(!expandedVersion);
    // Reset transitioning state after animation completes with a longer duration
    setTimeout(() => setIsTransitioning(false), 600);
  };

  return (
    <>
      <style>{`
        .scale-transition {
          animation: scale-zoom 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes scale-zoom {
          0% {
            transform: scale(expandedVersion ? 0.95 : 1);
          }
          70% {
            transform: scale(expandedVersion ? 1.01 : 0.99);
          }
          100% {
            transform: scale(1);
          }
        }

        .transition-custom {
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <CustomModal
        className={`transition-custom ${
          expandedVersion ? "w-full" : "w-full sm:w-[700px]"
        }`}
        show={show}
        onClose={onClose}
      >
        <div
          className={`transition-custom ${
            expandedVersion ? "w-full h-full" : "m-2 sm:m-4 "
          }`}
        >
          <div
            className={`
              transition-custom overflow-auto rounded-md bg-white
              ${
                expandedVersion
                  ? "w-full h-full"
                  : "max-w-[676px] max-md:h-[500px] md:max-h-[90vh]"
              }
              ${isTransitioning ? "scale-transition" : ""}
            `}
            style={{
              transformOrigin: "center",
            }}
          >
            <div className="flex items-center border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[16px] sm:px-[24px]">
              <p className="text-[16px] sm:text-[18px] text-[#343432]">
                Order ID: {orderId}
              </p>
              <div className="flex items-center gap-2">
                <button className="cursor-pointer">
                  {expandedVersion ? (
                    <IconStore.collapse
                      onClick={handleCollapseModal}
                      className="size-4 cursor-pointer stroke-[#130061] transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <IconStore.expand
                      onClick={handleCollapseModal}
                      className="size-4 cursor-pointer stroke-[#130061] transition-transform duration-300 hover:scale-110"
                    />
                  )}
                </button>
                <button className="cursor-pointer">
                  <IconStore.close
                    onClick={onClose}
                    className="size-4 cursor-pointer stroke-[#130061] transition-transform duration-300 hover:scale-110"
                  />
                </button>
              </div>
            </div>
            <div className="p-[16px] sm:p-[24px] flex flex-col gap-4">
              {/* <CtaValues ctaText={ctaText} /> */}
              <div
                className={`flex gap-4 transition-custom ${
                  expandedVersion ? "" : "flex-col"
                }`}
              >
                <div
                  className={`transition-custom flex flex-col gap-4 ${
                    expandedVersion ? "w-full sm:w-1/2" : "w-full"
                  }`}
                >
                  <OrderValues orderObject={orderObject} />
                  {(bookingId == 4 || bookingId == 5 || bookingId == 6) && (
                    <DownLoadYourTickets
                      tickets={tickets}
                      bookingId={order_details?.booking_id}
                    />
                  )}
                </div>
                <div
                  className={`flex flex-col gap-4  ${`transition-custom ${
                    expandedVersion ? "w-full sm:w-1/2 h-full" : "w-full"
                  }`}`}
                >
                  <CustomerDetails
                    customerEmail={customer_details?.email}
                    customerName={customer_details?.first_name}
                    mobileNumber={customer_details?.mobile_no}
                  />

                  <PaymentOrderDetails payment_details={payment_details} />
                </div>
              </div>
              <OrderedTickets ticket_details={ticket_details} />
              <Benifits
                expandedVersion={expandedVersion}
                benefits_restrictions={benefits_restrictions}
              />
              <AttendeeDetails
                attendee_details={attendee_details}
                bookingId={order_details?.booking_id}
              />
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default OrderDetails;
