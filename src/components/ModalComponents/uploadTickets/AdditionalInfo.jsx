import { getAdditionalTemplate } from "@/utils/apiHandler/request";
import React, { useState, useCallback, useEffect, useRef } from "react";

const AdditionalInfoSection = React.forwardRef(
  ({ paperTicketFlow = false, initialData = null, onChange }, ref) => {
    // Internal state for additional information
    const [additionalInfo, setAdditionalInfo] = useState({
      template: initialData?.template || "",
      dynamicContent: initialData?.dynamicContent || "",
    });
    const [templateData, setTemplateData] = useState([]);

    const getTemplateDetails = async () => {
      const response = await getAdditionalTemplate();
      console.log(response,'responseresponse')
    };

    useEffect(() => {
      getTemplateDetails();
    }, []);

    // Use ref to store the latest data for instant access
    const additionalInfoRef = useRef(additionalInfo);

    // Update ref whenever state changes
    useEffect(() => {
      additionalInfoRef.current = additionalInfo;
    }, [additionalInfo]);

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

          // Only call onChange if it's provided (backward compatibility)
          if (onChange && typeof onChange === "function") {
            onChange(newInfo);
          }

          return newInfo;
        });
      },
      [onChange]
    );

    // Update internal state when initialData changes
    useEffect(() => {
      if (initialData) {
        const newData = {
          template: initialData.template || "",
          dynamicContent: initialData.dynamicContent || "",
        };
        setAdditionalInfo(newData);
        additionalInfoRef.current = newData;
      }
    }, [initialData]);

    // Method to get current data (primary method for ref access)
    const getCurrentData = useCallback(() => {
      return additionalInfoRef.current;
    }, []);

    // Method to check if data has any values
    const hasData = useCallback(() => {
      const data = additionalInfoRef.current;
      return !!(data.template || data.dynamicContent);
    }, []);

    // Method to validate required fields
    const isValid = useCallback(() => {
      const data = additionalInfoRef.current;
      // Add your validation logic here if needed
      return true; // Currently no required fields
    }, []);

    // Expose methods via ref for parent component access
    React.useImperativeHandle(
      ref,
      () => ({
        // Primary method to get current data
        getCurrentData,

        // Alternative method names for flexibility
        getAdditionalInfo: () => additionalInfoRef.current,
        getData: () => additionalInfoRef.current,

        // Utility methods
        hasData,
        isValid,

        // Method to programmatically update data from parent if needed
        updateData: (newData) => {
          const updatedData = {
            template: newData?.template || "",
            dynamicContent: newData?.dynamicContent || "",
          };
          setAdditionalInfo(updatedData);
          additionalInfoRef.current = updatedData;
        },

        // Method to reset to initial state
        reset: () => {
          const resetData = {
            template: initialData?.template || "",
            dynamicContent: initialData?.dynamicContent || "",
          };
          setAdditionalInfo(resetData);
          additionalInfoRef.current = resetData;
        },

        // Method to clear all data
        clear: () => {
          const emptyData = {
            template: "",
            dynamicContent: "",
          };
          setAdditionalInfo(emptyData);
          additionalInfoRef.current = emptyData;
        },
      }),
      [getCurrentData, hasData, isValid, initialData]
    );

    return (
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
  }
);

AdditionalInfoSection.displayName = "AdditionalInfoSection";

export default AdditionalInfoSection;
