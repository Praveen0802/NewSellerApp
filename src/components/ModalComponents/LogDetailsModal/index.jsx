import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import CustomModal from "../../commonComponents/customModal";
import RightViewModal from "@/components/commonComponents/rightViewModal";

const IconStore = {
  close: () => <X className="w-5 h-5 cursor-pointer" />,
  chevronDown: () => <ChevronDown className="w-5 h-5" />,
  chevronUp: () => <ChevronUp className="w-5 h-5" />,
};

const LogDetailsModal = ({ show, onClose }) => {
  const [expandedSections, setExpandedSections] = useState([0]);

  const toggleSection = (index) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter((i) => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  // Sample data based on the image
  const logEntries = [
    {
      title: "Action: Add by Arnir Khan",
      date: "05/11/2024 08:49:26",
      leftColumns: [
        { key: "Benefits/restrictions :", value: "" },
        { key: "Category :", value: "de Upper Tier" },
        { key: "Date of ship :", value: "29/11/2024" },
        { key: "Face value :", value: "£50.00" },
        { key: "First seat :", value: "" },
        { key: "In hand :", value: "No" },
        { key: "Listing owner :", value: "Mark Jhonson" },
        { key: "Max display quantity :", value: "" },
        { key: "Ticket files status :", value: "No file(s) uploaded" },
        { key: "Mobile links status :", value: "No link(s) uploaded" },
      ],
      rightColumns: [
        { key: "Fan area :", value: "Home" },
        { key: "Payout price :", value: "£10,000.00" },
        { key: "Quantity :", value: "1" },
        { key: "Sold Tickets :", value: "1" },
        { key: "Section :", value: "General Admission" },
        { key: "Row :", value: "" },
        { key: "Seating arrangement :", value: "0" },
        { key: "Split type :", value: "No Preferences" },
        { key: "Status :", value: "Unpublished" },
        { key: "Ticket type :", value: "E-ticket" },
      ],
    },
    {
      title: "Action: Add by Arnir Khan",
      date: "04/11/2024 08:49:26",
      leftColumns: [
        { key: "Benefits/restrictions :", value: "" },
        { key: "Category :", value: "Fill (294) × 30 Hugo de Upper Tier" },
        { key: "Date of ship :", value: "29/11/2024" },
        { key: "Face value :", value: "£50.00" },
        { key: "First seat :", value: "" },
      ],
      rightColumns: [
        { key: "Fan area :", value: "Home" },
        { key: "Payout price :", value: "£10,000.00" },
        { key: "Quantity :", value: "1" },
        { key: "Sold Tickets :", value: "1" },
        { key: "Section :", value: "General Admission" },
      ],
    },
  ];

  return (
    <RightViewModal className={"!w-[670px]"} show={show} onClose={onClose}>
      <div className="w-2xl bg-white rounded-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <p className="text-lg font-medium text-gray-800">Log Details</p>
          <div onClick={() => onClose()} className="cursor-pointer">
            <IconStore.close />
          </div>
        </div>

        <div className=" overflow-y-auto p-4">
          {logEntries.map((entry, index) => (
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
                        className="grid grid-cols-2 border-b border-blue-100"
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
                        className="grid grid-cols-2 border-b border-blue-100"
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
          ))}
        </div>
      </div>
    </RightViewModal>
  );
};

export default LogDetailsModal;
