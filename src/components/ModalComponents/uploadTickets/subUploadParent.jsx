import { getAdditionalTemplate } from "@/utils/apiHandler/request";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import TemplateContentRenderer from "./templateContent";
import { Eye, FileText, ReceiptIcon } from "lucide-react";
import FloatingSelect from "@/components/floatinginputFields/floatingSelect";

const SubUploadParent = React.forwardRef(
  (
    {
      proofUploadView,
      showInstruction,
      ETicketsFlow,
      paperTicketFlow,
      MatchHeader,
      TicketDetails,
      QRLinksConfigSection,
      PaperTicketCourierDetailsSection, // Add this prop
      FileUploadSection, // Add this prop
      TicketAssignmentSection, // Add this prop
      initialAdditionalData = null,
      onAdditionalInfoChange,
      onTemplateSelect,
      existingUploadedTickets,
      additionalTemplateFile,
    },
    ref
  ) => {
    console.log(existingUploadedTickets[0]?.additional_file_type,'existingUploadedTicketsexistingUploadedTickets')
    const [templateData, setTemplateData] = useState();
    const [showPopupView, setShowPopupView] = useState(false);

    // Additional Info State - now using template ID instead of template name
    const [additionalInfo, setAdditionalInfo] = useState({
      templateId:
        initialAdditionalData?.templateId ||
        existingUploadedTickets[0]?.additional_file_type ||
        "",
      dynamicContent:
        initialAdditionalData?.dynamicContent ||
        existingUploadedTickets[0]?.additional_dynamic_content ||
        "",
      templateContent: initialAdditionalData?.templateContent || "",
      templateFile: initialAdditionalData?.templateFile || null, // Add file state
    });

    const [additionalTemplateData, setAdditionalTemplateData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTemplateContent, setSelectedTemplateContent] = useState("");
    // Ref to store the latest additional info data for instant access
    const additionalInfoRef = useRef(additionalInfo);

    // Update ref whenever additional info state changes
    useEffect(() => {
      additionalInfoRef.current = additionalInfo;
    }, [additionalInfo]);

    const handleTemplateSelection = (data) => {
      console.log(data, "sssssss");
      setTemplateData(data);
    };

    // Helper function to get template name by ID
    const getTemplateNameById = useCallback(
      (templateId) => {
        const template = additionalTemplateData.find(
          (template) => template.id === parseInt(templateId)
        );
        return template ? template.template_name : "";
      },
      [additionalTemplateData]
    );

    // Helper function to get template by ID
    const getTemplateById = useCallback(
      (templateId) => {
        return additionalTemplateData.find(
          (template) => template.id === parseInt(templateId)
        );
      },
      [additionalTemplateData]
    );

    // Handle file upload for "Upload your own" template
    const handleFileUpload = useCallback(
      (event) => {
        const file = event.target.files[0];
        if (file) {
          setAdditionalInfo((prev) => {
            const newInfo = {
              ...prev,
              templateFile: file,
            };
            additionalInfoRef.current = newInfo;

            // Call onChange if provided
            if (
              onAdditionalInfoChange &&
              typeof onAdditionalInfoChange === "function"
            ) {
              onAdditionalInfoChange(newInfo);
            }

            return newInfo;
          });
        }
      },
      [onAdditionalInfoChange]
    );

    // Handle template selection and find corresponding content by ID
    const handleTemplateChange = useCallback(
      (templateId) => {
        const selectedTemplate = getTemplateById(templateId);

        const templateContent = selectedTemplate
          ? selectedTemplate.template_content
          : "";
        setSelectedTemplateContent(templateContent);

        // Call the onTemplateSelect callback to pass data to parent
        setShowPopupView(true);
        setAdditionalInfo((prev) => {
          const newInfo = {
            ...prev,
            templateId: templateId,
            templateContent,
            // Reset file when changing templates
            templateFile: null,
          };
          additionalInfoRef.current = newInfo;
          return newInfo;
        });
      },
      [getTemplateById, onTemplateSelect]
    );

    // Handle additional info changes
    const handleAdditionalInfoChange = useCallback(
      (field, value) => {
        setAdditionalInfo((prev) => {
          const newInfo = {
            ...prev,
            [field]: value,
          };

          // Update ref immediately for instant access
          additionalInfoRef.current = newInfo;

          // Only call onChange if it's provided
          if (
            onAdditionalInfoChange &&
            typeof onAdditionalInfoChange === "function"
          ) {
            onAdditionalInfoChange(newInfo);
          }

          return newInfo;
        });
      },
      [onAdditionalInfoChange]
    );

    // Method to get current additional info data with template name included
    const getCurrentAdditionalInfoData = useCallback(() => {
      return {
        ...additionalInfoRef.current,
        templateName: getTemplateNameById(additionalInfoRef.current.templateId),
        selectedTemplateContent,
      };
    }, [selectedTemplateContent, getTemplateNameById]);

    // Method to check if additional info has any values
    const hasAdditionalInfoData = useCallback(() => {
      const data = additionalInfoRef.current;
      return !!(data.templateId || data.dynamicContent || data.templateFile);
    }, []);

    // Method to validate additional info
    const isAdditionalInfoValid = useCallback(() => {
      const data = additionalInfoRef.current;
      // Add your validation logic here if needed
      return true; // Currently no required fields
    }, []);

    // Method to get selected template content
    const getSelectedTemplateContent = useCallback(() => {
      return selectedTemplateContent;
    }, [selectedTemplateContent]);

    // Check if current template is "Upload your own"
    const isUploadYourOwnTemplate = useMemo(() => {
      const selectedTemplate = getTemplateById(additionalInfo.templateId);
      return (
        selectedTemplate && selectedTemplate.template_name === "Upload your own"
      );
    }, [additionalInfo.templateId, getTemplateById]);

    // Expose methods via ref for parent component access
    React.useImperativeHandle(
      ref,
      () => ({
        // Primary method to get current additional info data
        getCurrentAdditionalInfoData,

        // Alternative method names for flexibility
        getAdditionalInfo: () => ({
          ...additionalInfoRef.current,
          templateName: getTemplateNameById(
            additionalInfoRef.current.templateId
          ),
        }),
        getAdditionalInfoData: () => ({
          ...additionalInfoRef.current,
          templateName: getTemplateNameById(
            additionalInfoRef.current.templateId
          ),
        }),
        getData: () => ({
          ...additionalInfoRef.current,
          templateName: getTemplateNameById(
            additionalInfoRef.current.templateId
          ),
        }),

        // New method to get template content
        getSelectedTemplateContent,

        // Utility methods
        hasAdditionalInfoData,
        isAdditionalInfoValid,

        // Method to get uploaded file
        getTemplateFile: () => additionalInfoRef.current.templateFile,

        // Method to programmatically update additional info from parent if needed
        updateAdditionalInfo: (newData) => {
          const updatedData = {
            templateId: newData?.templateId || "",
            dynamicContent: newData?.dynamicContent || "",
            templateContent: newData?.templateContent || "",
            templateFile: newData?.templateFile || null,
          };
          setAdditionalInfo(updatedData);
          additionalInfoRef.current = updatedData;

          if (newData?.templateId) {
            handleTemplateChange(newData.templateId);
          }
        },

        // Method to reset additional info to initial state
        resetAdditionalInfo: () => {
          const resetData = {
            templateId: initialAdditionalData?.templateId || "",
            dynamicContent: initialAdditionalData?.dynamicContent || "",
            templateContent: initialAdditionalData?.templateContent || "",
            templateFile: initialAdditionalData?.templateFile || null,
          };
          setAdditionalInfo(resetData);
          additionalInfoRef.current = resetData;
          setSelectedTemplateContent("");
        },

        // Method to clear all additional info data
        clearAdditionalInfo: () => {
          const emptyData = {
            templateId: "",
            dynamicContent: "",
            templateContent: "",
            templateFile: null,
          };
          setAdditionalInfo(emptyData);
          additionalInfoRef.current = emptyData;
          setSelectedTemplateContent("");
        },
      }),
      [
        getCurrentAdditionalInfoData,
        hasAdditionalInfoData,
        isAdditionalInfoValid,
        getSelectedTemplateContent,
        getTemplateNameById,
        initialAdditionalData,
        handleTemplateChange,
      ]
    );

    const getTemplateDetails = async () => {
      try {
        setLoading(true);
        const response = await getAdditionalTemplate();

        // Assuming the response contains the array of templates
        if (response && Array.isArray(response)) {
          setAdditionalTemplateData(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setAdditionalTemplateData(response.data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        setAdditionalTemplateData([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      getTemplateDetails();
    }, []);

    // Update internal state when initialAdditionalData changes
    useEffect(() => {
      if (initialAdditionalData) {
        const newData = {
          templateId: initialAdditionalData.templateId || "",
          dynamicContent: initialAdditionalData.dynamicContent || "",
          templateContent: initialAdditionalData.templateContent || "",
          templateFile: initialAdditionalData.templateFile || null,
        };
        setAdditionalInfo(newData);
        additionalInfoRef.current = newData;

        // If there's an initial template ID, find and set its content
        if (initialAdditionalData.templateId) {
          handleTemplateChange(initialAdditionalData.templateId);
        }
      }
    }, [initialAdditionalData, handleTemplateChange]);

    // Instructions Panel Component
    const InstructionsPanel = ({ title, instructions }) => (
      <div className="border-[1px] border-[#E0E1EA] rounded-md">
        <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
          <h4 className="text-sm font-medium text-[#323A70]">{title}</h4>
        </div>
        <div className="p-3">
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
    );

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
                  deliveries, express options may be available at additional
                  cost.
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
                our customer service team immediately. Have your booking
                reference ready when calling.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

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

    // Left Panel Content
    const LeftPanelContent = () => (
      <div className="md:w-[45%] w-full border-r border-[#E0E1EA] flex flex-col">
        <div className="p-3 m-4 flex flex-col gap-4 overflow-y-auto  flex-1 max-h-[calc(100vh-150px)]">
          {showPopupView && selectedTemplateContent ? (
            <TemplateContentRenderer
              templateContent={selectedTemplateContent}
              dynamicContent={additionalInfo?.dynamicContent}
              onclose={() => setShowPopupView(false)}
            />
          ) : proofUploadView ? (
            <>
              {FileUploadSection && <FileUploadSection />}
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
          ) : ETicketsFlow ? (
            <>
              <ETicketInfoSection />
            </>
          ) : paperTicketFlow ? (
            <>
              <PaperTicketInfoSection />
            </>
          ) : (
            <>
              {FileUploadSection && <FileUploadSection />}
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

    const templateOptions = additionalTemplateData.map((template) => ({
      value: template.id,
      label: template.template_name,
    }))
    console.log(additionalInfo.templateId,'templateOptionstemplateOptions')
    return (
      <div className="flex max-md:flex-col  flex-1 overflow-auto md:overflow-hidden">
        <LeftPanelContent />
        <div className="max-md:w-full md:w-[55%] flex flex-col">
          <div className="m-4 flex flex-col overflow-y-auto hideScrollbar flex-1 max-h-[calc(100vh-150px)]">
            {MatchHeader && <MatchHeader />}
            {TicketDetails && <TicketDetails />}

            {proofUploadView ? (
              <>
                <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
                  {TicketAssignmentSection && <TicketAssignmentSection />}
                </div>
              </>
            ) : ETicketsFlow ? (
              <>{QRLinksConfigSection && <QRLinksConfigSection />}</>
            ) : paperTicketFlow ? (
              <>
                {PaperTicketCourierDetailsSection && (
                  <PaperTicketCourierDetailsSection />
                )}
              </>
            ) : (
              <>
                <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0">
                  {TicketAssignmentSection && <TicketAssignmentSection />}
                </div>
              </>
            )}

            {/* Show additional info section when not in proof upload view */}
            {!proofUploadView && (
              <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 h-fit flex-1 bg-[#F9F9FB]">
                <div className=" p-3 flex items-center gap-2">
                  <h4 className="text-sm font-medium text-[#323A70]">
                    Additional Information
                  </h4>
                  <span className="flex-grow flex-shrink basis-[40px] max-w-[18rem]">
                  <FloatingSelect
                    label={"Template"}
                    // id={id}
                    name={"Template"}
                    // keyValue={}
                    options={templateOptions || []}
                    // mandatory={mandatory}
                    selectedValue={Number(additionalInfo.templateId)}
                    // multiselect={multiselect}
                    // labelClassName={labelClassName}
                    // searchable={searchable}
                    disabled={loading}
                    onSelect={handleTemplateChange}
                    placeholder={"Template"}
                    // error={error}
                    paddingClassName={"w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"}
                    // hideLabel={hideLabel}
                    // className={parentClassName}
                  />
                  </span>
                </div>

                <div className="px-3">

                  {/* Dynamic Content Area */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#323A70] mb-2">
                      Dynamic Content
                    </label>
                    <textarea
                      value={additionalInfo.dynamicContent}
                      onChange={(e) =>
                        handleAdditionalInfoChange(
                          "dynamicContent",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] resize-none focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                      rows="4"
                      placeholder="Enter dynamic content here..."
                    />
                  </div>

                  {/* File Upload Section - Show only for "Upload your own" template */}
                  {isUploadYourOwnTemplate && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-[#323A70] mb-2">
                        Upload Template File
                      </label>
                      {additionalTemplateFile ? (
                        <div className="p-2 bg-[#F9F9FB] border flex gap-1 justify-between items-center border-[#E0E1EA] rounded-md">
                          <div className="flex gap-2 items-center">
                            <FileText className="w-4 h-4 text-[#323A70]" />
                            <p className="text-[13px] font-normal">
                              Additional Template
                            </p>
                          </div>

                          <Eye
                            className="w-4 h-4 cursor-pointer text-[#323A70] mt-2"
                            onClick={() => {
                              window.open(additionalTemplateFile, "_blank");
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          {" "}
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.html"
                              onChange={handleFileUpload}
                              className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:bg-[#F9F9FB] file:text-[#323A70] file:rounded-md hover:file:bg-[#E0E1EA]"
                            />
                            {additionalInfo.templateFile && (
                              <div className="mt-2 p-2 bg-[#F9F9FB] border border-[#E0E1EA] rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-[#323A70] truncate">
                                    {additionalInfo.templateFile.name}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleAdditionalInfoChange(
                                        "templateFile",
                                        null
                                      )
                                    }
                                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Size:{" "}
                                  {Math.round(
                                    additionalInfo.templateFile.size / 1024
                                  )}{" "}
                                  KB
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Accepted formats: PDF, DOC, DOCX, TXT, HTML
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SubUploadParent.displayName = "SubUploadParent";

export default SubUploadParent;
