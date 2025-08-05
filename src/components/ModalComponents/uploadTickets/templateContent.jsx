import React, { useEffect, useMemo, useState } from "react";

const TemplateContentRenderer = ({
  templateContent = "",
  dynamicContent = "",
  className = "",
  additionalInfoRef,
  showPopup,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showPopup) {
      setIsLoading(true);
      
      // Show loader for 2 seconds, then call getCurrentData
      const timer = setTimeout(() => {
        const additionalData = additionalInfoRef.current?.getCurrentData();
        console.log(additionalData, "oooooooooo");
        setIsLoading(false);
      }, 2000);

      // Cleanup timer if component unmounts or showPopup changes
      return () => clearTimeout(timer);
    }
  }, [showPopup, additionalInfoRef]);

  console.log(
    additionalInfoRef,
    "additionalInfoRefadditionalInfoRefadditionalInfoRef"
  );

  // Process the template content and replace [DYNAMIC_CONTENT] placeholder
  const processedContent = useMemo(() => {
    if (!templateContent) return "";

    // Replace the [DYNAMIC_CONTENT] placeholder with actual dynamic content
    let processed = templateContent.replace(/\[DYNAMIC_CONTENT\]/g, "");

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
      {isLoading && <Loader />}
      <div className={`border border-gray-200 rounded-md ${className}`}>
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Template Preview</h4>
        </div>
        <div
          className="p-3 max-h-96 overflow-y-auto text-sm leading-relaxed"
          dangerouslySetInnerHTML={createMarkup()}
          style={{
            // Override some default styles for better readability
            color: "#374151",
            lineHeight: "1.6",
          }}
        />
        {dynamicContent && (
          <div className="bg-blue-50 border-t border-blue-200 px-3 py-2">
            <p className="text-xs text-blue-600">
              <strong>Dynamic Content:</strong> {dynamicContent}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TemplateContentRenderer;