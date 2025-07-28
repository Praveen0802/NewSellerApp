import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  X,
  Trash2,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import CustomModal from "@/components/commonComponents/customModal";
import uploadImage from "../../../../public/uploadView.svg";
import Image from "next/image";
import Button from "@/components/commonComponents/button";
import RightViewContainer from "@/components/dashboardPage/reportViewContainer/rightViewContainer";
import RightViewModal from "@/components/commonComponents/rightViewModal";

const UploadTickets = ({
  show,
  onClose,
  showInstruction = false,
  rowData,
  matchDetails,
  rowIndex,
  handleConfirmClick,
}) => {
  const ticketTypes = !isNaN(parseInt(rowData?.ticket_type))
    ? rowData?.ticket_type
    : rowData?.ticket_types || rowData?.rawTicketData?.ticket_type_id;
  const ETicketsFlow = [2, 4]?.includes(parseInt(ticketTypes));
  const paperTicketFlow = parseInt(ticketTypes) === 3;
  const normalFlow = !ETicketsFlow && !paperTicketFlow;

  // Get the quantity limit from rowData
  const maxQuantity =
    parseInt(rowData?.add_qty_addlist || rowData?.quantity) || 0;

  const [showAssigned, setShowAssigned] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Files in left panel
  const [transferredFiles, setTransferredFiles] = useState(
    rowData?.upload_tickets || []
  ); // Files in right panel

  // State for ETicketsFlow - storing links for each quantity
  // FIXED: Initialize with proper structure and avoid re-initialization
  const [ticketLinks, setTicketLinks] = useState(() =>
    Array.from({ length: maxQuantity }, () => ({
      qr_link_android: "",
      qr_link_ios: "",
    }))
  );

  // State for Paper Ticket Flow - storing courier info
  // FIXED: Use functional initialization
  const [paperTicketDetails, setPaperTicketDetails] = useState(() => ({
    courier_type: "company",
    courier_company: "",
    tracking_details: "",
  }));

  // State for additional info
  // FIXED: Use functional initialization
  const [additionalInfo, setAdditionalInfo] = useState(() => ({
    template: "",
    dynamicContent: "",
  }));

  const fileInputRef = useRef(null);

  // FIXED: Simplified handlers without useCallback for text inputs
  const handleLinkChange = (ticketIndex, linkType, value) => {
    console.log('handleLinkChange called:', { ticketIndex, linkType, value });
    setTicketLinks((prevLinks) => {
      const newTicketLinks = [...prevLinks];
      newTicketLinks[ticketIndex] = {
        ...newTicketLinks[ticketIndex],
        [linkType]: value,
      };
      console.log('New ticket links:', newTicketLinks);
      return newTicketLinks;
    });
  };

  const handlePaperTicketDetailChange = (field, value) => {
    console.log('handlePaperTicketDetailChange called:', { field, value });
    setPaperTicketDetails((prevDetails) => {
      const newDetails = {
        ...prevDetails,
        [field]: value,
      };
      console.log('New paper ticket details:', newDetails);
      return newDetails;
    });
  };

  const handleAdditionalInfoChange = (field, value) => {
    console.log('handleAdditionalInfoChange called:', { field, value });
    setAdditionalInfo((prevInfo) => {
      const newInfo = {
        ...prevInfo,
        [field]: value,
      };
      console.log('New additional info:', newInfo);
      return newInfo;
    });
  };

  // File handling functions - keep these optimized
  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        file: file,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const handleDeleteUploaded = useCallback((id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const handleDeleteTransferred = useCallback((id) => {
    setTransferredFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const handleRemoveFromSlot = useCallback((slotIndex) => {
    setTransferredFiles((prev) => {
      const newTransferredFiles = [...prev];
      newTransferredFiles.splice(slotIndex, 1);
      return newTransferredFiles;
    });
  }, []);

  const handleTransferSingleFile = useCallback(
    (fileId) => {
      const fileToTransfer = uploadedFiles.find((file) => file.id === fileId);
      const remainingSlots = maxQuantity - transferredFiles.length;

      if (remainingSlots <= 0) {
        alert(`Maximum limit reached. You can only have ${maxQuantity} files.`);
        return;
      }

      if (fileToTransfer) {
        setTransferredFiles((prev) => [...prev, fileToTransfer]);
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      }
    },
    [uploadedFiles, maxQuantity, transferredFiles.length]
  );

  const canTransferFile = useCallback(
    (fileId) => {
      return transferredFiles.length < maxQuantity;
    },
    [transferredFiles.length, maxQuantity]
  );

  // Debug effect to log state changes
  useEffect(() => {
    console.log('TicketLinks state changed:', ticketLinks);
  }, [ticketLinks]);

  useEffect(() => {
    console.log('PaperTicketDetails state changed:', paperTicketDetails);
  }, [paperTicketDetails]);

  useEffect(() => {
    console.log('AdditionalInfo state changed:', additionalInfo);
  }, [additionalInfo]);

  // Common instructions based on flow type - Memoized
  const instructions = useMemo(() => {
    if (ETicketsFlow) {
      return [
        "Have the ticket ready and open on your phone (With the brightness turned up high and auto-rotate turned off) when approaching the turnstile.",
        "Make sure to enter the venue using the gate entrance that is stated on your tickets. Any other turnstile used result in the ticket not working.",
        "It is recommended to arrive at the stadium 30-40 mins prior to the event starting.",
        "The names on the tickets do not matter These are just the names of the people who own the season cards / memberships. Simply scan the ticket at the correct entrance to gain entry.",
        "Please be aware that you have purchased tickets in the away section of the ground and in the UK there are strict segregation laws forbidding home fans sitting amongst the away fans. If any persons seen to be supporting the opposing team (celebrating a goal / cheering for the visiting team / wearing home team club colours such as kits or scarfs etc then they are likely to be ejected from the stadium or refused.",
      ];
    } else if (paperTicketFlow) {
      return [
        "Physical tickets will be delivered to your specified address or made available for collection.",
        "Please ensure your delivery address is correct and someone will be available to receive the tickets.",
        "Collection points are typically available at the venue or designated partner locations.",
        "Bring a valid ID when collecting tickets as verification may be required.",
        "Paper tickets must be kept safe - lost or damaged tickets cannot be replaced on match day.",
        "Arrive at the venue early to allow time for entry with physical tickets.",
        "Check the ticket for the correct entrance gate and seat information.",
      ];
    }
    return [
      "Use this window to upload individual tickets for each order (PDF format)",
      "Click 'Transfer' button next to each file to move it to the assignment area",
      "Confirm all tickets are uploaded and transferred by clicking the green 'confirm' button",
    ];
  }, [ETicketsFlow, paperTicketFlow]);

  // QR Links Configuration Section for E-Ticket Flow
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
                        key={`android-${index}-${ticketLinks[index]?.qr_link_android}`}
                        type="url"
                        placeholder="Enter Android app/web link"
                        defaultValue={ticketLinks[index]?.qr_link_android || ""}
                        onChange={(e) => {
                          console.log('Android input onChange:', e.target.value);
                          handleLinkChange(index, "qr_link_android", e.target.value);
                        }}
                        className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                      />
                    </div>

                    {/* iOS Link Input */}
                    <div>
                      <label className="block text-xs font-medium text-[#323A70] mb-1">
                        iOS QR Link
                      </label>
                      <input
                        key={`ios-${index}-${ticketLinks[index]?.qr_link_ios}`}
                        type="url"
                        placeholder="Enter iOS app/web link"
                        defaultValue={ticketLinks[index]?.qr_link_ios || ""}
                        onChange={(e) => {
                          console.log('iOS input onChange:', e.target.value);
                          handleLinkChange(index, "qr_link_ios", e.target.value);
                        }}
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

  // Paper Ticket Courier Details Section
  const PaperTicketCourierDetailsSection = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1">
      <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
        <h4 className="text-sm font-medium text-[#323A70]">
          Courier Details ({maxQuantity} tickets)
        </h4>
      </div>

      <div className="p-3 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Courier Type */}
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Courier Type
            </label>
            <select
              value={paperTicketDetails.courier_type || "company"}
              onChange={(e) => {
                console.log('Courier type onChange:', e.target.value);
                handlePaperTicketDetailChange("courier_type", e.target.value);
              }}
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
              key={`courier-company-${paperTicketDetails.courier_company}`}
              type="text"
              placeholder="FedEx"
              defaultValue={paperTicketDetails.courier_company || ""}
              onChange={(e) => {
                console.log('Courier company onChange:', e.target.value);
                handlePaperTicketDetailChange("courier_company", e.target.value);
              }}
              className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            />
          </div>

          {/* Tracking Details */}
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Input Tracking Details
            </label>
            <input
              key={`tracking-${paperTicketDetails.tracking_details}`}
              type="text"
              placeholder="DSG684864SG56"
              defaultValue={paperTicketDetails.tracking_details || ""}
              onChange={(e) => {
                console.log('Tracking details onChange:', e.target.value);
                handlePaperTicketDetailChange("tracking_details", e.target.value);
              }}
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

  // Additional Information Section
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
            onChange={(e) => {
              console.log('Template onChange:', e.target.value);
              handleAdditionalInfoChange("template", e.target.value);
            }}
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
            key={`dynamic-content-${additionalInfo.dynamicContent}`}
            defaultValue={additionalInfo.dynamicContent}
            onChange={(e) => {
              console.log('Dynamic content onChange:', e.target.value);
              handleAdditionalInfoChange("dynamicContent", e.target.value);
            }}
            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] resize-none focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
            rows="4"
            placeholder="Enter dynamic content here..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <RightViewModal
        className="!w-[70vw]"
        show={show}
        onClose={() => onClose()}
      >
        <div className="w-full max-w-5xl h-full border bg-white border-[#E0E1EA] rounded-lg relative flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#E0E1EA] flex-shrink-0">
            <h2 className="text-lg font-medium text-[#323A70]">
              {ETicketsFlow ? "Configure E-Tickets" : paperTicketFlow ? "Configure Paper Tickets" : "Upload Tickets"}
              {` (${maxQuantity} tickets)`}
            </h2>
            <button onClick={() => onClose()} className="text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Instructions */}
            <div className="w-1/2 border-r border-[#E0E1EA] flex flex-col">
              <div className="p-3 m-4 flex flex-col gap-4 overflow-y-auto flex-1 max-h-[calc(100vh-150px)]">
                <div className="space-y-3">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-[#323A70] rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-[13px] text-[#323A70] leading-relaxed">
                        {instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Configuration */}
            <div className="w-1/2 flex flex-col">
              <div className="m-4 flex flex-col overflow-y-auto flex-1 max-h-[calc(100vh-150px)]">
                {/* Match Header */}
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
                </div>

                {/* Ticket Details */}
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

                {/* Flow-specific sections */}
                {ETicketsFlow && (
                  <>
                    <QRLinksConfigSection />
                    <AdditionalInfoSection />
                  </>
                )}

                {paperTicketFlow && (
                  <>
                    <PaperTicketCourierDetailsSection />
                    <AdditionalInfoSection />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-4 justify-end w-full">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                onClick={() => {
                  const updatedObject = ETicketsFlow 
                    ? { qr_links: ticketLinks, additional_info: additionalInfo }
                    : paperTicketFlow 
                    ? { 
                        paper_ticket_details: paperTicketDetails,
                        courier_type: paperTicketDetails.courier_type,
                        courier_name: paperTicketDetails.courier_company,
                        courier_tracking_details: paperTicketDetails.tracking_details,
                        upload_tickets: uploadedFiles,
                        additional_info: additionalInfo,
                      }
                    : { upload_tickets: transferredFiles, additional_info: additionalInfo };
                  
                  handleConfirmClick(updatedObject, rowIndex, rowData);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </RightViewModal>
    </div>
  );
};

export default UploadTickets;