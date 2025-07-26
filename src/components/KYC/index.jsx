import {
  getAuthAddress,
  getAuthPhotoId,
  getSellerContract,
} from "@/utils/apiHandler/request";
import KycComponent from "./KycComponent";
import { useState } from "react";

const KYC = (props) => {
  const { photoId, address, contract } = props ?? {};

  const [uploading, setUploading] = useState({});

  const [docsData, setDocsData] = useState({
    photoId: photoId || {},
    address: address || {},
    contract: contract || {},
  });

  const handleUploadSuccess = async (documentType, file) => {
    // Configuration mapping for document types
    const documentTypeConfig = {
      photoId: {
        apiCall: getAuthPhotoId,
        key: "photoId",
      },
      address: {
        apiCall: getAuthAddress,
        key: "address",
      },
      contract: {
        apiCall: getSellerContract,
        key: "contract",
      },
    };

    const config = documentTypeConfig[documentType];

    if (!config) {
      console.warn(`Unknown document type: ${documentType}`);
      return;
    }

    const { apiCall, key } = config;

    try {
      // Set loading state
      setUploading((prev) => ({ ...prev, [key]: true }));

      // Make API call
      const resp = await apiCall();

      // Update document data
      setDocsData((prev) => ({
        ...prev,
        [key]: { ...resp },
      }));
    } catch (error) {
      console.error(`Error fetching ${documentType} data:`, error);
      // Optional: Handle error state or show user feedback
    } finally {
      // Always clear loading state
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="h-fit bg-gray-50">
      <KycComponent
        photoId={docsData.photoId}
        address={docsData.address}
        contract={docsData.contract}
        onUploadSuccess={handleUploadSuccess}
        uploading={uploading}
        setUploading={setUploading}
      />
    </div>
  );
};

export default KYC;
