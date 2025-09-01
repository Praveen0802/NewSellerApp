import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Edit2, SquarePen } from "lucide-react";

const DisplayValues = ({
  text,
  orderObject = {},
  orderStatusKey,
  copyKeys,
  deliveryKey,
  value,
  ticketTypesList = [],
  onTicketTypeChange = () => {},
}) => {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Edit clicked, ticketTypesList:", ticketTypesList);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTicketTypeSelect = (selectedTicketType) => {
    console.log("Selected:", selectedTicketType);
    onTicketTypeChange(selectedTicketType);
    setIsDropdownOpen(false);
  };

  const orderFullfilled = orderObject?.["order_status"] == "fulfilled";

  // Special handling for order status to show both status and ticket type
  if (orderStatusKey) {
    const ticketType = orderObject?.["ticket_type"];
    const showEditIcon = ticketTypesList && ticketTypesList.length > 0;

    // Get the current ticket type to display
    const currentTicketType = ticketTypesList.find(
      (ticket) =>
        ticket.label === ticketType ||
        ticket.value === ticketType ||
        ticket.value === orderObject?.ticket_type_id
    );

    const displayTicketType = currentTicketType?.label || ticketType;

    const getStatusBadgeColor = () => {
      const lowerCaseValue = value?.toLowerCase();
      if (["delivered", "active", "confirmed"].includes(lowerCaseValue)) {
        return "bg-[#03BA8A]";
      } else if (["paid"].includes(lowerCaseValue)) {
        return "bg-[#00A3ED]";
      } else if (["cancelled"].includes(lowerCaseValue)) {
        return "bg-[#F3024B]";
      } else {
        return "bg-[#F57B1B]";
      }
    };

    const getTicketTypeBadgeColor = () => {
      const lowerCaseValue = value?.toLowerCase();
      if (["delivered", "active", "confirmed"].includes(lowerCaseValue)) {
        return "bg-[#E6F9F4]";
      } else if (["paid"].includes(lowerCaseValue)) {
        return "bg-[#E6F6FE]";
      } else if (["cancelled"].includes(lowerCaseValue)) {
        return "bg-[#FDEFF2]";
      } else {
        return "bg-[#FFF4EC]";
      }
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        <p className="text-xs font-normal text-[#7D82A4]">{text}</p>
        <div className="relative w-full" ref={dropdownRef}>
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col gap-2 md:hidden">
            {/* Order Status Badge - Mobile */}
            <span
              className={`${getStatusBadgeColor()} text-white px-3 py-2 rounded-md text-sm font-normal w-fit`}
            >
              {value}
            </span>

            {/* Ticket Type Badge - Mobile */}
            {ticketType && (
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`${getTicketTypeBadgeColor()} text-[#343432] px-3 py-2 flex-1 text-sm font-normal ${
                    showEditIcon ? "rounded-l-md" : "rounded-md"
                  }`}
                >
                  {showEditIcon
                    ? ticketTypesList.find(
                        (ticket) =>
                          ticket.label === ticketType ||
                          ticket.value === ticketType ||
                          ticket.value === orderObject?.ticket_type_id
                      )?.label || ticketType
                    : ticketType}
                </span>

                {/* Edit Icon - Mobile */}
                {showEditIcon && (
                  <button
                    onClick={handleEditClick}
                    className="p-2 bg-[#343432] rounded-md transition-colors flex-shrink-0"
                    title="Edit ticket type"
                  >
                    <SquarePen className="size-4 text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop: Inline layout */}
          <div className="hidden md:flex items-center">
            {/* Order Status Badge - Desktop */}
            <span
              className={`${getStatusBadgeColor()} text-white px-2 py-1 rounded-l-md text-sm font-normal`}
            >
              {value}
            </span>

            {/* Ticket Type Badge - Desktop */}
            {ticketType && (
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`${getTicketTypeBadgeColor()} text-[#343432] px-2 w-full py-1 text-sm font-normal ${
                    showEditIcon ? "" : "rounded-r-md"
                  }`}
                >
                  {showEditIcon
                    ? ticketTypesList.find(
                        (ticket) =>
                          ticket.label === ticketType ||
                          ticket.value === ticketType ||
                          ticket.value === orderObject?.ticket_type_id
                      )?.label || ticketType
                    : ticketType}
                </span>

                {/* Edit Icon - Desktop */}
                {showEditIcon && (
                  <button
                    onClick={handleEditClick}
                    className="p-2 bg-[#343432] rounded-md transition-colors border-l border-gray-200"
                    title="Edit ticket type"
                  >
                    <SquarePen className="size-3 text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dropdown for ticket type selection - Responsive */}
          {isDropdownOpen && showEditIcon && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              <div className="py-1">
                {ticketTypesList.map((ticketTypeOption) => {
                  const isCurrentType =
                    ticketTypeOption.label === ticketType ||
                    ticketTypeOption.value === ticketType ||
                    ticketTypeOption.value === orderObject?.ticket_type_id;

                  return (
                    <button
                      key={ticketTypeOption.value}
                      onClick={() => handleTicketTypeSelect(ticketTypeOption)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        isCurrentType
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {ticketTypeOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-xs font-normal text-[#7D82A4]">{text}</p>
      <div
        className={`flex items-center justify-between ${
          copyKeys ? "bg-[#F4F5F8] px-2 md:px-1 py-1 md:py-0.5 rounded-md" : ""
        } ${
          deliveryKey &&
          `${
            orderFullfilled ? "bg-green-100" : "bg-[#FFF4EC]"
          } px-2 md:px-1 py-1 md:py-0.5 rounded-md w-fit`
        } text-sm font-normal text-[#343432]`}
      >
        <span className="break-words flex-1 min-w-0 pr-2">{value}</span>
        {copyKeys && (
          <div className="flex items-center flex-shrink-0">
            {copied ? (
              <span className="text-green-500 text-xs mr-1">Copied!</span>
            ) : null}
            <button
              onClick={handleCopy}
              className="p-1 md:p-0.5 hover:bg-gray-200 rounded transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <IconStore.check className="size-4 text-green-500" />
              ) : (
                <IconStore.copy className="size-4 cursor-pointer" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayValues;