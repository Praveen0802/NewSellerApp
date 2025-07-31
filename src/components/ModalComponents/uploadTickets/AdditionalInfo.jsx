import { Calendar, ChevronUp, Clock, MapPin, X } from "lucide-react";

const { useState, useCallback } = require("react");

const RightPanelContent = ({
  matchDetails,
  maxQuantity,
  ETicketsFlow,
  paperTicketFlow,
  rowData,
  normalFlow,
  transferredFiles,
}) => {
  const [ticketLinks, setTicketLinks] = useState(
    Array.from({ length: maxQuantity }, () => ({
      qr_link_android: "",
      qr_link_ios: "",
    }))
  );

  // State for Paper Ticket Flow - storing courier info
  const [paperTicketDetails, setPaperTicketDetails] = useState({
    courier_type: "company",
    courier_company: "",
    tracking_details: "",
  });

  // State for additional info
  const [additionalInfo, setAdditionalInfo] = useState({
    template: "",
    dynamicContent: "",
  });

  const handleLinkChange = useCallback((ticketIndex, linkType, value) => {
    setTicketLinks((prev) => {
      // Create a shallow copy of the array
      const newTicketLinks = [...prev];
      // Only update the specific ticket object that changed
      newTicketLinks[ticketIndex] = {
        ...newTicketLinks[ticketIndex],
        [linkType]: value,
      };
      return newTicketLinks;
    });
  }, []);

  // Handle paper ticket details change - FIXED
  const handlePaperTicketDetailChange = useCallback((field, value) => {
    setPaperTicketDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);
  const handleAdditionalInfoChange = useCallback((field, value) => {
    setAdditionalInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const TicketDetails = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
      <div className="grid grid-cols-4 bg-gray-100 px-3 py-2 border-b border-gray-200">
        <div className="text-xs font-medium text-[#323A70]">Listing ID</div>
        <div className="text-xs font-medium text-[#323A70]">Quantity</div>
        <div className="text-xs font-medium text-[#323A70]">Ticket Details</div>
        <div className="text-xs font-medium text-[#323A70]">
          {ETicketsFlow ? "Type" : paperTicketFlow ? "Type" : "Row (Seat)"}
        </div>
      </div>

      <div className="grid grid-cols-4 bg-[#F9F9FB] py-2 px-3 border-b border-gray-200">
        <div className="text-xs truncate">{rowData?.id || "N/A"}</div>
        <div className="text-xs truncate">{maxQuantity}</div>
        <div className="text-xs truncate">
          {rowData?.ticket_category || "N/A"}, {rowData?.ticket_block || ""}
        </div>
        <div className="text-xs truncate">
          {ETicketsFlow ? (
            "E-Ticket"
          ) : paperTicketFlow ? (
            "Paper Ticket"
          ) : (
            <div className="flex gap-5 items-center justify-end">
              <span>{rowData?.row || "0"} (0)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TicketAssignmentSection = () => (
    <div className="p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-[#323A70]">
          Ticket Assignment ({transferredFiles.length}/{maxQuantity})
        </h4>
      </div>

      <div className="max-h-60 overflow-y-auto">
        {maxQuantity === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm border border-gray-200 rounded">
            No quantity specified
          </div>
        ) : (
          Array.from({ length: maxQuantity }, (_, index) => {
            const ticketNumber = index + 1;
            const assignedFile = transferredFiles[index];

            return (
              <div
                key={ticketNumber}
                className="grid grid-cols-2 items-center border-b border-gray-200 last:border-b-0"
              >
                <div className="px-3 py-2 text-xs font-medium text-[#323A70]">
                  Ticket {ticketNumber}
                </div>
                <div className="px-3 py-2 flex items-center">
                  {assignedFile ? (
                    <div className="flex bg-gray-100 rounded px-2 py-1 items-center justify-between w-full">
                      <span className="text-xs text-gray-700 truncate max-w-24">
                        {assignedFile.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 text-red-500 cursor-pointer hover:text-red-700"
                          onClick={() => handleRemoveFromSlot(index)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 w-full border-[1px] border-dashed border-[#E0E1EA] bg-white rounded-md px-2 py-1">
                      Waiting for file...
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const QRLinksConfigSection = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1">
      <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
        <h4 className="text-sm font-medium text-[#323A70]">
          QR Code Links Configuration (
          {
            ticketLinks.filter(
              (link) => link.qr_link_android && link.qr_link_ios
            ).length
          }
          /{maxQuantity})
        </h4>
      </div>

      <div className="p-3 max-h-96 overflow-y-auto">
        {maxQuantity === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm border border-gray-200 rounded">
            No quantity specified
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: maxQuantity }, (_, index) => {
              const ticketNumber = index + 1;

              return (
                <div
                  key={`ticket-${ticketNumber}`}
                  className="border border-[#E0E1EA] rounded-md p-3 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-[#323A70]">
                      Ticket {ticketNumber}
                    </h5>
                    <div className="flex items-center gap-1">
                      {ticketLinks[index]?.qr_link_android &&
                        ticketLinks[index]?.qr_link_ios && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Android Link Input */}
                    <div>
                      <label className="block text-xs font-medium text-[#323A70] mb-1">
                        Android QR Link
                      </label>
                      <input
                        type="url"
                        placeholder="Enter Android app/web link"
                        value={ticketLinks[index]?.qr_link_android || ""}
                        onChange={(e) =>
                          handleLinkChange(
                            index,
                            "qr_link_android",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                      />
                    </div>

                    {/* iOS Link Input */}
                    <div>
                      <label className="block text-xs font-medium text-[#323A70] mb-1">
                        iOS QR Link
                      </label>
                      <input
                        type="url"
                        placeholder="Enter iOS app/web link"
                        value={ticketLinks[index]?.qr_link_ios || ""}
                        onChange={(e) =>
                          handleLinkChange(index, "qr_link_ios", e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Paper Ticket Courier Details Section - For Right Panel - Move outside useMemo
  const PaperTicketCourierDetailsSection = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1">
      <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
        <h4 className="text-sm font-medium text-[#323A70]">
          Courier Details ({maxQuantity} tickets)
        </h4>
      </div>

      <div className="p-3 space-y-4">
        {/* Courier Details */}
        <div className="grid grid-cols-3 gap-3">
          {/* Courier Type */}
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Courier Type
            </label>
            <select
              value={paperTicketDetails.courier_type || "company"}
              onChange={(e) =>
                handlePaperTicketDetailChange("courier_type", e.target.value)
              }
              className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            >
              <option value="company">Company</option>
              <option value="individual">Individual</option>
              <option value="express">Express</option>
            </select>
          </div>

          {/* Courier Company Name */}
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Courier Company Name
            </label>
            <input
              type="text"
              placeholder="FedEx"
              value={paperTicketDetails.courier_company || ""}
              onChange={(e) =>
                handlePaperTicketDetailChange("courier_company", e.target.value)
              }
              className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            />
          </div>

          {/* Tracking Details */}
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Input Tracking Details
            </label>
            <input
              type="text"
              placeholder="DSG684864SG56"
              value={paperTicketDetails.tracking_details || ""}
              onChange={(e) =>
                handlePaperTicketDetailChange(
                  "tracking_details",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="border-2 border-dashed border-[#0137D5] rounded-lg p-6 bg-[#F9F9FB]">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#0137D5] rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm text-[#323A70] mb-1">
              Drag your file(s) or{" "}
              <span
                className="text-[#0137D5] font-medium cursor-pointer"
                onClick={handleBrowseFiles}
              >
                Browse files
              </span>
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="border border-[#E0E1EA] rounded-lg bg-white">
            <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
              <h5 className="text-xs font-medium text-[#323A70]">
                Uploaded Files ({uploadedFiles.length})
              </h5>
            </div>
            <div className="p-3">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border border-[#E0E1EA] rounded-md bg-[#F9F9FB]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#E0E1EA] rounded flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-[#666]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-[#323A70] truncate max-w-32">
                        {file.name}
                      </span>
                    </div>
                    <button
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteUploaded(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Additional Information Section (for Normal Flow and Paper Tickets) - Move outside useMemo
  const AdditionalInfoSection = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1">
      <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
        <h4 className="text-sm font-medium text-[#323A70]">
          Additional Information
        </h4>
      </div>

      <div className="p-3">
        {/* Template Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#323A70] mb-2">
            Template
          </label>
          <select
            value={additionalInfo.template}
            onChange={(e) =>
              handleAdditionalInfoChange("template", e.target.value)
            }
            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
          >
            <option value="">
              {paperTicketFlow
                ? "Paper Ticket - Away Section"
                : "E-Ticket / PDF - Away Section"}
            </option>
            <option value="home">
              {paperTicketFlow
                ? "Paper Ticket - Home Section"
                : "E-Ticket / PDF - Home Section"}
            </option>
            <option value="vip">
              {paperTicketFlow
                ? "Paper Ticket - VIP Section"
                : "E-Ticket / PDF - VIP Section"}
            </option>
          </select>
        </div>

        {/* Dynamic Content Area */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#323A70] mb-2">
            Dynamic Content
          </label>
          <textarea
            value={additionalInfo.dynamicContent}
            onChange={(e) =>
              handleAdditionalInfoChange("dynamicContent", e.target.value)
            }
            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] resize-none focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            rows="4"
            placeholder="Enter dynamic content here..."
          />
        </div>
      </div>
    </div>
  );

  const MatchHeader = (matchDetails) => (
    <div className="bg-[#1E0065] text-xs py-3 rounded-t-md text-white px-4 flex items-center justify-between">
      <h3 className="font-medium">{matchDetails?.match_name}</h3>
      <div className="flex items-center gap-2 justify-center">
        <Calendar className="w-4 h-4" />
        <span className="text-xs">{matchDetails?.match_date_format}</span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Clock className="w-4 h-4" />
        <span className="text-xs">{matchDetails?.match_time}</span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <MapPin className="w-4 h-4" />
        <span className="text-xs">{matchDetails?.stadium_name}</span>
      </div>
      <button className="ml-2">
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="w-1/2 flex flex-col">
      <div className="m-4 flex flex-col overflow-y-auto flex-1 max-h-[calc(100vh-150px)]">
        {MatchHeader(matchDetails)}
        <TicketDetails />

        {ETicketsFlow ? (
          <>
            <QRLinksConfigSection />
            <AdditionalInfoSection />
          </>
        ) : paperTicketFlow ? (
          <>
            <PaperTicketCourierDetailsSection />
            <AdditionalInfoSection />
          </>
        ) : (
          <>
            <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
              <TicketAssignmentSection />
            </div>
            <AdditionalInfoSection />
          </>
        )}
      </div>
    </div>
  );
};

export default RightPanelContent;
