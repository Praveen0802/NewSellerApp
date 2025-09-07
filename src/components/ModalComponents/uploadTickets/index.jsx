import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  X,
  Trash2,
  ChevronUp,
  ArrowRight,
  Trash,
} from "lucide-react";
import CustomModal from "@/components/commonComponents/customModal";
import uploadImage from "../../../../public/uploadIconNew.svg";
import Image from "next/image";
import Button from "@/components/commonComponents/button";
import RightViewContainer from "@/components/dashboardPage/reportViewContainer/rightViewContainer";
import RightViewModal from "@/components/commonComponents/rightViewModal";
import {
  deleteTicketUpload,
  myListingUploadTickets,
  updateAdditionalFile,
  uploadPopInstruction,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import { has, max, set } from "lodash";
import AdditionalInfoSection from "./AdditionalInfo";
import QRLinksSection from "./QRLinkSection";
import PaperTicketCourierSection from "./paperTicketCourierSection";
import TemplateContentRenderer from "./templateContent";
import SubUploadParent from "./subUploadParent";
import { readCookie } from "@/utils/helperFunctions/cookie";
import { separateDateTime } from "@/utils/helperFunctions";
import FilePreviewModal from "./previewFile";

const UploadTickets = ({
  show,
  onClose,
  showInstruction = false,
  rowData,
  matchDetails,
  rowIndex,
  handleConfirmClick,
  myListingPage = false,
  mySalesPage = false,
}) => {
  const proofUploadView = rowData?.handleProofUpload || false;
  console.log(rowData, "rowDatarowData");

  // Mobile breakpoint detection
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsSmallMobile(width < 480);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const ticketTypes = !isNaN(parseInt(rowData?.ticket_type))
    ? rowData?.ticket_type
    : rowData?.ticket_types || rowData?.ticket_type_id;
  const ETicketsFlow = [4]?.includes(parseInt(ticketTypes));
  const paperTicketFlow = parseInt(ticketTypes) === 3;
  const normalFlow = !ETicketsFlow && !paperTicketFlow;

  const existingUploadedTickets = rowData?.rawTicketData?.uploadTickets || [];

  const hasExistingTickets = false;
  const existingProofTickets = rowData?.rawTicketData?.popUpload || [];
  // Updated maxQuantity calculation for proof upload
  const maxQuantity = proofUploadView
    ? 1 // Always 1 for proof upload
    : parseInt(rowData?.add_qty_addlist || rowData?.quantity) || 0;

  const hasPartialUploads =
    hasExistingTickets && existingUploadedTickets.length < maxQuantity;

  const [isLoading, setIsLoading] = useState(false);
  const [showAssigned, setShowAssigned] = useState(false);

  // Normal flow states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [assignedFiles, setAssignedFiles] = useState([]);
  const [transferredFiles, setTransferredFiles] = useState([]);

  const [draggedAssignedFile, setDraggedAssignedFile] = useState(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState(null);

  // Proof upload flow states
  const [proofUploadedFiles, setProofUploadedFiles] = useState([]);
  const [proofTransferredFiles, setProofTransferredFiles] = useState([]);

  // NEW: Drag and drop states
  // Track currently dragged file (ref to avoid extra re-renders mid-drag)
  const [draggedFile, setDraggedFile] = useState(null); // keep for final UI state after drop
  const draggingFileRef = useRef(null); // used during the gesture
  const [dragOver, setDragOver] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  // Refs to stabilize first-attempt drag & drop
  const dragGhostRef = useRef(null);
  const dragPayloadRef = useRef(null);
  const draggingAssignedRef = useRef(null);
  const draggingAssignedFromIndexRef = useRef(null);

  // State for Paper Ticket Flow - storing courier info
  const [paperTicketDetails, setPaperTicketDetails] = useState({
    courier_type: "company",
    courier_company: "",
    tracking_details: "",
  });

  const additionalTemplateFile =
    rowData?.rawTicketData?.additional_template_file;
  const fileInputRef = useRef(null);
  const paperTicketCourierRef = useRef();

  // Create ref for SubUploadParent to access additional info
  const subUploadParentRef = useRef();
  const qrLinksRef = useRef();

  const templateDataRef = useRef({
    templateName: "",
    templateContent: "",
    selectedTemplate: null,
  });
  const handleCloseFunction = (passValue) => {
    setAssignedFiles([]);
    console.log("calling thisss");
    onClose(passValue);
  };
  // Enhanced useEffect to properly handle proof upload state initialization
  useEffect(() => {
    if (!show) return;

    if (proofUploadView) {
      if (existingProofTickets && existingProofTickets.length > 0) {
        const existingProofFiles = existingProofTickets.map(
          (ticket, index) => ({
            id: `${ticket.id || index}`,
            name: `Proof Document`,
            file: null,
            url: ticket.pop_upload || ticket.url,
            isExisting: true,
            existingId: ticket.id,
          })
        );
        setProofTransferredFiles(existingProofFiles);
        console.log(existingProofFiles, "existingProofFiles");
        setAssignedFiles(existingProofFiles);
      } else {
        setProofTransferredFiles([]);
      }
      setProofUploadedFiles([]);
    } else {
      console.log("hereeee");
      if (
        existingUploadedTickets.length > 0 &&
        existingUploadedTickets?.[0]?.upload_tickets
      ) {
        const existingFiles = existingUploadedTickets
          .filter((ticket) => ticket.upload_tickets) // Only include tickets with URLs
          .map((ticket, index) => ({
            id: `${ticket.id}`,
            name: `Ticket ${index + 1}`,
            file: null,
            url: ticket.upload_tickets,
            isExisting: true,
            existingId: ticket.id,
          }));
        setTransferredFiles(existingFiles);
        setAssignedFiles(existingFiles);
      } else {
        const initialUploadTickets = rowData?.upload_tickets || [];
        setTransferredFiles(initialUploadTickets);
        setAssignedFiles(initialUploadTickets);
      }
      setUploadedFiles([]);
    }
  }, [
    show,
    proofUploadView,
    hasExistingTickets,
    rowData?.rawTicketData?.s_no,
    rowData?.id,
    rowData?.pop_upload_tickets,
    existingUploadedTickets.length,
    hasPartialUploads,
  ]);

  // Enhanced handleBrowseFiles to handle proof upload restrictions
  const handleBrowseFiles = useCallback(() => {
    if (proofUploadView) {
      if (proofTransferredFiles.length >= 1) {
        alert(
          "Only one proof document can be uploaded. Please remove the existing document first."
        );
        return;
      }
    } else {
      if (hasExistingTickets && !hasPartialUploads) {
        return;
      }
    }
    fileInputRef.current?.click();
  }, [
    proofUploadView,
    proofTransferredFiles.length,
    hasExistingTickets,
    hasPartialUploads,
  ]);

  // Enhanced handleFileUpload to properly handle single file for proof
  const handleFileUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        if (proofUploadView) {
          const newFile = {
            id: Date.now(),
            name: files[0].name,
            file: files[0],
          };
          setProofUploadedFiles([newFile]);

          if (files.length > 1) {
            alert(
              "Only one proof document can be uploaded. The first file has been selected."
            );
          }
        } else {
          if (hasExistingTickets && !hasPartialUploads) {
            return;
          }
          // Total already staged = existing uploaded (not yet transferred) + transferred
          const nonNullTransferred = transferredFiles.filter(Boolean).length;
          const stagedCount = uploadedFiles.length + nonNullTransferred;
          if (stagedCount >= maxQuantity) {
            alert("You have already added the maximum number of files.");
            return;
          }
          const remainingSlots = maxQuantity - stagedCount;
          const filesToAdd = files.slice(0, remainingSlots);

          const newFiles = filesToAdd.map((file, index) => ({
            id: `Hello_${Date.now()}_${index}`,
            name: file.name,
            file: file,
          }));
          setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
      }
    },
    [
      proofUploadView,
      hasExistingTickets,
      hasPartialUploads,
      maxQuantity,
      transferredFiles, // need full array to recalc after null placeholder deletion
      uploadedFiles.length,
    ]
  );

  const handleDeleteUploaded = useCallback(
    (id, assigned) => {
      if (proofUploadView) {
        setProofUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      } else if (assigned) {
        setAssignedFiles((prev) => prev.filter((file) => file.id !== id));
      } else {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      }
    },
    [proofUploadView]
  );

  const [selectedTemplateData, setSelectedTemplateData] = useState({
    templateName: "",
    templateContent: "",
    selectedTemplate: null,
  });

  let templateContent = "";

  const [showPopup, setShowPopup] = useState(false);

  // New function to handle template selection from AdditionalInfoSection
  const handleTemplateSelection = useCallback((templateData) => {
    console.log("Template data received:", templateData);
    templateDataRef.current = {
      templateName: templateData.templateName || "",
      templateContent: templateData.templateContent || "",
      selectedTemplate: templateData.selectedTemplate || null,
    };
    console.log("Template content:", templateContent);
    setShowPopup(!showPopup);
  }, []);

  useEffect(() => {
    console.log(templateDataRef?.current, "templateContent updated");
  }, [templateDataRef.current]);

  // NEW: Enhanced handleTransferSingleFile with drag support and target slot
  const handleTransferSingleFile = useCallback(
    (fileId, targetSlot = null) => {
      if (proofUploadView) {
        if (proofTransferredFiles.length >= maxQuantity) {
          alert("Maximum limit reached. Only one proof document allowed.");
          return;
        }

        const fileToTransfer = proofUploadedFiles.find(
          (file) => file.id === fileId
        );
        if (fileToTransfer) {
          setProofTransferredFiles([fileToTransfer]);
          setProofUploadedFiles([]);
        }
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return;
        }

        const fileToTransfer = uploadedFiles.find((file) => file.id === fileId);
        const nonNullTransferred = transferredFiles.filter(Boolean).length;
        const remainingSlots = maxQuantity - nonNullTransferred;

        if (remainingSlots <= 0) {
          alert(
            `Maximum limit reached. You can only have ${maxQuantity} files.`
          );
          return;
        }

        if (fileToTransfer) {
          // NEW: If targetSlot is specified and valid, insert at that position
          if (
            targetSlot !== null &&
            targetSlot >= 1 &&
            targetSlot <= maxQuantity
          ) {
            setTransferredFiles((prev) => {
              const newTransferred = [...prev];
              const targetIndex = targetSlot - 1;
              // Ensure array length up to maxQuantity with null placeholders
              if (newTransferred.length < maxQuantity) {
                for (let i = newTransferred.length; i < maxQuantity; i++) {
                  newTransferred[i] = newTransferred[i] || null;
                }
              }
              newTransferred[targetIndex] = fileToTransfer; // place/replace
              return newTransferred;
            });
            setAssignedFiles((prev) => {
              const newTransferred = [...prev];
              const targetIndex = targetSlot - 1;
              // For assignedFiles we keep a compressed list (no nulls) - replace if exists else push
              if (newTransferred[targetIndex]) {
                newTransferred[targetIndex] = fileToTransfer;
              } else {
                // If inserting beyond current length, fill gaps with nulls temporarily then push
                while (newTransferred.length < targetIndex)
                  newTransferred.push(null);
                newTransferred[targetIndex] = fileToTransfer;
              }
              return newTransferred.filter(Boolean);
            });
          } else {
            // Add to first available empty slot, else ignore
            setTransferredFiles((prev) => {
              const newArr = [...prev];
              if (newArr.length < maxQuantity) {
                for (let i = newArr.length; i < maxQuantity; i++) {
                  newArr[i] = newArr[i] || null;
                }
              }
              const firstEmpty = newArr.findIndex((f) => !f);
              if (firstEmpty !== -1) newArr[firstEmpty] = fileToTransfer;
              return newArr;
            });
            setAssignedFiles((prev) => [...prev, fileToTransfer]);
          }
          setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        }
      }
    },
    [
      proofUploadView,
      proofUploadedFiles,
      proofTransferredFiles.length,
      maxQuantity,
      uploadedFiles,
      transferredFiles, // include full array ref so non-null count updates
      hasExistingTickets,
      hasPartialUploads,
    ]
  );

  // Enhanced canTransferFile for proof upload
  const canTransferFile = useCallback(
    (fileId) => {
      if (proofUploadView) {
        return proofTransferredFiles.length < maxQuantity;
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return false;
        }
        return transferredFiles.filter(Boolean).length < maxQuantity;
      }
    },
    [
      proofUploadView,
      proofTransferredFiles.length,
      transferredFiles, // recalc when content changes (nulls)
      maxQuantity,
      hasExistingTickets,
      hasPartialUploads,
    ]
  );

  // Common instructions based on flow type - Memoized
  const instructions = useMemo(() => {
    if (proofUploadView) {
      return [
        "Upload proof of purchase or ticket confirmation document",
        "Accepted formats: PDF, JPG, JPEG, PNG",
        "Only one file can be uploaded for proof verification",
        "Ensure the document clearly shows ticket details and purchase information",
        "Click 'Attach' button to move the file to the assignment area",
        "Confirm the proof document is uploaded by clicking the green 'Submit Proof' button",
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

  // Common Match Header Component
  const MatchHeader = () => (
    <div
      className={`bg-[#343432] ${
        isSmallMobile ? "text-[10px]" : "text-xs"
      } rounded-t-md text-white ${
        isSmallMobile ? "px-2" : "px-4"
      } flex items-center justify-between min-w-0`}
    >
      <div
        className={`${
          isMobile ? "grid-cols-2 gap-1" : "grid-cols-4 gap-2"
        } grid`}
      >
        <h3
          className={`font-medium truncate ${
            isSmallMobile ? "py-2" : "py-3"
          } flex-shrink-0 ${
            isSmallMobile
              ? "max-w-[120px]"
              : isMobile
              ? "max-w-[150px]"
              : "max-w-[200px]"
          } ${isMobile ? "col-span-2" : ""} border-r border-[#51428E]`}
        >
          {matchDetails?.match_name}
        </h3>
        <div
          className={`flex items-center gap-1 ${
            isSmallMobile ? "py-2" : "py-3"
          } ${isMobile ? "" : "border-r border-[#51428E]"}`}
        >
          <Calendar
            className={`${isSmallMobile ? "w-3 h-3" : "w-4 h-4"} flex-shrink-0`}
          />
          <span
            className={`${
              isSmallMobile ? "text-[9px]" : "text-xs"
            } whitespace-nowrap ${isMobile ? "hidden sm:inline" : ""}`}
          >
            {matchDetails?.match_date_format ||
              rowData?.matchDate ||
              separateDateTime(matchDetails?.match_date)?.date}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 ${
            isMobile ? "" : "border-r border-[#51428E]"
          }`}
        >
          <Clock
            className={`${isSmallMobile ? "w-3 h-3" : "w-4 h-4"} flex-shrink-0`}
          />
          <span
            className={`${
              isSmallMobile ? "text-[9px]" : "text-xs"
            } whitespace-nowrap ${isMobile ? "hidden sm:inline" : ""}`}
          >
            {matchDetails?.match_time || rowData?.matchTime}
          </span>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-1">
            <MapPin
              className={`${
                isSmallMobile ? "w-3 h-3" : "w-4 h-4"
              } flex-shrink-0`}
            />
            <span
              className={`${
                isSmallMobile ? "text-[9px]" : "text-xs"
              } whitespace-nowrap`}
            >
              {matchDetails?.stadium_name || rowData?.venue}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="flex-shrink-0">
          <ChevronUp className={`${isSmallMobile ? "w-3 h-3" : "w-4 h-4"}`} />
        </button>
      </div>
    </div>
  );

  // Common Ticket Details Component
  const TicketDetails = () => (
    <div className="border-[1px] border-[#E0E1EA] flex-shrink-0">
      <div
        className={`${
          isMobile ? "grid-cols-2" : "grid-cols-4"
        } grid bg-gray-100 ${
          isSmallMobile ? "px-2 py-1" : "px-3 py-2"
        } border-b border-gray-200`}
      >
        <div
          className={`${
            isSmallMobile ? "text-[10px]" : "text-xs"
          } font-medium text-[#323A70]`}
        >
          Listing ID
        </div>
        <div
          className={`${
            isSmallMobile ? "text-[10px]" : "text-xs"
          } font-medium text-[#323A70]`}
        >
          {proofUploadView ? "Proof Required" : "Quantity"}
        </div>
        {!isMobile && (
          <>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } font-medium text-[#323A70]`}
            >
              Ticket Details
            </div>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } font-medium text-[#323A70]`}
            >
              {ETicketsFlow
                ? "Type"
                : paperTicketFlow
                ? "Type"
                : proofUploadView
                ? "Status"
                : "Row (Seat)"}
            </div>
          </>
        )}
      </div>

      <div
        className={`${
          isMobile ? "grid-cols-2" : "grid-cols-4"
        } grid bg-[#F9F9FB] ${isSmallMobile ? "py-1 px-2" : "py-2 px-3"}`}
      >
        <div
          className={`${isSmallMobile ? "text-[10px]" : "text-xs"} truncate`}
        >
          {myListingPage
            ? rowData?.rawTicketData?.s_no || rowData?.id || "N/A"
            : "-"}
        </div>
        <div
          className={`${isSmallMobile ? "text-[10px]" : "text-xs"} truncate`}
        >
          {proofUploadView ? "1 Document" : maxQuantity}
        </div>
        {!isMobile && (
          <>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } truncate`}
            >
              {rowData?.ticket_category || "N/A"}, {rowData?.ticket_block || ""}
            </div>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } truncate`}
            >
              {[ticketTypes].flat().includes(2) ? (
                "E-Ticket"
              ) : ETicketsFlow ? (
                "Mobile Ticket"
              ) : paperTicketFlow ? (
                "Paper Ticket"
              ) : proofUploadView ? (
                <>
                  {existingProofTickets ? (
                    <span className="text-[#323A70]">{"Uploaded"}</span>
                  ) : (
                    <span className="text-[#323A70]">{"Pending"}</span>
                  )}
                </>
              ) : (
                <div className="flex gap-5 items-center justify-start">
                  <span>{rowData?.row || "0"} (0)</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Mobile additional info row */}
      {isMobile && (
        <div className="grid grid-cols-2 bg-[#F9F9FB] border-t border-gray-200 px-2 py-1">
          <div>
            <div
              className={`${
                isSmallMobile ? "text-[9px]" : "text-[10px]"
              } text-gray-600 font-medium`}
            >
              Details
            </div>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } truncate`}
            >
              {rowData?.ticket_category || "N/A"}, {rowData?.ticket_block || ""}
            </div>
          </div>
          <div>
            <div
              className={`${
                isSmallMobile ? "text-[9px]" : "text-[10px]"
              } text-gray-600 font-medium`}
            >
              {ETicketsFlow
                ? "Type"
                : paperTicketFlow
                ? "Type"
                : proofUploadView
                ? "Status"
                : "Row (Seat)"}
            </div>
            <div
              className={`${
                isSmallMobile ? "text-[10px]" : "text-xs"
              } truncate`}
            >
              {[ticketTypes].flat().includes(2) ? (
                "E-Ticket"
              ) : ETicketsFlow ? (
                "Mobile Ticket"
              ) : paperTicketFlow ? (
                "Paper Ticket"
              ) : proofUploadView ? (
                <>
                  {existingProofTickets ? (
                    <span className="text-[#323A70]">{"Uploaded"}</span>
                  ) : (
                    <span className="text-[#323A70]">{"Pending"}</span>
                  )}
                </>
              ) : (
                <div className="flex gap-5 items-center justify-start">
                  <span>{rowData?.row || "0"} (0)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // QR Links Configuration Section for E-Ticket Flow
  const QRLinksConfigSection = () => (
    <QRLinksSection
      ref={qrLinksRef}
      maxQuantity={maxQuantity}
      initialData={rowData?.qr_links || null}
      existingUploadTickets={existingUploadedTickets}
      onChange={(newLinks) => {
        console.log("QR Links updated:", newLinks);
      }}
    />
  );

  // Paper Ticket Courier Details Section
  const PaperTicketCourierDetailsSection = () => (
    <PaperTicketCourierSection
      ref={paperTicketCourierRef}
      maxQuantity={maxQuantity}
      initialData={rowData?.paper_ticket_details || null}
      rowData={rowData}
      onChange={(newData) => {
        console.log("Paper ticket courier data updated:", newData);
      }}
    />
  );

  // Enhanced completion status calculation
  const getCompletionStatus = useMemo(() => {
    if (ETicketsFlow) {
      const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
      const completedTickets = currentQRLinks.filter(
        (link) => link.qr_link_android && link.qr_link_ios
      ).length;
      return { completed: 1, total: maxQuantity };
    } else if (paperTicketFlow) {
      const paperTicketStatus = { completed: 1, total: maxQuantity };
      return paperTicketStatus;
    } else if (normalFlow || proofUploadView) {
      const currentTransferredFiles = proofUploadView
        ? proofTransferredFiles
        : transferredFiles;
      return {
        completed: currentTransferredFiles.filter(Boolean).length,
        total: maxQuantity,
      };
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
  ]);

  const isConfirmDisabled = getCompletionStatus.completed === 0;

  // Keep assignedFiles in sync (ordered, compressed) with transferredFiles after reorder/move/delete
  useEffect(() => {
    if (proofUploadView) return; // proof uses different set
    setAssignedFiles(transferredFiles.filter(Boolean));
  }, [transferredFiles, proofUploadView]);

  // Enhanced modal title and subtitle
  const getModalTitle = () => {
    if (proofUploadView) return "Upload Proof Document";
    if (ETicketsFlow) return "Mobile Ticket";
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
    console.log(updatedObject, "updatedObjectupdatedObject");
    // setIsLoading(true);
    let hasChanges = false;

    const constructTicketFormData = (updatedObject) => {
      const formData = new FormData();
      const index = 0;
      formData.append(`data[0][ticket_id]`, rowData?.rawTicketData?.s_no);
      formData.append(
        `data[0][ticket_type]`,
        rowData?.rawTicketData?.ticket_type_id
      );
      formData.append(`data[0][match_id]`, rowData?.rawMatchData?.m_id);

      if (paperTicketFlow) {
        formData.append(`data[0][upload_id]`, updatedObject.courier_id || "0");
        if (
          updatedObject.upload_tickets &&
          updatedObject.upload_tickets.length > 0 &&
          !updatedObject?.upload_tickets?.[0]?.url
        ) {
          hasChanges = true;

          updatedObject.upload_tickets.forEach((ticket, idx) => {
            formData.append(
              `data[0][rows][${idx}][file]`,
              ticket.file,
              ticket.name
            );
          });
        }
      }

      // Common additional info fields for all flows (except proof upload)
      if (updatedObject.additional_info && !proofUploadView) {
        if (
          existingUploadedTickets[0]?.additional_file_type !=
          updatedObject.additional_info.template
        ) {
          hasChanges = true;
          formData.append(
            `data[${index}][additional_file_type]`,
            updatedObject.additional_info.template || ""
          );
        }
        if (
          existingUploadedTickets[0]?.additional_dynamic_content !=
          updatedObject.additional_info.dynamicContent
        ) {
          hasChanges = true;
          formData.append(
            `data[${index}][additional_dynamic_content]`,
            updatedObject.additional_info.dynamicContent || ""
          );
        }
      }

      // Handle Normal Flow and Proof Upload - upload_tickets
      // FIXED: Only process new files (non-existing) from updatedObject
      if (
        updatedObject.upload_tickets &&
        updatedObject.upload_tickets.length > 0 &&
        !paperTicketFlow
      ) {
        hasChanges = true;

        // Filter only new files that need to be uploaded
        const newFilesToUpload = updatedObject.upload_tickets.filter(
          (fileObj) => !fileObj.isExisting && fileObj.file instanceof File
        );

        newFilesToUpload.forEach((fileObj, idx) => {
          const uploadId = fileObj.existingId || fileObj.id;
          formData.append(
            `data[0][rows][${idx}][upload_id]`,
            uploadId?.includes("Hello") ? "0" : uploadId
          );
          formData.append(
            `data[0][rows][${idx}][file]`,
            fileObj.file,
            fileObj.name
          );
        });
      }

      // Handle E-Ticket Flow - qr_links
      if (updatedObject.qr_links && updatedObject.qr_links.length > 0) {
        hasChanges = true;

        updatedObject.qr_links.forEach((link, idx) => {
          // Only process links that have at least one QR link (android or ios)
          if (link.qr_link_android || link.qr_link_ios) {
            // Use the existing id if available, otherwise use 0
            const uploadId = link.id || 0;

            formData.append(`data[0][rows][${idx}][upload_id]`, uploadId);

            // Add Android link if it exists
            if (link.qr_link_android) {
              formData.append(
                `data[0][rows][${idx}][qr_link_android]`,
                link.qr_link_android
              );
            }

            // Add iOS link if it exists
            if (link.qr_link_ios) {
              formData.append(
                `data[0][rows][${idx}][qr_link_ios]`,
                link.qr_link_ios
              );
            }
          }
        });
      }

      // Handle Paper Ticket Flow - courier details and upload_tickets
      if (updatedObject.courier_type) {
        hasChanges = true;
        formData.append(
          `data[${index}][rows][0][courier_type]`,
          updatedObject.courier_type
        );
      }
      if (updatedObject.courier_name) {
        hasChanges = true;
        formData.append(
          `data[${index}][rows][0][courier_name]`,
          updatedObject.courier_name
        );
      }
      if (updatedObject.courier_tracking_details) {
        hasChanges = true;
        formData.append(
          `data[${index}][rows][0][courier_tracking_details]`,
          updatedObject.courier_tracking_details
        );
      }

      // Add proof upload flag if applicable
      if (proofUploadView) {
        formData.append(`data[${index}][is_proof_upload]`, "1");
      }

      return formData;
    };

    const constructNewFormData = () => {
      const newFormData = new FormData();

      if (updatedObject.additional_info) {
        if (updatedObject.additional_info?.templateFile) {
          newFormData.append(
            "additional_file",
            updatedObject.additional_info.templateFile,
            "additional_file"
          );
        }

        newFormData.append(
          "additional_file_type",
          updatedObject.additional_info.template || ""
        );
        newFormData.append("template_name", rowData?.rawTicketData?.s_no || "");
        newFormData.append(
          "additional_dynamic_content",
          updatedObject.additional_info.dynamicContent || ""
        );
        newFormData.append(`match_id`, rowData?.rawMatchData?.m_id);
        newFormData.append(`user_id`, readCookie("user_token"));
        newFormData.append(`ticket_id`, rowData?.rawTicketData?.s_no);
        newFormData.append(
          "template_id",
          updatedObject.additional_info.template || ""
        );
      }

      return newFormData;
    };

    try {
      setIsLoading(true);
      const formData = constructTicketFormData(updatedObject);
      console.log(updatedObject, "updatedObjectupdatedObject", formData);

      if (hasChanges) {
        const response = await myListingUploadTickets("", formData);
        if (updatedObject.additional_info) {
          try {
            const newFormData = constructNewFormData(updatedObject);
            if (
              updatedObject.additional_info?.templateFile &&
              typeof updateAdditionalFile === "file"
            ) {
              const data = await updateAdditionalFile("", newFormData);
            }
          } catch (err) {
            console.log("error", err);
          }
        }
        if (response.status == 200) {
          handleCloseFunction();
          toast.success(
            proofUploadView
              ? "Proof document uploaded successfully"
              : "Tickets updated successfully"
          );
        } else {
          console.error("Upload failed:", response.message);
          toast.error(response.message || "Upload failed");
        }
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCtaClick = useCallback(async () => {
    if (mySalesPage) {
      handleCloseFunction();
      return;
    }
    // Get additional info data from SubUploadParent ref instead of additionalInfoRef
    const additionalData =
      subUploadParentRef.current?.getCurrentAdditionalInfoData() || {
        template: "",
        dynamicContent: "",
        templateContent: "",
        selectedTemplateContent: "",
      };

    const currentAdditionalInfo = {
      template: additionalData?.templateId || "",
      templateName: additionalData?.templateName || "",
      dynamicContent: additionalData?.dynamicContent || "",
      templateContent: additionalData?.templateContent || "",
      selectedTemplateContent: additionalData?.selectedTemplateContent || "",
      templateFile: additionalData?.templateFile || null,
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
      if (existingProofTickets?.length <= 0) {
        const formData = new FormData();
        formData.append(`ticket_id`, rowData?.rawTicketData?.s_no);
        formData.append(`match_id`, rowData?.rawTicketData?.match_id);

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
          setIsLoading(false);
          handleCloseFunction();
          toast.success("Proof document uploaded successfully");
        } catch (error) {
          console.error("API call failed:", error);
          setIsLoading(false);
        }
      } else {
        handleCloseFunction();
        setIsLoading(false);
      }
    } else if (normalFlow) {
      if (transferredFiles?.length > 0) {
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
          console.log(
            "handleConfirmClick(updatedObject, rowIndex, rowData)",
            updatedObject,
            rowIndex,
            rowData
          );
          handleConfirmClick(updatedObject, rowIndex, rowData);
        }
      } else {
        handleCloseFunction();
      }
    } else if (ETicketsFlow) {
      const completedTickets = currentQRLinks.filter(
        (link) => link.qr_link_android && link.qr_link_ios
      ).length;
      if (completedTickets > 0) {
        const updatedObject = {
          qr_links: currentQRLinks,
          additional_info: currentAdditionalInfo,
        };
        if (myListingPage) {
          handleTicketsPageApiCall(updatedObject);
        } else {
          handleConfirmClick(updatedObject, rowIndex, rowData);
        }
      } else {
        handleCloseFunction();
      }
    } else if (paperTicketFlow) {
      if (
        currentPaperTicketData.courierDetails.courier_type ||
        currentPaperTicketData.courierDetails.courier_company ||
        currentPaperTicketData.courierDetails.tracking_details ||
        currentPaperTicketData.uploadedFiles?.length > 0
      ) {
        console.log(
          currentPaperTicketData,
          "currentPaperTicketDatacurrentPaperTicketData"
        );
        const updatedObject = {
          paper_ticket_details: currentPaperTicketData.courierDetails,
          courier_type: currentPaperTicketData.courierDetails.courier_type,
          courier_name: currentPaperTicketData.courierDetails.courier_company,
          courier_tracking_details:
            currentPaperTicketData.courierDetails.tracking_details,
          courier_id: currentPaperTicketData.courierDetails?.id,
          upload_tickets: currentPaperTicketData.uploadedFiles,
          additional_info: currentAdditionalInfo,
        };
        if (myListingPage) {
          handleTicketsPageApiCall(updatedObject);
        } else {
          handleConfirmClick(updatedObject, rowIndex, rowData);
        }
      } else {
        handleCloseFunction();
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
    subUploadParentRef, // Add this dependency
  ]);

  // Handle additional info changes callback (optional)
  const handleAdditionalInfoChange = useCallback((data) => {
    console.log("Additional info changed in real-time:", data);
    // You can perform real-time validation or updates here
  }, []);

  // 2. Add this state variable after your existing state declarations
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // 3. Add this function to handle preview clicks
  const handlePreviewClick = useCallback((file, e) => {
    e?.stopPropagation();
    setPreviewFile(file);
    setShowPreview(true);
  }, []);

  // Handle template selection callback (optional)
  const handleTemplateSelect = useCallback((templateData) => {
    console.log("Template selected:", templateData);
    // Handle template selection logic here
  }, []);

  // NEW: Enhanced File Upload Section Component with Drag Functionality
  const FileUploadSection = () => {
    // Use the appropriate state variables based on proof upload view
    const currentUploadedFiles = proofUploadView
      ? proofUploadedFiles
      : uploadedFiles;
    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : transferredFiles;

    // Enhanced upload message for proof upload
    const getUploadMessage = () => {
      if (proofUploadView) {
        if (currentTransferredFiles.length >= 1) {
          return "Proof document has been uploaded";
        }
        return "Add your proof document to start uploading";
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return "All tickets have already been uploaded for this listing";
        } else if (hasPartialUploads) {
          const remainingSlots = maxQuantity - existingUploadedTickets.length;
          return `${existingUploadedTickets.length} of ${maxQuantity} tickets uploaded. Upload ${remainingSlots} more ticket(s)`;
        }
        return "Add your file(s) to start uploading";
      }
    };

    // Enhanced drag area disabled logic
    const isDragAreaDisabled = proofUploadView
      ? currentTransferredFiles.length >= 1
      : transferredFiles.filter(Boolean).length >= maxQuantity;

    // Enhanced no files message
    const getNoFilesMessage = () => {
      if (proofUploadView) {
        if (currentTransferredFiles.length >= 1) {
          return "Proof document assigned";
        }
        return "No proof document uploaded yet";
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return "All files already uploaded and assigned";
        } else if (hasPartialUploads) {
          return `${
            maxQuantity - existingUploadedTickets.length
          } more file(s) can be uploaded`;
        }
        return "No files uploaded yet";
      }
    };

    // NEW: Drag handlers for file items
    const handleDragStart = (e, file) => {
      if (!canTransferFile(file.id)) {
        e.preventDefault();
        return;
      }
      console.debug("[UploadTickets] dragStart file:", file.id);
      try {
        e.dataTransfer.setData(
          "application/x-ticket",
          JSON.stringify({ id: file.id })
        );
      } catch (err) {
        /* ignore */
      }
      try {
        e.dataTransfer.setData("text/plain", file.id);
      } catch (err) {
        /* ignore */
      }
      e.dataTransfer.effectAllowed = "move";
      window.currentDraggedFile = file;
      dragPayloadRef.current = file;
      draggingFileRef.current = file; // use ref during gesture
      // Defer state update to next frame to avoid interrupting native drag initialisation (fix first-attempt issue)
      requestAnimationFrame(() => setDraggedFile(file));
      // Custom ghost
      const ghostElement = document.createElement("div");
      ghostElement.innerHTML = `<div style="background:rgba(255,255,255,.92);border:2px dashed #0137D5;border-radius:8px;padding:10px 14px;font-size:12px;font-family:system-ui,sans-serif;color:#323A70;box-shadow:0 4px 12px rgba(0,0,0,.18);max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;">📄 ${file.name}</div>`;
      ghostElement.style.position = "absolute";
      ghostElement.style.top = "-1000px";
      document.body.appendChild(ghostElement);
      dragGhostRef.current = ghostElement;
      try {
        e.dataTransfer.setDragImage(ghostElement, 10, 10);
      } catch (err) {
        /* ignore */
      }
    };

    const handleDragEnd = () => {
      console.debug(
        "[UploadTickets] dragEnd file:",
        draggingFileRef.current?.id
      );
      window.currentDraggedFile = null;
      draggingFileRef.current = null;
      setDraggedFile(null);
      dragPayloadRef.current = null;
      if (dragGhostRef.current) {
        try {
          document.body.removeChild(dragGhostRef.current);
        } catch (err) {}
        dragGhostRef.current = null;
      }
    };

    // NEW: Enhanced eye icon click handler for FileUploadSection
    const handleFileUploadEyeIconClick = (file, e) => {
      e?.stopPropagation();

      // If file has URL (existing file), open in new tab
      if (file.url && file.isExisting) {
        window.open(file.url, "_blank");
      }
      // If file is newly uploaded (File object), show preview modal
      else if (file.file instanceof File) {
        handlePreviewClick(file, e);
      }
      // Fallback for any other cases
      else if (file.url) {
        window.open(file.url, "_blank");
      }
    };

    console.log(uploadedFiles, "currentUploadedFiles");
    return (
      <>
        {/* Drag and drop area */}
        <div
          className={`border-1 bg-[#F9F9FB] border-dashed border-[#130061] rounded-lg ${
            isSmallMobile ? "p-2" : "p-4"
          } flex flex-col gap-1 items-center justify-center ${
            isDragAreaDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Image
            src={uploadImage}
            width={isSmallMobile ? 32 : 42}
            height={isSmallMobile ? 32 : 42}
            alt="Upload"
          />
          <p
            className={`${
              isSmallMobile ? "text-[10px]" : "text-xs"
            } text-[#323A70] mb-1 text-center`}
          >
            {getUploadMessage()}
          </p>
          {!isDragAreaDisabled && (
            <>
              <p
                className={`${
                  isSmallMobile ? "text-[10px]" : "text-xs"
                } text-gray-500`}
              >
                OR
              </p>
              <Button
                onClick={handleBrowseFiles}
                classNames={{
                  root: `${
                    isSmallMobile ? "py-1" : "py-2"
                  } border-1 border-[#0137D5] rounded-sm`,
                  label_: `${
                    isSmallMobile ? "text-[10px]" : "text-[12px]"
                  } font-medium !text-[#343432]`,
                }}
              >
                Browse Files
              </Button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple={!proofUploadView} // Only allow multiple files if not proof upload
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            disabled={isDragAreaDisabled}
          />
          {proofUploadView && !isDragAreaDisabled && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum 1 file allowed for proof upload
            </p>
          )}
        </div>

        {/* Uploaded files list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3
              className={`${
                isSmallMobile ? "text-xs" : "text-sm"
              } font-medium text-[#323A70] truncate`}
            >
              {proofUploadView
                ? isMobile
                  ? `Proof (${currentUploadedFiles.length}/1)`
                  : `Proof Document (${currentUploadedFiles.length}/1)`
                : isMobile
                ? `Files (${currentUploadedFiles.length})`
                : `Uploaded Files (${currentUploadedFiles.length})`}
            </h3>
            <div className="flex items-center gap-x-2 flex-shrink-0">
              <span
                className={`${
                  isSmallMobile ? "text-[10px]" : "text-xs"
                } text-[#323A70] ${isMobile ? "hidden" : ""}`}
              >
                Show assigned
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showAssigned}
                  onChange={(e) => {
                    setShowAssigned((prev) => !prev);
                  }}
                />
                <div
                  className={`${
                    isSmallMobile ? "w-6 h-2.5" : "w-7 h-3"
                  } bg-gray-200 peer-checked:bg-[#64EAA540] rounded-full transition-all peer peer-checked:after:translate-x-full peer-checked:after:bg-[#64EAA5] after:content-[''] after:absolute ${
                    isSmallMobile
                      ? "after:-top-0.5 after:-left-0.5 after:h-3.5 after:w-3.5"
                      : "after:-top-0.5 after:-left-0.5 after:h-4 after:w-4"
                  } after:bg-gray-400 after:rounded-full after:transition-all after:shadow-md peer-checked:bg-100`}
                ></div>
              </label>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-2 rounded">
            {currentUploadedFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {getNoFilesMessage()}
              </div>
            ) : (
              currentUploadedFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center border border-[#eaeaf1] bg-[#F9F9FB] justify-between ${
                    isSmallMobile ? "px-1 py-1" : "px-[8px] py-[5px]"
                  } transition-all duration-200 ${
                    canTransferFile(file.id)
                      ? "cursor-grab hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500"
                      : "cursor-not-allowed opacity-60"
                  } ${
                    draggingFileRef.current?.id === file.id
                      ? "opacity-50 transform scale-95"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${
                        isSmallMobile
                          ? "text-[10px] max-w-20"
                          : "text-[12px] max-w-32"
                      } text-[#323A70]`}
                    >
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* NEW: Eye icon for uploaded files */}

                    <Button
                      onClick={() => handleTransferSingleFile(file.id)}
                      disabled={!canTransferFile(file.id)}
                      classNames={{
                        root: `${
                          isSmallMobile ? "py-1 px-1" : "py-[4px] px-[6px]"
                        } cursor-pointer rounded-sm ${
                          isSmallMobile ? "text-[8px]" : "text-[10px]"
                        } ${
                          canTransferFile(file.id)
                            ? "bg-[#343432] text-white hover:bg-[#343432]/90"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`,
                        label_: `${
                          isSmallMobile ? "text-[8px]" : "text-[10px]"
                        } font-medium flex items-center gap-1`,
                      }}
                    >
                      {proofUploadView ? "Attach" : "Add"}{" "}
                      <ArrowRight
                        className={`${isSmallMobile ? "w-3 h-3" : "w-4 h-4"}`}
                      />
                    </Button>
                    <button
                      className="pl-2 text-[#130061]  cursor-pointer hover:text-blue-700"
                      onClick={(e) => handleFileUploadEyeIconClick(file, e)}
                      title={
                        file.url && file.isExisting
                          ? "Open file in new tab"
                          : "Preview file"
                      }
                    >
                      <Eye
                        className={`${
                          isSmallMobile ? "w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                      />
                    </button>
                    <button
                      className={`${
                        isSmallMobile ? "p-0.5" : "p-1"
                      } text-[#130061] cursor-pointer`}
                      onClick={() => handleDeleteUploaded(file.id)}
                    >
                      <Trash2
                        className={`${
                          isSmallMobile ? "w-2.5 h-2.5" : "w-3 h-3"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show assigned files section */}
          <div className="pt-2 flex flex-col gap-2">
            {showAssigned &&
              assignedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 border rounded-sm bg-white transition-all duration-200 border-green-600 hover:border-green-600 `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 truncate max-w-32">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* NEW: Eye icon for assigned files */}
                    <button
                      className="p-1 text-gray-900 cursor-pointer hover:text-blue-700"
                      onClick={(e) => handleFileUploadEyeIconClick(file, e)}
                      title={
                        file.url && file.isExisting
                          ? "Open file in new tab"
                          : "Preview file"
                      }
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteUploaded(file.id, true)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </>
    );
  };

  // NEW: Enhanced Ticket Assignment Section Component with Drag Drop Support
  // Replace your existing TicketAssignmentSection function with this updated version:

  const handleReorderTransferredFiles = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      if (proofUploadView) return;

      setTransferredFiles((prev) => {
        const newArray = [...prev];
        // Ensure fixed length with placeholders up to maxQuantity
        if (newArray.length < maxQuantity) {
          for (let i = newArray.length; i < maxQuantity; i++) {
            newArray[i] = newArray[i] || null;
          }
        }
        const draggedItem = newArray[fromIndex];
        if (!draggedItem) return newArray; // nothing to move

        // Strategy: if target slot empty -> move and leave null at original.
        // If target slot filled -> swap.
        const targetItem = newArray[toIndex];
        if (!targetItem) {
          newArray[toIndex] = draggedItem;
          newArray[fromIndex] = null;
        } else {
          newArray[toIndex] = draggedItem;
          newArray[fromIndex] = targetItem;
        }
        return newArray;
      });
    },
    [proofUploadView, maxQuantity]
  );

  const TicketAssignmentSection = () => {
    // Use the appropriate state variables based on proof upload view
    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : transferredFiles;

    // Existing drop handlers for assignment area (unchanged)
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOver(true);
    };

    const handleDragLeave = (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDragOver(false);
        setDragOverSlot(null);
      }
    };

    // Enhanced drop handler to handle both new files and reordering
    const handleDrop = (e, targetSlot = null) => {
      e.preventDefault();
      setDragOver(false);
      setDragOverSlot(null);

      // Check if we're reordering an assigned file
      if (
        (draggedAssignedFile || draggingAssignedRef.current) &&
        (draggedFromIndex !== null ||
          draggingAssignedFromIndexRef.current !== null) &&
        targetSlot !== null
      ) {
        const fromIdx =
          draggingAssignedFromIndexRef.current ?? draggedFromIndex;
        const toIndex = targetSlot - 1;
        handleReorderTransferredFiles(fromIdx, toIndex);
        // Full cleanup so original slot becomes active again immediately
        draggingAssignedRef.current = null;
        draggingAssignedFromIndexRef.current = null;
        window.currentDraggedFile = null;
        dragPayloadRef.current = null;
        setDraggedAssignedFile(null);
        setDraggedFromIndex(null);
        if (dragGhostRef.current) {
          try {
            document.body.removeChild(dragGhostRef.current);
          } catch (err) {}
          dragGhostRef.current = null;
        }
        return;
      }

      // Handle new file drops (existing logic)
      let draggedFileData = null;
      try {
        const customReorder = e.dataTransfer.getData(
          "application/x-ticket-reorder"
        );
        const customTicket = e.dataTransfer.getData("application/x-ticket");
        if (customReorder) {
          draggedFileData = JSON.parse(customReorder);
        } else if (customTicket) {
          draggedFileData = JSON.parse(customTicket);
        } else {
          const plain = e.dataTransfer.getData("text/plain");
          if (plain) draggedFileData = { id: plain };
        }
      } catch (error) {
        console.warn("Failed to parse drag data, using fallback");
      }
      let fileToTransfer = null;
      if (draggedFileData?.id) {
        fileToTransfer =
          uploadedFiles.find((f) => f.id === draggedFileData.id) ||
          proofUploadedFiles.find((f) => f.id === draggedFileData.id) ||
          dragPayloadRef.current ||
          window.currentDraggedFile;
      } else {
        fileToTransfer = dragPayloadRef.current || window.currentDraggedFile;
      }

      if (fileToTransfer && canTransferFile(fileToTransfer.id)) {
        handleTransferSingleFile(fileToTransfer.id, targetSlot);
      }
    };

    // Enhanced slot drag handlers
    const handleSlotDragOver = (e, slotNumber) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSlot(slotNumber);
      e.dataTransfer.dropEffect = "move";
    };

    const handleSlotDragLeave = (e, slotNumber) => {
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDragOverSlot(null);
      }
    };

    const handleSlotDrop = (e, slotNumber) => {
      e.stopPropagation();
      handleDrop(e, slotNumber);
    };

    // NEW: Drag handlers for assigned files (for reordering)
    const handleAssignedFileDragStart = (e, file, index) => {
      if (proofUploadView) {
        e.preventDefault();
        return;
      }
      console.debug(
        "[UploadTickets] reorder dragStart file:",
        file.id,
        "index:",
        index
      );
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData(
          "application/x-ticket-reorder",
          JSON.stringify({ type: "reorder", id: file.id, index })
        );
      } catch (err) {
        /* ignore */
      }
      try {
        e.dataTransfer.setData("text/plain", file.id);
      } catch (err) {
        /* ignore */
      }
      draggingAssignedRef.current = file;
      draggingAssignedFromIndexRef.current = index;
      dragPayloadRef.current = file;
      window.currentDraggedFile = file;
      requestAnimationFrame(() => {
        setDraggedAssignedFile(file);
        setDraggedFromIndex(index);
      });
      const ghostElement = document.createElement("div");
      ghostElement.innerHTML = `<div style="background:rgba(255,255,255,.96);border:2px solid #03BA8A;border-radius:6px;padding:8px 12px;font-size:12px;font-family:system-ui,sans-serif;color:#323A70;box-shadow:0 4px 12px rgba(0,0,0,.22);max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;">🔄 ${file.name}</div>`;
      ghostElement.style.position = "absolute";
      ghostElement.style.top = "-1000px";
      document.body.appendChild(ghostElement);
      dragGhostRef.current = ghostElement;
      try {
        e.dataTransfer.setDragImage(ghostElement, 10, 10);
      } catch (err) {
        /* ignore */
      }
    };

    const handleAssignedFileDragEnd = () => {
      console.debug(
        "[UploadTickets] reorder dragEnd file:",
        draggingAssignedRef.current?.id
      );
      draggingAssignedRef.current = null;
      draggingAssignedFromIndexRef.current = null;
      dragPayloadRef.current = null;
      window.currentDraggedFile = null;
      setDraggedAssignedFile(null);
      setDraggedFromIndex(null);
      if (dragGhostRef.current) {
        try {
          document.body.removeChild(dragGhostRef.current);
        } catch (err) {}
        dragGhostRef.current = null;
      }
    };

    // Existing functions (unchanged)
    const handleDeleteUpload = async (assignedFile) => {
      try {
        if (
          assignedFile?.url &&
          (assignedFile?.existingId || assignedFile?.id) &&
          !mySalesPage
        ) {
          const idToDelete = assignedFile.existingId || assignedFile.id;
          try {
            const response = await deleteTicketUpload("", idToDelete);
            if (response?.status) {
              toast.success("File deleted successfully");
            } else {
              toast.error(`${response?.message}` || "Failed to delete file");
              return;
            }
          } catch (error) {
            console.error("Failed to delete from server:", error);
            toast.error("Failed to delete file from server");
            return;
          }
        }

        if (proofUploadView) {
          setProofTransferredFiles((prev) =>
            prev.filter((file) => {
              if (assignedFile.existingId) {
                return file.existingId !== assignedFile.existingId;
              }
              if (assignedFile.id) {
                return file.id !== assignedFile.id;
              }
              return true;
            })
          );
        } else {
          setTransferredFiles((prev) => {
            const newArr = [...prev];
            const idx = newArr.findIndex(
              (f) =>
                f &&
                (f.id === assignedFile.id ||
                  f.existingId === assignedFile.existingId)
            );
            if (idx !== -1) newArr[idx] = null; // leave placeholder
            return newArr;
          });
          // Keep assignedFiles in sync (used for 'Show assigned')
          setAssignedFiles((prev) =>
            prev.filter((f) => {
              if (!f) return false;
              if (assignedFile.existingId)
                return f.existingId !== assignedFile.existingId;
              return f.id !== assignedFile.id;
            })
          );
        }
      } catch (error) {
        console.error("Error in handleDeleteUpload:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleEyeIconClick = (assignedFile, e) => {
      e?.stopPropagation();

      if (assignedFile.url && assignedFile.isExisting) {
        window.open(assignedFile.url, "_blank");
      } else if (assignedFile.file instanceof File) {
        handlePreviewClick(assignedFile, e);
      } else if (assignedFile.url) {
        window.open(assignedFile.url, "_blank");
      }
    };

    return (
      <div
        className={`p-3 transition-all duration-200 ${
          dragOver ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-[#323A70]">
            {proofUploadView
              ? `Proof Assignment (${
                  currentTransferredFiles.filter(Boolean).length
                }/${maxQuantity})`
              : `Ticket Assignment (${
                  currentTransferredFiles.filter(Boolean).length
                }/${maxQuantity})`}
          </h4>
          {dragOver && (
            <div className="text-xs text-blue-600 animate-pulse">
              {draggingAssignedRef.current || draggedAssignedFile
                ? "Drop to reorder"
                : "Drop file here to assign"}
            </div>
          )}
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
              const isSlotDraggedOver = dragOverSlot === itemNumber;
              const isEmpty = !assignedFile;
              const isDraggedFile =
                (draggingAssignedRef.current &&
                  draggingAssignedFromIndexRef.current === index) ||
                (draggedAssignedFile && draggedFromIndex === index);

              // Check if this specific slot can accept drops
              const canAcceptDrop =
                isEmpty &&
                window.currentDraggedFile &&
                canTransferFile(window.currentDraggedFile.id);

              // Check if this slot can accept reordering
              const activeReorderIndex =
                draggingAssignedFromIndexRef.current ?? draggedFromIndex;
              const canAcceptReorder =
                (draggingAssignedRef.current || draggedAssignedFile) &&
                activeReorderIndex !== null &&
                activeReorderIndex !== index;

              return (
                <div
                  key={itemNumber}
                  className={`flex items-center border-b border-gray-200 last:border-b-0 transition-all duration-200 ${
                    isSlotDraggedOver && (canAcceptDrop || canAcceptReorder)
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  } ${isDraggedFile ? "opacity-50" : ""}`}
                  onDragOver={(e) => handleSlotDragOver(e, itemNumber)}
                  onDragLeave={(e) => handleSlotDragLeave(e, itemNumber)}
                  onDrop={(e) => handleSlotDrop(e, itemNumber)}
                >
                  <div className="px-3 w-[15%] py-2 text-xs font-medium text-[#323A70]">
                    {proofUploadView
                      ? `Proof Document`
                      : `Ticket ${itemNumber}`}
                  </div>
                  <div className="px-3 w-[85%] py-2 flex items-center">
                    {assignedFile ? (
                      <div
                        className={`flex bg-[#F2FBF9] border border-[#03BA8A] rounded px-2 py-1 items-center justify-between w-full transition-all duration-200 ${
                          !proofUploadView
                            ? "cursor-grab hover:shadow-md active:cursor-grabbing"
                            : ""
                        } ${isDraggedFile ? "transform scale-95" : ""}`}
                        draggable={!proofUploadView}
                        onDragStart={(e) =>
                          handleAssignedFileDragStart(e, assignedFile, index)
                        }
                        onDragEnd={handleAssignedFileDragEnd}
                        title={!proofUploadView ? "Drag to reorder" : ""}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {!proofUploadView && (
                            <div className="text-gray-400 cursor-grab">⋮⋮</div>
                          )}
                          <span className="text-xs text-gray-700 truncate ">
                            {assignedFile.name}
                          </span>
                          {/* Show full name without truncation when assigned */}
                          {/* Updated: removed truncate and allow wrapping via break-all */}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-gray-900 cursor-pointer hover:text-blue-700"
                            onClick={(e) => handleEyeIconClick(assignedFile, e)}
                            title={
                              assignedFile.url && assignedFile.isExisting
                                ? "Open file in new tab"
                                : "Preview file"
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-900 cursor-pointer hover:text-red-700"
                            onClick={() => handleDeleteUpload(assignedFile)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`text-xs w-full border-[1px] border-dashed rounded-md px-2 py-1 transition-all duration-200 ${
                          isSlotDraggedOver && canAcceptDrop
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : isSlotDraggedOver && canAcceptReorder
                            ? "border-green-500 bg-green-50 text-green-600"
                            : "border-[#E0E1EA] bg-white text-gray-400"
                        }`}
                      >
                        {isSlotDraggedOver && canAcceptDrop ? (
                          <span className="animate-pulse">Drop here...</span>
                        ) : isSlotDraggedOver && canAcceptReorder ? (
                          <span className="animate-pulse">Move here...</span>
                        ) : proofUploadView ? (
                          "Waiting for proof document..."
                        ) : (
                          "Waiting for file..."
                        )}
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

  console.log(
    rowData?.additional_info,
    "rowData?.initialAdditionalData?.additional_info"
  );

  return (
    <div>
      <RightViewModal
        className={
          isMobile
            ? "!w-[100vw] !h-[100vh]"
            : isTablet
            ? "!w-[90vw]"
            : "!w-[80vw]"
        }
        show={show}
        onClose={() => handleCloseFunction(false)}
      >
        <div className="w-full h-full bg-white rounded-lg relative flex flex-col">
          {/* Header */}
          <div
            className={`flex justify-between items-center ${
              isSmallMobile ? "p-2" : "p-4"
            } border-b border-[#E0E1EA] flex-shrink-0`}
          >
            <h2
              className={`${
                isSmallMobile ? "text-base" : isMobile ? "text-lg" : "text-lg"
              } font-medium text-[#323A70] ${isMobile ? "truncate" : ""}`}
            >
              {getModalTitle()}
              {!isSmallMobile && getModalSubtitle()}
            </h2>
            <button
              onClick={() => handleCloseFunction(false)}
              className="text-gray-500 flex-shrink-0"
            >
              <X
                className={`${
                  isSmallMobile ? "w-4 h-4" : "w-5 h-5"
                } cursor-pointer`}
              />
            </button>
          </div>

          {/* Main Content - Use SubUploadParent with ref */}
          <SubUploadParent
            ref={subUploadParentRef}
            proofUploadView={proofUploadView}
            showInstruction={showInstruction}
            ETicketsFlow={ETicketsFlow}
            paperTicketFlow={paperTicketFlow}
            initialAdditionalData={rowData?.additional_info}
            onAdditionalInfoChange={handleAdditionalInfoChange}
            onTemplateSelect={handleTemplateSelect}
            MatchHeader={MatchHeader}
            TicketDetails={TicketDetails}
            QRLinksConfigSection={QRLinksConfigSection}
            PaperTicketCourierDetailsSection={PaperTicketCourierDetailsSection}
            FileUploadSection={FileUploadSection} // Enhanced with drag functionality
            TicketAssignmentSection={TicketAssignmentSection} // Enhanced with drop functionality
            existingUploadedTickets={existingUploadedTickets}
            additionalTemplateFile={additionalTemplateFile}
          />

          {/* Footer */}
          <div
            className={`flex justify-between items-center ${
              isSmallMobile ? "p-2" : "p-3"
            } bg-gray-50 border-t border-gray-200 flex-shrink-0`}
          >
            <div
              className={`flex ${
                isMobile ? "gap-2 flex-col w-full" : "gap-4 justify-end w-full"
              }`}
            >
              <button
                onClick={() => handleCloseFunction(false)}
                className={`${
                  isSmallMobile ? "px-3 py-1.5" : "px-4 py-2"
                } border border-gray-300 rounded text-gray-700 ${
                  isSmallMobile ? "text-xs" : "text-sm"
                } hover:bg-gray-50 ${isMobile ? "order-2" : ""}`}
              >
                Cancel
              </button>
              <Button
                className={`${isSmallMobile ? "px-3 py-1.5" : "px-4 py-2"} ${
                  isConfirmDisabled ? "bg-gray-300" : "bg-green-500"
                } text-white rounded ${
                  isSmallMobile ? "text-xs" : "text-sm"
                } disabled:bg-gray-300 flex gap-2 items-center disabled:cursor-not-allowed ${
                  isMobile ? "order-1" : ""
                }`}
                disabled={isConfirmDisabled}
                loading={isLoading}
                onClick={handleConfirmCtaClick}
              >
                {proofUploadView
                  ? isMobile
                    ? "Submit"
                    : "Submit Proof"
                  : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </RightViewModal>
      <FilePreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        file={previewFile}
      />
    </div>
  );
};

export default UploadTickets;
