import React, { useState, useCallback, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

const PaperTicketCourierSection = React.forwardRef(({ 
  maxQuantity = 0,
  initialData = null, 
  onChange 
}, ref) => {
  // Internal state for courier details
  const [courierDetails, setCourierDetails] = useState({
    courier_type: initialData?.courier_type || "company",
    courier_company: initialData?.courier_company || "",
    tracking_details: initialData?.tracking_details || "",
  });

  // Internal state for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState(
    initialData?.upload_tickets || []
  );

  // Use ref to store the latest data for instant access
  const courierDataRef = useRef({ courierDetails, uploadedFiles });

  // File input ref
  const fileInputRef = useRef(null);

  // Update ref whenever state changes
  useEffect(() => {
    courierDataRef.current = { courierDetails, uploadedFiles };
  }, [courierDetails, uploadedFiles]);

  // Handle courier details change
  const handleCourierDetailChange = useCallback((field, value) => {
    setCourierDetails((prev) => {
      const newDetails = {
        ...prev,
        [field]: value,
      };
      
      // Update ref immediately for instant access
      courierDataRef.current = { 
        courierDetails: newDetails, 
        uploadedFiles: courierDataRef.current.uploadedFiles 
      };
      
      // Only call onChange if it's provided (backward compatibility)
      if (onChange && typeof onChange === 'function') {
        onChange({
          courierDetails: newDetails,
          uploadedFiles: courierDataRef.current.uploadedFiles
        });
      }
      
      return newDetails;
    });
  }, [onChange]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        file: file,
      }));
      
      setUploadedFiles((prev) => {
        const updatedFiles = [...prev, ...newFiles];
        
        // Update ref immediately for instant access
        courierDataRef.current = { 
          courierDetails: courierDataRef.current.courierDetails, 
          uploadedFiles: updatedFiles 
        };
        
        // Only call onChange if it's provided (backward compatibility)
        if (onChange && typeof onChange === 'function') {
          onChange({
            courierDetails: courierDataRef.current.courierDetails,
            uploadedFiles: updatedFiles
          });
        }
        
        return updatedFiles;
      });
    }
  }, [onChange]);

  // Handle file deletion
  const handleDeleteUploaded = useCallback((id) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== id);
      
      // Update ref immediately for instant access
      courierDataRef.current = { 
        courierDetails: courierDataRef.current.courierDetails, 
        uploadedFiles: updatedFiles 
      };
      
      // Only call onChange if it's provided (backward compatibility)
      if (onChange && typeof onChange === 'function') {
        onChange({
          courierDetails: courierDataRef.current.courierDetails,
          uploadedFiles: updatedFiles
        });
      }
      
      return updatedFiles;
    });
  }, [onChange]);

  // Handle browse files click
  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Update internal state when initialData changes
  useEffect(() => {
    if (initialData) {
      const newCourierDetails = {
        courier_type: initialData.courier_type || "company",
        courier_company: initialData.courier_company || "",
        tracking_details: initialData.tracking_details || "",
      };
      const newUploadedFiles = initialData.upload_tickets || [];
      
      setCourierDetails(newCourierDetails);
      setUploadedFiles(newUploadedFiles);
      courierDataRef.current = { 
        courierDetails: newCourierDetails, 
        uploadedFiles: newUploadedFiles 
      };
    }
  }, [initialData]);

  // Method to get current data (primary method for ref access)
  const getCurrentData = useCallback(() => {
    return courierDataRef.current;
  }, []);

  // Method to check if courier details are complete
  const hasCourierDetails = useCallback(() => {
    const data = courierDataRef.current;
    return !!(data.courierDetails.courier_company && data.courierDetails.tracking_details);
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
    return !!(data.courierDetails.courier_company && data.courierDetails.tracking_details);
  }, []);

  // Method to get completion status
  const getCompletionStatus = useCallback(() => {
    const isComplete = hasCourierDetails();
    return { completed: isComplete ? maxQuantity : 0, total: maxQuantity };
  }, [hasCourierDetails, maxQuantity]);

  // Expose methods via ref for parent component access
  React.useImperativeHandle(ref, () => ({
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
        uploadedFiles: updatedUploadedFiles 
      };
    },
    
    // Method to update only courier details
    updateCourierDetails: (newDetails) => {
      const updatedDetails = { ...courierDataRef.current.courierDetails, ...newDetails };
      setCourierDetails(updatedDetails);
      courierDataRef.current = { 
        ...courierDataRef.current, 
        courierDetails: updatedDetails 
      };
    },
    
    // Method to reset to initial state
    reset: () => {
      const resetCourierDetails = {
        courier_type: initialData?.courier_type || "company",
        courier_company: initialData?.courier_company || "",
        tracking_details: initialData?.tracking_details || "",
      };
      const resetUploadedFiles = initialData?.upload_tickets || [];
      
      setCourierDetails(resetCourierDetails);
      setUploadedFiles(resetUploadedFiles);
      courierDataRef.current = { 
        courierDetails: resetCourierDetails, 
        uploadedFiles: resetUploadedFiles 
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
        uploadedFiles: []
      };
      setCourierDetails(emptyData.courierDetails);
      setUploadedFiles(emptyData.uploadedFiles);
      courierDataRef.current = emptyData;
    }
  }), [getCurrentData, hasData, isValid, hasCourierDetails, hasUploadedFiles, getCompletionStatus, maxQuantity, initialData]);

  return (
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
              value={courierDetails.courier_type}
              onChange={(e) =>
                handleCourierDetailChange("courier_type", e.target.value)
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
              value={courierDetails.courier_company}
              onChange={(e) =>
                handleCourierDetailChange("courier_company", e.target.value)
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
              value={courierDetails.tracking_details}
              onChange={(e) =>
                handleCourierDetailChange("tracking_details", e.target.value)
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
});

PaperTicketCourierSection.displayName = 'PaperTicketCourierSection';

export default PaperTicketCourierSection;