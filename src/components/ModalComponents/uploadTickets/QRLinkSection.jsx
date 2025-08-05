import React, { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";

const QRLinksSection = React.forwardRef(
  (
    {
      maxQuantity = 0,
      initialData = null,
      onChange,
      existingUploadTickets = [], // New prop to pass existing upload tickets data
    },
    ref
  ) => {
    // State to track copied items
    const [copiedItems, setCopiedItems] = useState({});

    // Helper function to extract QR links from existing upload tickets
    const extractQRLinksFromUploadTickets = useCallback(() => {
      if (!existingUploadTickets || existingUploadTickets.length === 0) {
        return Array.from({ length: maxQuantity }, () => ({
          qr_link_android: "",
          qr_link_ios: "",
          isExisting: false,
        }));
      }

      const extractedLinks = [];

      // Process existing upload tickets
      existingUploadTickets.forEach((ticket, index) => {
        if (ticket.qr_links) {
          const androidLinks = ticket.qr_links.android || [];
          const iosLinks = ticket.qr_links.ios || [];

          // Create entries for each QR link pair
          const maxLinks = Math.max(androidLinks.length, iosLinks.length);
          for (let i = 0; i < maxLinks; i++) {
            extractedLinks.push({
              qr_link_android: androidLinks[i] || "",
              qr_link_ios: iosLinks[i] || "",
              isExisting: true, // Mark as existing/prefilled
            });
          }
        }
      });

      // Fill remaining slots with empty entries if needed
      while (extractedLinks.length < maxQuantity) {
        extractedLinks.push({
          qr_link_android: "",
          qr_link_ios: "",
          isExisting: false,
        });
      }

      // Limit to maxQuantity
      return extractedLinks.slice(0, maxQuantity);
    }, [existingUploadTickets, maxQuantity]);

    // Internal state for QR links
    const [ticketLinks, setTicketLinks] = useState(() => {
      if (initialData && Array.isArray(initialData)) {
        return initialData.map((link) => ({
          ...link,
          isExisting: link.isExisting || false,
        }));
      }
      return extractQRLinksFromUploadTickets();
    });

    // Use ref to store the latest data for instant access
    const ticketLinksRef = useRef(ticketLinks);

    // Update ref whenever state changes
    useEffect(() => {
      ticketLinksRef.current = ticketLinks;
    }, [ticketLinks]);

    // Update links when existingUploadTickets changes
    useEffect(() => {
      if (existingUploadTickets && existingUploadTickets.length > 0) {
        const extractedLinks = extractQRLinksFromUploadTickets();
        setTicketLinks(extractedLinks);
        ticketLinksRef.current = extractedLinks;
      }
    }, [existingUploadTickets, extractQRLinksFromUploadTickets]);

    // Update array size when maxQuantity changes
    useEffect(() => {
      if (maxQuantity !== ticketLinks.length) {
        setTicketLinks((prevLinks) => {
          if (maxQuantity > prevLinks.length) {
            // Add new empty links
            const newLinks = [...prevLinks];
            for (let i = prevLinks.length; i < maxQuantity; i++) {
              newLinks.push({
                qr_link_android: "",
                qr_link_ios: "",
                isExisting: false,
              });
            }
            ticketLinksRef.current = newLinks;
            return newLinks;
          } else if (maxQuantity < prevLinks.length) {
            // Remove excess links
            const newLinks = prevLinks.slice(0, maxQuantity);
            ticketLinksRef.current = newLinks;
            return newLinks;
          }
          return prevLinks;
        });
      }
    }, [maxQuantity, ticketLinks.length]);

    // Handle link input changes (only for non-existing links)
    const handleLinkChange = useCallback(
      (ticketIndex, linkType, value) => {
        const currentLink = ticketLinks[ticketIndex];
        if (currentLink?.isExisting) {
          return; // Don't allow changes to existing links
        }

        setTicketLinks((prev) => {
          // Create a shallow copy of the array
          const newTicketLinks = [...prev];
          // Only update the specific ticket object that changed
          newTicketLinks[ticketIndex] = {
            ...newTicketLinks[ticketIndex],
            [linkType]: value,
          };

          // Update ref immediately for instant access
          ticketLinksRef.current = newTicketLinks;

          // Only call onChange if it's provided (backward compatibility)
          if (onChange && typeof onChange === "function") {
            onChange(newTicketLinks);
          }

          return newTicketLinks;
        });
      },
      [onChange, ticketLinks]
    );

    // Handle copy to clipboard
    const handleCopyToClipboard = useCallback(
      async (text, ticketIndex, linkType) => {
        try {
          await navigator.clipboard.writeText(text);
          const key = `${ticketIndex}-${linkType}`;
          setCopiedItems((prev) => ({ ...prev, [key]: true }));

          // Reset copied state after 2 seconds
          setTimeout(() => {
            setCopiedItems((prev) => {
              const newState = { ...prev };
              delete newState[key];
              return newState;
            });
          }, 2000);
        } catch (err) {
          console.error("Failed to copy text: ", err);
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
            const key = `${ticketIndex}-${linkType}`;
            setCopiedItems((prev) => ({ ...prev, [key]: true }));
            setTimeout(() => {
              setCopiedItems((prev) => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
              });
            }, 2000);
          } catch (fallbackErr) {
            console.error("Fallback copy failed: ", fallbackErr);
          }
          document.body.removeChild(textArea);
        }
      },
      []
    );

    // Update internal state when initialData changes
    useEffect(() => {
      if (initialData && Array.isArray(initialData)) {
        const newData = initialData.map((link) => ({
          qr_link_android: link?.qr_link_android || "",
          qr_link_ios: link?.qr_link_ios || "",
          isExisting: link?.isExisting || false,
        }));
        setTicketLinks(newData);
        ticketLinksRef.current = newData;
      }
    }, [initialData]);

    // Method to get current data (primary method for ref access)
    const getCurrentData = useCallback(() => {
      return ticketLinksRef.current;
    }, []);

    // Method to check if any links have values
    const hasData = useCallback(() => {
      const data = ticketLinksRef.current;
      return data.some((link) => link.qr_link_android || link.qr_link_ios);
    }, []);

    // Method to get count of completed tickets (both Android and iOS links filled)
    const getCompletedCount = useCallback(() => {
      const data = ticketLinksRef.current;
      return data.filter((link) => link.qr_link_android && link.qr_link_ios)
        .length;
    }, []);

    // Method to validate required fields
    const isValid = useCallback(() => {
      const data = ticketLinksRef.current;
      // Check if all tickets have both Android and iOS links
      return data.every((link) => link.qr_link_android && link.qr_link_ios);
    }, []);

    // Method to check if specific ticket is complete
    const isTicketComplete = useCallback((index) => {
      const data = ticketLinksRef.current;
      if (index >= 0 && index < data.length) {
        const link = data[index];
        return !!(link.qr_link_android && link.qr_link_ios);
      }
      return false;
    }, []);

    // Expose methods via ref for parent component access
    React.useImperativeHandle(
      ref,
      () => ({
        // Primary method to get current data
        getCurrentData,

        // Alternative method names for flexibility
        getQRLinks: () => ticketLinksRef.current,
        getData: () => ticketLinksRef.current,
        getTicketLinks: () => ticketLinksRef.current,

        // Utility methods
        hasData,
        isValid,
        getCompletedCount,
        isTicketComplete,

        // Method to get completion status (similar to your existing logic)
        getCompletionStatus: () => ({
          completed: getCompletedCount(),
          total: maxQuantity,
        }),

        // Method to programmatically update data from parent if needed
        updateData: (newData) => {
          if (Array.isArray(newData)) {
            const updatedData = newData.map((link) => ({
              qr_link_android: link?.qr_link_android || "",
              qr_link_ios: link?.qr_link_ios || "",
              isExisting: link?.isExisting || false,
            }));
            setTicketLinks(updatedData);
            ticketLinksRef.current = updatedData;
          }
        },

        // Method to update specific ticket (only if not existing)
        updateTicket: (index, linkType, value) => {
          if (
            index >= 0 &&
            index < maxQuantity &&
            !ticketLinks[index]?.isExisting
          ) {
            handleLinkChange(index, linkType, value);
          }
        },

        // Method to reset to initial state
        reset: () => {
          const resetData =
            initialData && Array.isArray(initialData)
              ? initialData.map((link) => ({
                  qr_link_android: link?.qr_link_android || "",
                  qr_link_ios: link?.qr_link_ios || "",
                  isExisting: link?.isExisting || false,
                }))
              : extractQRLinksFromUploadTickets();
          setTicketLinks(resetData);
          ticketLinksRef.current = resetData;
        },

        // Method to clear all data (only non-existing ones)
        clear: () => {
          const clearedData = ticketLinks.map((link) => ({
            ...link,
            qr_link_android: link.isExisting ? link.qr_link_android : "",
            qr_link_ios: link.isExisting ? link.qr_link_ios : "",
          }));
          setTicketLinks(clearedData);
          ticketLinksRef.current = clearedData;
        },
      }),
      [
        getCurrentData,
        hasData,
        isValid,
        getCompletedCount,
        isTicketComplete,
        maxQuantity,
        initialData,
        handleLinkChange,
        ticketLinks,
        extractQRLinksFromUploadTickets,
      ]
    );

    const completedCount = ticketLinks.filter(
      (link) => link.qr_link_android && link.qr_link_ios
    ).length;

    // Render input field or read-only field with copy button
    const renderLinkField = (ticketIndex, linkType, label, placeholder) => {
      const link = ticketLinks[ticketIndex];
      if (!link) return null;

      const value = link[linkType] || "";
      const isExisting = link.isExisting && value;
      const key = `${ticketIndex}-${linkType}`;
      const isCopied = copiedItems[key];

      if (isExisting) {
        // Read-only field with copy button for existing data
        return (
          <div>
            <label className="block text-xs font-medium text-[#323A70] mb-1">
              {label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={value}
                readOnly
                className="w-full px-3 py-2 pr-10 text-xs border border-[#E0E1EA] rounded-md bg-gray-50 text-[#323A70] cursor-default"
                title="This link is already configured and cannot be edited"
              />
              <button
                type="button"
                onClick={() =>
                  handleCopyToClipboard(value, ticketIndex, linkType)
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-[#0137D5] transition-colors"
                title={isCopied ? "Copied!" : "Copy to clipboard"}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        );
      }

      // Editable field for new data
      return (
        <div>
          <label className="block text-xs font-medium text-[#323A70] mb-1">
            {label}
          </label>
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) =>
              handleLinkChange(ticketIndex, linkType, e.target.value)
            }
            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
          />
        </div>
      );
    };

    return (
      <div className="border-[1px] border-[#E0E1EA] rounded-md mt-4 flex-1">
        <div className="bg-[#F9F9FB] px-3 py-2 border-b border-[#E0E1EA]">
          <h4 className="text-sm font-medium text-[#323A70]">
            QR Code Links Configuration ({completedCount}/{maxQuantity})
          </h4>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto">
          {maxQuantity === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm border border-gray-200 rounded">
              No quantity specified
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: maxQuantity }, (_, index) => {
                const ticketNumber = index + 1;
                const link = ticketLinks[index];
                const isComplete = link?.qr_link_android && link?.qr_link_ios;
                const hasExistingData =
                  link?.isExisting &&
                  (link?.qr_link_android || link?.qr_link_ios);

                return (
                  <div
                    key={`ticket-${ticketNumber}`}
                    className={`border border-[#E0E1EA] rounded-md p-3 ${
                      hasExistingData ? "bg-green-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-[#323A70]">
                        Ticket {ticketNumber}
                      </h5>
                      <div className="flex items-center gap-1">
                        {isComplete && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Android Link Input */}
                      {renderLinkField(
                        index,
                        "qr_link_android",
                        "Android QR Link",
                        "Enter Android app/web link"
                      )}

                      {/* iOS Link Input */}
                      {renderLinkField(
                        index,
                        "qr_link_ios",
                        "iOS QR Link",
                        "Enter iOS app/web link"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

QRLinksSection.displayName = "QRLinksSection";

export default QRLinksSection;
