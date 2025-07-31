import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar1Icon,
  Clock,
  MapPin,
} from "lucide-react";
import oneHand from "../../../../public/onehand.svg";
import greenHand from "../../../../public/greenhand.svg";
import uploadListing from "../../../../public/uploadlisting.svg";
import { MultiSelectEditableCell, SimpleEditableCell } from "../selectCell";


const CustomInventoryTable = ({
  inventoryData,
  headers,
  selectedRows,
  setSelectedRows,
  handleCellEdit,
  handleHandAction,
  handleUploadAction,
  handleSelectAll,
  handleDeselectAll,
  matchDetails,
  isEditMode,
  editingRowIndex,
}) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hasScrolledLeft, setHasScrolledLeft] = useState(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Refs for sticky table functionality
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  const stickyColumnsWidth = 100; // 50px per column * 2 columns

  // Function to check scroll capabilities and update state
  const checkScrollCapabilities = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Can scroll left if we've scrolled right
    setCanScrollLeft(scrollLeft > 0);

    // Can scroll right if there's more content to the right
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding issues

    // Update hasScrolledLeft state
    setHasScrolledLeft(scrollLeft > 0);
    setHasScrolled(scrollLeft > 0);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current || !canScrollLeft) return;

    const container = scrollContainerRef.current;
    const scrollAmount = Math.min(300, container.clientWidth / 3);

    container.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current || !canScrollRight) return;

    const container = scrollContainerRef.current;
    const scrollAmount = Math.min(300, container.clientWidth / 3);

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScrollCapabilities();

    // Add scroll event listener
    const handleScroll = () => {
      checkScrollCapabilities();
    };

    container.addEventListener("scroll", handleScroll);

    // Check on resize as well
    const handleResize = () => {
      setTimeout(checkScrollCapabilities, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [inventoryData]);

  // Check scroll capabilities when table data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollCapabilities();
    }, 100);

    return () => clearTimeout(timer);
  }, [inventoryData, isTableCollapsed]);

  // Synchronize row heights between main and sticky tables
  useEffect(() => {
    const syncRowHeights = () => {
      if (!mainTableRef.current || !stickyTableRef.current) return;

      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      if (mainRows.length !== stickyRows.length) return;

      // Reset heights first
      mainRows.forEach((row) => (row.style.height = "auto"));
      stickyRows.forEach((row) => (row.style.height = "auto"));

      // Sync header heights
      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      if (mainHeaderRow && stickyHeaderRow) {
        const headerHeight = mainHeaderRow.offsetHeight;
        stickyHeaderRow.style.height = `${headerHeight}px`;
      }

      // Sync body row heights
      requestAnimationFrame(() => {
        mainRows.forEach((row, index) => {
          if (index < stickyRows.length) {
            const stickyRow = stickyRows[index];
            const mainRowHeight = row.offsetHeight;
            const stickyRowHeight = stickyRow.offsetHeight;
            const maxHeight = Math.max(mainRowHeight, stickyRowHeight);
            row.style.height = `${maxHeight}px`;
            stickyRow.style.height = `${maxHeight}px`;
          }
        });
      });
    };

    const timer = setTimeout(() => {
      syncRowHeights();
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      syncRowHeights();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", syncRowHeights);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener("resize", syncRowHeights);
    };
  }, [inventoryData]);

  // Render editable cell function
  const renderEditableCell = (
    row,
    header,
    rowIndex,
    isRowHovered,
    isDisabled = false
  ) => {
    // Check if this row is editable
    const isRowEditable =
      !isEditMode ||
      (Array.isArray(editingRowIndex)
        ? editingRowIndex.includes(rowIndex) // Bulk edit: editable if in editing selection
        : editingRowIndex === rowIndex); // Single edit: editable if it's the editing row

    const shouldShowAsEditable =
      isRowEditable &&
      (isRowHovered ||
        (isEditMode &&
          (Array.isArray(editingRowIndex)
            ? editingRowIndex.includes(rowIndex)
            : editingRowIndex === rowIndex)));

    // Get placeholder text based on header type and label
    const getPlaceholder = () => {
      if (header.type === "select" || header.type === "multiselect") {
        return "Select...";
      }
      if (header.type === "text") {
        if (
          header.label.toLowerCase().includes("price") ||
          header.label.toLowerCase().includes("value")
        ) {
          return "Enter amount";
        }
        if (header.label.toLowerCase().includes("seat")) {
          return "Enter seat";
        }
        if (header.label.toLowerCase().includes("row")) {
          return "Enter row";
        }
        return "Enter...";
      }
      if (header.type === "date") {
        return "Select date";
      }
      if (header.type === "checkbox") {
        return "No";
      }
      return "Enter...";
    };

    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={row[header.key]}
          options={header.options || []}
          onSave={(value) => handleCellEdit(rowIndex, header.key, value)}
          className={header.className || ""}
          isRowHovered={shouldShowAsEditable}
          disabled={!isRowEditable || isDisabled}
          placeholder="Select options..."
        />
      );
    }

    return (
      <SimpleEditableCell
        value={row[header.key]}
        type={header.type || "text"}
        options={header.options || []}
        onSave={(value) => handleCellEdit(rowIndex, header.key, value)}
        className={header.className || ""}
        isRowHovered={shouldShowAsEditable}
        disabled={!isRowEditable || isDisabled}
        placeholder={getPlaceholder()}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="border border-gray-200 rounded-lg overflow-hidden relative shadow-sm"
    >
      {/* Accordion Header */}
      <div
        className="bg-[#343432] cursor-pointer"
        onClick={() => setIsTableCollapsed(!isTableCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Radio button */}
            <div className="flex w-[50px] justify-center py-4 border-r-[1px] border-[#51428E] items-center">
              <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Match name with pipe separator */}
            <div className="flex items-center space-x-4 py-4 pr-4 border-r-[1px] border-[#51428E]">
              <h3 className="font-medium text-sm text-white">
                {matchDetails?.match_name || "Match Details"}
              </h3>
            </div>

            {/* Match details with pipe separators and more spacing */}
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                <Calendar1Icon size={14} className="text-white" />
                <span className="text-white">
                  {matchDetails?.match_date_format}
                </span>
              </div>

              <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                <Clock size={14} className="text-white" />
                <span className="text-white">{matchDetails?.match_time}</span>
              </div>

              <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                <MapPin size={14} className="text-white" />
                <span className="text-white max-w-xs truncate">
                  {matchDetails?.stadium_name}, {matchDetails?.country_name},{" "}
                  {matchDetails?.city_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pr-4">
            {/* Accordion Toggle */}
            <div className="bg-[#FFFFFF26] p-2 rounded-full cursor-pointer">
              <ChevronDown
                size={18}
                className={`text-white transition-transform duration-200 ${
                  isTableCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {!isTableCollapsed && (
        <div
          className="w-full bg-white relative"
          style={{ overflow: "visible" }}
        >
          {/* Sticky Left Column for Checkbox */}
          <div
            className={`absolute top-0 left-0 h-full bg-white border-r border-[#DADBE5] z-30 transition-shadow duration-200 ${
              hasScrolledLeft ? "shadow-md" : ""
            }`}
            style={{ width: `50px` }}
          >
            <div className="h-full">
              <table className="w-full h-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#DADBE5]">
                    <th className="px-3 py-3 text-center text-[#7D82A4] font-medium whitespace-nowrap text-xs border-r border-[#DADBE5]">
                      <div className="flex justify-center items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.length === inventoryData.length &&
                            inventoryData.length > 0
                          }
                          disabled={isEditMode}
                          onChange={
                            selectedRows.length > 0
                              ? handleDeselectAll
                              : handleSelectAll
                          }
                          className={`w-4 h-4 text-blue-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
                            isEditMode ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, rowIndex) => {
                    const isSelected = selectedRows.includes(rowIndex);
                    const isRowDisabled =
                      isEditMode &&
                      (Array.isArray(editingRowIndex)
                        ? !editingRowIndex.includes(rowIndex) // Bulk edit: disable if not in editing selection
                        : editingRowIndex !== rowIndex); // Single edit: disable if not the editing row

                    return (
                      <tr
                        key={`sticky-left-${row.id || rowIndex}`}
                        className={`border-b border-[#DADBE5] transition-colors ${
                          isSelected
                            ? "bg-[#EEF1FD]"
                            : "bg-white hover:bg-gray-50"
                        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                        onMouseEnter={() =>
                          !isRowDisabled && setHoveredRowIndex(rowIndex)
                        }
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        <td className="py-2 px-3 text-center whitespace-nowrap border-r border-[#DADBE5]">
                          <div className="flex justify-center items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isRowDisabled}
                              onChange={(e) => {
                                if (isRowDisabled) return;
                                e.stopPropagation();
                                const newSelectedRows = isSelected
                                  ? selectedRows.filter(
                                      (index) => index !== rowIndex
                                    )
                                  : [...selectedRows, rowIndex];
                                setSelectedRows(newSelectedRows);
                              }}
                              className={`w-4 h-4 text-blue-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
                                isRowDisabled
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Main scrollable table container */}
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto hideScrollbar"
            style={{
              paddingLeft: `50px`,
              paddingRight: `100px`,
            }}
          >
            <table
              ref={mainTableRef}
              className="w-full border-none"
              style={{ minWidth: "1200px" }}
            >
              <thead>
                <tr className="bg-gray-50 border-b border-[#DADBE5]">
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      className={`px-3 py-3 ${
                        header?.increasedWidth
                          ? header?.increasedWidth
                          : "min-w-[110px]"
                      } text-left text-[#7D82A4] font-medium whitespace-nowrap text-xs border-r border-[#DADBE5]`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate text-[#7D82A4]">
                          {header.label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((row, rowIndex) => {
                  const isSelected = selectedRows.includes(rowIndex);
                  const isRowDisabled =
                    isEditMode &&
                    (Array.isArray(editingRowIndex)
                      ? !editingRowIndex.includes(rowIndex) // Bulk edit: disable if not in editing selection
                      : editingRowIndex !== rowIndex); // Single edit: disable if not the editing row

                  return (
                    <tr
                      key={row.id || rowIndex}
                      className={`border-b border-[#DADBE5] transition-colors ${
                        isSelected
                          ? "bg-[#EEF1FD]"
                          : "bg-white hover:bg-gray-50"
                      } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                      onMouseEnter={() =>
                        !isRowDisabled && setHoveredRowIndex(rowIndex)
                      }
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      {headers.map((header) => (
                        <td
                          key={`${rowIndex}-${header.key}`}
                          className={`py-2 px-3 text-xs ${
                            header?.increasedWidth
                              ? header?.increasedWidth
                              : "min-w-[110px]"
                          } whitespace-nowrap overflow-hidden text-ellipsis align-middle border-r border-[#DADBE5] ${
                            isRowDisabled ? "bg-gray-50" : ""
                          } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                        >
                          {header.editable ? (
                            renderEditableCell(
                              row,
                              header,
                              rowIndex,
                              true,
                              isRowDisabled
                            )
                          ) : (
                            <span
                              className={`${header.className || ""} ${
                                isRowDisabled
                                  ? "text-gray-400"
                                  : "text-[#323A70]"
                              }`}
                            >
                              {row[header.key]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky Right Column for Action Icons */}
          <div
            className={`absolute top-0 right-0 h-full bg-white border-l border-[#DADBE5] z-20 transition-shadow duration-200 ${
              hasScrolled ? "shadow-md" : ""
            }`}
            style={{ width: `${stickyColumnsWidth}px` }}
          >
            <div className="h-full">
              <table
                ref={stickyTableRef}
                className="w-full h-full border-collapse"
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-[#DADBE5]">
                    {/* Hand icon column header */}
                    <th
                      className="py-2 px-2 text-left text-[#7D82A4] text-xs border-r border-[#DADBE5] font-medium whitespace-nowrap text-center"
                      style={{
                        width: "50px",
                        minWidth: "50px",
                        maxWidth: "50px",
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <span className="text-[#7D82A4] text-xs"></span>
                      </div>
                    </th>

                    {/* Upload icon column header with scroll navigation */}
                    <th
                      className="py-2 px-2 text-left text-[#7D82A4] text-xs font-medium whitespace-nowrap text-center relative"
                      style={{
                        width: "50px",
                        minWidth: "50px",
                        maxWidth: "50px",
                      }}
                    >
                      {/* Scroll Navigation Arrows in table header */}
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollLeft();
                          }}
                          disabled={!canScrollLeft}
                          className={`p-1 rounded transition-colors ${
                            canScrollLeft
                              ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="Scroll Left"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollRight();
                          }}
                          disabled={!canScrollRight}
                          className={`p-1 rounded transition-colors ${
                            canScrollRight
                              ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="Scroll Right"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, rowIndex) => {
                    const isRowDisabled =
                      isEditMode &&
                      (Array.isArray(editingRowIndex)
                        ? !editingRowIndex.includes(rowIndex) // Bulk edit: disable if not in editing selection
                        : editingRowIndex !== rowIndex); // Single edit: disable if not the editing row
                    const isSelected = selectedRows.includes(rowIndex);

                    return (
                      <tr
                        key={`sticky-${row.id || rowIndex}`}
                        className={`border-b border-[#DADBE5] transition-colors ${
                          isSelected
                            ? "bg-[#EEF1FD]"
                            : "bg-white hover:bg-gray-50"
                        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                      >
                        {/* Hand icon column */}
                        <td
                          className={`py-2 text-sm align-middle text-center border-r border-[#DADBE5] ${
                            isRowDisabled ? "pointer-events-none" : ""
                          } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                          style={{
                            width: "50px",
                            minWidth: "50px",
                            maxWidth: "50px",
                          }}
                        >
                          <div className="flex justify-center items-center">
                            <Image
                              src={row?.tickets_in_hand ? greenHand : oneHand}
                              alt="hand status"
                              width={16}
                              height={16}
                              className={`${
                                row?.tickets_in_hand
                                  ? "text-green-500"
                                  : "text-gray-400"
                              } cursor-pointer hover:opacity-75 transition-opacity`}
                              onClick={() => handleHandAction(row, rowIndex)}
                            />
                          </div>
                        </td>

                        {/* Upload icon column */}
                        <td
                          className={`py-2 text-sm align-middle text-center ${
                            isRowDisabled ? "pointer-events-none" : ""
                          } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                          style={{
                            width: "50px",
                            minWidth: "50px",
                            maxWidth: "50px",
                          }}
                        >
                          <div className="flex justify-center items-center h-full">
                            <Image
                              src={uploadListing}
                              alt="upload"
                              width={16}
                              height={16}
                              className="cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => handleUploadAction(row, rowIndex)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomInventoryTable;
