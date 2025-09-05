import React, { useState, useCallback, useEffect, useRef } from "react";
import { Trash2, Lock, Eye } from "lucide-react";
import FilePreviewModal from "../previewFile";

const MySalesPaperTicketCourierSection = React.forwardRef(
  ({ maxQuantity = 0, initialData = null, onChange, rowData }, ref) => {
    const updated = rowData?.rawTicketData?.uploadTickets;
    const isDisabled = false;

    const [previewFile, setPreviewFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handlePreviewClick = useCallback((file, e) => {
      e?.stopPropagation();
      setPreviewFile(file);
      setShowPreview(true);
    }, []);

    const transformUpdatedData = useCallback((updatedArray) => {
      if (!updatedArray || updatedArray.length === 0) return null;

      const firstItem = updatedArray[0];
      return {
        courier_type: firstItem.courier?.type || "company",
        courier_company: firstItem.courier?.name || "",
        tracking_details: firstItem.courier?.tracking_details || "",
        tracking_link: firstItem.courier?.tracking_link || "",
        upload_tickets: firstItem.upload_tickets
          ? [
              {
                id: firstItem.id || Date.now(),
                name: `Ticket_${firstItem.id || "file"}.png`,
                url: firstItem.upload_tickets,
                isExisting: true,
              },
            ]
          : [],
      };
    }, []);

    const getInitialData = useCallback(() => {
      if (updated) {
        return transformUpdatedData(updated);
      }
      return initialData;
    }, [updated, transformUpdatedData, initialData]);

    const [courierDetails, setCourierDetails] = useState(() => {
      const data = getInitialData();
      return {
        courier_type: data?.courier_type || "company",
        courier_company: data?.courier_company || "",
        tracking_details: data?.tracking_details || "",
        tracking_link: data?.tracking_link || "",
      };
    });

    const [uploadedFiles, setUploadedFiles] = useState(() => {
      const data = getInitialData();
      return data?.upload_tickets || [];
    });

    // FIXED: Use refs to store the latest state values
    const courierDetailsRef = useRef(courierDetails);
    const uploadedFilesRef = useRef(uploadedFiles);
    const fileInputRef = useRef(null);

    // FIXED: Critical - Update refs whenever state changes
    useEffect(() => {
      courierDetailsRef.current = courierDetails;
      console.log(
        "Paper ticket courierDetailsRef updated:",
        courierDetailsRef.current
      );
    }, [courierDetails]);

    useEffect(() => {
      uploadedFilesRef.current = uploadedFiles;
      console.log(
        "Paper ticket uploadedFilesRef updated:",
        uploadedFilesRef.current
      );
    }, [uploadedFiles]);

    // FIXED: Enhanced handleCourierDetailChange with immediate ref update
    const handleCourierDetailChange = useCallback(
      (field, value) => {
        console.log(`Changing ${field} to:`, value);

        setCourierDetails((prevDetails) => {
          const newDetails = {
            ...prevDetails,
            [field]: value,
          };

          // FIXED: Update ref immediately - this is crucial
          courierDetailsRef.current = newDetails;
          console.log(
            "Paper ticket courierDetailsRef updated immediately:",
            courierDetailsRef.current
          );

          // Call onChange with the new data using current refs
          if (onChange && typeof onChange === "function") {
            const changeData = {
              courierDetails: newDetails,
              uploadedFiles: uploadedFilesRef.current,
            };
            console.log("Paper ticket calling onChange with:", changeData);
            onChange(changeData);
          }

          return newDetails;
        });
      },
      [onChange]
    );

    // FIXED: Enhanced handleFileUpload with immediate ref update
    const handleFileUpload = useCallback(
      (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const newFiles = files.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file,
            isExisting: false,
          }));

          setUploadedFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, ...newFiles];

            // FIXED: Update ref immediately
            uploadedFilesRef.current = updatedFiles;
            console.log(
              "Paper ticket uploadedFilesRef updated immediately:",
              uploadedFilesRef.current
            );

            // Call onChange with the new data using current refs
            if (onChange && typeof onChange === "function") {
              const changeData = {
                courierDetails: courierDetailsRef.current,
                uploadedFiles: updatedFiles,
              };
              console.log("File upload - calling onChange with:", changeData);
              onChange(changeData);
            }

            return updatedFiles;
          });
        }
      },
      [onChange]
    );

    // FIXED: Enhanced handleDeleteUploaded with immediate ref update
    const handleDeleteUploaded = useCallback(
      (id) => {
        setUploadedFiles((prevFiles) => {
          const updatedFiles = prevFiles.filter((file) => file.id !== id);

          // FIXED: Update ref immediately
          uploadedFilesRef.current = updatedFiles;
          console.log(
            "Paper ticket uploadedFilesRef updated immediately after delete:",
            uploadedFilesRef.current
          );

          // Call onChange with the new data using current refs
          if (onChange && typeof onChange === "function") {
            const changeData = {
              courierDetails: courierDetailsRef.current,
              uploadedFiles: updatedFiles,
            };
            console.log("File deletion - calling onChange with:", changeData);
            onChange(changeData);
          }

          return updatedFiles;
        });
      },
      [onChange]
    );

    const handleBrowseFiles = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    useEffect(() => {
      const data = getInitialData();
      if (data) {
        const newCourierDetails = {
          courier_type: data.courier_type || "company",
          courier_company: data.courier_company || "",
          tracking_details: data.tracking_details || "",
          tracking_link: data.tracking_link || "",
        };
        const newUploadedFiles = data.upload_tickets || [];

        console.log("Paper ticket initializing with data:", data);
        setCourierDetails(newCourierDetails);
        setUploadedFiles(newUploadedFiles);
      }
    }, [getInitialData]);

    // FIXED: Always return current ref data
    const getCurrentData = useCallback(() => {
      const currentData = {
        courierDetails: courierDetailsRef.current,
        uploadedFiles: uploadedFilesRef.current,
      };
      console.log(
        "Paper ticket getCurrentData called, returning from refs:",
        currentData
      );
      return currentData;
    }, []);

    const hasCourierDetails = useCallback(() => {
      const details = courierDetailsRef.current;
      const hasDetails = !!(
        details.courier_company && details.tracking_details
      );
      console.log("Paper ticket hasCourierDetails:", hasDetails, details);
      return hasDetails;
    }, []);

    const hasUploadedFiles = useCallback(() => {
      const files = uploadedFilesRef.current;
      const hasFiles = files.length > 0;
      console.log("Paper ticket hasUploadedFiles:", hasFiles, files);
      return hasFiles;
    }, []);

    const hasData = useCallback(() => {
      return hasCourierDetails() || hasUploadedFiles();
    }, [hasCourierDetails, hasUploadedFiles]);

    const isValid = useCallback(() => {
      const details = courierDetailsRef.current;
      const valid = !!(details.courier_company && details.tracking_details);
      console.log("Paper ticket isValid:", valid, details);
      return valid;
    }, []);

    const getCompletionStatus = useCallback(() => {
      const isComplete = hasCourierDetails();
      return { completed: isComplete ? maxQuantity : 0, total: maxQuantity };
    }, [hasCourierDetails, maxQuantity]);

    React.useImperativeHandle(
      ref,
      () => ({
        // FIXED: Primary method to get current data - use refs
        getCurrentData: () => {
          const data = {
            courierDetails: courierDetailsRef.current,
            uploadedFiles: uploadedFilesRef.current,
          };
          console.log(
            "REF Paper ticket getCurrentData called, returning from refs:",
            data
          );
          return data;
        },
        getCourierData: () => ({
          courierDetails: courierDetailsRef.current,
          uploadedFiles: uploadedFilesRef.current,
        }),
        getData: () => ({
          courierDetails: courierDetailsRef.current,
          uploadedFiles: uploadedFilesRef.current,
        }),
        getCourierDetails: () => {
          console.log(
            "REF Paper ticket getCourierDetails called, returning from ref:",
            courierDetailsRef.current
          );
          return courierDetailsRef.current;
        },
        getUploadedFiles: () => {
          console.log(
            "REF Paper ticket getUploadedFiles called, returning from ref:",
            uploadedFilesRef.current
          );
          return uploadedFilesRef.current;
        },
        hasData,
        isValid,
        hasCourierDetails,
        hasUploadedFiles,
        getCompletionStatus,
        isDisabled: () => isDisabled,
        updateData: (newData) => {
          console.log("REF Paper ticket updateData called with:", newData);
          const updatedCourierDetails = {
            courier_type: newData?.courier_type || "company",
            courier_company: newData?.courier_company || "",
            tracking_details: newData?.tracking_details || "",
            tracking_link: newData?.tracking_link || "",
          };
          const updatedUploadedFiles = newData?.upload_tickets || [];

          setCourierDetails(updatedCourierDetails);
          setUploadedFiles(updatedUploadedFiles);
        },
        updateCourierDetails: (newDetails) => {
          console.log(
            "REF Paper ticket updateCourierDetails called with:",
            newDetails
          );
          setCourierDetails((prev) => ({
            ...prev,
            ...newDetails,
          }));
        },
        reset: () => {
          console.log("REF Paper ticket reset called");
          const data = getInitialData();
          const resetCourierDetails = {
            courier_type: data?.courier_type || "company",
            courier_company: data?.courier_company || "",
            tracking_details: data?.tracking_details || "",
            tracking_link: data?.tracking_link || "",
          };
          const resetUploadedFiles = data?.upload_tickets || [];

          setCourierDetails(resetCourierDetails);
          setUploadedFiles(resetUploadedFiles);
        },
        clear: () => {
          console.log("REF Paper ticket clear called");
          const emptyData = {
            courierDetails: {
              courier_type: "company",
              courier_company: "",
              tracking_details: "",
              tracking_link: "",
            },
            uploadedFiles: [],
          };
          setCourierDetails(emptyData.courierDetails);
          setUploadedFiles(emptyData.uploadedFiles);
        },
        debugCurrentState: () => {
          console.log(
            "DEBUG - Paper ticket Current courier details from ref:",
            courierDetailsRef.current
          );
          console.log(
            "DEBUG - Paper ticket Current uploaded files from ref:",
            uploadedFilesRef.current
          );
          console.log(
            "DEBUG - Paper ticket Current courier details from state:",
            courierDetails
          );
          console.log(
            "DEBUG - Paper ticket Current uploaded files from state:",
            uploadedFiles
          );
          return {
            fromRefs: {
              courierDetails: courierDetailsRef.current,
              uploadedFiles: uploadedFilesRef.current,
            },
            fromState: { courierDetails, uploadedFiles },
          };
        },
      }),
      [
        hasData,
        isValid,
        hasCourierDetails,
        hasUploadedFiles,
        getCompletionStatus,
        maxQuantity,
        getInitialData,
        isDisabled,
      ]
    );

    return (
      <div
        className={`border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1 ${
          isDisabled ? "bg-gray-50" : ""
        }`}
      >
        <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#323A70]">
            Courier Details ({maxQuantity} tickets)
          </h4>
          <div className="text-xs text-gray-500">
            Company: {courierDetails.courier_company}, Tracking:{" "}
            {courierDetails.tracking_details}
          </div>
        </div>

        <div className="p-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#323A70] mb-2">
                Courier Type
              </label>
              <select
                value={courierDetails.courier_type}
                onChange={(e) => {
                  console.log(
                    "Courier type select changed to:",
                    e.target.value
                  );
                  handleCourierDetailChange("courier_type", e.target.value);
                }}
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
                <option value="express">Express</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#323A70] mb-2">
                Courier Company Name
              </label>
              <input
                type="text"
                placeholder="FedEx"
                value={courierDetails.courier_company}
                onChange={(e) => {
                  console.log(
                    "Courier company input changed to:",
                    e.target.value
                  );
                  handleCourierDetailChange("courier_company", e.target.value);
                }}
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#323A70] mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                placeholder="DSG684864SG56"
                value={courierDetails.tracking_details}
                onChange={(e) => {
                  console.log(
                    "Tracking details input changed to:",
                    e.target.value
                  );
                  handleCourierDetailChange("tracking_details", e.target.value);
                }}
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#323A70] mb-2">
                Tracking Link
              </label>
              <input
                type="url"
                placeholder="https://tracking.fedex.com/..."
                value={courierDetails.tracking_link}
                onChange={(e) => {
                  console.log(
                    "Tracking link input changed to:",
                    e.target.value
                  );
                  handleCourierDetailChange("tracking_link", e.target.value);
                }}
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "bg-white"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-2">
              Proof of Delivery (POD) File
            </label>
            {!isDisabled && (
              <div className="border-2 border-dashed border-[#0137D5] rounded-lg p-6 bg-[#F9F9FB]">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#343432] rounded-lg flex items-center justify-center mb-3">
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
                    Upload POD file or{" "}
                    <span
                      className="text-[#343432] font-medium cursor-pointer"
                      onClick={handleBrowseFiles}
                    >
                      Browse files
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, JPG, JPEG, PNG
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {isDisabled && uploadedFiles.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex flex-col items-center justify-center text-center">
                <Lock className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  File upload is disabled - data already exists
                </p>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="border border-[#E0E1EA] rounded-lg bg-white">
              <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
                <h5 className="text-xs font-medium text-[#323A70]">
                  {isDisabled ? "Existing Files" : "Uploaded Files"} (
                  {uploadedFiles.length})
                </h5>
              </div>
              <div className="p-3">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 border border-[#E0E1EA] rounded-md ${
                        isDisabled ? "bg-gray-50" : "bg-[#F9F9FB]"
                      }`}
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
                        <span className="text-xs text-[#323A70] max-w-32">
                          {file.name}
                        </span>
                        {file.isExisting && (
                          <span className="text-xs bg-gray-100 text-blue-800 px-2 py-1 rounded">
                            Existing
                          </span>
                        )}

                        {/* Updated View/Preview section */}
                        {file.url ? (
                          // For existing files with URLs, show traditional "View" link
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-blue-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        ) : (
                          // For newly uploaded files, show preview button with eye icon
                          <button
                            onClick={(e) => handlePreviewClick(file, e)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-800"
                            title="Preview file"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        )}
                      </div>
                      {!isDisabled && (
                        <button
                          className="p-1 text-gray-900 hover:text-red-700"
                          onClick={() => handleDeleteUploaded(file.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <FilePreviewModal
          show={showPreview}
          onClose={() => setShowPreview(false)}
          file={previewFile}
        />
      </div>
    );
  }
);

MySalesPaperTicketCourierSection.displayName =
  "MySalesPaperTicketCourierSection";

export default MySalesPaperTicketCourierSection;
