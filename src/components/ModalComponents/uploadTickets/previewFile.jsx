import { X } from "lucide-react";

const FilePreviewModal = ({ show, onClose, file }) => {
    if (!show || !file) return null;
  
    const getFilePreview = () => {
      // If it's an existing file with URL
      if (file.url) {
        const fileExtension = file.url.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          return (
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          );
        } else if (fileExtension === 'pdf') {
          return (
            <iframe 
              src={file.url}
              className="w-full h-full border-none"
              title={file.name}
            />
          );
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg mb-2">{file.name}</p>
              <p className="text-sm">Preview not available for this file type</p>
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Open File
              </a>
            </div>
          );
        }
      }
      
      // If it's a newly uploaded file (File object)
      if (file.file instanceof File) {
        const fileExtension = file.file.name.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          const imageUrl = URL.createObjectURL(file.file);
          return (
            <img 
              src={imageUrl} 
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onLoad={() => {
                // Clean up the object URL after image loads
                setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
              }}
            />
          );
        } else if (fileExtension === 'pdf') {
          const pdfUrl = URL.createObjectURL(file.file);
          return (
            <iframe 
              src={pdfUrl}
              className="w-full h-full border-none"
              title={file.name}
              onLoad={() => {
                // Clean up the object URL after PDF loads
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
              }}
            />
          );
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg mb-2">{file.name}</p>
              <p className="text-sm">Preview not available for this file type</p>
              <p className="text-xs text-gray-400 mt-2">
                Size: {(file.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          );
        }
      }
  
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-6xl mb-4">❓</div>
          <p className="text-lg">Unable to preview file</p>
        </div>
      );
    };
  
    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-[9999] flex items-center justify-center">
        <div className="bg-white rounded-lg w-[90vw] h-[90vh] max-w-4xl max-h-4xl flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">File Preview</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              {getFilePreview()}
              <div className="hidden text-center text-gray-500">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-lg mb-2">Failed to load image</p>
                <p className="text-sm">The image could not be displayed</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end items-center p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default FilePreviewModal;