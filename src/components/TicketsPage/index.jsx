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
import beforeFaviurates from "../../../public/before-favourates.svg";
import attachmentPin from "../../../public/attachment-pin.svg";
import attachment6 from "../../../public/attachment-6.svg";
import attachment3 from "../../../public/attachment-3.svg";
import attachment1 from "../../../public/attachment-1.svg";
import crossHand from "../../../public/cross-hand.svg";
import oneHand from "../../../public/One-hand.svg";
import star from "../../../public/Star.svg";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import documentText from "../../../public/document-text.svg";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import ScrollableAccordionTable from "./scrollableTable";
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

// Filter Dropdown Component
const FilterDropdown = ({
  isOpen,
  onClose,
  filterConfig,
  activeFilters,
  onFilterToggle,
}) => {
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
              const allFilterNames =
                filterConfig?.map((filter) => filter.name) || [];
              allFilterNames.forEach((filterName) => {
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
const ColumnDropdown = ({
  isOpen,
  onClose,
  headers,
  visibleColumns,
  onColumnToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredHeaders = headers?.filter((header) =>
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
              headers?.forEach((header) => {
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

const TicketsPage = () => {
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isStickyExpanded, setIsStickyExpanded] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  // Filter and column control states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  // All available headers
  const allHeaders = [
    { key: "listingId", label: "Listing ID", sortable: true },
    {
      key: "ticketType",
      label: "Ticket Type",
      editable: true,
      type: "select",
      options: [
        { value: "External Transfer", label: "External Transfer" },
        { value: "Internal Transfer", label: "Internal Transfer" },
        { value: "Direct Sale", label: "Direct Sale" },
      ],
    },
    { key: "quantity", label: "Quantity", editable: true, type: "number" },
    { key: "sold", label: "Sold" },
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
    { key: "category", label: "Category", editable: true },
    { key: "section", label: "Section/Block", editable: true },
    { key: "row", label: "Row", editable: true },
    {
      key: "pricePerTicket",
      label: "Price per Ticket",
      editable: true,
      type: "number",
    },
    { key: "totalPrice", label: "Total Price", editable: true, type: "number" },
    {
      key: "deliveryMethod",
      label: "Delivery Method",
      editable: true,
      type: "select",
      options: [
        { value: "Email", label: "Email" },
        { value: "Mobile", label: "Mobile" },
        { value: "Postal", label: "Postal" },
        { value: "Collection", label: "Collection" },
      ],
    },
    { key: "saleDate", label: "Sale Date", editable: true, type: "date" },
    { key: "eventDate", label: "Event Date", editable: true, type: "date" },
    {
      key: "status",
      label: "Status",
      editable: true,
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Sold", label: "Sold" },
        { value: "Pending", label: "Pending" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "commission",
      label: "Commission (%)",
      editable: true,
      type: "number",
    },
    { key: "notes", label: "Notes", editable: true },
  ];

  // Filter configuration
  const filterConfig = [
    {
      name: "selectedMatch",
      label: "Search Match Event",
      type: "text",
    },
    {
      name: "ticket_status",
      label: "Ticket Status",
      type: "select",
    },
    {
      name: "booking_status",
      label: "Booking Status",
      type: "select",
    },
    {
      name: "eventDate",
      label: "Event Date",
      type: "date",
    },
  ];

  // Helper functions for default states
  const getAllFilterNames = () => filterConfig.map((f) => f.name);
  const getAllColumnKeys = () => allHeaders.map((h) => h.key);

  // State for active filters and visible columns - all enabled by default
  const [activeFilters, setActiveFilters] = useState(getAllFilterNames());
  const [visibleColumns, setVisibleColumns] = useState(getAllColumnKeys());

  // Filter headers based on visible columns
  const headers = allHeaders.filter((header) =>
    visibleColumns.includes(header.key)
  );

  // Get filtered filter config based on active filters
  const getActiveFilterConfig = () => {
    return filterConfig.filter((filter) => activeFilters.includes(filter.name));
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
    setActiveFilters((prev) => {
      if (prev.includes(filterName)) {
        return prev.filter((f) => f !== filterName);
      } else {
        return [...prev, filterName];
      }
    });
  };

  // Handle column toggle from dropdown
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnKey)) {
        return prev.filter((c) => c !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const stickyColumns = [
    [
      {
        icon: <p className="text-xs font-medium">£165</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachmentPin} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">External Transfer</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-24")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
        tooltipComponent: (
          <div>
            <p className="text-left">Benefits/Restrictions</p>
            <ul className="list-disc ml-[20px]">
              <li>Behind the goal view</li>
              <li>Atmosphere section</li>
            </ul>
          </div>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <Image width={20} height={20} src={beforeFaviurates} alt="star" />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£155</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachment3} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">Internal Transfer</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-25")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
      },
      {
        icon: <Image width={20} height={20} src={star} alt="star" />,
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£295</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachment6} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">Direct Sale</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-26")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
        tooltipComponent: (
          <div>
            <p className="text-left">Benefits/Restrictions</p>
            <ul className="list-disc ml-[20px] grid grid-cols-2 gap-1">
              <li>Executive lounge access</li>
              <li>Premium dining</li>
              <li>Complimentary drinks</li>
              <li>Best seats in stadium</li>
            </ul>
          </div>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <Image width={20} height={20} src={beforeFaviurates} alt="star" />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£165</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachmentPin} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">External Transfer</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-24")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
        tooltipComponent: (
          <div>
            <p className="text-left">Benefits/Restrictions</p>
            <ul className="list-disc ml-[20px]">
              <li>Behind the goal view</li>
              <li>Atmosphere section</li>
            </ul>
          </div>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <Image width={20} height={20} src={beforeFaviurates} alt="star" />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£155</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachment3} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">Internal Transfer</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-25")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
      },
      {
        icon: <Image width={20} height={20} src={star} alt="star" />,
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£295</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachment6} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">Direct Sale</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-26")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
        tooltipComponent: (
          <div>
            <p className="text-left">Benefits/Restrictions</p>
            <ul className="list-disc ml-[20px] grid grid-cols-2 gap-1">
              <li>Executive lounge access</li>
              <li>Premium dining</li>
              <li>Complimentary drinks</li>
              <li>Best seats in stadium</li>
            </ul>
          </div>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <Image width={20} height={20} src={beforeFaviurates} alt="star" />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
    [
      {
        icon: <p className="text-xs font-medium">£165</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
      },
      {
        icon: <Image width={14} height={14} src={attachmentPin} alt="attach" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">External Transfer</p>,
        key: "attach",
      },
      {
        icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
        className: "cursor-pointer px-2",
        key: "oneHand",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {dateFormat("2024-11-24")}
          </p>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <IconStore.upload
            onClick={() => openUploadPopup()}
            className="size-5 font-[500]"
            alt="document"
          />
        ),
        className: "cursor-pointer pr-2",
        key: "document",
        tooltipComponent: (
          <div>
            <p className="text-left">Benefits/Restrictions</p>
            <ul className="list-disc ml-[20px]">
              <li>Behind the goal view</li>
              <li>Atmosphere section</li>
            </ul>
          </div>
        ),
        tooltipPosition: "top",
      },
      {
        icon: (
          <Image width={20} height={20} src={beforeFaviurates} alt="star" />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
    ],
  ];

  const rightStickyHeaders = ["", "", "", "", "", ""];

  // Convert your event data into accordion items - using the same data structure as your original
  const accordionItems = [
    {
      id: 1,
      title: "Nottingham Forest vs Aston Villa",
      date: "Sat, 23 Nov 2024",
      time: "08:00 AM",
      venue: "City Ground",
      available: "15",
      sold: "8",
      views: "120",
      data: [
        {
          id: "2059648309",
          listingId: "2059648309",
          ticketType: "External Transfer",
          quantity: 40,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "PREMIUM",
          pricePerTicket: 165,
          totalPrice: 6600,
          deliveryMethod: "Email",
          saleDate: "2024-11-20",
          eventDate: "2024-11-23",
          status: "Active",
          commission: 10,
          notes: "Premium seats with excellent view",
        },
        {
          id: "1933901370",
          listingId: "1933901370",
          ticketType: "External Transfer",
          quantity: 40,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "PREMIUM",
          pricePerTicket: 155,
          totalPrice: 6200,
          deliveryMethod: "Mobile",
          saleDate: "2024-11-19",
          eventDate: "2024-11-23",
          status: "Active",
          commission: 8,
          notes: "Last minute availability",
        },
        {
          id: "2330843130",
          listingId: "2330843130",
          ticketType: "External Transfer",
          quantity: 10,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "M01",
          pricePerTicket: 295,
          totalPrice: 2950,
          deliveryMethod: "Collection",
          saleDate: "2024-11-18",
          eventDate: "2024-11-23",
          status: "Pending",
          commission: 12,
          notes: "VIP package included",
        },
        {
          id: "5172790641",
          listingId: "5172790641",
          ticketType: "Direct Sale",
          quantity: 20,
          sold: 5,
          splitType: "Split",
          category: "Family Stand",
          section: "Family Stand",
          row: "F12",
          pricePerTicket: 85,
          totalPrice: 1700,
          deliveryMethod: "Email",
          saleDate: "2024-11-17",
          eventDate: "2024-11-23",
          status: "Active",
          commission: 5,
          notes: "Family friendly section",
        },
        {
          id: "1480917639",
          listingId: "1480917639",
          ticketType: "External Transfer",
          quantity: 10,
          sold: 0,
          splitType: "None",
          category: "Away End",
          section: "Away End",
          row: "Row",
          pricePerTicket: 45,
          totalPrice: 450,
          deliveryMethod: "Postal",
          saleDate: "2024-11-16",
          eventDate: "2024-11-23",
          status: "Active",
          commission: 3,
          notes: "Away supporters section",
        },
        {
          id: "123825011",
          listingId: "123825011",
          ticketType: "External Transfer",
          quantity: 10,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "Row",
          pricePerTicket: 125,
          totalPrice: 1250,
          deliveryMethod: "Email",
          saleDate: "2024-11-15",
          eventDate: "2024-11-23",
          status: "Cancelled",
          commission: 7,
          notes: "Cancelled due to seller request",
        },
        {
          id: "4082813833",
          listingId: "4082813833",
          ticketType: "External Transfer",
          quantity: 10,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "D",
          pricePerTicket: 175,
          totalPrice: 1750,
          deliveryMethod: "Mobile",
          saleDate: "2024-11-14",
          eventDate: "2024-11-23",
          status: "Active",
          commission: 9,
          notes: "Lower tier seats",
        },
        {
          id: "2267793173",
          listingId: "2267793173",
          ticketType: "External Transfer",
          quantity: 10,
          sold: 0,
          splitType: "None",
          category: "Main Stand",
          section: "Main Stand",
          row: "D",
          pricePerTicket: 165,
          totalPrice: 1650,
          deliveryMethod: "Collection",
          saleDate: "2024-11-13",
          eventDate: "2024-11-23",
          status: "Sold",
          commission: 8,
          notes: "Sold to season ticket holder",
        },
      ],
      rightStickyColumns: stickyColumns,
    },
    {
      id: 2,
      title: "Chelsea vs Manchester United",
      date: "Sun, 24 Nov 2024",
      time: "14:30",
      venue: "Stamford Bridge",
      available: "22",
      sold: "15",
      views: "350",
      data: [
        {
          id: "3059648309",
          listingId: "3059648309",
          ticketType: "External Transfer",
          quantity: 30,
          sold: 5,
          splitType: "None",
          category: "West Stand",
          section: "West Stand Upper",
          row: "PREMIUM",
          pricePerTicket: 225,
          totalPrice: 6750,
          deliveryMethod: "Email",
          saleDate: "2024-11-21",
          eventDate: "2024-11-24",
          status: "Active",
          commission: 15,
          notes: "Premium view of the pitch",
        },
        {
          id: "4933901370",
          listingId: "4933901370",
          ticketType: "Direct Sale",
          quantity: 25,
          sold: 10,
          splitType: "Split",
          category: "East Stand",
          section: "East Stand Lower",
          row: "A15",
          pricePerTicket: 185,
          totalPrice: 4625,
          deliveryMethod: "Mobile",
          saleDate: "2024-11-20",
          eventDate: "2024-11-24",
          status: "Active",
          commission: 12,
          notes: "Close to player tunnel",
        },
      ],
      rightStickyColumns: stickyColumns.slice(0, 2),
    },
    {
      id: 3,
      title: "Arsenal vs Liverpool",
      date: "Mon, 25 Nov 2024",
      time: "20:00",
      venue: "Emirates Stadium",
      available: "8",
      sold: "25",
      views: "580",
      data: [
        {
          id: "5059648309",
          listingId: "5059648309",
          ticketType: "External Transfer",
          quantity: 15,
          sold: 8,
          splitType: "Bundle",
          category: "North Bank",
          section: "North Bank Upper",
          row: "C22",
          pricePerTicket: 195,
          totalPrice: 2925,
          deliveryMethod: "Collection",
          saleDate: "2024-11-22",
          eventDate: "2024-11-25",
          status: "Active",
          commission: 13,
          notes: "Behind the goal atmosphere",
        },
        {
          id: "6933901370",
          listingId: "6933901370",
          ticketType: "Internal Transfer",
          quantity: 20,
          sold: 17,
          splitType: "None",
          category: "Clock End",
          section: "Clock End Lower",
          row: "G8",
          pricePerTicket: 145,
          totalPrice: 2900,
          deliveryMethod: "Email",
          saleDate: "2024-11-21",
          eventDate: "2024-11-25",
          status: "Active",
          commission: 8,
          notes: "Good value seats",
        },
        {
          id: "7330843130",
          listingId: "7330843130",
          ticketType: "Direct Sale",
          quantity: 12,
          sold: 0,
          splitType: "Split",
          category: "Executive",
          section: "Diamond Club",
          row: "EXECUTIVE",
          pricePerTicket: 450,
          totalPrice: 5400,
          deliveryMethod: "Collection",
          saleDate: "2024-11-23",
          eventDate: "2024-11-25",
          status: "Pending",
          commission: 20,
          notes: "VIP experience with hospitality",
        },
      ],
      rightStickyColumns: stickyColumns.slice(0, 3),
    },
  ];

  const handleCellEdit = (itemIndex, rowIndex, columnKey, value) => {
    console.log("Cell edited:", { itemIndex, rowIndex, columnKey, value });
    // Here you would typically update your data state or make an API call
  };

  const handleRowSelectionChange = (newSelectedRows) => {
    console.log("Row selection changed:", newSelectedRows);
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    // Logic to select all rows across all items
    const allRowIds = [];
    accordionItems.forEach((item) => {
      if (item.data) {
        item.data.forEach((row) => {
          allRowIds.push(`${item.id}-${row.id}`);
        });
      }
    });
    setSelectedRows(allRowIds);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  const handleClone = () => {
    console.log("Cloning selected rows:", selectedRows);
    // Implement clone functionality
  };

  const handleEdit = () => {
    console.log("Editing selected rows:", selectedRows);
    // Implement edit functionality
  };

  const handleDelete = () => {
    console.log("Deleting selected rows:", selectedRows);
    // Implement delete functionality
  };

  const handleExportCSV = () => {
    console.log("Exporting selected rows to CSV:", selectedRows);
    // Implement CSV export functionality
  };

  const handleCollapseAll = () => {
    console.log("Collapsing all accordion items");
    // Implement collapse all functionality
  };

  // Calculate total events count from accordion items
  const totalEvents = accordionItems.length;
  const selectedCount = selectedRows.length;
  const selectedEventsCount = accordionItems.filter((item) =>
    selectedRows.some((id) => id.startsWith(`${item.id}-`))
  ).length;

  return (
    <div className="bg-[#F5F7FA] w-full h-full relative">
      {/* Header with Filter and Add Deposit button */}
      <div className="flex bg-white items-center py-2 md:py-2 justify-between px-4 md:px-6 border-b border-[#eaeaf1]">
        <div className="flex items-center space-x-4">
          <p>Filter</p>

          {/* Control Icons */}
        </div>
        <div className="flex items-center gap-4">
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
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
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
                <rect x="3" y="3" width="6" height="18" />
                <rect x="11" y="3" width="6" height="18" />
                <rect x="19" y="3" width="2" height="18" />
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
          <Button
          type="blueType"
          classNames={{
            root: "px-2 md:px-3 py-1.5 md:py-2",
            label_: "text-xs md:text-sm font-medium",
          }}
          onClick={() => {
            handleOpenAddWalletPopup();
          }}
          label="+ Add Deposit"
        />
        </div>
      </div>

      {/* Filter Section - Only show active filters */}
      {getActiveFilterConfig().length > 0 && (
        <div className="border-b-[1px] bg-white border-[#DADBE5] p-4">
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
                      label="Search Match Event"
                      className={
                        "!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "
                      }
                      paddingClassName=""
                      autoComplete="off"
                    />
                  );
                case "ticket_status":
                  return (
                    <FloatingSelect
                      key={filter.name}
                      label={"Ticket Status"}
                      options={[
                        { value: "fulfilled", label: "Fulfilled" },
                        { value: "incomplete", label: "Incomplete" },
                      ]}
                      keyValue="ticket_status"
                      className=""
                      paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                    />
                  );
                case "booking_status":
                  return (
                    <FloatingSelect
                      key={filter.name}
                      label={"Booking Status"}
                      keyValue="booking_status"
                      className=""
                      paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
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
        </div>
      )}

      {/* Events Count Section */}
      <div className="border-b-[1px] bg-white border-[#DADBE5] flex items-center">
        <p className="text-[14px] p-4 text-[#323A70] font-medium border-r-[1px] border-[#DADBE5] w-fit">
          {totalEvents} Events
        </p>
      </div>

      {/* Main Content Area with Accordion Table */}
      <div
        className="m-6 bg-white rounded max-h-[calc(100vh-300px)] overflow-auto"
        style={{
          paddingBottom: selectedRows.length > 0 ? "120px" : "0", // Add padding when sticky bar is visible
        }}
      >
        <ScrollableAccordionTable
          items={accordionItems}
          headers={headers}
          rightStickyHeaders={rightStickyHeaders}
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

      {/* Sticky Bottom Container - FIXED z-index and positioning */}
      {selectedRows.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
          style={{ zIndex: 9999 }} // Much higher z-index
        >
          {/* Collapsed State */}
          {!isStickyExpanded && (
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCount > 0}
                    onChange={
                      selectedCount > 0 ? handleDeselectAll : handleSelectAll
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select all
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedCount}</span> selected
                  in <span className="font-medium">{selectedEventsCount}</span>{" "}
                  event{selectedEventsCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 hover:bg-gray-100 rounded"
                >
                  Deselect
                </button>
                <button
                  onClick={handleClone}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
                >
                  <Copy size={16} />
                  <span>Clone</span>
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
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setIsStickyExpanded(true)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Expanded State */}
          {isStickyExpanded && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCount > 0}
                      onChange={
                        selectedCount > 0 ? handleDeselectAll : handleSelectAll
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select all
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedCount}</span>{" "}
                    selected in{" "}
                    <span className="font-medium">{selectedEventsCount}</span>{" "}
                    event{selectedEventsCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => setIsStickyExpanded(false)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    Deselect
                  </button>
                  <button
                    onClick={handleClone}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    <Copy size={16} />
                    <span>Clone</span>
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    <Download size={16} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded border border-gray-300"
                  >
                    <ChevronDown size={16} />
                    <span>Collapse all</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
