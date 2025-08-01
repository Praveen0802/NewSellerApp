import React, { useState, useRef, useCallback, useMemo } from "react";
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
import {
  myListingUploadTickets,
  uploadPopInstruction,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import { set } from "lodash";
import AdditionalInfoSection from "./AdditionalInfo";
import QRLinksSection from "./QRLinkSection";
import PaperTicketCourierSection from "./paperTicketCourierSection";

const UploadTickets = ({
  show,
  onClose,
  showInstruction = false,
  rowData,
  matchDetails,
  rowIndex,
  handleConfirmClick,
  myListingPage = false,
}) => {
  const proofUploadView = rowData?.handleProofUpload || false;
  const ticketTypes = !isNaN(parseInt(rowData?.ticket_type))
    ? rowData?.ticket_type
    : rowData?.ticket_types || rowData?.ticket_type_id;
  const ETicketsFlow = [4]?.includes(parseInt(ticketTypes));
  const paperTicketFlow = parseInt(ticketTypes) === 3;
  const normalFlow = !ETicketsFlow && !paperTicketFlow;

  // Get the quantity limit from rowData
  // For proof upload view, limit to 1, otherwise use the original quantity
  const maxQuantity = proofUploadView
    ? 1
    : parseInt(rowData?.add_qty_addlist || rowData?.quantity) || 0;

  const [isLoading, setIsLoading] = useState(false);

  const [showAssigned, setShowAssigned] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Files in left panel
  const [transferredFiles, setTransferredFiles] = useState(
    rowData?.upload_tickets || []
  ); // Files in right panel

  const [proofUploadedFiles, setProofUploadedFiles] = useState([]); // Files in left panel
  const [proofTransferredFiles, setProofTransferredFiles] = useState(
    rowData?.pop_upload_tickets || []
  ); // Files in right panel

  // State for ETicketsFlow - storing links for each quantity

  // State for Paper Ticket Flow - storing courier info
  const [paperTicketDetails, setPaperTicketDetails] = useState({
    courier_type: "company",
    courier_company: "",
    tracking_details: "",
  });

  // State for additional info

  const fileInputRef = useRef(null);
  const paperTicketCourierRef = useRef();

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        // For proof upload view, only allow one file
        if (proofUploadView) {
          const newFile = {
            id: Date.now(),
            name: files[0].name,
            file: files[0],
          };
          setProofUploadedFiles([newFile]); // Replace existing files with just one
        } else {
          const newFiles = files.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file,
          }));
          setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
      }
    },
    [proofUploadView]
  );

  const handleDeleteUploaded = useCallback(
    (id) => {
      if (proofUploadView) {
        setProofUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      } else {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      }
    },
    [proofUploadView]
  );

  const handleRemoveFromSlot = useCallback(
    (slotIndex) => {
      if (proofUploadView) {
        setProofTransferredFiles((prev) => {
          const newTransferredFiles = [...prev];
          newTransferredFiles.splice(slotIndex, 1);
          return newTransferredFiles;
        });
      } else {
        setTransferredFiles((prev) => {
          const newTransferredFiles = [...prev];
          newTransferredFiles.splice(slotIndex, 1);
          return newTransferredFiles;
        });
      }
    },
    [proofUploadView]
  );

  const handleTransferSingleFile = useCallback(
    (fileId) => {
      if (proofUploadView) {
        const fileToTransfer = proofUploadedFiles.find(
          (file) => file.id === fileId
        );
        const remainingSlots = maxQuantity - proofTransferredFiles.length;

        if (remainingSlots <= 0) {
          alert(
            `Maximum limit reached. You can only have ${maxQuantity} files.`
          );
          return;
        }

        if (fileToTransfer) {
          setProofTransferredFiles((prev) => [...prev, fileToTransfer]);
          setProofUploadedFiles((prev) =>
            prev.filter((file) => file.id !== fileId)
          );
        }
      } else {
        const fileToTransfer = uploadedFiles.find((file) => file.id === fileId);
        const remainingSlots = maxQuantity - transferredFiles.length;

        if (remainingSlots <= 0) {
          alert(
            `Maximum limit reached. You can only have ${maxQuantity} files.`
          );
          return;
        }

        if (fileToTransfer) {
          setTransferredFiles((prev) => [...prev, fileToTransfer]);
          setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        }
      }
    },
    [
      proofUploadView,
      proofUploadedFiles,
      maxQuantity,
      proofTransferredFiles.length,
      uploadedFiles,
      transferredFiles.length,
    ]
  );

  const canTransferFile = useCallback(
    (fileId) => {
      if (proofUploadView) {
        return proofTransferredFiles.length < maxQuantity;
      } else {
        return transferredFiles.length < maxQuantity;
      }
    },
    [
      proofUploadView,
      proofTransferredFiles.length,
      transferredFiles.length,
      maxQuantity,
    ]
  );

  // Handle paper ticket details change - FIXED
  const handlePaperTicketDetailChange = useCallback((field, value) => {
    setPaperTicketDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const additionalInfoRef = useRef();
  const qrLinksRef = useRef();

  // Common instructions based on flow type - Memoized
  const instructions = useMemo(() => {
    if (proofUploadView) {
      return [
        "Upload proof of purchase or ticket confirmation document",
        "Accepted formats: PDF, JPG, JPEG, PNG",
        "Only one file can be uploaded for proof verification",
        "Ensure the document clearly shows ticket details and purchase information",
        "Click 'Transfer' button to move the file to the assignment area",
        "Confirm the proof document is uploaded by clicking the green 'confirm' button",
      ];
    } else if (ETicketsFlow) {
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
  }, [ETicketsFlow, paperTicketFlow, proofUploadView]);

  // Common Match Header Component - Move outside useMemo
  const MatchHeader = () => (
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

  // Common Ticket Details Component - Move outside useMemo
  const TicketDetails = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
      <div className="grid grid-cols-4 bg-gray-100 px-3 py-2 border-b border-gray-200">
        <div className="text-xs font-medium text-[#323A70]">Listing ID</div>
        <div className="text-xs font-medium text-[#323A70]">
          {proofUploadView ? "Proof Required" : "Quantity"}
        </div>
        <div className="text-xs font-medium text-[#323A70]">Ticket Details</div>
        <div className="text-xs font-medium text-[#323A70]">
          {ETicketsFlow
            ? "Type"
            : paperTicketFlow
            ? "Type"
            : proofUploadView
            ? "Status"
            : "Row (Seat)"}
        </div>
      </div>

      <div className="grid grid-cols-4 bg-[#F9F9FB] py-2 px-3 border-b border-gray-200">
        <div className="text-xs truncate">{rowData?.id || "N/A"}</div>
        <div className="text-xs truncate">
          {proofUploadView ? "1 Document" : maxQuantity}
        </div>
        <div className="text-xs truncate">
          {rowData?.ticket_category || "N/A"}, {rowData?.ticket_block || ""}
        </div>
        <div className="text-xs truncate">
          {ETicketsFlow ? (
            "E-Ticket"
          ) : paperTicketFlow ? (
            "Paper Ticket"
          ) : proofUploadView ? (
            <span className="text-orange-600">Pending Upload</span>
          ) : (
            <div className="flex gap-5 items-center justify-end">
              <span>{rowData?.row || "0"} (0)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Common Instructions Component - Move outside useMemo
  const InstructionsPanel = ({ title, instructions, children }) => (
    <div className="border-[1px] border-[#E0E1EA] rounded-[6px]">
      <p className="p-[10px] text-[#323A70] text-[16px] font-semibold border-b-[1px] border-[#E0E1EA]">
        {title}
      </p>
      {instructions && (
        <ul className="p-[10px] list-decimal pl-[30px] flex flex-col gap-1">
          {instructions.map((item, index) => (
            <li className="text-[12px] text-[#323A70]" key={index}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );

  // File Upload Section for Normal Flow - Move outside useMemo
  const FileUploadSection = () => {
    // Use the appropriate state variables based on proof upload view
    const currentUploadedFiles = proofUploadView
      ? proofUploadedFiles
      : uploadedFiles;

    return (
      <>
        {/* Drag and drop area */}
        <div className="border-1 bg-[#F9F9FB] border-dashed border-[#130061] rounded-lg p-4 flex flex-col gap-1 items-center justify-center ">
          <Image src={uploadImage} width={42} height={42} alt="Upload" />
          <p className="text-xs text-[#323A70] mb-1">
            {proofUploadView
              ? "Add your proof document to start uploading"
              : "Add your file(s) to start uploading"}
          </p>
          <p className="text-xs text-gray-500">OR</p>
          <Button
            onClick={handleBrowseFiles}
            classNames={{
              root: "py-2 border-1 border-[#0137D5] rounded-sm ",
              label_: "text-[12px] font-medium !text-[#0137D5]",
            }}
          >
            Browse Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple={!proofUploadView} // Only allow multiple files if not proof upload
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          {proofUploadView && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum 1 file allowed for proof upload
            </p>
          )}
        </div>

        {/* Uploaded files list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-[#323A70]">
              {proofUploadView
                ? `Proof Document (${currentUploadedFiles.length}/1)`
                : `Uploaded Files (${currentUploadedFiles.length})`}
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto border border-[#E0E1EA] rounded">
            {currentUploadedFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {proofUploadView
                  ? "No proof document uploaded yet"
                  : "No files uploaded yet"}
              </div>
            ) : (
              currentUploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 truncate max-w-32">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleTransferSingleFile(file.id)}
                      disabled={!canTransferFile(file.id)}
                      classNames={{
                        root: `py-1 px-2 cursor-pointer rounded-sm text-xs ${
                          canTransferFile(file.id)
                            ? "bg-[#0137D5] text-white hover:bg-[#0137D5]/90"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`,
                        label_:
                          "text-[10px] font-medium flex items-center gap-1",
                      }}
                    >
                      {proofUploadView ? "Attach" : "Add"}{" "}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                    <button
                      className="p-1 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteUploaded(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  // E-Ticket Info Section - Move outside useMemo
  const ETicketInfoSection = () => (
    <div className="">
      <div className="">
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

        <div className="mt-4 pt-3 border-t border-[#E0E1EA]">
          <h4 className="text-[13px] font-medium text-[#323A70] mb-2">
            What if I have any issues at the venue?
          </h4>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-[#323A70] rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-[13px] text-[#323A70] leading-relaxed">
              If you have experienced issues at the turnstile, please call the
              emergency contact number. They will be able to fix the issue for
              you. DO NOT go to the ticket office or seek assistance from the
              stewards as they will only cancel the tickets and won't replace
              them for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Paper Ticket Info Section - Move outside useMemo
  const PaperTicketInfoSection = () => (
    <div className="">
      <div className="">
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

        <div className="mt-4 pt-3 border-t border-[#E0E1EA]">
          <h4 className="text-[13px] font-medium text-[#323A70] mb-2">
            Important Delivery Information
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#323A70] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-[13px] text-[#323A70] leading-relaxed">
                Delivery typically takes 3-5 business days. For urgent
                deliveries, express options may be available at additional cost.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#323A70] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-[13px] text-[#323A70] leading-relaxed">
                If choosing collection, tickets will be available 24 hours
                before the event. Bring your booking reference and valid ID.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E0E1EA]">
          <h4 className="text-[13px] font-medium text-[#323A70] mb-2">
            What if I have issues with my paper tickets?
          </h4>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-[#323A70] rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-[13px] text-[#323A70] leading-relaxed">
              For any issues with paper ticket delivery or collection, contact
              our customer service team immediately. Have your booking reference
              ready when calling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Left Panel Content - Now with independent scrolling
  const LeftPanelContent = () => (
    <div className="w-1/2 border-r border-[#E0E1EA] flex flex-col">
      <div className="p-3 m-4 flex flex-col gap-4 overflow-y-auto flex-1 max-h-[calc(100vh-150px)]">
        {ETicketsFlow ? (
          <ETicketInfoSection />
        ) : paperTicketFlow ? (
          <PaperTicketInfoSection />
        ) : (
          <>
            <FileUploadSection />
            {(proofUploadView || showInstruction) && (
              <InstructionsPanel
                title={
                  proofUploadView
                    ? "Proof Upload Instructions"
                    : "Upload Instructions"
                }
                instructions={instructions}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  // Ticket Assignment Section for Normal Flow - Move outside useMemo
  const TicketAssignmentSection = () => {
    // Use the appropriate state variables based on proof upload view
    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : transferredFiles;

    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-[#323A70]">
            {proofUploadView
              ? `Proof Assignment (${currentTransferredFiles.length}/${maxQuantity})`
              : `Ticket Assignment (${currentTransferredFiles.length}/${maxQuantity})`}
          </h4>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {maxQuantity === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm border border-gray-200 rounded">
              No quantity specified
            </div>
          ) : (
            Array.from({ length: maxQuantity }, (_, index) => {
              const itemNumber = index + 1;
              const assignedFile = currentTransferredFiles[index];

              return (
                <div
                  key={itemNumber}
                  className="grid grid-cols-2 items-center border-b border-gray-200 last:border-b-0"
                >
                  <div className="px-3 py-2 text-xs font-medium text-[#323A70]">
                    {proofUploadView
                      ? `Proof Document`
                      : `Ticket ${itemNumber}`}
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
                        {proofUploadView
                          ? "Waiting for proof document..."
                          : "Waiting for file..."}
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
  };

  // QR Links Configuration Section for E-Ticket Flow - Move outside useMemo
  const QRLinksConfigSection = () => (
    <QRLinksSection
      ref={qrLinksRef}
      maxQuantity={maxQuantity}
      initialData={rowData?.qr_links || null} // Pass initial data if available
      onChange={(newLinks) => {
        // Optional: Handle real-time changes if needed
        console.log("QR Links updated:", newLinks);
      }}
    />
  );

  // Paper Ticket Courier Details Section - For Right Panel - Move outside useMemo
  const PaperTicketCourierDetailsSection = () => (
    <PaperTicketCourierSection
      ref={paperTicketCourierRef}
      maxQuantity={maxQuantity}
      initialData={rowData?.paper_ticket_details || null} // Pass initial data if available
      onChange={(newData) => {
        // Optional: Handle real-time changes if needed
        console.log("Paper ticket courier data updated:", newData);
      }}
    />
  );

  // Right Panel Content - Now with independent scrolling
  const RightPanelContent = () => (
    <div className="w-1/2 flex flex-col">
      <div className="m-4 flex flex-col overflow-y-auto flex-1 max-h-[calc(100vh-150px)]">
        <MatchHeader />
        <TicketDetails />

        {ETicketsFlow ? (
          <>
            <QRLinksConfigSection />
            {!proofUploadView && (
              <AdditionalInfoSection
                ref={additionalInfoRef}
                paperTicketFlow={paperTicketFlow}
                initialData={null}
              />
            )}
          </>
        ) : paperTicketFlow ? (
          <>
            <PaperTicketCourierDetailsSection />
            {!proofUploadView && (
              <AdditionalInfoSection
                ref={additionalInfoRef}
                paperTicketFlow={paperTicketFlow}
                initialData={null}
              />
            )}
          </>
        ) : (
          <>
            <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
              <TicketAssignmentSection />
            </div>
            {!proofUploadView && (
              <AdditionalInfoSection
                ref={additionalInfoRef}
                paperTicketFlow={paperTicketFlow}
                initialData={null}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  // Calculate completion status for confirm button
  const getCompletionStatus = useMemo(() => {
    if (ETicketsFlow) {
      const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
      const completedTickets = currentQRLinks.filter(
        (link) => link.qr_link_android && link.qr_link_ios
      ).length;
      return { completed: 1, total: maxQuantity };
    } else if (paperTicketFlow) {
      // Use the ref to get completion status
      const paperTicketStatus = { completed: 1, total: maxQuantity };
      return paperTicketStatus;
    } else if (normalFlow || proofUploadView) {
      const currentTransferredFiles = proofUploadView
        ? proofTransferredFiles
        : transferredFiles;
      return { completed: currentTransferredFiles.length, total: maxQuantity };
    }
    return { completed: 0, total: 0 };
  }, [
    ETicketsFlow,
    paperTicketFlow,
    normalFlow,
    proofUploadView,
    transferredFiles,
    proofTransferredFiles,
    maxQuantity,
    // Note: Remove paperTicketDetails dependency since it's now handled by the component
  ]);

  const isConfirmDisabled = getCompletionStatus.completed === 0;

  // Get modal title based on flow type
  const getModalTitle = () => {
    if (proofUploadView) return "Upload Proof Document";
    if (ETicketsFlow) return "Configure E-Tickets";
    if (paperTicketFlow) return "Configure Paper Tickets";
    return "Upload Tickets";
  };

  const getModalSubtitle = () => {
    if (proofUploadView) return " (1 document required)";
    if (ETicketsFlow) return ` (${maxQuantity} tickets)`;
    if (paperTicketFlow) return ` (${maxQuantity} tickets)`;
    return ` (Max: ${maxQuantity})`;
  };

  const handleTicketsPageApiCall = async (updatedObject) => {
    setIsLoading(true);
    const constructTicketFormData = (updatedObject) => {
      const formData = new FormData();
      const index = 0; // Since we're dealing with a single row
      formData.append(`data[0][ticket_id]`, rowData?.rawTicketData?.s_no);
      formData.append(
        `data[0][ticket_type]`,
        rowData?.rawTicketData?.ticket_type_id
      );
      formData.append(`data[0][match_id]`, rowData?.rawMatchData?.m_id);

      // Common additional info fields for all flows (except proof upload)
      if (updatedObject.additional_info && !proofUploadView) {
        formData.append(
          `data[${index}][additional_file_type]`,
          updatedObject.additional_info.template || ""
        );
        formData.append(
          `data[${index}][additional_dynamic_content]`,
          updatedObject.additional_info.dynamicContent || ""
        );
      }

      // Handle Normal Flow and Proof Upload - upload_tickets
      if (
        updatedObject.upload_tickets &&
        updatedObject.upload_tickets.length > 0
      ) {
        updatedObject.upload_tickets.forEach((ticket, ticketIndex) => {
          if (ticket.file && ticket.file instanceof File) {
            const fieldName = proofUploadView
              ? `data[${index}][proof_document][${ticketIndex}]`
              : `data[${index}][upload_tickets][${ticketIndex}]`;
            formData.append(fieldName, ticket.file, ticket.name);
          }
        });
      }

      // Handle E-Ticket Flow - qr_links
      if (updatedObject.qr_links && updatedObject.qr_links.length > 0) {
        const androidLinks = [];
        const iosLinks = [];

        updatedObject.qr_links.forEach((link) => {
          if (link.qr_link_android) {
            androidLinks.push(link.qr_link_android);
          }
          if (link.qr_link_ios) {
            iosLinks.push(link.qr_link_ios);
          }
        });

        if (androidLinks.length > 0) {
          formData.append(
            `data[${index}][qr_link_android]`,
            androidLinks.join(",")
          );
        }
        if (iosLinks.length > 0) {
          formData.append(`data[${index}][qr_link_ios]`, iosLinks.join(","));
        }
      }

      // Handle Paper Ticket Flow - courier details and upload_tickets
      if (updatedObject.courier_type) {
        formData.append(
          `data[${index}][courier_type]`,
          updatedObject.courier_type
        );
      }
      if (updatedObject.courier_name) {
        formData.append(
          `data[${index}][courier_name]`,
          updatedObject.courier_name
        );
      }
      if (updatedObject.courier_tracking_details) {
        formData.append(
          `data[${index}][courier_tracking_details]`,
          updatedObject.courier_tracking_details
        );
      }

      // Add row ID if available
      if (rowData?.id) {
        formData.append(`data[${index}][id]`, rowData.id);
      }

      // Add proof upload flag if applicable
      if (proofUploadView) {
        formData.append(`data[${index}][is_proof_upload]`, "1");
      }

      return formData;
    };

    try {
      const formData = constructTicketFormData(updatedObject);

      // Call the API with the constructed FormData
      const response = await myListingUploadTickets("", formData);
      console.log(response.success, "response.successresponse.success");
      // Handle response
      if (response.success) {
        // Handle success - maybe close modal, show success message, etc.
        onClose();
        toast.success(
          proofUploadView
            ? "Proof document uploaded successfully"
            : "Tickets uploaded successfully"
        );
      } else {
        // Handle error
        console.error("Upload failed:", response.message);
        toast.error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("API call failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirmCtaClick = useCallback(async () => {
    const currentAdditionalInfo =
      additionalInfoRef.current?.getCurrentData() || {
        template: "",
        dynamicContent: "",
      };

    const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
    const currentPaperTicketData =
      paperTicketCourierRef.current?.getCurrentData() || {
        courierDetails: {
          courier_type: "company",
          courier_company: "",
          tracking_details: "",
        },
        uploadedFiles: [],
      };
    if (proofUploadView && myListingPage) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append(`ticket_id`, rowData?.rawTicketData?.s_no);
      formData.append(`match_id`, rowData?.rawTicketData?.match_id);
      // Use proofTransferredFiles instead of transferredFiles for proof upload
      if (
        proofTransferredFiles[0]?.file &&
        proofTransferredFiles[0]?.file instanceof File
      ) {
        formData.append(
          `pop_upload_tickets`,
          proofTransferredFiles[0]?.file,
          proofTransferredFiles[0]?.name
        );
      }
      try {
        const response = await uploadPopInstruction("", formData);
        console.log(response, "response.response.response");
        setIsLoading(false);
        onClose();
        toast.success(
          proofUploadView
            ? "Proof document uploaded successfully"
            : "Tickets uploaded successfully"
        );
      } catch (error) {
        console.error("API call failed:", error);
        toast.error("Upload failed. Please try again.");
        setIsLoading(false);
      }
    } else if (normalFlow) {
      // Use the appropriate transferred files based on proof upload view
      const filesToUpload = proofUploadView
        ? proofTransferredFiles
        : transferredFiles;
      const updatedObject = {
        upload_tickets: filesToUpload,
        additional_info: currentAdditionalInfo,
      };
      if (myListingPage) {
        handleTicketsPageApiCall(updatedObject);
      } else {
        handleConfirmClick(updatedObject, rowIndex, rowData);
      }
    } else if (ETicketsFlow) {
      const updatedObject = {
        qr_links: currentQRLinks, // Use data from QRLinksSection component
        additional_info: currentAdditionalInfo,
      };
      if (myListingPage) {
        handleTicketsPageApiCall(updatedObject);
      } else {
        handleConfirmClick(updatedObject, rowIndex, rowData);
      }
    } else if (paperTicketFlow) {
      const updatedObject = {
        paper_ticket_details: currentPaperTicketData.courierDetails,
        courier_type: currentPaperTicketData.courierDetails.courier_type,
        courier_name: currentPaperTicketData.courierDetails.courier_company,
        courier_tracking_details:
          currentPaperTicketData.courierDetails.tracking_details,
        upload_tickets: currentPaperTicketData.uploadedFiles,
        additional_info: currentAdditionalInfo,
      };
      if (myListingPage) {
        handleTicketsPageApiCall(updatedObject);
      } else {
        handleConfirmClick(updatedObject, rowIndex, rowData);
      }
    }
    if (
      proofUploadView &&
      !myListingPage &&
      proofTransferredFiles?.length > 0
    ) {
      const updatedObject = {
        pop_upload_tickets: proofTransferredFiles?.[0],
      };
      handleConfirmClick(updatedObject, rowIndex, rowData);
    }
  }, [
    proofUploadView,
    normalFlow,
    ETicketsFlow,
    paperTicketFlow,
    transferredFiles,
    proofTransferredFiles,
    uploadedFiles,
    handleConfirmClick,
    rowIndex,
    rowData,
    myListingPage,
  ]);

  return (
    <div>
      <RightViewModal
        className="!w-[70vw]"
        show={show}
        onClose={() => onClose()}
      >
        <div className="w-full  h-full bg-white  rounded-lg relative flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#E0E1EA] flex-shrink-0">
            <h2 className="text-lg font-medium text-[#323A70]">
              {getModalTitle()}
              {getModalSubtitle()}
            </h2>
            <button onClick={() => onClose()} className="text-gray-500">
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          {/* Main Content - Now with proper flex structure */}
          <div className="flex flex-1 overflow-hidden">
            <LeftPanelContent />
            <RightPanelContent />
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
              <Button
                className={`px-4 py-2 ${
                  isConfirmDisabled ? "bg-gray-300" : "bg-green-500"
                } text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300 flex gap-2 items-center disabled:cursor-not-allowed`}
                disabled={isConfirmDisabled}
                loading={isLoading}
                onClick={handleConfirmCtaClick}
              >
                {proofUploadView ? "Submit Proof" : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </RightViewModal>
    </div>
  );
};

export default UploadTickets;
