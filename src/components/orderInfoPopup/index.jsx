import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useEffect } from "react";
import Button from "../commonComponents/button";
import { convertSnakeCaseToCamelCase } from "@/utils/helperFunctions";
import Benifits from "../orderDetails/components/benifits";
import CustomModal from "../commonComponents/customModal";
import CtaValues from "../orderDetails/components/ctaValues";
import OrderValues from "../orderDetails/components/orderValues";
import CustomerDetails from "../orderDetails/components/customerDetails";
import OrderedTickets from "../orderDetails/components/orderedTickets";
import RightViewModal from "../commonComponents/rightViewModal";
import {
  addReportsNotes,
  addSalesPendingNotes,
  downloadSaleAction,
  updateTicketTypes,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import { Download, Expand, Shrink, X } from "lucide-react";
import AttendeeDetails from "./attendeeDetails";
import useS3Download from "@/Hooks/useS3Download";

const OrderInfo = ({
  show,
  onClose,
  data: orderData,
  refreshPopupData = () => {},
  type = "",
  showShimmer = false,
  ticketTypesList = [],
  mySalesPage = false,
  showAttendeeUpload = false,
  rowData,
  handleUploadClick,
  hideExpand = false,
} = {}) => {
  const [expandedVersion, setExpandedVersion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);
  const [showOutsideLoader, setShowOutsideLoader] = useState(false);

  const { downloadFile } = useS3Download();
  // Handle new array format data
  const data = orderData && orderData.length > 0 ? orderData[0] : null;
  const [updatedOrderObject, setUpdatedOrderObject] = useState(null);

  // Enhanced transition handler
  const handleCollapseModal = () => {
    if (isTransitioning) return; // Prevent multiple rapid clicks

    setIsTransitioning(true);
    setExpandedVersion(!expandedVersion);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Shimmer loading component
  const ShimmerLoader = () => (
    <div className="w-[600px] animate-pulse">
      <div className="overflow-auto rounded-md bg-white">
        {/* Header Shimmer */}
        <div className="flex items-center border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[24px]">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>

        {/* Content Shimmer */}
        <div className="p-[24px] flex flex-col gap-4">
          {/* CTA Values Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-blue-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>

          {/* Order Values and Customer Details Row Shimmer */}
          <div className={`flex ${expandedVersion ? "" : "flex-col "} gap-4`}>
            {/* Order Values Shimmer */}
            <div className={`${expandedVersion ? "w-1/2" : "w-full"}`}>
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
                  {/* Ticket Type */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Shimmer */}
            <div className={`${expandedVersion ? "w-1/2 h-full" : "w-full"}`}>
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
            </div>
          </div>

          {/* Ordered Tickets Shimmer */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );

  if (showShimmer) {
    return (
      <RightViewModal className={"!w-[600px]"} show={show} onClose={onClose}>
        <ShimmerLoader />
      </RightViewModal>
    );
  }

  if (!data) {
    return (
      <RightViewModal className={"!w-[600px]"} show={show} onClose={onClose}>
        <div className="p-4 text-center">
          <p>No order data available</p>
          <p className="text-sm text-gray-500">Please try again later.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Close
          </button>
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
    order_id_label,
  } = data;
  // Extract order notes from ticket details
  const order_notes = ticket_details?.[0]?.order_notes || "";
  // const order_notes = "";

  // Extract ticket file from attendee details
  const ticket_file = attendee_details?.[0]?.ticket_file;

  console.log("ticket_file", order_details);

  const handleDownLoadActionClick = async () => {
    setDownloadLoader(true);
    const response = await downloadSaleAction("", order_details?.order_id);
    console.log(response?.url, "kkkkk");
    downloadFile(response?.url, "ticket");
    setDownloadLoader(false);
  };

  const ctaText = [
    { title: "Order Notes", cta: order_notes ? "View Note" : "+ Add Note" },
    ...(data?.ticket_file_included
      ? [
          {
            title: "Additional File",
            cta: ticket_file ? "Download File" : "No File",
            icon: <Download className="size-4 text-white" />,
            onClick: handleDownLoadActionClick,
            loading: downloadLoader,
          },
        ]
      : []),
  ];

  function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function getOrderStatus() {
    const { order_status_label = null, order_status = null } =
      order_details ?? {};
    if (order_status_label) {
      return order_status_label;
    }
    return order_status === 1
      ? "Active"
      : order_status === null
      ? "Pending"
      : "Inactive";
  }

  // Format order object for OrderValues component
  const orderObject = {
    order_id: order_details?.booking_no || order_details?.order_id,
    order_date: order_details?.order_date
      ? formatTimestamp(order_details?.order_date)
      : "-",
    order_status: getOrderStatus?.(),
    delivered_by: order_details?.delivered_by || "Not specified",
    delivery_details: order_details?.delivery_status_label,
    days_to_event: order_details?.days_in_event,
    ticket_type: ticket_details?.[0]?.ticket_types,
    payout_date: order_details?.payout_date,
  };
  console.log(orderObject, "orderObjectorderObject");
  // Format customer details - prioritize attendee details, then user address, then address
  const attendee = attendee_details?.[0];

  const customerName =
    attendee?.first_name && attendee?.last_name
      ? `${attendee.first_name} ${attendee.last_name}`
      : user_address_details?.first_name && user_address_details?.last_name
      ? `${user_address_details.first_name} ${user_address_details.last_name}`
      : address_details?.first_name && address_details?.last_name
      ? `${address_details.first_name} ${address_details.last_name}`
      : "Not provided";

  const customerEmail =
    attendee?.email || address_details?.email || "Not provided";

  const mobileNumber =
    attendee?.phone ||
    user_address_details?.phone_number ||
    address_details?.phone_number ||
    "Not provided";

  // Format benefits/restrictions from listing_note in ticket_details
  const benefits =
    ticket_details?.[0]?.listing_note?.map((note) => note.name) || [];

  // Transform ticket_details to match expected format for OrderedTickets component
  // Since ticket_details is now an array, we'll use the first ticket or handle multiple tickets
  const transformedTicketDetails = ticket_details?.[0]
    ? {
        venue: ticket_details[0].venue,
        match_date: ticket_details[0].match_date,
        match_time: ticket_details[0].match_time,
        seat_category: ticket_details[0].seat_category,
        ticket_types: ticket_details[0].ticket_types,
        quantity: ticket_details[0].quantity,
        ticket_price: ticket_details[0].ticket_price,
        order_value: ticket_details[0].order_value,
        currency_type: ticket_details[0].currency_type,
      }
    : null;

  const handleSaveNote = async (note) => {
    const id_key_name = "booking_id";
    const { order_id } = order_details;

    const payload = {
      [id_key_name]: String(order_id),
      order_notes: note,
    };

    const resp =
      type === "sales"
        ? await addSalesPendingNotes("", payload)
        : await addReportsNotes("", payload);
    if (resp?.success) {
      toast.success("Note saved successfully", {
        position: "top-center",
      });
      refreshPopupData?.();
      // to refresh the order details
    } else {
      toast.error("Failed to save note", {
        position: "top-center",
      });
    }
  };

  const handleTicketTypeChange = async (selectedTicketType) => {
    try {
      console.log("Selected ticket type:", selectedTicketType);

      // Immediately update the local orderObject state
      const newOrderObject = {
        ...orderObject,
        ticket_type: selectedTicketType.label,
        ticket_type_id: selectedTicketType.value,
      };

      setUpdatedOrderObject(newOrderObject);

      // Here you can implement your API call to update the ticket type
      // Example API call structure:

      const payload = {
        booking_id: `${order_details?.order_id}`,
        ticket_type: selectedTicketType.value,
      };

      const response = await updateTicketTypes("", payload);
      if (response?.success) {
        setShowOutsideLoader(true);
        toast.success("Ticket type updated successfully", {
          position: "top-center",
        });
        // refreshPopupData?.(); // Refresh the order details
      } else {
        toast.error(response?.message || "Failed to update ticket type", {
          position: "top-center",
        });
        // Revert the local state if API call fails
        setUpdatedOrderObject(null);
      }

      // For now, just show a success message
    } catch (error) {
      console.error("Error updating ticket type:", error);
      toast.error("Failed to update ticket type", {
        position: "top-center",
      });
      // Revert the local state if there's an error
      setUpdatedOrderObject(null);
    }
  };

  const currentOrderObject = updatedOrderObject || orderObject;
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
  console.log(currentOrderObject, "currentOrderObjectcurrentOrderObject");
  return (
    <RightViewModal
      className={`transition-all duration-300 ease-in-out ${
        expandedVersion ? "!w-[100vw] !max-w-none" : "!w-[650px]"
      }`}
      show={show}
      onClose={onClose}
    >
      <div
        className={`transition-all duration-300 ease-in-out ${
          expandedVersion ? "w-full" : "w-[650px]"
        }`}
      >
        <div className="overflow-auto rounded-md bg-white h-full">
          <div className="flex items-center border-b-[1px] border-[#E0E1EA] justify-between py-[13px] px-[24px]">
            <p className="text-[18px] text-[#323A70] font-semibold ">
              Order ID:
              {order_details?.booking_no || order_details?.order_id}
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isTransitioning ? "opacity-50" : "opacity-100"
                }`}
              >
                {!hideExpand ? (
                  expandedVersion ? (
                    <Shrink
                      className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-200"
                      onClick={handleCollapseModal}
                    />
                  ) : (
                    <Expand
                      className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors duration-200"
                      onClick={handleCollapseModal}
                    />
                  )
                ) : null}
              </div>

              <X
                onClick={() => {
                  onClose(showOutsideLoader);
                }}
                className="size-4 cursor-pointer stroke-[#130061] hover:stroke-[#1a0080] transition-colors  duration-200"
              />
            </div>
          </div>

          <div className="p-[24px] flex flex-col gap-4">
            <div className="transition-all duration-300 ease-in-out">
              <CtaValues
                ctaText={ctaText}
                order_notes={order_notes}
                onSaveNote={handleSaveNote}
              />
            </div>

            <div
              className={`flex gap-4 transition-all duration-300 ease-in-out ${
                expandedVersion ? "flex-row" : "flex-col"
              }`}
            >
              <div
                className={`transition-all duration-300 ease-in-out ${
                  expandedVersion ? "w-1/2 flex-shrink-0" : "w-full"
                }`}
              >
                <OrderValues
                  orderObject={currentOrderObject}
                  order_id_label={order_id_label}
                  ticketTypesList={ticketTypesList}
                  onTicketTypeChange={handleTicketTypeChange}
                  OrderValueObject={OrderValueObject}
                />
              </div>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  expandedVersion ? "w-1/2 flex-shrink-0" : "w-full"
                }`}
              >
                <CustomerDetails
                  customerEmail={customerEmail}
                  customerName={customerName}
                  mobileNumber={mobileNumber}
                />
              </div>
            </div>

            {transformedTicketDetails && (
              <div className="transition-all duration-300 ease-in-out">
                <OrderedTickets ticket_details={transformedTicketDetails} />
              </div>
            )}

            {benefits.length > 0 && (
              <div className="transition-all duration-300 ease-in-out">
                <Benifits benefits_restrictions={benefits} />
              </div>
            )}

            {/* Add AttendeeDetails component */}
            {attendee_details && attendee_details.length > 0 && (
              <div className="transition-all duration-300 ease-in-out">
                <AttendeeDetails
                  attendee_details={attendee_details}
                  mySalesPage={mySalesPage}
                  expandedVersion={expandedVersion}
                  showAttendeeUpload={showAttendeeUpload}
                  rowData={{
                    ...rowData,
                  }}
                  handleUploadClick={handleUploadClick}
                  currentOrderObject={currentOrderObject}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </RightViewModal>
  );
};

export default OrderInfo;
