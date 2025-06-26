import React, { useState } from "react";
import { ChevronDown, FileText, Upload, Eye, Download } from "lucide-react";

const KYCPopup = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [documents, setDocuments] = useState({
    seller: { uploaded: false, file: null, preview: null },
    photoId: {
      uploaded: true,
      file: { name: "code_snippet.png" },
      preview: "/api/placeholder/300/200",
    },
    proofAddress: {
      uploaded: true,
      file: { name: "ticket_image.png" },
      preview: "/api/placeholder/200/250",
    },
  });

  const toggleDropdown = (docType) => {
    setDropdownOpen(dropdownOpen === docType ? null : docType);
  };

  const handleFileUpload = (docType, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments((prev) => ({
          ...prev,
          [docType]: {
            uploaded: true,
            file: { name: file.name },
            preview: e.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleView = (docType) => {
    console.log(`Viewing ${docType} document`);
    setDropdownOpen(null);
  };

  const handleDownload = (docType) => {
    console.log(`Downloading ${docType} document`);
    setDropdownOpen(null);
  };

  const DocumentCard = ({ title, docType, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {documents[docType].uploaded && (
          <div className="relative">
            <button
              onClick={() => toggleDropdown(docType)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>

            {dropdownOpen === docType && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={() => handleView(docType)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(docType)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-blue-600 mb-4">Pending</div>

      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600">You can see all Documents here</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Documents
            </button>
          </div>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sellers Contract */}
          <DocumentCard title="Sellers Contract" docType="seller">
            <div className="flex flex-col items-center">
              <>
                <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded cursor-pointer">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload("seller", e)}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </>
            </div>
          </DocumentCard>

          {/* Photo ID */}
          <DocumentCard title="Photo ID" docType="photoId">
            <div className="flex flex-col items-center">
              <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-600">Upload Photo ID</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload("photoId", e)}
                  accept="image/*"
                />
              </label>
            </div>
          </DocumentCard>

          {/* Proof of Address */}
          <DocumentCard title="Proof of address" docType="proofAddress">
            <div className="flex flex-col items-center">
              <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-600">Upload Proof of Address</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload("proofAddress", e)}
                  accept="image/*,.pdf"
                />
              </label>
            </div>
          </DocumentCard>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default KYCPopup;
