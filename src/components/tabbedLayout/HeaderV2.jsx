import React from "react";
import DropdownList from "./DropdownList";

// Simple chevron icons - filled with black
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

const PlusIcon = ({ className }) => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const HeaderV2 = ({
  showFilters,
  showFilterDropdown,
  setShowFilterDropdown,
  setShowColumnDropdown,
  showColumnDropdown,
  filterDropdownRef,
  columnDropdownRef,
  getAvailableFilters,
  handleFilterToggle,
  getAvailableColumns,
  handleColumnToggle,
  handleColumnsReorder, // New prop for column reordering
  handleFiltersReorder, // New prop for filter reordering
  hideVisibleColumns,
  onAddInventory,
  addInventoryText = "Add Inventory",
  showListItems = true,
  onToggleListItems,
  // New props for enhanced functionality
  isDraggableColumns = false,
  isDraggableFilters = false,
  showColumnSearch = false,
  showFilterSearch = false,
}) => {
  // Simple chevron icons - filled with black
  const ChevronDownIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );

  const PlusIcon = ({ className }) => (
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  return (
    <div className="flex items-center justify-between w-full px-6 py-2 bg-white border-b border-gray-200">
      {/* Left side controls - Filter, Columns, Bulk Actions */}
      <div className="flex items-center gap-3">
        {/* Filter Dropdown */}
        {showFilters && (
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowColumnDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-50 focus:outline-none"
            >
              Filter
              <ChevronDownIcon
                className={`w-4 h-4 text-black transition-transform ${
                  showFilterDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            <DropdownList
              isOpen={showFilterDropdown}
              title="Filters"
              items={getAvailableFilters()}
              onItemChange={handleFilterToggle}
              onItemsReorder={handleFiltersReorder}
              emptyMessage="No filters available"
              isDraggable={isDraggableFilters}
              showSearch={showFilterSearch}
            />
          </div>
        )}

        {/* Columns Dropdown */}
        {!hideVisibleColumns && (
          <div className="relative" ref={columnDropdownRef}>
            <button
              onClick={() => {
                setShowColumnDropdown(!showColumnDropdown);
                setShowFilterDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-50 focus:outline-none"
            >
              Columns
              <ChevronDownIcon
                className={`w-4 h-4 text-black transition-transform ${
                  showColumnDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            <DropdownList
              isOpen={showColumnDropdown}
              title="Columns"
              items={getAvailableColumns()}
              onItemChange={handleColumnToggle}
              onItemsReorder={handleColumnsReorder}
              emptyMessage="No columns available"
              isDraggable={isDraggableColumns}
              showSearch={showColumnSearch}
            />
          </div>
        )}
      </div>

      {/* Right side - Add Inventory Button and Toggle Icon */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAddInventory}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          {addInventoryText}
        </button>

        {/* Toggle List Items Chevron */}
        <button
          onClick={onToggleListItems}
          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none"
        >
          <ChevronDownIcon
            className={`w-5 h-5 text-black transition-transform ${
              showListItems ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default HeaderV2;
