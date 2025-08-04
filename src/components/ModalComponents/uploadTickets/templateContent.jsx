import React, { useMemo } from "react";

const TemplateContentRenderer = ({
  templateContent = "",
  dynamicContent = "",
  className = "",
}) => {
  // Process the template content and replace [DYNAMIC_CONTENT] placeholder
  const processedContent = useMemo(() => {
    if (!templateContent) return "";

    // Replace the [DYNAMIC_CONTENT] placeholder with actual dynamic content
    let processed = templateContent.replace(
      /\[DYNAMIC_CONTENT\]/g,
      ""
    );

    return processed;
  }, [templateContent, dynamicContent]);

  // Clean HTML content for safe rendering
  const createMarkup = () => {
    return { __html: processedContent };
  };

  if (!templateContent) {
    return (
      <div
        className={`p-4 text-center text-gray-500 text-sm border border-gray-200 rounded ${className}`}
      >
        <p>Select a template to see preview content</p>
      </div>
    );
  }

  return (
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
  );
};

export default TemplateContentRenderer;
