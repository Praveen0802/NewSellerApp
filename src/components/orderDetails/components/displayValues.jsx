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

    console.log("Order status key detected:", {
      ticketType,
      currentTicketType,
      displayTicketType,
      ticketTypesList,
      showEditIcon,
      ticketTypesListLength: ticketTypesList?.length
    });

    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-normal text-[#7D82A4]">{text}</p>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center">
            {/* Order Status Badge */}
            <span
              className={`${
                value?.toLowerCase() === "delivered" ||
                value?.toLowerCase() === "active"
                  ? "bg-green-600"
                  : "bg-[#F57B1B]"
              } text-white px-2 py-1 rounded-l-md text-sm font-normal`}
            >
              {value}
            </span>

            {/* Ticket Type Badge */}
            {ticketType && (
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`${
                    value?.toLowerCase() === "delivered" ||
                    value?.toLowerCase() === "active"
                      ? "bg-[#E6F9F4]"
                      : "bg-[#FFF4EC]"
                  } text-[#343432] px-2 w-full py-1 text-sm font-normal ${
                    showEditIcon ? "" : "rounded-r-md"
                  }`}
                >
                  {/* Find the current ticket type label from the list */}
                  {showEditIcon
                    ? ticketTypesList.find(
                        (ticket) => 
                          ticket.label === ticketType || 
                          ticket.value === ticketType ||
                          ticket.value === orderObject?.ticket_type_id
                      )?.label || ticketType
                    : ticketType}
                </span>

                {/* Edit Icon - only show if ticketTypesList has items */}
                {showEditIcon && (
                  <button
                    onClick={handleEditClick}
                    className={`p-2 bg-[#0137D5] rounded-md transition-colors border-l border-gray-200`}
                    title="Edit ticket type"
                  >
                    <SquarePen className="size-3 text-white " />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dropdown for ticket type selection */}
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
    <div className="flex flex-col gap-1">
      <p className="text-xs font-normal text-[#7D82A4]">{text}</p>
      <p
        className={`flex items-center justify-between ${
          copyKeys ? "bg-[#F4F5F8] px-1 py-0.5 rounded-md" : ""
        } ${
          deliveryKey &&
          `${
            orderFullfilled ? "bg-green-100 " : "bg-[#FFF4EC]"
          } px-1 py-0.5 rounded-md w-fit`
        } text-sm font-normal text-[#343432]`}
      >
        {value}
        {copyKeys && (
          <div className="flex items-center">
            {copied ? (
              <span className="text-green-500 text-xs mr-1">Copied!</span>
            ) : null}
            <button
              onClick={handleCopy}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
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
      </p>
    </div>
  );
};

export default DisplayValues;