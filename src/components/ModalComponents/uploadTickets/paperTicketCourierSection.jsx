import React, { useState, useCallback, useEffect, useRef } from "react";
import { Trash2, Lock } from "lucide-react";
import Image from "next/image";
import uploadIcon from "../../../../public/uploadIconNew.svg";

const PaperTicketCourierSection = React.forwardRef(
  ({ maxQuantity = 0, initialData = null, onChange, rowData }, ref) => {
    const updated = rowData?.rawTicketData?.uploadTickets;

    // Check if component should be in disabled/readonly mode
    const isDisabled = false;

    // Transform updated data to component format
    const transformUpdatedData = useCallback((updatedArray) => {
      if (!updatedArray || updatedArray.length === 0) return null;

      const firstItem = updatedArray[0];
      return {
        courier_type: firstItem.courier?.type || "company",
        courier_company: firstItem.courier?.name || "",
        tracking_details: firstItem.courier?.tracking_details || "",
        upload_tickets: firstItem.upload_tickets ? [{
          id: firstItem.id || Date.now(),
          name: `Ticket_${firstItem.id || 'file'}.png`,
          url: firstItem.upload_tickets,
          isExisting: true // Flag to identify pre-existing files
        }] : []
      };
    }, []);

    // Get initial data based on priority: updated data > initialData > defaults
    const getInitialData = useCallback(() => {
      if (updated) {
        return transformUpdatedData(updated);
      }
      return initialData;
    }, [ updated, transformUpdatedData, initialData]);

    // Internal state for courier details
    const [courierDetails, setCourierDetails] = useState(() => {
      const data = getInitialData();
      return {
        courier_type: data?.courier_type || "company",
        courier_company: data?.courier_company || "",
        tracking_details: data?.tracking_details || "",
      };
    });

    // Internal state for uploaded files
    const [uploadedFiles, setUploadedFiles] = useState(() => {
      const data = getInitialData();
      return data?.upload_tickets || [];
    });

    // Use ref to store the latest data for instant access
    const courierDataRef = useRef({ courierDetails, uploadedFiles });

    // File input ref
    const fileInputRef = useRef(null);

    // Update ref whenever state changes
    useEffect(() => {
      courierDataRef.current = { courierDetails, uploadedFiles };
    }, [courierDetails, uploadedFiles]);

    // Handle courier details change (disabled when readonly)
    const handleCourierDetailChange = useCallback(
      (field, value) => {
        // Prevent changes in disabled mode

        setCourierDetails((prev) => {
          const newDetails = {
            ...prev,
            [field]: value,
          };

          // Update ref immediately for instant access
          courierDataRef.current = {
            courierDetails: newDetails,
            uploadedFiles: courierDataRef.current.uploadedFiles,
          };

          // Only call onChange if it's provided (backward compatibility)
          if (onChange && typeof onChange === "function") {
            onChange({
              courierDetails: newDetails,
              uploadedFiles: courierDataRef.current.uploadedFiles,
            });
          }

          return newDetails;
        });
      },
      [onChange]
    );

    // Handle file upload (disabled when readonly)
    const handleFileUpload = useCallback(
      (e) => {
       

        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const newFiles = files.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            file: file,
            isExisting: false
          }));

          setUploadedFiles((prev) => {
            const updatedFiles = [...prev, ...newFiles];

            // Update ref immediately for instant access
            courierDataRef.current = {
              courierDetails: courierDataRef.current.courierDetails,
              uploadedFiles: updatedFiles,
            };

            // Only call onChange if it's provided (backward compatibility)
            if (onChange && typeof onChange === "function") {
              onChange({
                courierDetails: courierDataRef.current.courierDetails,
                uploadedFiles: updatedFiles,
              });
            }

            return updatedFiles;
          });
        }
      },
      [onChange, isDisabled]
    );

    // Handle file deletion (disabled when readonly)
    const handleDeleteUploaded = useCallback(
      (id) => {

        setUploadedFiles((prev) => {
          const updatedFiles = prev.filter((file) => file.id !== id);

          // Update ref immediately for instant access
          courierDataRef.current = {
            courierDetails: courierDataRef.current.courierDetails,
            uploadedFiles: updatedFiles,
          };

          // Only call onChange if it's provided (backward compatibility)
          if (onChange && typeof onChange === "function") {
            onChange({
              courierDetails: courierDataRef.current.courierDetails,
              uploadedFiles: updatedFiles,
            });
          }

          return updatedFiles;
        });
      },
      [onChange]
    );

    // Handle browse files click (disabled when readonly)
    const handleBrowseFiles = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    // Update internal state when initialData or updated data changes
    useEffect(() => {
      const data = getInitialData();
      if (data) {
        const newCourierDetails = {
          courier_type: data.courier_type || "company",
          courier_company: data.courier_company || "",
          tracking_details: data.tracking_details || "",
        };
        const newUploadedFiles = data.upload_tickets || [];

        setCourierDetails(newCourierDetails);
        setUploadedFiles(newUploadedFiles);
        courierDataRef.current = {
          courierDetails: newCourierDetails,
          uploadedFiles: newUploadedFiles,
        };
      }
    }, [getInitialData]);

    // Method to get current data (primary method for ref access)
    const getCurrentData = useCallback(() => {
      return courierDataRef.current;
    }, []);

    // Method to check if courier details are complete
    const hasCourierDetails = useCallback(() => {
      const data = courierDataRef.current;
      return !!(
        data.courierDetails.courier_company &&
        data.courierDetails.tracking_details
      );
    }, []);

    // Method to check if any files are uploaded
    const hasUploadedFiles = useCallback(() => {
      const data = courierDataRef.current;
      return data.uploadedFiles.length > 0;
    }, []);

    // Method to check if data has any values
    const hasData = useCallback(() => {
      return hasCourierDetails() || hasUploadedFiles();
    }, [hasCourierDetails, hasUploadedFiles]);

    // Method to validate required fields
    const isValid = useCallback(() => {
      const data = courierDataRef.current;
      // Basic validation: courier company and tracking details should be filled
      return !!(
        data.courierDetails.courier_company &&
        data.courierDetails.tracking_details
      );
    }, []);

    // Method to get completion status
    const getCompletionStatus = useCallback(() => {
      const isComplete = hasCourierDetails();
      return { completed: isComplete ? maxQuantity : 0, total: maxQuantity };
    }, [hasCourierDetails, maxQuantity]);

    // Expose methods via ref for parent component access
    React.useImperativeHandle(
      ref,
      () => ({
        // Primary method to get current data
        getCurrentData,

        // Alternative method names for flexibility
        getCourierData: () => courierDataRef.current,
        getData: () => courierDataRef.current,
        getCourierDetails: () => courierDataRef.current.courierDetails,
        getUploadedFiles: () => courierDataRef.current.uploadedFiles,

        // Utility methods
        hasData,
        isValid,
        hasCourierDetails,
        hasUploadedFiles,
        getCompletionStatus,
        isDisabled: () => isDisabled,

        // Method to programmatically update data from parent if needed
        updateData: (newData) => {

          const updatedCourierDetails = {
            courier_type: newData?.courier_type || "company",
            courier_company: newData?.courier_company || "",
            tracking_details: newData?.tracking_details || "",
          };
          const updatedUploadedFiles = newData?.upload_tickets || [];

          setCourierDetails(updatedCourierDetails);
          setUploadedFiles(updatedUploadedFiles);
          courierDataRef.current = {
            courierDetails: updatedCourierDetails,
            uploadedFiles: updatedUploadedFiles,
          };
        },

        // Method to update only courier details
        updateCourierDetails: (newDetails) => {

          const updatedDetails = {
            ...courierDataRef.current.courierDetails,
            ...newDetails,
          };
          setCourierDetails(updatedDetails);
          courierDataRef.current = {
            ...courierDataRef.current,
            courierDetails: updatedDetails,
          };
        },

        // Method to reset to initial state
        reset: () => {

          const data = getInitialData();
          const resetCourierDetails = {
            courier_type: data?.courier_type || "company",
            courier_company: data?.courier_company || "",
            tracking_details: data?.tracking_details || "",
          };
          const resetUploadedFiles = data?.upload_tickets || [];

          setCourierDetails(resetCourierDetails);
          setUploadedFiles(resetUploadedFiles);
          courierDataRef.current = {
            courierDetails: resetCourierDetails,
            uploadedFiles: resetUploadedFiles,
          };
        },

        // Method to clear all data
        clear: () => {

          const emptyData = {
            courierDetails: {
              courier_type: "company",
              courier_company: "",
              tracking_details: "",
            },
            uploadedFiles: [],
          };
          setCourierDetails(emptyData.courierDetails);
          setUploadedFiles(emptyData.uploadedFiles);
          courierDataRef.current = emptyData;
        },
      }),
      [
        getCurrentData,
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
      <div className={`border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1 ${isDisabled ? 'bg-gray-50' : ''}`}>
        <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA] flex items-center justify-between">
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
                value={courierDetails.courier_type}
                onChange={(e) =>
                  handleCourierDetailChange("courier_type", e.target.value)
                }
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                    : 'bg-white'
                }`}
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
                value={courierDetails.courier_company}
                onChange={(e) =>
                  handleCourierDetailChange("courier_company", e.target.value)
                }
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                    : 'bg-white'
                }`}
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
                value={courierDetails.tracking_details}
                onChange={(e) =>
                  handleCourierDetailChange("tracking_details", e.target.value)
                }
                disabled={isDisabled}
                className={`w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent ${
                  isDisabled 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                    : 'bg-white'
                }`}
              />
            </div>
          </div>

          {/* File Upload Section */}
          {!isDisabled && (
            <div className="border-2 border-dashed border-[#0137D5] rounded-lg p-3 bg-[#F9F9FB]">
              <div className="flex items-center text-center">
                {/* <div className="w-12 h-12 bg-[#343432] rounded-lg flex items-center justify-center mb-3">
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
                </div> */}
                <Image src={uploadIcon} alt="Upload Icon" width={42} height={42}/>

                <p className="text-sm text-[#323A70]">
                  Drag your file(s) or{" "}
                  <span
                    className="text-[#2F343A] font-bold text-sm cursor-pointer"
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
          )}

          {/* Disabled mode message */}
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

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="border border-[#E0E1EA] rounded-lg bg-white">
              <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
                <h5 className="text-xs font-medium text-[#323A70]">
                  {isDisabled ? 'Existing Files' : 'Uploaded Files'} ({uploadedFiles.length})
                </h5>
              </div>
              <div className="p-3">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 border border-[#E0E1EA] rounded-md ${
                        isDisabled ? 'bg-gray-50' : 'bg-[#F9F9FB]'
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
                        <span className="text-xs text-[#323A70] truncate max-w-32">
                          {file.name}
                        </span>
                        {file.isExisting && (
                          <span className="text-xs bg-gray-100 text-blue-800 px-2 py-1 rounded">
                            Existing
                          </span>
                        )}
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-blue-800 underline"
                          >
                            View
                          </a>
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
      </div>
    );
  }
);

PaperTicketCourierSection.displayName = "PaperTicketCourierSection";

export default PaperTicketCourierSection;