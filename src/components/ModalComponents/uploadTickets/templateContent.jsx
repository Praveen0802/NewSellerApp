import { X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const TemplateContentRenderer = ({
  templateContent = "",
  dynamicContent = "",
  className = "",
  additionalInfoRef,
  showPopup,
  onclose
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showPopup) {
      setIsLoading(true);
      
      // Show loader for 2 seconds, then call getCurrentData
      const timer = setTimeout(() => {
        const additionalData = additionalInfoRef.current?.getCurrentData();
        setIsLoading(false);
      }, 2000);

      // Cleanup timer if component unmounts or showPopup changes
      return () => clearTimeout(timer);
    }
  }, [showPopup, additionalInfoRef]);


  // Process the template content and replace [DYNAMIC_CONTENT] placeholder
  const processedContent = useMemo(() => {
    if (!templateContent) return "";

    // Replace the [DYNAMIC_CONTENT] placeholder with actual dynamic content
    let processed = templateContent.replace(/\[DYNAMIC_CONTENT\]/g, dynamicContent ? dynamicContent : '[DYNAMIC CONTENT]');

    return processed;
  }, [templateContent, dynamicContent]);

  // Clean HTML content for safe rendering
  const createMarkup = () => {
    return { __html: processedContent };
  };

  // Loader component
  const Loader = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading additional data...</p>
      </div>
    </div>
  );

  if (!templateContent) {
    return (
      <>
        {isLoading && <Loader />}
        <div
          className={`p-4 text-center text-gray-500 text-sm border border-gray-200 rounded ${className}`}
        >
          <p>Select a template to see preview content</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className= "py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700">Template Preview</h4>
          <X className="cursor-pointer" onClick={() => onclose()} />
        </div>
        <div
          className=" overflow-y-auto text-sm leading-relaxed"
          dangerouslySetInnerHTML={createMarkup()}
          style={{
            // Override some default styles for better readability
            color: "#374151",
            lineHeight: "1.6",
          }}
        />
        {/* {dynamicContent && (
          <div className="bg-blue-50 border-t border-blue-200 px-3 py-2">
            <p className="text-xs text-gray-600">
              <strong>Dynamic Content:</strong> {dynamicContent}
            </p>
          </div>
        )} */}
      </div>
    </>
  );
};

export default TemplateContentRenderer;