import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useRef, useEffect } from "react";
import StatusBadge from "../reportsPage/components/statusbadge";
import TableShimmer from "./tableShimmer";

const CollapsablePaymentTable = ({
  sections,
  onRowClick,
  selectedTab,
  isLoading = false,
  tableType = "reports", // "reports" or "payout"
}) => {
  const [expandedSections, setExpandedSections] = useState([]);
  const [contentHeights, setContentHeights] = useState([]);
  const contentRefs = useRef([]);

  // Initialize refs array to match sections length
  useEffect(() => {
    if (sections) {
      // Ensure refs array matches sections length
      contentRefs.current = sections.map((_, index) => 
        contentRefs.current[index] || React.createRef()
      );
      
      // Initialize expanded sections if not already set
      if (expandedSections.length === 0) {
        setExpandedSections(sections.map((_, index) => index === 0));
      } else if (expandedSections.length < sections.length) {
        // Add new sections as expanded (you can change this behavior)
        setExpandedSections(prev => [
          ...prev,
          ...new Array(sections.length - prev.length).fill(true)
        ]);
      }
      
      // Initialize content heights array
      if (contentHeights.length < sections.length) {
        setContentHeights(prev => [
          ...prev,
          ...new Array(sections.length - prev.length).fill(0)
        ]);
      }
    }
  }, [sections?.length]);

  // Calculate heights for all sections including new ones
  useEffect(() => {
    if (!isLoading && sections && contentRefs.current.length > 0) {
      const timer = setTimeout(() => {
        const newHeights = [...contentHeights];
        let heightsUpdated = false;

        contentRefs.current.forEach((ref, index) => {
          if (ref?.current && index < sections.length) {
            const scrollHeight = ref.current.scrollHeight;
            if (newHeights[index] !== scrollHeight) {
              newHeights[index] = scrollHeight;
              heightsUpdated = true;
            }
          }
        });

        if (heightsUpdated) {
          setContentHeights(newHeights);
        }
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timer);
    }
  }, [sections, isLoading, expandedSections]);

  // Additional effect to recalculate heights when sections change significantly
  useEffect(() => {
    if (!isLoading && sections) {
      const timer = setTimeout(() => {
        setContentHeights(prev => {
          const newHeights = [...prev];
          
          contentRefs.current.forEach((ref, index) => {
            if (ref?.current && index < sections.length) {
              newHeights[index] = ref.current.scrollHeight;
            }
          });
          
          return newHeights;
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [sections, isLoading]);

  const toggleSection = (index) => {
    setExpandedSections(prev => {
      const newExpandedSections = [...prev];
      newExpandedSections[index] = !newExpandedSections[index];
      return newExpandedSections;
    });
  };

  // If loading is true, show shimmer effect
  if (isLoading) {
    return <TableShimmer rowCount={5} columnCount={6} />;
  }

  // If no sections are available
  if (!sections || sections.length === 0) {
    return (
      <div className="w-full flex justify-center items-center p-6 bg-white border border-[#E0E1EA] rounded-[6px]">
        <p className="text-[#7D82A4] text-sm">No data available</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-gray-600";
      case "failed":
      case "rejected":
        return "text-red-600";
      case "approved":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Function to determine the transaction type for onRowClick based on table type
  const getTransactionType = () => {
    if (tableType === "payout") {
      return "payout";
    }
    return selectedTab === "transaction" ? "transaction" : "wallet";
  };

  return (
    <div className="w-full flex flex-col gap-4 mobile:gap-2">
      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}-${section.title}`} className="mb-1 overflow-hidden">
          {/* Section Header */}
          <div
            className={`flex items-center justify-between ${
              !expandedSections[sectionIndex]
                ? "rounded-[6px]"
                : "rounded-t-[6px]"
            } bg-[#343432] text-white px-4 py-3 cursor-pointer mobile:px-3 mobile:py-2`}
            onClick={() => toggleSection(sectionIndex)}
          >
            <h3 className="text-[14px] font-semibold mobile:text-xs">
              {section.title}
            </h3>
            <svg
              className={`w-5 h-5 mobile:w-4 mobile:h-4 transition-transform duration-300 ${
                expandedSections[sectionIndex] ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>

          {/* Section Content with Animation */}
          <div
            ref={contentRefs.current[sectionIndex]}
            className="overflow-hidden transition-all duration-300 ease-in-out rounded-b-[6px] border-b border-[#E0E1EA]"
            style={{
              maxHeight: expandedSections[sectionIndex]
                ? `${contentHeights[sectionIndex] || 'auto'}px`
                : "0px",
              opacity: expandedSections[sectionIndex] ? 1 : 0,
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white mobile:text-xs">
                <thead>
                  <tr>
                    {section.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className={`${
                          idx === 0
                            ? "border-l border-[#E0E1EA]"
                            : idx === section.headers.length - 1
                            ? "border-r border-[#E0E1EA]"
                            : ""
                        } p-3 mobile:p-2 text-left text-[12px] mobile:text-[10px] text-[#7D82A4] font-normal border-b-[1px] border-[#E0E1EA]`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((row, rowIndex) => {
                    const isLastRow = rowIndex === section.data.length - 1;

                    return (
                      <tr key={`row-${sectionIndex}-${rowIndex}-${row.id || rowIndex}`} className="mobile:text-xs">
                        {Object.entries(row).map(([key, values], cellIndex) => {
                          if (key === "id") return null;

                          const statusKey = key === "status";
                          const eyeKey = key === "eye";
                          const isFirstCell = cellIndex === 0;
                          const isLastCell =
                            cellIndex ===
                            Object.keys(row).filter((k) => k !== "id").length -
                              1;

                          // Format payment method for transaction/wallet tabs only
                          let displayValue = values;
                          let icon = null;

                          // Only show credit/debit formatting for reports page (transaction/wallet tabs)
                          if (
                            key === "paymentMethod" &&
                            tableType === "reports"
                          ) {
                            if (values?.toLowerCase() === "credit") {
                              icon = (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 mr-1">
                                  <p className="text-green-600">+</p>
                                </span>
                              );
                              displayValue = "Credited";
                            } else if (values?.toLowerCase() === "debit") {
                              icon = (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 mr-1">
                                  <p className="text-red-600">-</p>
                                </span>
                              );
                              displayValue = "Debited";
                            }
                          }

                          return (
                            <td
                              onClick={() => {
                                eyeKey && onRowClick(row, getTransactionType());
                              }}
                              className={`py-3 pl-4 mobile:py-2 mobile:pl-2 ${
                                key === "eye" && "w-[56px] hover:bg-gray-100"
                              } text-left text-[12px] mobile:text-[10px] ${
                                isLastRow ? "border-b-0" : "border-b"
                              } border-[#E0E1EA] ${
                                eyeKey && "border-l-[1px] cursor-pointer"
                              } ${
                                // Different styling logic for reports vs payout
                                tableType === "reports" &&
                                key === "paymentMethod" &&
                                values === "credit"
                                  ? "text-green-500"
                                  : tableType === "reports" &&
                                    key === "paymentMethod" &&
                                    values === "debit"
                                  ? "text-red-500"
                                  : statusKey
                                  ? getStatusColor(values)
                                  : "text-[#343432]"
                              } ${
                                isFirstCell
                                  ? `border-l border-[#E0E1EA] ${
                                      isLastRow ? "rounded-bl-[6px]" : ""
                                    }`
                                  : isLastCell
                                  ? `border-r border-[#E0E1EA] ${
                                      isLastRow ? "rounded-br-[6px]" : ""
                                    }`
                                  : ""
                              }`}
                              key={`cell-${sectionIndex}-${rowIndex}-${cellIndex}`}
                            >
                              {key === "eye" && values ? (
                                <IconStore.eye className="stroke-black size-4 mobile:size-3" />
                              ) : statusKey ? (
                                <StatusBadge status={values} />
                              ) : key === "paymentMethod" &&
                                tableType === "reports" ? (
                                <div className="flex items-center">
                                  {icon}
                                  <span
                                    className={`font-medium ${
                                      values?.toLowerCase() === "credit"
                                        ? "text-green-600"
                                        : values?.toLowerCase() === "debit"
                                        ? "text-red-600"
                                        : ""
                                    }`}
                                  >
                                    {displayValue}
                                  </span>
                                </div>
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollapsablePaymentTable;