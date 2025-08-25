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
import RightViewModal from "../commonComponents/rightViewModal";

const OrderDetails = ({ show, onClose, data = {}, showShimmer = false }) => {
  // Handle case where data might be an array or null/undefined
  const normalizedData = Array.isArray(data) || !data ? {} : data;
  
  const {
    order_details = {},
    customer_details = {},
    ticket_details = {},
    benefits_restrictions = [],
    attendee_details = [],
    payment_details = {},
    tickets = {},
  } = normalizedData;

  console.log(normalizedData, 'datadata');
  
  const [expandedVersion, setExpandedVersion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Safe access to nested properties
  const orderId = order_details?.booking_no || order_details?.order_id || "N/A";

  // Shimmer loading component
  const ShimmerLoader = () => (
    <div className="animate-pulse">
      <div className="overflow-auto rounded-md bg-white">
        {/* Header Shimmer */}
        <div className="flex items-center border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[24px]">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Content Shimmer */}
        <div className="p-[16px] sm:p-[24px] flex flex-col gap-4">
          {/* Order Values and Customer Details Row Shimmer */}
          <div className={`flex ${expandedVersion ? "" : "flex-col"} gap-4`}>
            {/* Order Values Shimmer */}
            <div className={`${expandedVersion ? "w-full sm:w-1/2" : "w-full"}`}>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-28 mb-3"></div>
                <div className="space-y-3">
                  {/* Order ID */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  {/* Order Date */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  {/* Order Status */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-green-200 rounded w-16"></div>
                  </div>
                  {/* Delivered By */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  {/* Days to Event */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  {/* Expected Payout Date */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Shimmer */}
            <div className={`${expandedVersion ? "w-full sm:w-1/2 h-full" : "w-full"}`}>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="space-y-3">
                  {/* Customer Name */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  {/* Email */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  {/* Mobile Number */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>

              {/* Payment Details Shimmer */}
              <div className="border border-gray-200 rounded-lg p-4 mt-4">
                <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Tickets Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-blue-200 rounded-full w-20"></div>
              <div className="h-6 bg-blue-200 rounded-full w-24"></div>
              <div className="h-6 bg-blue-200 rounded-full w-16"></div>
              <div className="h-6 bg-blue-200 rounded-full w-28"></div>
            </div>
          </div>

          {/* Attendee Details Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3"></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>

          {/* Download Tickets Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-blue-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const ctaText = [
    { title: "Order Notes", cta: "+ Add Note" },
    { title: "Additional File", cta: "Download File" },
  ];

  // Format date function with better error handling
  function formatTimestamp(dateString) {
    if (!dateString || dateString === "" || dateString === "null" || dateString === "undefined") {
      return "-";
    }

    // If it's already in DD/MM/YYYY format, return as is
    if (typeof dateString === 'string' && dateString.includes("/") && dateString.split("/").length === 3) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const options = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.warn("Date formatting error:", error);
      return dateString || "-";
    }
  }

  // Get order status with better null handling
  function getOrderStatus() {
    if (!order_details || typeof order_details !== 'object') {
      return "Pending";
    }
    
    const { booking_status = null, ticket_status = null } = order_details;
    return booking_status || ticket_status || "Pending";
  }

  // Updated orderObject with safe property access
  const orderObject = {
    order_id: orderId,
    order_date: formatTimestamp(order_details?.booking_date),
    order_status: getOrderStatus(),
    delivered_by: order_details?.expected_ticket_delivery || "Not specified",
    delivery_details: order_details?.delivery_status_label || "-",
    days_to_event: order_details?.days_left_to_event || "-",
    ticket_type: ticket_details?.ticket_type || "-",
    payout_date: formatTimestamp(order_details?.expected_payout_date) || "-",
  };

  // Define OrderValueObject
  const OrderValueObject = [
    {
      key: "order_id",
      name: "Order ID",
    },
    {
      key: "order_date",
      name: "Order Date",
    },
    {
      key: "order_status",
      name: "Order Status",
    },
    {
      name: "Delivery By",
      key: "delivered_by",
    },
    {
      name: "Days to Event",
      key: "days_to_event",
    },
    {
      name: "Expected Payout Date",
      key: "payout_date",
    },
  ];

  console.log(ticket_details?.match_date);

  // Safe transformation of ticket details with comprehensive null checks
  const transformedTicketDetails = ticket_details && typeof ticket_details === 'object' && Object.keys(ticket_details).length > 0
    ? {
        match_name: ticket_details.match_name || "-",
        venue: ticket_details.venue_name || "-",
        match_date: ticket_details.match_datetime 
          ? (() => {
              try {
                const date = new Date(ticket_details.match_datetime);
                return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
              } catch (e) {
                return "-";
              }
            })()
          : "-",
        match_time: ticket_details.match_datetime 
          ? (() => {
              try {
                const date = new Date(ticket_details.match_datetime);
                return isNaN(date.getTime()) ? "-" : date.toLocaleTimeString();
              } catch (e) {
                return "-";
              }
            })()
          : "-",
        seat_category: ticket_details.seat_category || "-",
        ticket_types: ticket_details.ticket_type || "-",
        quantity: ticket_details.quantity || 0,
        ticket_price: ticket_details.total_paid_converted || 0,
        order_value: ticket_details.ticket_price_converted || 0,
        currency_type: ticket_details.currency || "USD",
      }
    : null;

  const bookingId = order_details?.booking_status_id;

  const handleCollapseModal = () => {
    setIsTransitioning(true);
    setExpandedVersion(!expandedVersion);
    // Reset transitioning state after animation completes
    setTimeout(() => setIsTransitioning(false), 600);
  };

  // Check if we have valid data
  const hasValidData = normalizedData && Object.keys(normalizedData).length > 0;

  // Show shimmer loader if showShimmer is true
  if (showShimmer) {
    return (
      <RightViewModal
        className={`transition-custom ${
          expandedVersion ? "w-full" : "w-full sm:w-[650px]"
        }`}
        show={show}
        onClose={onClose}
      >
        <ShimmerLoader />
      </RightViewModal>
    );
  }

  return (
    <>
      <style>{`
        .scale-transition {
          animation: scale-zoom 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes scale-zoom {
          0% {
            transform: scale(${expandedVersion ? 0.95 : 1});
          }
          70% {
            transform: scale(${expandedVersion ? 1.01 : 0.99});
          }
          100% {
            transform: scale(1);
          }
        }

        .transition-custom {
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <RightViewModal
        className={`transition-custom ${
          expandedVersion ? "w-full" : "w-full sm:w-[650px]"
        }`}
        show={show}
        onClose={onClose}
      >
        <div
          className={`transition-custom ${
            expandedVersion ? "w-full h-full" : " "
          }`}
        >
          <div
            className={`
              transition-custom overflow-auto rounded-md bg-white
              ${
                expandedVersion
                  ? "w-full h-full"
                  : "max-w-[676px] max-md:h-[500px] "
              }
              ${isTransitioning ? "scale-transition" : ""}
            `}
            style={{
              transformOrigin: "center",
            }}
          >
            {/* Header - Always rendered for close functionality */}
            <div className="flex items-center border-b-[1px] p-3 border-[#E0E1EA] justify-between">
              <p className="text-[16px] sm:text-[18px] text-[#343432]">
                {hasValidData ? `Order ID: ${orderId}` : "Order Details"}
              </p>
              <div className="flex items-center gap-2">
                {hasValidData && (
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
                )}
                <button className="cursor-pointer">
                  <IconStore.close
                    onClick={onClose}
                    className="size-4 cursor-pointer stroke-[#130061] transition-transform duration-300 hover:scale-110"
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            {hasValidData ? (
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
                    <OrderValues
                      orderObject={orderObject}
                      OrderValueObject={OrderValueObject}
                    />
                    {(bookingId == 4 || bookingId == 5 || bookingId == 6) && 
                     tickets && 
                     typeof tickets === 'object' && 
                     Object.keys(tickets).length > 0 && (
                      <DownLoadYourTickets
                        tickets={tickets}
                        bookingId={order_details?.booking_id}
                      />
                    )}
                  </div>
                  <div
                    className={`flex flex-col gap-4 ${`transition-custom ${
                      expandedVersion ? "w-full sm:w-1/2 h-full" : "w-full"
                    }`}`}
                  >
                    {customer_details && typeof customer_details === 'object' && (
                      <CustomerDetails
                        customerEmail={customer_details.email || ""}
                        customerName={customer_details.first_name || ""}
                        mobileNumber={customer_details.mobile_no || ""}
                      />
                    )}

                    {payment_details && typeof payment_details === 'object' && (
                      <PaymentOrderDetails payment_details={payment_details} />
                    )}
                  </div>
                </div>
                
                {transformedTicketDetails && (
                  <OrderedTickets ticket_details={transformedTicketDetails} />
                )}
                
                {benefits_restrictions && Array.isArray(benefits_restrictions) && benefits_restrictions.length > 0 && (
                  <Benifits
                    expandedVersion={expandedVersion}
                    benefits_restrictions={benefits_restrictions}
                  />
                )}
                
                {attendee_details && Array.isArray(attendee_details) && attendee_details.length > 0 && (
                  <AttendeeDetails
                    attendee_details={attendee_details}
                    bookingId={order_details?.booking_id}
                  />
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="mb-3">
                    <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xl">!</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Data Available</h3>
                  <p className="text-gray-500 text-sm">
                    The order information could not be loaded. Please try again later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </RightViewModal>
    </>
  );
};

export default OrderDetails;