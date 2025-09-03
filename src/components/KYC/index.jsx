import {
  getAuthAddress,
  getAuthPhotoId,
  getSellerBusinessDocuments,
  getSellerContract,
} from "@/utils/apiHandler/request";
import KycComponent from "./KycComponent";
import { useState } from "react";

const KYC = (props) => {
  const { photoId, address, contract, business_document } = props ?? {};

  const [uploading, setUploading] = useState({});

  const [docsData, setDocsData] = useState({
    photoId: photoId || {},
    address: address || {},
    contract: contract || {},
    business_document: business_document || {},
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
      business_document: {
        apiCall: getSellerBusinessDocuments,
        key: "business_document",
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
    <div className="h-full bg-gray-50">
      <KycComponent
        photoId={docsData.photoId}
        address={docsData.address}
        contract={docsData.contract}
        business_document={docsData.business_document}
        onUploadSuccess={handleUploadSuccess}
        uploading={uploading}
        setUploading={setUploading}
        isBusiness={props.isBusiness}
      />
    </div>
  );
};

export default KYC;
