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
import uploadImage from "../../../../../public/uploadIconNew.svg";
import Image from "next/image";
import Button from "@/components/commonComponents/button";
import RightViewContainer from "@/components/dashboardPage/reportViewContainer/rightViewContainer";
import RightViewModal from "@/components/commonComponents/rightViewModal";
import {
  deleteSaleTicket,
  deleteTicketUpload,
  myListingUploadTickets,
  saveAdditionalInstructionFile,
  saveMobileTickets,
  savePaperTicketsUpload,
  saveSalesUploadedTickets,
  updateAdditionalFile,
  uploadPopInstruction,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";
import { readCookie } from "@/utils/helperFunctions/cookie";
import { separateDateTime } from "@/utils/helperFunctions";
import PaperTicketCourierSection from "../paperTicketCourierSection";
import MySalesSubUploadParent from "./subUploadParent";
import { UploadTicketsShimmer } from "./shimmerLoader";
import MySalesPaperTicketCourierSection from "./mySalesPaperTicketsSection";
import MyQRLinksSection from "./MyQrLinkSection";
import QRLinksSection from "../QRLinkSection";
import FilePreviewModal from "../previewFile";

const MySalesUploadTickets = ({
  show,
  onClose,
  showInstruction = false,
  rowData,
  matchDetails,
  rowIndex,
  handleConfirmClick,
  loading = false,
  myListingPage = false,
  mySalesPage = false,
}) => {
  if (loading || !rowData) {
    return (
      <div>
        <RightViewModal
          className="!w-[80vw]"
          show={show}
          onClose={() => onClose()}
        >
          <UploadTicketsShimmer />
        </RightViewModal>
      </div>
    );
  }

  const proofUploadView = rowData?.handleProofUpload || false;
  const ticketTypes = !isNaN(parseInt(rowData?.ticket_type))
    ? rowData?.ticket_type
    : rowData?.ticket_types || rowData?.ticket_type_id;
  const ETicketsFlow = [4]?.includes(parseInt(ticketTypes));
  const paperTicketFlow = parseInt(ticketTypes) === 3;
  const normalFlow = !ETicketsFlow && !paperTicketFlow;

  const existingUploadedTickets = rowData?.rawTicketData?.uploadTickets || [];

  const hasExistingTickets = false;
  const existingProofTickets = rowData?.rawTicketData?.popUpload || [];

  const maxQuantity = proofUploadView
    ? 1
    : parseInt(rowData?.add_qty_addlist || rowData?.quantity) || 0;

  const hasPartialUploads =
    hasExistingTickets && existingUploadedTickets.length < maxQuantity;

  const [isLoading, setIsLoading] = useState(false);
  // 2. Add this state variable after your existing state declarations
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [showAssigned, setShowAssigned] = useState(false);
  const [deletedTicketIds, setDeletedTicketIds] = useState([]);
  const [modifiedTickets, setModifiedTickets] = useState({});
  const [assignedFiles, setAssignedFiles] = useState([]);
  // Normal flow states
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // FIXED: Changed to slot-based structure instead of array
  const [assignedSlots, setAssignedSlots] = useState({});

  // Proof upload flow states
  const [proofUploadedFiles, setProofUploadedFiles] = useState([]);
  const [proofTransferredFiles, setProofTransferredFiles] = useState([]);
  const [modifiedQRLinks, setModifiedQRLinks] = useState({});
  const [draggedFile, setDraggedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // State for Paper Ticket Flow
  const [paperTicketDetails, setPaperTicketDetails] = useState({
    courier_type: "company",
    courier_company: "",
    tracking_details: "",
  });

  const handlePreviewClick = useCallback((file, e) => {
    e?.stopPropagation();
    setPreviewFile(file);
    setShowPreview(true);
  }, []);

  const additionalTemplateFile =
    rowData?.rawTicketData?.additional_template_file;

  const fileInputRef = useRef(null);
  const salespaperTicketCourierRef = useRef();
  const subUploadParentRef = useRef();
  const qrLinksRef = useRef();

  const templateDataRef = useRef({
    templateName: "",
    templateContent: "",
    selectedTemplate: null,
  });

  // FIXED: Helper function to convert slot-based structure to array for backward compatibility
  const getTransferredFilesArray = useMemo(() => {
    const result = [];
    for (let i = 1; i <= maxQuantity; i++) {
      if (assignedSlots[i]) {
        result.push({
          ...assignedSlots[i],
          slotNumber: i,
        });
      }
    }
    return result;
  }, [assignedSlots, maxQuantity]);

  // FIXED: Enhanced useEffect with proper slot-based initialization
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
      } else {
        setProofTransferredFiles([]);
      }
      setProofUploadedFiles([]);
    } else if (paperTicketFlow && mySalesPage) {
      if (
        rowData?.originalTicketDetails &&
        rowData.originalTicketDetails.length > 0
      ) {
        const firstTicketDetail = rowData.originalTicketDetails[0];
        const paperTicketData = {
          courier_type: "company",
          courier_company: firstTicketDetail.delivery_provider || "",
          tracking_details: firstTicketDetail.tracking_number || "",
          tracking_link: firstTicketDetail.tracking_link || "",
          pod_file: firstTicketDetail.pod_file || null,
        };
        setPaperTicketDetails(paperTicketData);
        console.log("Initialized paper ticket data:", paperTicketData);
      }
    } else {
      // FIXED: Initialize slot-based structure
      const newAssignedSlots = {};

      if (
        mySalesPage &&
        rowData?.myListingFileUpload &&
        rowData.myListingFileUpload.length > 0
      ) {
        // For mySalesPage, use serial numbers as slot keys
        rowData.myListingFileUpload
          .filter((ticket) => ticket.url && ticket.url.trim() !== "")
          .forEach((ticket) => {
            const slotNumber = ticket.serial || 1;
            newAssignedSlots[slotNumber] = {
              id: ticket?.id,
              name: ticket.fileName || `Ticket ${slotNumber}`,
              file: null,
              url: ticket.url,
              isExisting: true,
              existingId: ticket.id,
              ticketId: ticket.ticketId,
              serial: slotNumber,
              originalData: ticket,
            };
          });

        setAssignedSlots(newAssignedSlots);
        setDeletedTicketIds([]);
        setModifiedTickets({});
      } else if (hasExistingTickets) {
        // For other pages, use index + 1 as slot numbers
        existingUploadedTickets
          .filter(
            (ticket) =>
              ticket.upload_tickets && ticket.upload_tickets.trim() !== ""
          )
          .forEach((ticket, index) => {
            const slotNumber = index + 1;
            newAssignedSlots[slotNumber] = {
              id: `${ticket.id}`,
              name: `Ticket ${slotNumber}`,
              file: null,
              url: ticket.upload_tickets,
              isExisting: true,
              existingId: ticket.id,
            };
          });

        setAssignedSlots(newAssignedSlots);
      } else {
        // Handle initial upload tickets
        const initialUploadTickets = rowData?.upload_tickets || [];
        const validTickets = initialUploadTickets.filter(
          (ticket) => ticket.url && ticket.url.trim() !== ""
        );

        validTickets.forEach((ticket, index) => {
          const slotNumber = index + 1;
          newAssignedSlots[slotNumber] = ticket;
        });

        setAssignedSlots(newAssignedSlots);
      }

      setUploadedFiles([]);
    }
  }, [
    show,
    proofUploadView,
    hasExistingTickets,
    mySalesPage,
    rowData?.rawTicketData?.s_no,
    rowData?.id,
    rowData?.pop_upload_tickets,
    rowData?.myListingFileUpload,
    existingUploadedTickets.length,
    hasPartialUploads,
  ]);

  // FIXED: Enhanced function to check available slots
  const getAvailableSlots = useCallback(() => {
    const availableSlots = [];
    for (let i = 1; i <= maxQuantity; i++) {
      if (!assignedSlots[i]) {
        availableSlots.push(i);
      }
    }
    return availableSlots;
  }, [assignedSlots, maxQuantity]);

  // FIXED: Enhanced canTransferFile to check for available slots
  const canTransferFile = useCallback(
    (fileId) => {
      if (proofUploadView) {
        return proofTransferredFiles.length < maxQuantity;
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return false;
        }
        return getAvailableSlots().length > 0;
      }
    },
    [
      proofUploadView,
      proofTransferredFiles.length,
      maxQuantity,
      hasExistingTickets,
      hasPartialUploads,
      getAvailableSlots,
    ]
  );

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

          const availableSlots = getAvailableSlots();
          const filesToAdd = files.slice(0, availableSlots.length);

          const newFiles = filesToAdd.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file,
          }));
          setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
      }
    },
    [proofUploadView, hasExistingTickets, hasPartialUploads, getAvailableSlots]
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

  useEffect(() => {}, [templateDataRef.current]);

  // FIXED: Enhanced handleTransferSingleFile with target slot support
  const handleTransferSingleFile = useCallback(
    (fileId, targetSlot = null) => {
      if (proofUploadView) {
        // Existing proof upload logic remains the same
        const fileToTransfer = proofUploadedFiles.find(
          (file) => file.id === fileId
        );
        if (fileToTransfer && proofTransferredFiles.length < maxQuantity) {
          setProofTransferredFiles((prev) => [...prev, fileToTransfer]);
          setProofUploadedFiles((prev) =>
            prev.filter((file) => file.id !== fileId)
          );
        }
      } else {
        if (hasExistingTickets && !hasPartialUploads) {
          return;
        }

        const fileToTransfer = uploadedFiles.find((file) => file.id === fileId);
        if (!fileToTransfer) return;

        // FIXED: Determine target slot more intelligently
        let finalTargetSlot = targetSlot;

        if (!finalTargetSlot || assignedSlots[finalTargetSlot]) {
          // If no target slot specified or target slot is occupied, find first available
          const availableSlots = getAvailableSlots();
          if (availableSlots.length === 0) {
            alert(
              `Maximum limit reached. You can only have ${maxQuantity} files.`
            );
            return;
          }
          finalTargetSlot = availableSlots[0];
        }

        // For mySalesPage, track the modification
        if (mySalesPage) {
          const correspondingTicketDetail =
            rowData?.originalTicketDetails?.find(
              (detail) => detail.serial === finalTargetSlot
            );

          const wasDeleted =
            modifiedTickets[finalTargetSlot]?.action === "deleted";

          if (wasDeleted) {
            setModifiedTickets((prev) => ({
              ...prev,
              [finalTargetSlot]: {
                action: "reuploaded",
                originalId: prev[finalTargetSlot].originalId,
                newFile: fileToTransfer,
                ticketDetailId: correspondingTicketDetail?.id,
              },
            }));
          } else {
            setModifiedTickets((prev) => ({
              ...prev,
              [finalTargetSlot]: {
                action: "new_upload",
                newFile: fileToTransfer,
                ticketDetailId: correspondingTicketDetail?.id,
              },
            }));
          }

          fileToTransfer.serial = finalTargetSlot;
          fileToTransfer.ticketDetailId = correspondingTicketDetail?.id;
        }
        let files = Object.keys(assignedSlots).map((key) => assignedSlots[key]);
        console.log(assignedSlots, files, "filesfilesfilesfiles");
        setAssignedFiles([...assignedFiles, fileToTransfer]);
        // FIXED: Assign to specific slot instead of pushing to array
        setAssignedSlots((prev) => ({
          ...prev,
          [finalTargetSlot]: {
            ...fileToTransfer,
            slotNumber: finalTargetSlot,
          },
        }));

        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      }
    },
    [
      proofUploadView,
      proofUploadedFiles,
      proofTransferredFiles.length,
      maxQuantity,
      uploadedFiles,
      assignedSlots,
      hasExistingTickets,
      hasPartialUploads,
      mySalesPage,
      modifiedTickets,
      rowData?.originalTicketDetails,
      getAvailableSlots,
    ]
  );

  // Common Match Header Component
  const MatchHeader = () => (
    <div className="bg-[#343432] text-xs rounded-t-md text-white px-4 flex items-center justify-between min-w-0">
      <div className="grid grid-cols-4 gap-2">
        <h3 className="font-medium truncate py-3 flex-shrink-0 max-w-[200px] border-r border-[#51428E]">
          {matchDetails?.match_name}
        </h3>
        <div className="flex items-center gap-1 py-3 border-r border-[#51428E]">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs whitespace-nowrap">
            {matchDetails?.match_date_format ||
              rowData?.matchDate ||
              separateDateTime(matchDetails?.match_date)?.date}
          </span>
        </div>
        <div className="flex items-center gap-1 border-r border-[#51428E]">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs whitespace-nowrap">
            {matchDetails?.match_time || rowData?.matchTime}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs whitespace-nowrap">
            {matchDetails?.stadium_name || rowData?.venue}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="flex-shrink-0">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  // Common Ticket Details Component
  const TicketDetails = () => (
    <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
      <div className="grid grid-cols-4 bg-gray-100 px-3 py-2 border-b border-gray-200">
        <div className="text-xs font-medium text-[#323A70]">Booking ID</div>
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
        <div className="text-xs truncate">
          {rowData?.bookingId ||
            rowData?.rawTicketData?.s_no ||
            rowData?.id ||
            "N/A"}
        </div>
        <div className="text-xs truncate">
          {proofUploadView ? "1 Document" : maxQuantity}
        </div>
        <div className="text-xs truncate">
          {rowData?.ticket_category || "N/A"}, {rowData?.ticket_block || ""}
        </div>
        <div className="text-xs truncate">
          {ETicketsFlow ? (
            "Mobile Ticket"
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

  console.log(
    existingUploadedTickets,
    "existingUploadedTicketsexistingUploadedTickets",
    rowData?.qrLinksData
  );
  console.log(assignedSlots, "assignedSlotsassignedSlots");
  const debugId = useRef(
    `MainUpload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(
    `[${debugId.current}] 🔄 RENDER #${renderCount.current} - Component re-rendered`
  );

  // QR Links Configuration Section for E-Ticket Flow
  const QRLinksConfigSection = useCallback(() => {
    return (
      <MyQRLinksSection
        ref={qrLinksRef} // ✅ Direct ref assignment
        maxQuantity={maxQuantity}
        initialData={mySalesPage && ETicketsFlow ? rowData?.qrLinksData : null}
        onChange={(newLinks) => {
          console.log(
            `[${debugId.current}] 📞 QR Links onChange called with:`,
            newLinks
          );
        }}
      />
    );
  }, [maxQuantity, mySalesPage, ETicketsFlow]);
  // Paper Ticket Courier Details Section
  const PaperTicketCourierDetailsSection = useCallback(() => {
    const initialPaperTicketData = useMemo(() => {
      if (!paperTicketFlow || !mySalesPage) {
        return null;
      }

      if (rowData?.paper_ticket_details) {
        return {
          courier_type: rowData.paper_ticket_details.courier_type || "company",
          courier_company: rowData.paper_ticket_details.courier_company || "",
          tracking_details: rowData.paper_ticket_details.tracking_details || "",
          tracking_link: rowData.paper_ticket_details.tracking_link || "",
          upload_tickets: rowData?.paperTicketFileUpload || [],
        };
      }

      if (
        rowData?.originalTicketDetails &&
        rowData.originalTicketDetails.length > 0
      ) {
        const firstTicketDetail = rowData.originalTicketDetails[0];
        return {
          courier_type: "company",
          courier_company: firstTicketDetail?.delivery_provider || "",
          tracking_details: firstTicketDetail?.tracking_number || "",
          tracking_link: firstTicketDetail?.tracking_link || "",
          upload_tickets: firstTicketDetail?.pod_file
            ? [
                {
                  id: firstTicketDetail.id,
                  name: `POD_${firstTicketDetail.id}.png`,
                  url: firstTicketDetail.pod_file,
                  isExisting: true,
                },
              ]
            : [],
        };
      }

      return null;
    }, [
      paperTicketFlow,
      mySalesPage,
      rowData?.paper_ticket_details,
      rowData?.paperTicketFileUpload,
      rowData?.originalTicketDetails,
    ]);

    return (
      <MySalesPaperTicketCourierSection
        ref={salespaperTicketCourierRef}
        maxQuantity={maxQuantity}
        initialData={initialPaperTicketData}
        rowData={rowData}
        onChange={(newData) => {
          console.log("Paper ticket courier data updated:", newData);
          // OPTIONAL: Store in local state if you need immediate access
          // setCurrentPaperTicketData(newData);
        }}
      />
    );
  }, [maxQuantity, mySalesPage, paperTicketFlow]);

  const constructPaperTicketFormData = () => {
    const formData = new FormData();

    // FIXED: Get current data from ref
    const currentPaperTicketData =
      salespaperTicketCourierRef.current?.getCurrentData() || {};
    const { courierDetails, uploadedFiles } = currentPaperTicketData;

    console.log("Constructing FormData with current data:", {
      courierDetails,
      uploadedFiles,
    });

    const originalTicketDetail = rowData?.originalPaperTicketDetails;
    const originalPaperTicketDetails = rowData?.paper_ticket_details;

    formData.append("booking_id", rowData?.id || "");

    const originalDeliveryProvider =
      originalPaperTicketDetails?.courier_company ||
      originalTicketDetail?.delivery_provider ||
      "";
    const currentDeliveryProvider = courierDetails?.courier_company || "";
    if (currentDeliveryProvider !== originalDeliveryProvider) {
      formData.append("delivery_provider", currentDeliveryProvider);
      console.log("Adding delivery_provider:", currentDeliveryProvider);
    }

    const originalTrackingNumber =
      originalPaperTicketDetails?.tracking_details ||
      originalTicketDetail?.tracking_number ||
      "";
    const currentTrackingNumber = courierDetails?.tracking_details || "";
    if (currentTrackingNumber !== originalTrackingNumber) {
      formData.append("tracking_number", currentTrackingNumber);
      console.log("Adding tracking_number:", currentTrackingNumber);
    }

    const originalTrackingLink =
      originalPaperTicketDetails?.tracking_link ||
      originalTicketDetail?.tracking_link ||
      "";
    const currentTrackingLink = courierDetails?.tracking_link || "";
    if (currentTrackingLink !== originalTrackingLink) {
      formData.append("tracking_link", currentTrackingLink);
      console.log("Adding tracking_link:", currentTrackingLink);
    }

    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFile = uploadedFiles.find((file) => file.file instanceof File);
      if (newFile) {
        formData.append("pod_file", newFile.file);
        console.log("Adding pod_file:", newFile.file.name);
      }
    }

    console.log("Paper Ticket FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `${key}:`,
        value instanceof File ? `File: ${value.name}` : value
      );
    }

    return formData;
  };

  const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
  console.log(currentQRLinks, "currentQRLinkscurrentQRLinks");
  const constructETicketFormData = () => {
    const formData = new FormData();

    // FIXED: Get current data from ref
    const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
    const originalQRLinks = rowData?.qrLinksData || [];

    let modificationIndex = 0;

    currentQRLinks.forEach((currentLink, index) => {
      const originalLink = originalQRLinks[index];

      if (originalLink) {
        const androidModified =
          currentLink.qr_link_android !== originalLink.originalAndroid;
        const iosModified =
          currentLink.qr_link_ios !== originalLink.originalIos;

        if (androidModified || iosModified) {
          formData.append(`ticket_id[${modificationIndex}]`, originalLink.id);
          formData.append(
            `qr_link_android[${modificationIndex}]`,
            currentLink.qr_link_android
          );
          formData.append(
            `qr_link_ios[${modificationIndex}]`,
            currentLink.qr_link_ios
          );
          modificationIndex++;
        }
      }
    });

    return formData;
  };

  // FIXED: Enhanced completion status calculation using slot-based structure
  const getCompletionStatus = useMemo(() => {
    if (ETicketsFlow) {
      const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
      const completedTickets = currentQRLinks.filter(
        (link) => link.qr_link_android && link.qr_link_ios
      ).length;
      return { completed: 1, total: 1 };
    } else if (paperTicketFlow) {
      const paperTicketData =
        salespaperTicketCourierRef.current?.getCurrentData() || {};
      const { courierDetails } = paperTicketData;

      const hasRequiredFields = !!(
        courierDetails?.courier_company && courierDetails?.tracking_details
      );

      return {
        completed: 1,
        total: 1,
      };
    } else if (normalFlow || proofUploadView) {
      const currentTransferredFiles = proofUploadView
        ? proofTransferredFiles
        : Object.values(assignedSlots); // FIXED: Use slot values instead of array

      const validTransferredFiles = currentTransferredFiles.filter(
        (file) => (file.url && file.url.trim() !== "") || file.file
      );

      return { completed: validTransferredFiles.length, total: maxQuantity };
    }
    return { completed: 0, total: 0 };
  }, [
    ETicketsFlow,
    paperTicketFlow,
    normalFlow,
    proofUploadView,
    assignedSlots, // FIXED: Changed dependency
    proofTransferredFiles,
    maxQuantity,
  ]);

  const isConfirmDisabled = getCompletionStatus.completed === 0;

  const getModalTitle = () => {
    if (proofUploadView) return "Upload Proof Document";
    if (ETicketsFlow) return "Configure Mobile Ticket";
    if (paperTicketFlow) return "Configure Paper Tickets";
    return "Upload Tickets";
  };

  const getModalSubtitle = () => {
    if (proofUploadView) return " (1 document required)";
    if (ETicketsFlow) return ` (${maxQuantity} tickets)`;
    if (paperTicketFlow) return ` (${maxQuantity} tickets)`;
    return ` (Max: ${maxQuantity})`;
  };

  const constructMySalesFormData = () => {
    const formData = new FormData();
    const modificationsToSend = Object.entries(modifiedTickets).filter(
      ([serial, modification]) =>
        modification.action === "reuploaded" ||
        modification.action === "new_upload"
    );

    console.log("Modifications to send:", modificationsToSend);

    let formDataIndex = 0;

    modificationsToSend.forEach(([serial, modification]) => {
      if (modification.action === "reuploaded") {
        formData.append(`ticket_id[${formDataIndex}]`, modification.originalId);

        if (modification.newFile?.file instanceof File) {
          formData.append(
            `ticket_file[${formDataIndex}]`,
            modification.newFile.file
          );
        }

        console.log(
          `Reupload - ticket_id[${formDataIndex}]: ${modification.originalId}`
        );
        formDataIndex++;
      } else if (modification.action === "new_upload") {
        const serialNumber = parseInt(serial);
        const correspondingTicketDetail = rowData?.originalTicketDetails?.find(
          (detail) => detail.serial === serialNumber
        );

        if (correspondingTicketDetail) {
          formData.append(
            `ticket_id[${formDataIndex}]`,
            correspondingTicketDetail.id
          );

          if (modification.newFile?.file instanceof File) {
            formData.append(
              `ticket_file[${formDataIndex}]`,
              modification.newFile.file
            );
          }

          console.log(
            `New upload - ticket_id[${formDataIndex}]: ${correspondingTicketDetail.id}`
          );
          formDataIndex++;
        } else {
          console.warn(`No ticket detail found for serial ${serialNumber}`);
        }
      }
    });

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return formData;
  };

  const additionalInfoCheck = async () => {
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

    const formData = new FormData();
    formData.append(
      "ticket_id",
      rowData?.fetchedAdditionalInfoDetails?.sellTicketId || ""
    );
    formData.append("dynamic_content", currentAdditionalInfo?.dynamicContent);
    formData.append("ticket_type", currentAdditionalInfo?.template || "");
    if (currentAdditionalInfo?.templateFile) {
      formData.append(
        "additional_file",
        currentAdditionalInfo.templateFile,
        "instruction_file"
      );
    }
    await saveAdditionalInstructionFile(formData);
  };

  const handleConfirmCtaClick = useCallback(async () => {
    if (mySalesPage) {
      if (ETicketsFlow) {
        try {
          setIsLoading(true);

          await additionalInfoCheck();

          // FIXED: Now this will get the latest data
          const currentQRLinks = qrLinksRef.current?.getCurrentData() || [];
          const originalQRLinks = rowData?.qrLinksData || [];

          console.log("currentQRLinks from ref:", currentQRLinks);
          console.log("originalQRLinks:", originalQRLinks);

          let hasModifications = false;
          currentQRLinks.forEach((currentLink, index) => {
            const originalLink = originalQRLinks[index];
            if (originalLink) {
              const androidModified =
                currentLink.qr_link_android !== originalLink.originalAndroid;
              const iosModified =
                currentLink.qr_link_ios !== originalLink.originalIos;
              if (androidModified || iosModified) {
                hasModifications = true;
              }
            }
          });

          if (hasModifications) {
            const formData = constructETicketFormData();
            const response = await saveMobileTickets(formData, rowData?.id);

            if (response?.status === 200) {
              toast.success("QR Links updated successfully");
              onClose();
            } else {
              toast.error(
                "Please verify whether the valid links have been updated."
              );
            }
          } else {
            onClose();
          }
        } catch (error) {
          console.error("Error updating QR Links:", error);
          toast.error("Failed to update QR Links");
        } finally {
          setIsLoading(false);
        }
      } else if (paperTicketFlow) {
        try {
          setIsLoading(true);
          await additionalInfoCheck();

          // FIXED: Now this will get the latest data
          const currentPaperTicketData =
            salespaperTicketCourierRef.current?.getCurrentData() || {};

          console.log(
            "Current paper ticket data from ref:",
            currentPaperTicketData
          );

          const { courierDetails, uploadedFiles } = currentPaperTicketData;
          console.log("Destructured courier details:", courierDetails);
          console.log("Destructured uploaded files:", uploadedFiles);

          const originalTicketDetail = rowData?.originalPaperTicketDetails;
          const originalPaperTicketDetails = rowData?.paper_ticket_details;

          let hasModifications = false;

          const originalDeliveryProvider =
            originalPaperTicketDetails?.courier_company ||
            originalTicketDetail?.delivery_provider ||
            "";
          const originalTrackingNumber =
            originalPaperTicketDetails?.tracking_details ||
            originalTicketDetail?.tracking_number ||
            "";
          const originalTrackingLink =
            originalPaperTicketDetails?.tracking_link ||
            originalTicketDetail?.tracking_link ||
            "";

          console.log("Comparison values:");
          console.log(
            "Courier company - Current:",
            courierDetails?.courier_company,
            "Original:",
            originalDeliveryProvider
          );
          console.log(
            "Tracking details - Current:",
            courierDetails?.tracking_details,
            "Original:",
            originalTrackingNumber
          );
          console.log(
            "Tracking link - Current:",
            courierDetails?.tracking_link,
            "Original:",
            originalTrackingLink
          );

          if (courierDetails?.courier_company !== originalDeliveryProvider) {
            hasModifications = true;
            console.log("✓ Courier company changed");
          }
          if (courierDetails?.tracking_details !== originalTrackingNumber) {
            hasModifications = true;
            console.log("✓ Tracking details changed");
          }
          if (courierDetails?.tracking_link !== originalTrackingLink) {
            hasModifications = true;
            console.log("✓ Tracking link changed");
          }

          const hasNewFile = uploadedFiles?.some(
            (file) => file.file instanceof File
          );
          if (hasNewFile) {
            hasModifications = true;
            console.log("✓ New file uploaded");
          }

          console.log("Has modifications:", hasModifications);

          if (hasModifications) {
            const formData = constructPaperTicketFormData();
            const response = await savePaperTicketsUpload(
              formData,
              rowData?.id
            );
            if (response?.status === 200) {
              toast.success("Paper ticket details updated successfully");
              onClose();
            } else {
              toast.error("Failed to update paper ticket details");
            }
          } else {
            console.log("No modifications detected, closing modal");
            onClose();
          }
        } catch (error) {
          console.error("Error updating paper ticket details:", error);
          toast.error("Failed to update paper ticket details");
        } finally {
          setIsLoading(false);
        }
      } else {
        const hasModifications = Object.keys(modifiedTickets).length > 0;
        await additionalInfoCheck();
        if (hasModifications) {
          try {
            setIsLoading(true);
            const formData = constructMySalesFormData();
            const response = await saveSalesUploadedTickets(
              formData,
              rowData?.id
            );

            if (response?.status == 200) {
              toast.success("Tickets updated successfully");
              onClose();
            } else {
              toast.error("Failed to update tickets");
            }
          } catch (error) {
            console.error("Error updating tickets:", error);
            toast.error("Failed to update tickets");
          } finally {
            setIsLoading(false);
          }
        } else {
          onClose();
        }
        return;
      }
    }
  }, [mySalesPage, modifiedTickets, rowData?.id, onClose]);

  const handleAdditionalInfoChange = useCallback((data) => {
    console.log("Additional info changed in real-time:", data);
  }, []);

  const handleTemplateSelect = useCallback((templateData) => {
    console.log("Template selected:", templateData);
  }, []);

  // FIXED: Enhanced File Upload Section Component
  const FileUploadSection = () => {
    const currentUploadedFiles = proofUploadView
      ? proofUploadedFiles
      : uploadedFiles;
    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : Object.values(assignedSlots); // FIXED: Use slot values

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

    const isDragAreaDisabled = proofUploadView
      ? currentTransferredFiles.length >= 1
      : getAvailableSlots().length === 0; // FIXED: Check available slots

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

    // FIXED: Enhanced drag handlers with proper drag data transfer
    const handleDragStart = (e, file) => {
      if (!canTransferFile(file.id)) {
        e.preventDefault();
        return;
      }

      // Set drag data for better compatibility
      e.dataTransfer.setData("text/plain", JSON.stringify(file));
      e.dataTransfer.effectAllowed = "move";

      // Store dragged file globally
      window.currentDraggedFile = file;
      setIsDragging(true);
      setDraggedFile(file);

      // Create ghost image
      const ghostElement = document.createElement("div");
      ghostElement.innerHTML = `
          <div style="
            background: rgba(255, 255, 255, 0.9);
            border: 2px dashed #0137D5;
            border-radius: 8px;
            padding: 12px;
            font-size: 12px;
            color: #323A70;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            📄 ${file.name}
          </div>
        `;
      ghostElement.style.position = "absolute";
      ghostElement.style.top = "-1000px";
      document.body.appendChild(ghostElement);

      e.dataTransfer.setDragImage(ghostElement, 10, 10);

      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    };

    const handleDragEnd = () => {
      window.currentDraggedFile = null;
      setIsDragging(false);
      setDraggedFile(null);
    };

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

    return (
      <>
        <div
          className={`border-1 bg-[#F9F9FB] border-dashed border-[#130061] rounded-lg p-4 flex flex-col gap-1 items-center justify-center ${
            isDragAreaDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Image src={uploadImage} width={42} height={42} alt="Upload" />
          <p className="text-xs text-[#323A70] mb-1">{getUploadMessage()}</p>
          {!isDragAreaDisabled && (
            <>
              <p className="text-xs text-gray-500">OR</p>
              <Button
                onClick={handleBrowseFiles}
                classNames={{
                  root: "py-2 border-1 border-[#0137D5] rounded-sm ",
                  label_: "text-[12px] font-medium !text-[#343432]",
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
            multiple={!proofUploadView}
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

        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-[#323A70]">
              {proofUploadView
                ? `Proof Document (${currentUploadedFiles.length}/1)`
                : `Uploaded Files (${currentUploadedFiles.length})`}
            </h3>
            <div class="flex items-center gap-x-2">
              <span class="text-xs text-[#323A70]">Show assigned</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={showAssigned}
                  onChange={(e) => {
                    setShowAssigned((prev) => !prev);
                  }}
                />
                <div class="w-7 h-3 bg-gray-200 peer-checked:bg-[#64EAA540] rounded-full transition-all peer peer-checked:after:translate-x-full peer-checked:after:bg-[#64EAA5] after:content-[''] after:absolute after:-top-0.5 after:-left-0.5 after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-md peer-checked:bg-100"></div>
              </label>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-[#E0E1EA] rounded">
            {currentUploadedFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {getNoFilesMessage()}
              </div>
            ) : (
              currentUploadedFiles.map((file) => (
                <div
                  key={file.id}
                  draggable={canTransferFile(file.id)}
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0 bg-white transition-all duration-200 ${
                    canTransferFile(file.id)
                      ? "cursor-grab hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500"
                      : "cursor-not-allowed opacity-60"
                  } ${
                    isDragging && draggedFile?.id === file.id
                      ? "opacity-50 transform scale-95"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {canTransferFile(file.id) && (
                      <div className="text-gray-400 text-xs">⋮⋮</div>
                    )}
                    <span className="text-xs text-gray-700 truncate max-w-32">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* NEW: Eye icon for uploaded files */}

                    <Button
                      onClick={() => handleTransferSingleFile(file.id)}
                      disabled={!canTransferFile(file.id)}
                      classNames={{
                        root: `py-[4px] px-[6px] cursor-pointer rounded-sm text-[10px] ${
                          canTransferFile(file.id)
                            ? "bg-[#343432] text-white hover:bg-[#343432]/90"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`,
                        label_:
                          "text-[10px] font-medium flex items-center gap-1",
                      }}
                    >
                      {proofUploadView ? "Attach" : "Add"}{" "}
                      <ArrowRight className="w-4 h-4" />
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
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 text-[#130061] cursor-pointer"
                      onClick={() => handleDeleteUploaded(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {showAssigned &&
              assignedFiles?.map((file) => (
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

  // FIXED: Enhanced Ticket Assignment Section Component with precise slot targeting
  const TicketAssignmentSection = () => {
    const [dragOver, setDragOver] = useState(false);
    const [dragOverSlot, setDragOverSlot] = useState(null);

    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : Object.values(assignedSlots); // FIXED: Use slot values

    // FIXED: Enhanced drop handlers with target slot support
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

    // FIXED: Enhanced drop handler with target slot parameter
    const handleDrop = (e, targetSlot = null) => {
      e.preventDefault();
      setDragOver(false);
      setDragOverSlot(null);

      // Get drag data
      let draggedFileData = null;
      try {
        const dragData = e.dataTransfer.getData("text/plain");
        if (dragData) {
          draggedFileData = JSON.parse(dragData);
        }
      } catch (error) {
        console.warn("Failed to parse drag data, using fallback");
      }

      // Fallback to global variable if drag data parsing fails
      const fileToTransfer = draggedFileData || window.currentDraggedFile;

      if (fileToTransfer && canTransferFile(fileToTransfer.id)) {
        // FIXED: Pass target slot to transfer function
        handleTransferSingleFile(fileToTransfer.id, targetSlot);
      }
    };

    // FIXED: Individual slot drag handlers with precise targeting
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

    // FIXED: Slot-specific drop handler
    const handleSlotDrop = (e, slotNumber) => {
      e.stopPropagation();
      handleDrop(e, slotNumber);
    };

    // FIXED: Enhanced delete handler with slot-based removal
    const handleDeleteUpload = async (assignedFile, slotNumber) => {
      try {
        setIsLoading(true);

        if (mySalesPage && assignedFile?.existingId) {
          const ticketDetail = rowData?.originalTicketDetails?.find(
            (detail) => detail.id === assignedFile.existingId
          );

          try {
            const deleteTicket = await deleteSaleTicket("", {
              id: `${assignedFile.existingId}`,
              booking_id: `${rowData?.id}`,
              sort: `${slotNumber}`,
            });
            console.log(deleteTicket, "deleteTicketdeleteTicket");
          } catch {
            console.log("Failed Deleting");
          }

          setDeletedTicketIds((prev) => [...prev, assignedFile.existingId]);

          const serial = assignedFile.serial || slotNumber;

          setModifiedTickets((prev) => ({
            ...prev,
            [serial]: {
              action: "deleted",
              originalId: assignedFile.existingId,
              ticketDetailId: ticketDetail?.id,
            },
          }));
        }

        // FIXED: Remove from specific slot instead of filtering arrays
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
          // FIXED: Remove from specific slot
          setAssignedSlots((prev) => {
            const newSlots = { ...prev };
            delete newSlots[slotNumber];
            return newSlots;
          });
        }

        toast.success("File removed successfully");
      } catch (error) {
        console.error("Error in handleDeleteUpload:", error);
        toast.error("Failed to remove file");
      } finally {
        setIsLoading(false);
      }
    };

    const handleEyeIconClick = (assignedFile, e) => {
      e?.stopPropagation();

      // If file has URL (existing file), open in new tab
      if (assignedFile.url && assignedFile.isExisting) {
        window.open(assignedFile.url, "_blank");
      }
      // If file is newly uploaded (File object), show preview modal
      else if (assignedFile.file instanceof File) {
        handlePreviewClick(assignedFile, e);
      }
      // Fallback for any other cases
      else if (assignedFile.url) {
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
              ? `Proof Assignment (${currentTransferredFiles.length}/${maxQuantity})`
              : `Ticket Assignment (${
                  Object.keys(assignedSlots).length
                }/${maxQuantity})`}
          </h4>
          {dragOver && (
            <div className="text-xs text-blue-600 animate-pulse">
              Drop file here to assign
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
              const slotNumber = index + 1;

              // FIXED: Get assigned file for this specific slot
              const assignedFile = assignedSlots[slotNumber];

              const isSlotDraggedOver = dragOverSlot === slotNumber;
              const isEmpty = !assignedFile;

              // FIXED: Check if this specific slot can accept drops
              const canAcceptDrop =
                isEmpty &&
                window.currentDraggedFile &&
                canTransferFile(window.currentDraggedFile.id);

              return (
                <div
                  key={slotNumber}
                  className="flex items-center border-b border-gray-200 last:border-b-0"
                  onDragOver={(e) => handleSlotDragOver(e, slotNumber)}
                  onDragLeave={(e) => handleSlotDragLeave(e, slotNumber)}
                  onDrop={(e) => handleSlotDrop(e, slotNumber)}
                >
                  <div className="px-3 py-2 text-xs font-medium text-[#323A70]">
                    {proofUploadView
                      ? `Proof Document`
                      : `Ticket ${slotNumber}`}
                  </div>
                  <div className="px-3 py-2 flex items-center flex-1">
                    {assignedFile ? (
                      <div className="flex bg-[#F2FBF9] border border-[#03BA8A] rounded px-2 py-1 items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-gray-700 truncate max-w-24">
                            {assignedFile.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1">
                            {/* UPDATED: Always show eye icon, but behavior depends on file type */}
                            <button
                              className="p-1 text-gray-900 cursor-pointer hover:text-blue-700"
                              onClick={(e) =>
                                handleEyeIconClick(assignedFile, e)
                              }
                              title={
                                assignedFile.url && assignedFile.isExisting
                                  ? "Open file in new tab"
                                  : "Preview file"
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                           
                          </div>
                          <button
                            className="p-1 text-gray-900 cursor-pointer hover:text-red-700"
                            onClick={() => {
                              handleDeleteUpload(assignedFile, slotNumber);
                            }}
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
                            : "border-[#E0E1EA] bg-white text-gray-400"
                        }`}
                      >
                        {isSlotDraggedOver && canAcceptDrop ? (
                          <span className="animate-pulse">Drop here...</span>
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
  return (
    <div>
      <RightViewModal
        className="!w-[80vw]"
        show={show}
        onClose={() => onClose()}
      >
        <div className="w-full h-full bg-white rounded-lg relative flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-[#E0E1EA] flex-shrink-0">
            <h2 className="text-lg font-medium text-[#323A70]">
              {getModalTitle()}
              {getModalSubtitle()}
            </h2>
            <button onClick={() => onClose()} className="text-gray-500">
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          <MySalesSubUploadParent
            ref={subUploadParentRef}
            proofUploadView={proofUploadView}
            showInstruction={showInstruction}
            ETicketsFlow={ETicketsFlow}
            paperTicketFlow={paperTicketFlow}
            initialAdditionalData={null}
            onAdditionalInfoChange={handleAdditionalInfoChange}
            onTemplateSelect={handleTemplateSelect}
            MatchHeader={MatchHeader}
            TicketDetails={TicketDetails}
            QRLinksConfigSection={QRLinksConfigSection} // ✅ Pass memoized component
            PaperTicketCourierDetailsSection={PaperTicketCourierDetailsSection}
            FileUploadSection={FileUploadSection}
            TicketAssignmentSection={TicketAssignmentSection}
            existingUploadedTickets={existingUploadedTickets}
            additionalTemplateFile={additionalTemplateFile}
            rowData={rowData}
          />

          <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-4 justify-end w-full">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                className={`px-4 py-2 bg-green-500 
             
                 text-white rounded text-sm disabled:bg-gray-300 flex gap-2 items-center disabled:cursor-not-allowed`}
                // disabled={isConfirmDisabled}
                loading={isLoading}
                onClick={handleConfirmCtaClick}
              >
                {proofUploadView ? "Submit Proof" : "Confirm"}
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

export default MySalesUploadTickets;
