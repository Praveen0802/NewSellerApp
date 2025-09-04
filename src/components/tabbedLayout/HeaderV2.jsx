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
  // Global currency dropdown props (optional)
  showGlobalCurrency = false,
  currencyOptions = [],
  selectedCurrency = "",
  onCurrencyChange = () => {},
}) => {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex items-center justify-between px-6 py-2">
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
          
          {showGlobalCurrency && (
            <div className="flex items-center gap-2">
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={onAddInventory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#343432] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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

      {/* Mobile Layout (below md) */}
      <div className="md:hidden">
        {/* First Row - Add Inventory Button and Toggle */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <button
            onClick={onAddInventory}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#343432] border border-transparent rounded-md hover:bg-blue-700 focus:outline-none flex-1 mr-2 justify-center"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="truncate">{addInventoryText}</span>
          </button>

          {/* Toggle List Items Chevron */}
          <button
            onClick={onToggleListItems}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none flex-shrink-0"
          >
            <ChevronDownIcon
              className={`w-5 h-5 text-black transition-transform ${
                showListItems ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Second Row - Filter and Columns Controls */}
        <div className="max-md:hidden flex items-center px-4 py-2 gap-2">
          {/* Filter Dropdown */}
          {showFilters && (
            <div className="relative flex-1" ref={filterDropdownRef}>
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowColumnDropdown(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none rounded border border-gray-200"
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
            <div className="relative flex-1" ref={columnDropdownRef}>
              <button
                onClick={() => {
                  setShowColumnDropdown(!showColumnDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none rounded border border-gray-200"
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
      </div>
    </div>
  );
};

export default HeaderV2;