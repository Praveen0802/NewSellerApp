import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import CustomModal from "../../commonComponents/customModal";
import RightViewModal from "@/components/commonComponents/rightViewModal";

const IconStore = {
  close: () => <X className="w-5 h-5 cursor-pointer" />,
  chevronDown: () => <ChevronDown className="w-5 h-5" />,
  chevronUp: () => <ChevronUp className="w-5 h-5" />,
};


const LogDetailsModal = ({ show, onClose, orderLogs = [], inventoryLogs = [] }) => {
  const [expandedSections, setExpandedSections] = useState([0]);
  const [activeTab, setActiveTab] = useState("order");

  const toggleSection = (index) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter((i) => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  // Function to format order log data for display
  const formatOrderLogData = (log) => {
    const bookingData = log.json_payload.booking_data || {};
    const paymentData = log.json_payload.payment_data || {};
    
    return {
      title: `Order Action - Ticket ID: ${log.ticket_id}`,
      date: bookingData.created_at || bookingData.updated_at || "N/A",
      leftColumns: [
        { key: "Booking No:", value: bookingData.booking_no || "-" },
        { key: "Match Name:", value: bookingData.match_name || "-" },
        { key: "Match Date:", value: bookingData.match_date || "-" },
        { key: "Match Time:", value: bookingData.match_time || "-" },
        { key: "Stadium:", value: bookingData.stadium_name || "-" },
        { key: "Tournament:", value: bookingData.tournament_name || "-" },
        { key: "Seat Category:", value: bookingData.seat_category || "-" },
        { key: "Section:", value: bookingData.section || "-" },
        { key: "Row:", value: bookingData.row || "-" },
        { key: "Quantity:", value: bookingData.quantity || "-" },
      ],
      rightColumns: [
        { key: "Booking Status:", value: bookingData.booking_status || "-" },
        { key: "Seller ID:", value: bookingData.seller_id || "-" },
        { key: "User ID:", value: bookingData.user_id || "-" },
        { key: "Total Amount:", value: `${bookingData.total_amount || 0} ${bookingData.currency_type || ""}` },
        { key: "Ticket Amount:", value: `${bookingData.ticket_amount || 0} ${bookingData.currency_type || ""}` },
        { key: "Payment Status:", value: paymentData.payment_status || "-" },
        { key: "Transaction ID:", value: paymentData.transcation_id || "-" },
        { key: "Payment Date:", value: paymentData.payment_date || "-" },
        { key: "Country:", value: bookingData.country_name || "-" },
        { key: "City:", value: bookingData.city_name || "-" },
      ],
    };
  };

  // Function to format inventory log data for display
  const formatInventoryLogData = (log) => {
    const payload = log.json_payload || {};
    
    return {
      title: `Inventory Action - Ticket ID: ${log.ticket_id}`,
      date: new Date().toLocaleString(), // You might want to add timestamp to inventory logs
      leftColumns: [
        { key: "Ticket Types:", value: payload.ticket_types || "-" },
        { key: "Add Quantity:", value: payload.add_qty_addlist || "-" },
        { key: "Split Type:", value: payload.split_type || "-" },
        { key: "Price Type:", value: payload.add_pricetype_addlist || "-" },
        { key: "Price:", value: payload.add_price_addlist || "-" },
        { key: "Category:", value: payload.ticket_category || "-" },
        { key: "Block:", value: payload.ticket_block || "-" },
        { key: "Row:", value: payload.row || "-" },
        { key: "Home Town:", value: payload.home_town || "-" },
        { key: "Event:", value: payload.event || "-" },
      ],
      rightColumns: [
        { key: "Match ID:", value: payload.match_id || "-" },
        { key: "Mobile Link Status:", value: payload.mobile_link_status || "-" },
        { key: "PKPass Link Status:", value: payload.pkpass_link_status || "-" },
        { key: "File Type:", value: payload.additional_file_type || "-" },
        { key: "Dynamic Content:", value: payload.additional_dynamic_content || "-" },
        { key: "QR Android:", value: payload.qr_link_android ? "Available" : "-" },
        { key: "QR iOS:", value: payload.qr_link_ios ? "Available" : "-" },
        { key: "Upload Tickets:", value: payload.upload_tickets ? `${payload.upload_tickets.length} files` : "-" },
        { key: "Ticket Details:", value: payload.ticket_details ? payload.ticket_details.join(", ") : "-" },
        { key: "Ticket Details1:", value: payload.ticket_details1 || "-" },
      ],
    };
  };

  // Get current data based on active tab
  const getCurrentLogData = () => {
    if (activeTab === "order") {
      return orderLogs.map(formatOrderLogData);
    } else {
      return inventoryLogs.map(formatInventoryLogData);
    }
  };

  const currentLogEntries = getCurrentLogData();

  return (
    <RightViewModal className={"!w-[670px]"} show={show} onClose={onClose}>
      <div className="w-2xl bg-white rounded-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <p className="text-lg font-medium text-gray-800">Log Details</p>
          <div onClick={() => onClose()} className="cursor-pointer">
            <IconStore.close />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "order"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              setActiveTab("order");
              setExpandedSections([0]);
            }}
          >
            Order Logs ({orderLogs.length})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "inventory"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              setActiveTab("inventory");
              setExpandedSections([0]);
            }}
          >
            Inventory Logs ({inventoryLogs.length})
          </button>
        </div>

        {/* Log Content */}
        <div className="max-h-[90vh] overflow-y-auto p-4">
          {currentLogEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab} logs available
            </div>
          ) : (
            currentLogEntries.map((entry, index) => (
              <div
                key={index}
                className="mb-4 border border-blue-200 rounded-lg overflow-hidden"
              >
                <div
                  className="bg-[#130061] flex justify-between items-center px-4 py-3 cursor-pointer"
                  onClick={() => toggleSection(index)}
                >
                  <p className="text-white text-sm font-medium">{entry.title}</p>
                  <div className="flex items-center">
                    <p className="text-white text-sm">{entry.date}</p>
                    <div className="pl-4 ml-2 border-l border-gray-400 text-white">
                      {expandedSections.includes(index) ? (
                        <IconStore.chevronUp />
                      ) : (
                        <IconStore.chevronDown />
                      )}
                    </div>
                  </div>
                </div>
                {expandedSections.includes(index) && (
                  <div className="grid grid-cols-2 p-4 gap-4 divide-blue-100">
                    <div className="col-span-1 border border-blue-100 rounded-md">
                      {entry.leftColumns.map((item, i) => (
                        <div
                          key={`left-${i}`}
                          className="grid grid-cols-2 border-b border-blue-100 last:border-b-0"
                        >
                          <div className="p-3 text-sm truncate text-gray-600">
                            {item.key}
                          </div>
                          <div className="p-3 text-sm truncate text-gray-800 font-medium">
                            {item.value || "-"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-1 border border-blue-100 rounded-md">
                      {entry.rightColumns.map((item, i) => (
                        <div
                          key={`right-${i}`}
                          className="grid grid-cols-2 border-b border-blue-100 last:border-b-0"
                        >
                          <div className="p-3 text-sm truncate text-gray-600">
                            {item.key}
                          </div>
                          <div className="p-3 text-sm truncate text-gray-800 font-medium">
                            {item.value || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </RightViewModal>
  );
};

export default LogDetailsModal;