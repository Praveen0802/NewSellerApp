import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
} from "lucide-react";

// Shimmer loading component for table cells
const ShimmerCell = ({ width = "100%" }) => (
  <div
    className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded h-6"
    style={{ width }}
  ></div>
);

// No Records Found component
const NoRecordsFound = () => (
  <tr className="border-b border-gray-200 bg-white">
    <td colSpan="100%" className="py-12 text-center text-gray-500 font-medium">
      No records found
    </td>
  </tr>
);

// Custom Checkbox Component
const CustomCheckbox = ({
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
}) => {
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`
        w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all duration-200
        ${
          checked || indeterminate
            ? "bg-blue-600 border-blue-600"
            : "bg-white border-gray-300 hover:border-gray-400"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {indeterminate && !checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </label>
  );
};

// Editable Cell Component
const EditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur without confirmation
    handleSave();
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Only call select() for input elements, not select elements
      if (inputRef.current.select && type !== "select") {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  if (isEditing) {
    return (
      <div className="w-full">
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white w-full"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 w-full bg-white"
          />
        )}
      </div>
    );
  }

  // Show as form control when row is hovered, otherwise show as text
  if (isRowHovered) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => setIsEditing(true)}
      >
        {type === "select" ? (
          <select
            value={value}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer"
            onClick={() => setIsEditing(true)}
            readOnly
          >
            <option>{value}</option>
          </select>
        ) : (
          <input
            type={type}
            value={value}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer"
            onClick={() => setIsEditing(true)}
            readOnly
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-xs">{value}</span>
    </div>
  );
};

// Accordion Item Component
const AccordionItem = ({
  item,
  isOpen,
  onToggle,
  headers,
  rightStickyColumns = [],
  rightStickyHeaders = [],
  loading = false,
  onCellEdit = () => {},
  selectedRows = [],
  onRowSelect = () => {},
  onSelectAll = () => {},
}) => {
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  const [hasScrolled, setHasScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // Track hover state for rows with debouncing
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Calculate sticky columns width
  const maxStickyColumnsLength =
    rightStickyColumns.length > 0
      ? Math.max(
          ...rightStickyColumns.map((cols) =>
            Array.isArray(cols) ? cols.length : 0
          ),
          0
        )
      : 0;
  const stickyColumnsWidth = maxStickyColumnsLength * 50;

  // Split headers into regular and sticky columns
  const regularHeaders = headers.filter(
    (header) => !["actions"].includes(header.key)
  );

  // Generate shimmer loading rows
  const renderShimmerRows = (count = 5) => {
    return Array(count)
      .fill(0)
      .map((_, rowIndex) => ({
        id: `shimmer-${rowIndex}`,
        isShimmer: true,
      }));
  };

  const isDataEmpty = !loading && (!item.data || item.data.length === 0);
  const displayData = loading
    ? renderShimmerRows()
    : isDataEmpty
    ? [{ isEmpty: true }]
    : item.data;

  // Calculate checkbox states for this item
  const itemRowIds = displayData
    .filter((row) => !row.isShimmer && !row.isEmpty)
    .map((row) => `${item.id}-${row.id}`);
  const selectedItemRows = selectedRows.filter((id) =>
    id.startsWith(`${item.id}-`)
  );
  const isAllSelected =
    itemRowIds.length > 0 && selectedItemRows.length === itemRowIds.length;
  const isIndeterminate =
    selectedItemRows.length > 0 && selectedItemRows.length < itemRowIds.length;

  // Debounced hover handlers to prevent flickering
  const handleMouseEnter = (rowIndex) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRowIndex(rowIndex);
    }, 50); // Small delay to prevent flickering
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRowIndex(null);
    }, 100); // Slightly longer delay when leaving
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Check horizontal scrollability
  const checkHorizontalScrollability = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    setHasScrolled(scrollLeft > 0);
  };

  // Synchronize row heights
  useEffect(() => {
    if (!isOpen) return;

    const syncRowHeights = () => {
      if (!mainTableRef.current || !stickyTableRef.current) return;

      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      if (mainRows.length !== stickyRows.length) return;

      mainRows.forEach((row) => (row.style.height = "auto"));
      stickyRows.forEach((row) => (row.style.height = "auto"));

      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      if (mainHeaderRow && stickyHeaderRow) {
        const headerHeight = mainHeaderRow.offsetHeight;
        stickyHeaderRow.style.height = `${headerHeight}px`;
      }

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

    const timer = setTimeout(syncRowHeights, 0);
    return () => clearTimeout(timer);
  }, [displayData, rightStickyColumns, loading, isOpen]);

  // Scroll event listeners
  useEffect(() => {
    if (!isOpen || !scrollContainerRef.current) return;

    checkHorizontalScrollability();
    scrollContainerRef.current.addEventListener(
      "scroll",
      checkHorizontalScrollability
    );

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener(
          "scroll",
          checkHorizontalScrollability
        );
      }
    };
  }, [isOpen]);

  const scrollLeft = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && canScrollRight) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleSelectAllForItem = (e) => {
    e.stopPropagation();
    onSelectAll(item.id, !isAllSelected);
  };

  const handleRowSelect = (rowId, e) => {
    e.stopPropagation();
    onRowSelect(`${item.id}-${rowId}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      {/* Accordion Header */}
      <div
        className="bg-[#343432] text-white px-3 py-2.5 cursor-pointer hover:bg-[#2a2a28] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <h3 className="font-medium text-sm truncate max-w-xs">
                {item.title}
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <Calendar size={11} />
                <span className="truncate">{item.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={11} />
                <span className="truncate">{item.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={11} />
                <span className="truncate max-w-xs">{item.venue}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs">
              <Users size={11} />
              <span>{item.available}</span>
              <Users size={11} className="text-green-400" />
              <span className="text-green-400">{item.sold}</span>
              <Eye size={11} />
              <span>{item.views}</span>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-medium">
              Market Insights
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div ref={containerRef} className="w-full relative bg-white">
          {/* Main scrollable table container */}
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto"
            style={{ paddingRight: `${stickyColumnsWidth}px` }}
          >
            <table
              ref={mainTableRef}
              className="w-full border-none"
              style={{ minWidth: "1200px" }} // Increased min-width to force horizontal scroll
            >
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* Checkbox column header */}
                  <th className="px-2 py-2 text-left text-gray-600 font-medium whitespace-nowrap text-xs w-12">
                    <CustomCheckbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAllForItem}
                    />
                  </th>
                  {regularHeaders.map((header) => (
                    <th
                      key={header.key}
                      className="px-2 py-2 text-left text-gray-600 font-medium whitespace-nowrap text-xs min-w-[120px]" // Added min-width
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{header.label}</span>
                        {header.sortable && (
                          <ChevronDown
                            size={10}
                            className="ml-1 flex-shrink-0"
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData?.map((row, rowIndex) => {
                  if (row.isEmpty) {
                    return <NoRecordsFound key="no-records" />;
                  }

                  const rowId = `${item.id}-${row.id}`;
                  const isSelected = selectedRows.includes(rowId);

                  return (
                    <tr
                      key={
                        row.isShimmer
                          ? `shimmer-${rowIndex}`
                          : row.id || rowIndex
                      }
                      className={`border-b border-gray-200 transition-colors ${
                        isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                      }`}
                      onMouseEnter={() => handleMouseEnter(rowIndex)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Checkbox column */}
                      <td className="py-2 px-2 text-xs whitespace-nowrap w-12">
                        {row.isShimmer ? (
                          <ShimmerCell width="16px" />
                        ) : (
                          <CustomCheckbox
                            checked={isSelected}
                            onChange={(e) => handleRowSelect(row.id, e)}
                          />
                        )}
                      </td>
                      {regularHeaders?.map((header) => (
                        <td
                          key={`${rowIndex}-${header.key}`}
                          className="py-2 px-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis align-middle min-w-[120px]" // Added min-width
                        >
                          {row.isShimmer ? (
                            <ShimmerCell
                              width={`${Math.floor(
                                50 + Math.random() * 100
                              )}px`}
                            />
                          ) : header.editable ? (
                            <EditableCell
                              value={row[header.key]}
                              type={header.type || "text"}
                              options={header.options || []}
                              onSave={(value) =>
                                onCellEdit(rowIndex, header.key, value)
                              }
                              className={header.className || ""}
                              isRowHovered={hoveredRowIndex === rowIndex}
                            />
                          ) : (
                            <span className={header.className || ""}>
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

          {/* Sticky right columns */}
          {maxStickyColumnsLength > 0 && (
            <div
              className={`absolute top-0 right-0 h-full bg-white border-l border-gray-200 ${
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
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {rightStickyHeaders?.length > 0
                        ? rightStickyHeaders?.map((header, idx) => (
                            <th
                              key={`sticky-header-${idx}`}
                              className="py-2 px-1 text-left text-gray-600 text-xs border-r border-gray-200 font-medium whitespace-nowrap"
                            >
                              <span className="truncate">{header}</span>
                            </th>
                          ))
                        : null}
                      {maxStickyColumnsLength >
                        (rightStickyHeaders?.length || 0) && (
                        <th
                          colSpan={
                            maxStickyColumnsLength -
                            (rightStickyHeaders?.length || 0)
                          }
                          className="py-2 px-1"
                        >
                          <div className="flex justify-end items-center space-x-1">
                            <button
                              onClick={scrollLeft}
                              disabled={!canScrollLeft}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                canScrollLeft
                                  ? "text-gray-700 hover:bg-gray-100"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              onClick={scrollRight}
                              disabled={!canScrollRight}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                canScrollRight
                                  ? "text-gray-700 hover:bg-gray-100"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData?.map((row, rowIndex) => {
                      if (row.isEmpty) {
                        return (
                          <tr
                            key="no-records-sticky"
                            className="border-b border-gray-200 bg-white"
                          >
                            <td colSpan={maxStickyColumnsLength}></td>
                          </tr>
                        );
                      }

                      const rowStickyColumns = Array.isArray(
                        rightStickyColumns[rowIndex]
                      )
                        ? rightStickyColumns[rowIndex]
                        : [];

                      const rowId = `${item.id}-${row.id}`;
                      const isSelected = selectedRows.includes(rowId);

                      return (
                        <tr
                          key={
                            row.isShimmer
                              ? `shimmer-sticky-${rowIndex}`
                              : `sticky-${row.id || rowIndex}`
                          }
                          className={`border-b border-gray-200 transition-colors ${
                            isSelected
                              ? "bg-blue-50"
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onMouseEnter={() => handleMouseEnter(rowIndex)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {row.isShimmer ? (
                            Array(maxStickyColumnsLength)
                              .fill(0)
                              .map((_, colIndex) => (
                                <td
                                  key={`shimmer-${rowIndex}-${colIndex}`}
                                  className="py-2 text-sm align-middle text-center"
                                >
                                  <div className="flex justify-center">
                                    <ShimmerCell width="32px" />
                                  </div>
                                </td>
                              ))
                          ) : (
                            <>
                              {rowStickyColumns.map((column, colIndex) => (
                                <td
                                  key={`sticky-${rowIndex}-${colIndex}`}
                                  className="text-sm align-middle text-center py-2"
                                >
                                  <div className="flex justify-center">
                                    {column.icon && (
                                      <div className="cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors">
                                        {column.icon}
                                      </div>
                                    )}
                                    {column.button && (
                                      <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                                        {column.button}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              ))}
                              {Array.from({
                                length: Math.max(
                                  0,
                                  maxStickyColumnsLength -
                                    rowStickyColumns.length
                                ),
                              }).map((_, i) => (
                                <td
                                  key={`${rowIndex}-empty-${i}`}
                                  className="py-2 text-sm"
                                ></td>
                              ))}
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Accordion Component
const ScrollableAccordionTable = ({
  items = [],
  headers = [],
  rightStickyHeaders = [],
  loading = false,
  onCellEdit = () => {},
  selectedRows = [],
  onRowSelectionChange = () => {},
}) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (itemId) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRowSelect = (rowId) => {
    const newSelectedRows = selectedRows.includes(rowId)
      ? selectedRows.filter((id) => id !== rowId)
      : [...selectedRows, rowId];

    onRowSelectionChange(newSelectedRows);
  };

  const handleSelectAll = (itemId, selectAll) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || !item.data) return;

    const itemRowIds = item.data
      .filter((row) => !row.isShimmer && !row.isEmpty)
      .map((row) => `${itemId}-${row.id}`);

    let newSelectedRows;
    if (selectAll) {
      // Add all rows from this item that aren't already selected
      const newSelections = itemRowIds.filter(
        (id) => !selectedRows.includes(id)
      );
      newSelectedRows = [...selectedRows, ...newSelections];
    } else {
      // Remove all rows from this item
      newSelectedRows = selectedRows.filter(
        (id) => !id.startsWith(`${itemId}-`)
      );
    }

    onRowSelectionChange(newSelectedRows);
  };

  return (
    <div className="w-full">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
          headers={headers}
          rightStickyColumns={item.rightStickyColumns || []}
          rightStickyHeaders={rightStickyHeaders}
          loading={loading}
          onCellEdit={(rowIndex, columnKey, value) =>
            onCellEdit(item.id, rowIndex, columnKey, value)
          }
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
        />
      ))}
    </div>
  );
};

export default ScrollableAccordionTable;
