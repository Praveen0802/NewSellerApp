import Button from "@/components/commonComponents/button";
import { isEmptyObject } from "@/utils/helperFunctions";
import React, { useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import { downloadTicketLinks } from "@/utils/apiHandler/request";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const DownloadYourTickets = ({ tickets, bookingId }) => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState("etickets");
  // Track which link has been copied
  const [copiedLinkIndex, setCopiedLinkIndex] = useState(null);

  // Define available tabs based on data
  const availableTabs = [];
  if (tickets?.etickets?.length > 0)
    availableTabs.push({ id: "etickets", label: "E-Tickets" });
  if (tickets?.links?.length > 0)
    availableTabs.push({ id: "links", label: "Links" });
  if (!isEmptyObject(tickets?.pod))
    availableTabs.push({ id: "pods", label: "Pods" });
  availableTabs.push({ id: "instructionFile", label: "Instruction File" });

  // Set default active tab if current one isn't available
  React.useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.find((tab) => tab.id === activeTab)
    ) {
      setActiveTab(availableTabs[0].id);
    }
  }, [tickets, activeTab]);

  const fetchDownloadLinks = async (type, id, downloadType = "") => {
    const generateUrl = `/bookings/${bookingId}/${type}${
      id ? `/${id}` : ""
    }/${downloadType}`;
    const response = await downloadTicketLinks("", generateUrl);
    const createdAnchor = document.createElement("a");
    createdAnchor.href = response?.url;
    createdAnchor.download = "Download";
    createdAnchor.click();
  };

  const handleCopy = (value, index) => {
    navigator.clipboard.writeText(value);
    setCopiedLinkIndex(index);

    // Reset the copied status after 2 seconds
    setTimeout(() => {
      setCopiedLinkIndex(null);
    }, 2000);
  };

  return (
    <div className="border-[1px] border-[#E0E1EA] h-full rounded-md">
      <div className="border-b-[1px] border-[#E0E1EA] px-[16px] py-[12px] flex justify-between items-center">
        <p className="text-[16px] font-semibold text-[#343432] ">
          Download Your Tickets
        </p>
        <Button
          type="primary"
          label="Download All"
          classNames={{
            root: "bg-[#343432] px-[8px] py-[5px] w-fit",
            label_: "text-[12px] text-white font-medium",
          }}
          onClick={() => fetchDownloadLinks("etickets", "", "download-all")}
          icon={<Download size={16} />}
        />
      </div>
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 overflow-auto hideScrollbar">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 cursor-pointer whitespace-nowrap font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#343432] border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white">
        {/* E-Tickets Content */}
        {activeTab === "etickets" && tickets?.etickets?.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 pl-[20px]">
              {tickets?.etickets?.map((item, index) => (
                <div key={index} className="flex flex-col gap-3 ">
                  <div>
                    <p className="font-medium text-gray-700">
                      Ticket #{index + 1}
                    </p>
                  </div>
                  <Button
                    type="primary"
                    label="Download"
                    classNames={{
                      root: "bg-[#343432] px-[8px] py-[5px] w-fit",
                      label_: "text-[12px] text-white font-medium",
                    }}
                    onClick={() => {
                      fetchDownloadLinks("etickets", item.id, "download");
                    }}
                    icon={<Download size={16} />}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Content */}
        {activeTab === "links" && tickets?.links?.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-[20px]">
              {tickets?.links?.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="bg-gray-100 hover:bg-gray-200 px-3 py-2 flex items-center justify-between rounded-md transition-all">
                    <p className="font-medium text-gray-700 truncate">
                      Link #{index + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      {copiedLinkIndex === index ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="size-4 mr-1" />
                          <span>Copied!</span>
                        </div>
                      ) : (
                        <IconStore.copy
                          onClick={() => {
                            handleCopy(item?.qr_link_android, index);
                          }}
                          className="size-4 cursor-pointer hover:text-[#343432]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "instructionFile" && tickets?.instruction_file && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Instruction File
              </h2>
            </div>
            <div className="p-4">
              <Button
                type="primary"
                label="Download"
                classNames={{
                  root: "bg-[#343432] px-[8px] py-[5px]",
                  label_: "text-[12px] text-white font-medium",
                }}
                onClick={() => {
                  fetchDownloadLinks(
                    "etickets",
                    "",
                    "download-instruction-file"
                  );
                }}
                icon={<Download size={16} />}
              />
            </div>
          </div>
        )}

        {/* Pods Content */}
        {activeTab === "pods" && !isEmptyObject(tickets?.pod) && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Pods</h2>
            </div>
            <div className="p-4">
              <Button
                type="primary"
                label="Download Pods"
                classNames={{
                  root: "bg-[#343432] px-[8px] py-[5px]",
                  label_: "text-[12px] text-white font-medium",
                }}
                onClick={() => {
                  fetchDownloadLinks("etickets", "", "download-pod");
                }}
                icon={<Download size={16} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadYourTickets;
