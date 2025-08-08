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
import uploadImage from "../../../../public/uploadView.svg";
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
import { max, set } from "lodash";
import AdditionalInfoSection from "./AdditionalInfo";
import QRLinksSection from "./QRLinkSection";
import PaperTicketCourierSection from "./paperTicketCourierSection";
import TemplateContentRenderer from "./templateContent";
import SubUploadParent from "./subUploadParent";
import { readCookie } from "@/utils/helperFunctions/cookie";

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
console.log(rowData,'rowDatarowData')
  const ticketTypes = !isNaN(parseInt(rowData?.ticket_type))
    ? rowData?.ticket_type
    : rowData?.ticket_types || rowData?.ticket_type_id;
  const ETicketsFlow = [4]?.includes(parseInt(ticketTypes));
  const paperTicketFlow = parseInt(ticketTypes) === 3;
  const normalFlow = !ETicketsFlow && !paperTicketFlow;

  const existingUploadedTickets = rowData?.rawTicketData?.uploadTickets || [];
  console.log(
    existingUploadedTickets,
    "existingUploadedTicketsexistingUploadedTickets"
  );
  const hasExistingTickets =
    existingUploadedTickets.length > 0 &&
    existingUploadedTickets?.[0]?.upload_tickets;
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
  const [transferredFiles, setTransferredFiles] = useState([]);

  // Proof upload flow states
  const [proofUploadedFiles, setProofUploadedFiles] = useState([]);
  const [proofTransferredFiles, setProofTransferredFiles] = useState([]);

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
      } else {
        setProofTransferredFiles([]);
      }
      setProofUploadedFiles([]);
    } else {
      if (hasExistingTickets) {
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
      } else {
        const initialUploadTickets = rowData?.upload_tickets || [];
        setTransferredFiles(initialUploadTickets);
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

          const remainingSlots = maxQuantity - transferredFiles.length;
          const filesToAdd = files.slice(0, remainingSlots);

          const newFiles = filesToAdd.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file,
          }));
          setUploadedFiles((prev) => [...prev, ...newFiles]);

          if (files.length > remainingSlots) {
            alert(
              `Only ${remainingSlots} more files can be uploaded. ${remainingSlots} files were added.`
            );
          }
        }
      }
    },
    [
      proofUploadView,
      hasExistingTickets,
      hasPartialUploads,
      maxQuantity,
      transferredFiles.length,
    ]
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

  // Enhanced handleTransferSingleFile for proof upload
  const handleTransferSingleFile = useCallback(
    (fileId) => {
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
      proofTransferredFiles.length,
      maxQuantity,
      uploadedFiles,
      transferredFiles.length,
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
        return transferredFiles.length < maxQuantity;
      }
    },
    [
      proofUploadView,
      proofTransferredFiles.length,
      transferredFiles.length,
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
    <div className="bg-[#1E0065] text-xs py-3 rounded-t-md text-white px-4 flex items-center justify-between">
      <h3 className="font-medium">{matchDetails?.match_name}</h3>
      <div className="flex items-center gap-2 justify-center">
        <Calendar className="w-4 h-4" />
        <span className="text-xs">
          {matchDetails?.match_date_format || rowData?.matchDate}
        </span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Clock className="w-4 h-4" />
        <span className="text-xs">
          {matchDetails?.match_time || rowData?.matchTime}
        </span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <MapPin className="w-4 h-4" />
        <span className="text-xs">
          {matchDetails?.stadium_name || rowData?.venue}
        </span>
      </div>
      <button className="ml-2">
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );

  // Common Ticket Details Component
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
  ]);

  const isConfirmDisabled = getCompletionStatus.completed === 0;

  // Enhanced modal title and subtitle
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
      const index = 0;
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
        const newFiles = updatedObject.upload_tickets.filter(
          (ticket) => !ticket.isExisting
        );
        newFiles.forEach((ticket, ticketIndex) => {
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
        // Fix: Provide a value for template_id
        newFormData.append(
          "template_id",
          updatedObject.additional_info.template || ""
        );
      }

      return newFormData;
    };

    try {
      const formData = constructTicketFormData(updatedObject);
      const response = await myListingUploadTickets("", formData);

      if (updatedObject.additional_info) {
        try {
          const newFormData = constructNewFormData(updatedObject);
          const data = await updateAdditionalFile("", newFormData);
        } catch (err) {
          console.log("error", err);
        }
      }

      // if (response.success) {
      onClose();
      toast.success(
        proofUploadView
          ? "Proof document uploaded successfully"
          : "Tickets updated successfully"
      );
      // } else {
      // console.error("Upload failed:", response.message);
      // toast.error(response.message || "Upload failed");
      // }
    } catch (error) {
      // console.error("API call failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCtaClick = useCallback(async () => {
    console.log(mySalesPage,'mySalesPagemySalesPage')
    if (mySalesPage) {
      onClose();
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
console.log(currentPaperTicketData,'currentPaperTicketDatacurrentPaperTicketData')
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
          onClose();
          toast.success("Proof document uploaded successfully");
        } catch (error) {
          console.error("API call failed:", error);
          setIsLoading(false);
        }
      } else {
        onClose();
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
          handleConfirmClick(updatedObject, rowIndex, rowData);
        }
      } else {
        onClose();
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
        onClose();
      }
    } else if (paperTicketFlow) {
      if (
        currentPaperTicketData.courierDetails.courier_type &&
        currentPaperTicketData.courierDetails.courier_company &&
        currentPaperTicketData.courierDetails.tracking_details &&
        currentPaperTicketData.uploadedFiles?.length > 0
      ) {
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
      } else {
        onClose();
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

  // Handle template selection callback (optional)
  const handleTemplateSelect = useCallback((templateData) => {
    console.log("Template selected:", templateData);
    // Handle template selection logic here
  }, []);

  // Add these component definitions inside your UploadTickets component:

  // File Upload Section Component
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
      : false;

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

    return (
      <>
        {/* Drag and drop area */}
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
                  label_: "text-[12px] font-medium !text-[#0137D5]",
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
            <h3 className="text-sm font-medium text-[#323A70]">
              {proofUploadView
                ? `Proof Document (${currentUploadedFiles.length}/1)`
                : `Uploaded Files (${currentUploadedFiles.length})`}
            </h3>
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
                            ? "bg-[#343432] text-white hover:bg-[#343432]/90"
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
  console.log(transferredFiles, "transferredFiles");
  // Ticket Assignment Section Component
  const TicketAssignmentSection = () => {
    // Use the appropriate state variables based on proof upload view
    const currentTransferredFiles = proofUploadView
      ? proofTransferredFiles
      : transferredFiles;

    const handleDeleteUpload = async (assignedFile) => {
      console.log(assignedFile, "assignedFileassignedFile");
      try {
        // If the file has an existing ID, call the API first
        if (
          assignedFile?.url &&
          (assignedFile?.existingId || assignedFile?.id)
        ) {
          const idToDelete = assignedFile.existingId || assignedFile.id;
          console.log(idToDelete, "idToDelete");
          try {
            await deleteTicketUpload("", idToDelete);
            toast.success("File deleted successfully");
          } catch (error) {
            console.error("Failed to delete from server:", error);
            toast.error("Failed to delete file from server");
            return; // Don't update state if API call failed
          }
        }

        // Remove from the appropriate state array
        if (proofUploadView) {
          // For proof upload view
          setProofTransferredFiles((prev) =>
            prev.filter((file) => {
              // If assignedFile has existingId, match by existingId
              if (assignedFile.existingId) {
                return file.existingId !== assignedFile.existingId;
              }
              // If assignedFile has id, match by id
              if (assignedFile.id) {
                return file.id !== assignedFile.id;
              }
              // Fallback: this shouldn't happen, but keep all files if no identifier
              return true;
            })
          );
        } else {
          // For normal flow
          setTransferredFiles((prev) =>
            prev.filter((file) => {
              // If assignedFile has existingId, match by existingId
              if (assignedFile.existingId) {
                return file.existingId !== assignedFile.existingId;
              }
              // If assignedFile has id, match by id
              if (assignedFile.id) {
                return file.id !== assignedFile.id;
              }
              // Fallback: this shouldn't happen, but keep all files if no identifier
              return true;
            })
          );
        }
      } catch (error) {
        console.error("Error in handleDeleteUpload:", error);
      } finally {
        setIsLoading(false);
      }
    };
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
              console.log(assignedFile, "assignedFileassignedFile");
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
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-gray-700 truncate max-w-24">
                            {assignedFile.name}
                          </span>
                          {assignedFile.isExisting && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">
                                Uploaded
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {assignedFile.isExisting && (
                            <button
                              className="p-1 text-blue-500 cursor-pointer hover:text-blue-700"
                              onClick={() =>
                                window.open(assignedFile.url, "_blank")
                              }
                              title="View uploaded ticket"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            className="p-1 text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() => {
                              handleDeleteUpload(assignedFile);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
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

  return (
    <div>
      <RightViewModal
        className="!w-[70vw]"
        show={show}
        onClose={() => onClose()}
      >
        <div className="w-full h-full bg-white rounded-lg relative flex flex-col">
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

          {/* Main Content - Use SubUploadParent with ref */}
          <SubUploadParent
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
            QRLinksConfigSection={QRLinksConfigSection}
            PaperTicketCourierDetailsSection={PaperTicketCourierDetailsSection}
            FileUploadSection={FileUploadSection} // Add this
            TicketAssignmentSection={TicketAssignmentSection} // Add this
            existingUploadedTickets={existingUploadedTickets}
            additionalTemplateFile={additionalTemplateFile}
          />

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
                } text-white rounded text-sm disabled:bg-gray-300 flex gap-2 items-center disabled:cursor-not-allowed`}
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
