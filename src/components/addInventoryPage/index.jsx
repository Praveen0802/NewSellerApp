import React, { useState, useRef } from "react";
import Button from "../commonComponents/button";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import blueLocation from "../../../public/blue-location.svg";
import Image from "next/image";
import blueCalendar from "../../../public/blue-calendar.svg";
import blueTicket from "../../../public/blue-ticket.svg";
import hamburger from "../../../public/hamburger.svg";
import blueClock from "../../../public/blue-clock.svg";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import { dateFormat } from "@/utils/helperFunctions";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import UploadTickets from "../ModalComponents/uploadTickets";
import ScrollableAccordionTable from "../TicketsPage/scrollableTable";
import ViewMapPopup from "./ViewMapPopup";

// Filter Dropdown Component
const FilterDropdown = ({ isOpen, onClose, filterConfig, activeFilters, onFilterToggle }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Search filters</h3>
        </div>
        
        <div className="p-4">
          {filterConfig?.map((filter, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{filter.label}</span>
              <input
                type="checkbox"
                checked={activeFilters.includes(filter.name)}
                onChange={() => onFilterToggle(filter.name)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const allFilterNames = filterConfig?.map(filter => filter.name) || [];
              allFilterNames.forEach(filterName => {
                if (!activeFilters.includes(filterName)) {
                  onFilterToggle(filterName);
                }
              });
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Restore defaults
          </button>
        </div>
      </div>
    </>
  );
};

// Column Dropdown Component
const ColumnDropdown = ({ isOpen, onClose, headers, visibleColumns, onColumnToggle }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!isOpen) return null;

  const filteredHeaders = headers?.filter(header => 
    header.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Search columns</h3>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search columns"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          {filteredHeaders?.map((header, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{header.label}</span>
              <input
                type="checkbox"
                checked={visibleColumns.includes(header.key)}
                onChange={() => onColumnToggle(header.key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              headers?.forEach(header => {
                if (!visibleColumns.includes(header.key)) {
                  onColumnToggle(header.key);
                }
              });
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Restore defaults
          </button>
        </div>
      </div>
    </>
  );
};

const AddInventoryPage = () => {
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isStickyExpanded, setIsStickyExpanded] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  
  // Filter and column control states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  const [inventoryData, setInventoryData] = useState([
    {
      id: "initial-1",
      ticketType: "E-ticket",
      quantity: 5,
      splitType: "None",
      seatingArrangement: "No preference",
      maxDisplayedTickets: 5,
      fanArea: "Longside Lower Tier Central",
      category: "Premium",
      sectionBlock: "Block 1",
      row: "5",
      firstSeat: "3",
      faceValue: 90000.00,
      payoutPrice: 90000.00,
      benefits: "Premium view",
      restrictions: "No alcohol",
      dateToShip: "2024-11-20",
      ticketsInHand: "Yes",
      uploadTickets: "",
      deliveryMethod: "Email",
      saleDate: "2024-11-15",
      eventDate: "2024-11-23",
      status: "Active",
      commission: 10,
      notes: "Premium seats with excellent view",
    },
    {
      id: "initial-2",
      ticketType: "Physical",
      quantity: 3,
      splitType: "Split",
      seatingArrangement: "Together",
      maxDisplayedTickets: 3,
      fanArea: "Main Stand Upper",
      category: "Standard",
      sectionBlock: "Block 5",
      row: "12",
      firstSeat: "8",
      faceValue: 65000.00,
      payoutPrice: 65000.00,
      benefits: "Good view",
      restrictions: "None",
      dateToShip: "2024-11-19",
      ticketsInHand: "No",
      uploadTickets: "",
      deliveryMethod: "Collection",
      saleDate: "2024-11-14",
      eventDate: "2024-11-23",
      status: "Pending",
      commission: 8,
      notes: "Standard seating area",
    }
  ]);

  const selectedItem = [
    {
      matchName: "Manchester United FC vs AFC Bournemouth",
      mathDate: "Sun, 10 Nov 2024",
      matchTime: "16:30",
    },
  ];

  // All available headers
  const allHeaders = [
    {
      key: "ticketType",
      label: "Ticket Type",
      editable: true,
      type: "select",
      options: [
        { value: "E-ticket", label: "E-ticket" },
        { value: "Physical", label: "Physical" },
        { value: "Mobile", label: "Mobile" },
      ],
    },
    { key: "quantity", label: "Quantity", editable: true, type: "number" },
    {
      key: "splitType",
      label: "Split Type",
      editable: true,
      type: "select",
      options: [
        { value: "None", label: "None" },
        { value: "Split", label: "Split" },
        { value: "Bundle", label: "Bundle" },
      ],
    },
    {
      key: "seatingArrangement",
      label: "Seating Arrangement",
      editable: true,
      type: "select",
      options: [
        { value: "No preference", label: "No preference" },
        { value: "Together", label: "Together" },
        { value: "Apart", label: "Apart" },
      ],
    },
    { key: "maxDisplayedTickets", label: "Max Displayed Tickets", editable: true, type: "number" },
    { key: "fanArea", label: "Fan Area", editable: true },
    { key: "category", label: "Category", editable: true },
    { key: "sectionBlock", label: "Section/Block", editable: true },
    { key: "row", label: "Row", editable: true },
    { key: "firstSeat", label: "First Seat", editable: true },
    { key: "faceValue", label: "Face Value", editable: true, type: "number" },
    { key: "payoutPrice", label: "Payout Price", editable: true, type: "number" },
    { key: "benefits", label: "Benefits", editable: true },
    { key: "restrictions", label: "Restrictions", editable: true },
    { key: "dateToShip", label: "Date to Ship", editable: true, type: "date" },
    {
      key: "ticketsInHand",
      label: "Tickets In Hand",
      editable: true,
      type: "select",
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
    },
    { key: "uploadTickets", label: "Upload Tickets", editable: false },
  ];

  // Filter configuration
  const filterConfig = [
    {
      name: "selectedMatch",
      label: "Search Inventory",
      type: "text",
    },
    {
      name: "ticket_type",
      label: "Ticket Type",
      type: "select",
    },
    {
      name: "inventory_status",
      label: "Status",
      type: "select",
    },
    {
      name: "eventDate",
      label: "Event Date",
      type: "date",
    },
  ];

  // Helper functions for default states
  const getAllFilterNames = () => filterConfig.map(f => f.name);
  const getAllColumnKeys = () => allHeaders.map(h => h.key);

  // State for active filters and visible columns - all enabled by default
  const [activeFilters, setActiveFilters] = useState(getAllFilterNames());
  const [visibleColumns, setVisibleColumns] = useState(getAllColumnKeys());

  // Filter headers based on visible columns
  const headers = allHeaders.filter(header => visibleColumns.includes(header.key));

  // Get filtered filter config based on active filters
  const getActiveFilterConfig = () => {
    return filterConfig.filter(filter => activeFilters.includes(filter.name));
  };

  const renderListValue = (icon, text) => {
    return (
      <div className="flex gap-[8px] items-center">
        {icon}
        <p className="text-[12px] font-normal text-[#323A70] truncate">{text}</p>
      </div>
    );
  };

  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const openUploadPopup = () => {
    setShowUploadPopup(true);
  };

  // Handle filter toggle from dropdown
  const handleFilterToggle = (filterName) => {
    setActiveFilters(prev => {
      if (prev.includes(filterName)) {
        return prev.filter(f => f !== filterName);
      } else {
        return [...prev, filterName];
      }
    });
  };

  // Handle column toggle from dropdown
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(c => c !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  // Create right sticky columns for upload functionality
  const stickyColumns = inventoryData.map((_, index) => [
    {
      icon: <p className="text-xs font-medium">£{(inventoryData[index]?.faceValue || 0) / 100}</p>,
      className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
    },
    {
      icon: (
        <button
          onClick={() => openUploadPopup()}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded text-xs"
        >
          <IconStore.upload className="size-4" />
        </button>
      ),
      className: "cursor-pointer pr-2",
      key: "upload",
      tooltipComponent: <p className="text-center">Upload tickets</p>,
    },
  ]);

  // Single accordion item data wrapped in array for existing component
  const accordionItems = [{
    id: 1,
    title: "Manchester United FC vs AFC Bournemouth",
    date: "Sun, 10 Nov 2024",
    time: "16:30",
    venue: "Old Trafford, Manchester, United Kingdom",
    available: inventoryData.length.toString(),
    sold: "0",
    views: "45",
    data: inventoryData,
    rightStickyColumns: stickyColumns,
  }];

  const handleCellEdit = (itemIndex, rowIndex, columnKey, value) => {
    console.log("Cell edited:", { itemIndex, rowIndex, columnKey, value });
    setInventoryData(prevData => 
      prevData.map((item, index) => 
        index === rowIndex ? { ...item, [columnKey]: value } : item
      )
    );
  };

  const handleRowSelectionChange = (newSelectedRows) => {
    console.log("Row selection changed:", newSelectedRows);
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    const allRowIds = inventoryData.map((row) => `1-${row.id}`);
    setSelectedRows(allRowIds);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  const handleClone = () => {
    console.log("Cloning selected rows:", selectedRows);
    // Get selected row data and create clones
    const selectedRowsData = selectedRows.map(id => {
      const rowId = id.split('-')[1];
      return inventoryData.find(item => item.id === rowId);
    }).filter(Boolean);

    const clonedRows = selectedRowsData.map(row => ({
      ...row,
      id: `clone-${Date.now()}-${Math.random()}`,
    }));

    setInventoryData(prevData => [...prevData, ...clonedRows]);
    setSelectedRows([]);
  };

  const handleCloneToNew = () => {
    console.log("Cloning selected rows to new event:", selectedRows);
    // Implement clone to new event functionality
  };

  const handleEdit = () => {
    console.log("Editing selected rows:", selectedRows);
    // Implement bulk edit functionality
  };

  const handleDelete = () => {
    console.log("Deleting selected rows:", selectedRows);
    const rowIdsToDelete = selectedRows.map(id => id.split('-')[1]);
    setInventoryData(prevData => 
      prevData.filter(item => !rowIdsToDelete.includes(item.id))
    );
    setSelectedRows([]);
  };

  const handleSaveDraft = () => {
    console.log("Saving as draft:", selectedRows);
    // Implement save draft functionality
  };

  const handleAddToMyListings = () => {
    console.log("Adding to My Listings:", selectedRows);
    // Implement add to my listings functionality
  };

  const handlePublishLive = () => {
    console.log("Publishing live:", selectedRows);
    // Implement publish live functionality
  };

  // Add new listing function
  const handleAddListing = () => {
    const newListing = {
      id: `new-${Date.now()}`,
      ticketType: "E-ticket",
      quantity: 1,
      splitType: "None",
      seatingArrangement: "No preference",
      maxDisplayedTickets: 1,
      fanArea: "",
      category: "",
      sectionBlock: "",
      row: "",
      firstSeat: "",
      faceValue: 0,
      payoutPrice: 0,
      benefits: "",
      restrictions: "",
      dateToShip: "",
      ticketsInHand: "No",
      uploadTickets: "",
      deliveryMethod: "Email",
      saleDate: new Date().toISOString().split('T')[0],
      eventDate: "2024-11-23",
      status: "Active",
      commission: 0,
      notes: "",
    };

    setInventoryData(prevData => [...prevData, newListing]);
  };

  const selectedCount = selectedRows.length;

  return (
    <div className="bg-[#F5F7FA] w-full h-full relative">
      {/* Header with selected match info */}
      <ViewMapPopup onClose={() => setShowViewPopup(false)} show={showViewPopup}/>
      <div className="bg-white">
        <div className="border-b-[1px] p-4 border-[#E0E1EA] flex flex-col gap-2">
          <div className="w-full md:w-auto flex items-center justify-between">
            {renderListValue(
              <Image
                src={blueLocation}
                alt="location"
                width={14}
                height={14}
              />,
              "Old Trafford, Manchester, United Kingdom"
            )}
            <p onClick={() => setShowViewPopup(true)} className="text-[12px] font-semibold text-[#0137D5] cursor-pointer hover:underline">
              View Map
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {selectedItem.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 w-fit border-[1px] border-[#DADBE5] px-2 py-1 rounded-md"
              >
                <IconStore.close className="size-4 cursor-pointer" />
                <p className="text-[#323A70] text-[14px] font-medium">
                  {item.matchName}
                </p>
                {renderListValue(
                  <Image
                    src={blueCalendar}
                    alt="calendar"
                    width={14}
                    height={14}
                  />,
                  item.mathDate
                )}
                {renderListValue(
                  <Image
                    src={blueClock}
                    alt="clock"
                    width={14}
                    height={14}
                  />,
                  item.matchTime
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Section with Control Icons */}
        <div className="border-b-[1px] border-[#DADBE5] p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center w-[80%]">
              {getActiveFilterConfig().map((filter) => {
                switch (filter.name) {
                  case "selectedMatch":
                    return (
                      <FloatingLabelInput
                        key={filter.name}
                        id="selectedMatch"
                        name="selectedMatch"
                        keyValue={"selectedMatch"}
                        type="text"
                        label="Search Inventory"
                        className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
                        paddingClassName=""
                        autoComplete="off"
                      />
                    );
                  case "ticket_type":
                    return (
                      <FloatingSelect
                        key={filter.name}
                        label={"Ticket Type"}
                        options={[
                          { value: "e-ticket", label: "E-ticket" },
                          { value: "physical", label: "Physical" },
                          { value: "mobile", label: "Mobile" },
                        ]}
                        keyValue="ticket_type"
                        className=""
                        paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                      />
                    );
                  case "inventory_status":
                    return (
                      <FloatingSelect
                        key={filter.name}
                        label={"Status"}
                        keyValue="inventory_status"
                        className=""
                        paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                        options={[
                          { value: "active", label: "Active" },
                          { value: "pending", label: "Pending" },
                          { value: "sold", label: "Sold" },
                        ]}
                      />
                    );
                  case "eventDate":
                    return (
                      <FloatingDateRange
                        key={filter.name}
                        id="eventDate"
                        name="eventDate"
                        keyValue="eventDate"
                        parentClassName=""
                        label="Event Date"
                        subParentClassName=""
                        className="!py-[8px] !px-[16px] mobile:text-xs"
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>

            {/* Control Icons */}
            <div className="flex gap-2 ml-4 relative">
              {/* Filter Icon */}
              <button
                ref={filterButtonRef}
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowColumnDropdown(false);
                }}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Filter options"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                </svg>
              </button>
              
              {/* Column Icon */}
              <button
                ref={columnButtonRef}
                onClick={() => {
                  setShowColumnDropdown(!showColumnDropdown);
                  setShowFilterDropdown(false);
                }}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Column options"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="6" height="18"/>
                  <rect x="11" y="3" width="6" height="18"/>
                  <rect x="19" y="3" width="2" height="18"/>
                </svg>
              </button>
              
              {/* Filter Dropdown */}
              <FilterDropdown
                isOpen={showFilterDropdown}
                onClose={() => setShowFilterDropdown(false)}
                filterConfig={filterConfig}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
              />

              {/* Column Dropdown */}
              <ColumnDropdown
                isOpen={showColumnDropdown}
                onClose={() => setShowColumnDropdown(false)}
                headers={allHeaders}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
              />
            </div>
          </div>
        </div>

        {/* Add Listings Button */}
        <div className="flex justify-end px-4 py-2 border-b-[1px] border-[#E0E1EA]">
          <Button
            type="blueType"
            classNames={{
              root: "px-2 md:px-3 py-1.5 md:py-2",
              label_: "text-xs md:text-sm font-medium",
            }}
            onClick={handleAddListing}
            label="+ Add Listings"
          />
        </div>
      </div>

      {/* Inventory Count Section */}
      <div className="border-b-[1px] bg-white border-[#DADBE5] flex items-center">
        <p className="text-[14px] p-4 text-[#323A70] font-medium border-r-[1px] border-[#DADBE5] w-fit">
          {inventoryData.length} Inventory Items
        </p>
      </div>

      {/* Main Content Area with Single Accordion Table */}
      <div
        className="m-6 bg-white rounded max-h-[calc(100vh-400px)] overflow-auto"
        style={{
          marginBottom: "80px", // Add margin to ensure content is not hidden
        }}
      >
        <ScrollableAccordionTable
          items={accordionItems}
          headers={headers}
          rightStickyHeaders={["Price", "Upload"]}
          loading={false}
          onCellEdit={handleCellEdit}
          selectedRows={selectedRows}
          onRowSelectionChange={handleRowSelectionChange}
        />
      </div>

      <UploadTickets
        show={showUploadPopup}
        onClose={() => {
          setShowUploadPopup(false);
        }}
      />

      {/* Sticky Bottom Container - Always visible for testing */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedCount > 0}
                onChange={
                  selectedCount > 0 ? handleDeselectAll : handleSelectAll
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label 
                htmlFor="select-all"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Select all
              </label>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedCount}</span> selected
            </div>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 hover:bg-gray-100 rounded"
            >
              Deselect all
            </button>
            <button
              onClick={handleClone}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
            >
              <Copy size={16} />
              <span>Clone</span>
            </button>
            <button
              onClick={handleCloneToNew}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
            >
              <Copy size={16} />
              <span>Clone to new</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded border border-gray-300"
            >
              <span>Save draft</span>
            </button>
            <button
              onClick={handleAddToMyListings}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              <span>Add to My Listings</span>
            </button>
            <button
              onClick={handlePublishLive}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              <span>PUBLISH LIVE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryPage;