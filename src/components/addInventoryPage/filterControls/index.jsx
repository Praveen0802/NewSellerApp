import DropdownList from "@/components/tabbedLayout/DropdownList";
import React, { useRef, useState, useEffect } from "react";

// Simple Filter Icon
const FilterIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
    />
  </svg>
);

// Simple Columns Icon
const ColumnsIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002-2M9 7a2 2 0 012 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 002-2"
    />
  </svg>
);

const FilterColumnControls = ({
  // Filter props
  showFilters = true,
  availableFilters = [],
  onFilterToggle,
  onFiltersReorder,
  isDraggableFilters = false,
  showFilterSearch = false,
  
  // Column props
  showColumns = true,
  availableColumns = [],
  onColumnToggle,
  onColumnsReorder,
  isDraggableColumns = false,
  showColumnSearch = false,
  
  // Container props
  className = "absolute top-6 right-6 flex gap-2 z-50",
  
  // Additional customization
  hideVisibleColumns = false,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  
  const filterDropdownRef = useRef(null);
  const columnDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(event.target)
      ) {
        setShowColumnDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={className}>
      {/* Filter Dropdown */}
      {showFilters && (
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => {
              setShowFilterDropdown(!showFilterDropdown);
              setShowColumnDropdown(false);
            }}
            className="p-2 bg-white border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Filters"
          >
            <FilterIcon className="w-5 h-5 text-gray-600" />
          </button>

          <DropdownList
            isOpen={showFilterDropdown}
            title="Filters"
            items={availableFilters}
            onItemChange={onFilterToggle}
            onItemsReorder={onFiltersReorder}
            emptyMessage="No filters available"
            className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            isDraggable={isDraggableFilters}
            showSearch={showFilterSearch}
          />
        </div>
      )}

      {/* Columns Dropdown */}
      {showColumns && !hideVisibleColumns && (
        <div className="relative" ref={columnDropdownRef}>
          <button
            onClick={() => {
              setShowColumnDropdown(!showColumnDropdown);
              setShowFilterDropdown(false);
            }}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Columns"
          >
            <ColumnsIcon className="w-5 h-5 text-gray-600" />
          </button>

          <DropdownList
            isOpen={showColumnDropdown}
            title="Columns"
            items={availableColumns}
            onItemChange={onColumnToggle}
            onItemsReorder={onColumnsReorder}
            emptyMessage="No columns available"
            className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            isDraggable={isDraggableColumns}
            showSearch={showColumnSearch}
          />
        </div>
      )}
    </div>
  );
};

export default FilterColumnControls;