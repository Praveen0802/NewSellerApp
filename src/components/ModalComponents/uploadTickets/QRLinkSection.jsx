    import React, { useState, useCallback, useEffect, useRef } from "react";

    const QRLinksSection = React.forwardRef(({ 
    maxQuantity = 0,
    initialData = null, 
    onChange 
    }, ref) => {
    // Internal state for QR links
    const [ticketLinks, setTicketLinks] = useState(() => {
        if (initialData && Array.isArray(initialData)) {
        return initialData;
        }
        return Array.from({ length: maxQuantity }, () => ({
        qr_link_android: "",
        qr_link_ios: "",
        }));
    });

    // Use ref to store the latest data for instant access
    const ticketLinksRef = useRef(ticketLinks);

    // Update ref whenever state changes
    useEffect(() => {
        ticketLinksRef.current = ticketLinks;
    }, [ticketLinks]);

    // Update array size when maxQuantity changes
    useEffect(() => {
        if (maxQuantity !== ticketLinks.length) {
        setTicketLinks(prevLinks => {
            if (maxQuantity > prevLinks.length) {
            // Add new empty links
            const newLinks = [...prevLinks];
            for (let i = prevLinks.length; i < maxQuantity; i++) {
                newLinks.push({
                qr_link_android: "",
                qr_link_ios: "",
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

    // Handle link input changes
    const handleLinkChange = useCallback((ticketIndex, linkType, value) => {
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
        if (onChange && typeof onChange === 'function') {
            onChange(newTicketLinks);
        }
        
        return newTicketLinks;
        });
    }, [onChange]);

    // Update internal state when initialData changes
    useEffect(() => {
        if (initialData && Array.isArray(initialData)) {
        const newData = initialData.map(link => ({
            qr_link_android: link?.qr_link_android || "",
            qr_link_ios: link?.qr_link_ios || "",
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
        return data.some(link => link.qr_link_android || link.qr_link_ios);
    }, []);

    // Method to get count of completed tickets (both Android and iOS links filled)
    const getCompletedCount = useCallback(() => {
        const data = ticketLinksRef.current;
        return data.filter(link => link.qr_link_android && link.qr_link_ios).length;
    }, []);

    // Method to validate required fields
    const isValid = useCallback(() => {
        const data = ticketLinksRef.current;
        // Check if all tickets have both Android and iOS links
        return data.every(link => link.qr_link_android && link.qr_link_ios);
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
    React.useImperativeHandle(ref, () => ({
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
        total: maxQuantity
        }),
        
        // Method to programmatically update data from parent if needed
        updateData: (newData) => {
        if (Array.isArray(newData)) {
            const updatedData = newData.map(link => ({
            qr_link_android: link?.qr_link_android || "",
            qr_link_ios: link?.qr_link_ios || "",
            }));
            setTicketLinks(updatedData);
            ticketLinksRef.current = updatedData;
        }
        },
        
        // Method to update specific ticket
        updateTicket: (index, linkType, value) => {
        if (index >= 0 && index < maxQuantity) {
            handleLinkChange(index, linkType, value);
        }
        },
        
        // Method to reset to initial state
        reset: () => {
        const resetData = initialData && Array.isArray(initialData) 
            ? initialData.map(link => ({
                qr_link_android: link?.qr_link_android || "",
                qr_link_ios: link?.qr_link_ios || "",
            }))
            : Array.from({ length: maxQuantity }, () => ({
                qr_link_android: "",
                qr_link_ios: "",
            }));
        setTicketLinks(resetData);
        ticketLinksRef.current = resetData;
        },
        
        // Method to clear all data
        clear: () => {
        const emptyData = Array.from({ length: maxQuantity }, () => ({
            qr_link_android: "",
            qr_link_ios: "",
        }));
        setTicketLinks(emptyData);
        ticketLinksRef.current = emptyData;
        }
    }), [getCurrentData, hasData, isValid, getCompletedCount, isTicketComplete, maxQuantity, initialData, handleLinkChange]);

    const completedCount = ticketLinks.filter(
        (link) => link.qr_link_android && link.qr_link_ios
    ).length;

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
                const isComplete = ticketLinks[index]?.qr_link_android && ticketLinks[index]?.qr_link_ios;

                return (
                    <div
                    key={`ticket-${ticketNumber}`}
                    className="border border-[#E0E1EA] rounded-md p-3 bg-white"
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
                        <div>
                        <label className="block text-xs font-medium text-[#323A70] mb-1">
                            Android QR Link
                        </label>
                        <input
                            type="url"
                            placeholder="Enter Android app/web link"
                            value={ticketLinks[index]?.qr_link_android || ""}
                            onChange={(e) =>
                            handleLinkChange(
                                index,
                                "qr_link_android",
                                e.target.value
                            )
                            }
                            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                        />
                        </div>

                        {/* iOS Link Input */}
                        <div>
                        <label className="block text-xs font-medium text-[#323A70] mb-1">
                            iOS QR Link
                        </label>
                        <input
                            type="url"
                            placeholder="Enter iOS app/web link"
                            value={ticketLinks[index]?.qr_link_ios || ""}
                            onChange={(e) =>
                            handleLinkChange(
                                index,
                                "qr_link_ios",
                                e.target.value
                            )
                            }
                            className="w-full px-3 py-2 text-xs border border-[#E0E1EA] rounded-md bg-white text-[#323A70] focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:border-transparent"
                        />
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
    });

    QRLinksSection.displayName = 'QRLinksSection';

    export default QRLinksSection;