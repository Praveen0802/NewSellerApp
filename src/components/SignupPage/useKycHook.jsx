import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import {
  getZohoDocStatus,
  zohoEmbed,
  getZohoDocsDownload,
} from "@/utils/apiHandler/request";
import useS3Download from "@/Hooks/useS3Download";

const useKycHook = ({ currentUser } = {}) => {
  const [kycUrl, setKycUrl] = useState("");
  const [requestId, setRequestId] = useState("");
  const [kycLoader, setKycLoader] = useState(false);
  const [ownerLoader, setOwnerLoader] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false); // New state for download loader

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef(null);

  const [error, setError] = useState({
    zohoEmbed: null,
    zohoDocStatus: null,
    download: null, // New error state for download
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear polling interval on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Function to start polling for document status
  const startPolling = useCallback((requestId) => {
    if (!requestId || !isMountedRef.current) return;

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    console.log("Starting document status polling...");

    pollingIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        clearInterval(pollingIntervalRef.current);
        return;
      }

      try {
        console.log("Polling document status...");
        const payload = { id: requestId };
        const resp = await getZohoDocStatus(null, payload);
        const { request_status = null } = resp?.data ?? {};

        if (isMountedRef.current && request_status) {
          setKycStatus(request_status);
          console.log("Polled status:", request_status);

          // Stop polling if document is completed, rejected, or submitted
          if (
            ["completed", "rejected", "submitted"].includes(
              request_status?.toLowerCase()
            )
          ) {
            console.log("Document process finished, stopping polling");
            clearInterval(pollingIntervalRef.current);
            setIsPolling(false);

            // Show success/completion message
            if (request_status?.toLowerCase() === "completed") {
              if (typeof toast !== "undefined") {
                toast.success("KYC document completed successfully!");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during polling:", error);
        // Don't show toast for polling errors to avoid spam
        // Only log the error
      }
    }, 6000); // Poll every 6 seconds
  }, []);

  // Function to stop polling manually
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
      console.log("Polling stopped manually");
    }
  }, []);

  const getZohoDocs = useCallback(
    async (payload) => {
      if (!isMountedRef.current) return;

      setKycLoader(true);
      setError((prev) => ({ ...prev, zohoEmbed: null })); // Clear previous errors
      setHasInitialized(false); // Reset initialization state

      try {
        const resp = await zohoEmbed(null, payload);

        if (!isMountedRef.current) return resp;
        console.log("Document status:", resp);

        const { signing_url, request_id } = resp?.data ?? {};

        if (request_id) {
          setRequestId(request_id);
          // Start polling after successful zohoEmbed
          console.log(
            "zohoEmbed successful, starting polling for request_id:",
            request_id
          );
          startPolling(request_id);
        }
        if (signing_url) setKycUrl(signing_url);

        // Clear error on success and mark as initialized
        setError((prev) => ({ ...prev, zohoEmbed: null }));
        setHasInitialized(true);

        return resp;
      } catch (e) {
        if (isMountedRef.current) {
          setError((prev) => ({ ...prev, zohoEmbed: true }));
          setHasInitialized(true); // Mark as initialized even on error
          // Reset URL and requestId on error
          setKycUrl("");
          setRequestId("");
          toast.error("Error fetching Zoho docs");
          console.error("Error fetching Zoho docs:", e);
        }
        throw e; // Re-throw for potential handling by caller
      } finally {
        if (isMountedRef.current) {
          setKycLoader(false);
        }
      }
    },
    [startPolling]
  );

  const { isDownloading, downloadFile } = useS3Download();

  // New function to download completed KYC document
  const downloadKycDocument = useCallback(async () => {
    if (!requestId || !isMountedRef.current) return;

    // setDownloadLoader(true);
    setError((prev) => ({ ...prev, download: null }));

    try {
      const payload = { id: requestId };
      const resp = await getZohoDocsDownload(null, payload);
      const { file_url } = resp?.data ?? {};
      downloadFile(file_url);
      return true;
    } catch (e) {
      toast.error("Error downloading document. Please try again.");
    } finally {
    }
  }, [requestId]);

  const checkIsDocsSubmitted = useCallback(async (payload) => {
    if (!isMountedRef.current) return;

    setOwnerLoader(true);
    setError((prev) => ({ ...prev, zohoDocStatus: null })); // Clear previous errors

    try {
      const resp = await getZohoDocStatus(null, payload);
      const { request_status = null } = resp?.data?.requests ?? {};
      setKycStatus(request_status, resp);
      console.log("resp?.data?.requests", resp?.data?.requests);

      if (isMountedRef.current) {
        console.log("Document status:", resp);
      }

      // Clear error on success
      setError((prev) => ({ ...prev, zohoDocStatus: null }));

      return resp;
    } catch (e) {
      if (isMountedRef.current) {
        setError((prev) => ({ ...prev, zohoDocStatus: true }));
        if (typeof toast !== "undefined") {
          toast.error("Something went wrong. Please try again.");
        }
        console.error("Error checking document status:", e);
      }
      throw e;
    } finally {
      if (isMountedRef.current) {
        setOwnerLoader(false);
      }
    }
  }, []);

  // Memoize user data extraction
  const { email, first_name } = currentUser ?? {};

  // Effect for initial Zoho docs fetch
  useEffect(() => {
    if (!email || !first_name || !isMountedRef.current) return;

    const payload = {
      recipient_name: first_name,
      recipient_email: email,
      testing: true, // Optional: Set to true for testing purposes
    };

    getZohoDocs(payload);
  }, [email, first_name, getZohoDocs]);

  // Effect for checking document submission status (initial check only)
  useEffect(() => {
    if (!requestId || !isMountedRef.current) return;

    const payload = { id: requestId };
    checkIsDocsSubmitted(payload);
  }, [requestId, checkIsDocsSubmitted]);

  // Effect to handle status changes and stop polling when needed
  useEffect(() => {
    if (
      kycStatus &&
      ["completed", "rejected", "submitted"].includes(kycStatus.toLowerCase())
    ) {
      stopPolling();
    }
  }, [kycStatus, stopPolling]);

  return {
    kycUrl,
    kycLoader,
    ownerLoader,
    kycStatus,
    error,
    isPolling,
    hasInitialized,
    downloadLoader: isDownloading, // Export download loader state
    requestId, // Export requestId for component use
    // Expose methods for manual calls if needed
    getZohoDocs,
    checkIsDocsSubmitted,
    startPolling,
    stopPolling,
    downloadKycDocument, // Export new download function
  };
};

export default useKycHook;
