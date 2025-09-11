import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import uploadListing from "../../../public/uploadListing.svg";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import {
  constructTeamMembersDetails,
  convertKeyToDisplayName,
  separateDateTime,
} from "@/utils/helperFunctions";
import Button from "../commonComponents/button";
import {
  downloadSalesCSVReport,
  fetchSalesHistory,
  fetchSalesInventoryLogs,
  fetchSalesOrderDetails,
  fetchSalesOrderLogs,
  fetchSalesPageData,
  getSalesCount,
  getSalesTicketDetails,
  getTicketTypes,
  getFieldSettings,          // added
  saveFieldSettings,         // added
} from "@/utils/apiHandler/request";
import { Clock, Eye, Hand, Upload } from "lucide-react";
import { inventoryLog } from "@/data/testOrderDetails";
import useTeamMembersDetails from "@/Hooks/useTeamMembersDetails";
import { toast } from "react-toastify";
import useCSVDownload from "@/Hooks/useCsvDownload";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import Image from "next/image";
import Tooltip from "../addInventoryPage/simmpleTooltip";
import UploadTickets from "../ModalComponents/uploadTickets";
import MySalesUploadTickets from "../ModalComponents/uploadTickets/mySalesUploadTickets";
import InventoryLogsInfo from "../inventoryLogsInfo";
import { useRouter } from "next/router";

const SalesPage = (props) => {
  const { profile, response = {} } = props;
  const { tournamentList } = response;
  const tournamentOptions = tournamentList?.map((item) => ({
    value: item.tournament_id,
    label: item.tournament_name,
  }));
  const [pageLoader, setPageLoader] = useState(false);

  // Pagination states
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState([]);

  const [filtersApplied, setFiltersApplied] = useState({
    order_status: profile,
    page: 1,
  });
  const { teamMembers } = useTeamMembersDetails();

  const [activeTab, setActiveTab] = useState(profile || "pending");

  const [salesCount, setSalesCount] = useState(
    response?.salesCount?.sales_count
  );

  const [overViewData, setOverViewData] = useState(response?.salesPage || {});
  const [salesData, setSalesData] = useState(
    response?.salesHistory?.data?.sales_history || []
  );
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState({
    show: false,
    data: null,
    type: "",
  });
  const [listTypeChecked, setListTypeChecked] = useState("all");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [sortState, setSortState] = useState(null);

  // Field settings for Sales page (columns + filters)
  const [fieldSettings, setFieldSettings] = useState(null);
  const salesApiInitRef = useRef(false);

  // Normalize helper for robust name matching (labels/names vary)
  const normalize = useCallback((str) => {
    return (str || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s/]+/g, " ")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }, []);

  // Load field settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getFieldSettings("");
        setFieldSettings(res?.field_settings || null);
      } catch (e) {
        console.error("Failed to load field settings", e);
        setFieldSettings(null);
      }
    };
    loadSettings();
  }, []);

  // Define table headers - filter based on visible columns
  const allHeaders = [
    { key: "order_id", label: "Order Id" },
    {
      key: "order_date",
      label: "Order Date",
      sortable: true,
      sortableKey: "order_date",
    },
    {
      key: "order_value",
      label: "Order Value",
      sortable: true,
      sortableKey: "order_value",
    },
    {
      key: "event",
      label: "Event",
      sortable: true,
      sortableKey: "event_name",
    },
    {
      key: "venue",
      label: "Venue",
      sortable: true,
      sortableKey: "venue_name",
    },
    {
      key: "event_date",
      label: "Event Date",
      sortable: true,
      sortableKey: "event_date",
    },
    {
      key: "delivery_date",
      label: "Expected Delivery Date",
    },
    {
      key: "ticket_details",
      label: "Ticket Category",
      sortable: true,
      sortableKey: "ticket_details",
    },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
      sortableKey: "quantity",
    },
    {
      key: "ticket_type_label",
      label: "Ticket Type",
      sortable: true,
      sortableKey: "ticket_type",
    },
    {
      key: "section",
      label: "Section",
      sortable: true,
      sortableKey: "section_block",
    },
    { key: "category", label: "Category" },
    { key: "delivery_status_label", label: "Ticket Status" },
    { key: "order_status_label", label: "Order Status" },
    {
      key: "row",
      label: "Row",
      sortable: true,
      sortableKey: "row",
    },
    { key: "days_to_event", label: "Days to Event" },
  ];

  // Map normalized header labels -> keys (for API name matching)
  const headerNameToKeyMap = useMemo(() => {
    const map = {};
    allHeaders.forEach((h) => {
      map[normalize(h.label)] = h.key;
    });
    return map;
  }, [allHeaders, normalize]);

  // Column ordering (persisted)
  const [orderedColumns, setOrderedColumns] = useState(() =>
    allHeaders.map((h) => h.key)
  );

  // Modified API call to handle pagination
  const apiCall = async (
    params,
    handleCountApiCall,
    isLoadMore = false,
    isClear = false
  ) => {
    // Only show main loader for initial load, not for pagination
    if (!isLoadMore) {
      setPageLoader(true);
    } else {
      setLoadingMore(true);
    }
    let updatedFilters = {};
    if (isClear) {
      updatedFilters = { currency: currency };
    } else {
      updatedFilters = { ...filtersApplied, currency: currency, ...params };
    }

    setFiltersApplied(updatedFilters);

    try {
      const salesDataResponse = await fetchSalesPageData("", {
        ...updatedFilters,
        ...(updatedFilters?.ticket_type_value
          ? { ticket_type: updatedFilters?.ticket_type_value }
          : {}),
      });
      const history = await fetchSalesHistory("", {
        ...updatedFilters,
        ...(updatedFilters?.ticket_type_value
          ? { ticket_type: updatedFilters?.ticket_type_value }
          : {}),
      });

      if (handleCountApiCall) {
        const count = await getSalesCount("", params);
        console.log(count, "countcount");
        setSalesCount(count?.sales_count);
      }

      // Handle pagination metadata
      if (history?.data?.meta) {
        setCurrentPage(history.data.meta.current_page);
        setTotalPages(history.data.meta.last_page);
        setHasNextPage(history.data.meta.next_page_url !== null);
      }

      if (isLoadMore) {
        // Append new data to existing data
        setSalesData((prevData) => [
          ...prevData,
          ...(history?.data?.sales_history || []),
        ]);
      } else {
        // Replace data for new search/filter
        setSalesData(history?.data?.sales_history || []);
        setOverViewData(salesDataResponse);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Error loading data");
    } finally {
      setPageLoader(false);
      setLoadingMore(false);
    }
  };

  // Load more data when scrolling to end - THIS IS THE KEY FUNCTION
  const handleScrollEnd = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    console.log("Loading more data...", { currentPage, hasNextPage });
    const nextPage = currentPage + 1;
    await apiCall({ page: nextPage }, false, true);
  };

  const hideColumnKeys = ["tournament_id", "match_id", "row"];

  // Dynamically create initial visible columns state from allHeaders
  const createInitialVisibleColumns = () => {
    return allHeaders.reduce((acc, header) => {
      acc[header.key] = true; // Set all columns as visible by default
      if (hideColumnKeys.includes(header.key)) {
        acc[header.key] = false;
      }
      return acc;
    }, {});
  };

  // New state for column visibility - dynamically formed from allHeaders
  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  // Initialize columns from salesTableColumn when fieldSettings arrives
  useEffect(() => {
    if (salesApiInitRef.current) return;
    const columnList = fieldSettings?.salesTableColumn;
    if (!Array.isArray(columnList) || !columnList.length) return;

    const seen = new Set();
    const newOrder = [];
    const visibleSet = new Set();

    columnList.forEach((item) => {
      const key =
        headerNameToKeyMap[normalize(item?.name)] ||
        null;
      if (key && !seen.has(key)) {
        newOrder.push(key);
        if (item?.checked) visibleSet.add(key);
        seen.add(key);
      }
    });

    // Append any headers not present in settings (to avoid loss)
    allHeaders.forEach((h) => {
      if (!seen.has(h.key)) {
        newOrder.push(h.key);
        visibleSet.add(h.key); // default to visible for missing
      }
    });

    // Apply to state
    setOrderedColumns(newOrder);
    setVisibleColumns((prev) => {
      const map = {};
      newOrder.forEach((k) => {
        map[k] = visibleSet.has(k);
      });
      return map;
    });

    salesApiInitRef.current = true;
  }, [fieldSettings?.salesTableColumn, allHeaders, headerNameToKeyMap, normalize]);

  // Persist column settings to API (salesTableColumn)
  const persistSalesColumnSettings = useCallback(
    async (visibleMap = visibleColumns, order = orderedColumns) => {
      try {
        // Build label map for friendly names
        const labelMap = {};
        allHeaders.forEach((h) => (labelMap[h.key] = h.label));

        // Use server-provided IDs when available
        const apiSource = fieldSettings?.salesTableColumn || [];

        const valueArray = order.map((key, idx) => {
          const original = apiSource.find(
            (item) => headerNameToKeyMap[normalize(item?.name)] === key
          );
          return {
            id: original?.id || idx + 1,
            name: original?.name || labelMap[key] || key,
            checked: !!visibleMap[key],
          };
        });

        const payload = {
          settings: [{ key: "salesTableColumn", value: valueArray }],
        };
        await saveFieldSettings("", payload);
      } catch (e) {
        console.error("Failed to save salesTableColumn", e);
      }
    },
    [visibleColumns, orderedColumns, allHeaders, fieldSettings, headerNameToKeyMap, normalize]
  );

  // NEW: Handle columns reorder -> update state and persist
  const handleColumnsReorderPersist = useCallback(
    (newOrder /* array of keys */, reorderedItems) => {
      // Update local order so headers re-render in the new order
      setOrderedColumns(newOrder);
      // Persist the new order + current visibility
      persistSalesColumnSettings(visibleColumns, newOrder);
    },
    [persistSalesColumnSettings, visibleColumns]
  );

  // Helper function to safely format tab name
  const formatTabName = (tabKey) => {
    if (!tabKey || typeof tabKey !== "string") {
      return "Pending";
    }
    if (tabKey == "confirmed") {
      return "Awaiting Delivery";
    }
    return (
      tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/[-_]/g, " ")
    );
  };

  // Add Inventory navigation (missing earlier for sales pages)
  const router = useRouter();
  const handleAddInventory = useCallback(() => {
    try {
      router.push("/add-listings");
    } catch (e) {
      console.error("Failed to navigate to add-listings", e);
    }
  }, [router]);

  const listData = salesData?.map((item) => ({
    ...item,
  }));

  // Filter headers based on visibility with persisted order
  const headers = useMemo(() => {
    const desiredOrder = orderedColumns && orderedColumns.length
      ? orderedColumns
      : allHeaders.map((h) => h.key);
    return desiredOrder
      .filter((key) => visibleColumns[key])
      .map((key) => allHeaders.find((h) => h.key === key))
      .filter(Boolean);
  }, [allHeaders, orderedColumns, visibleColumns]);

  const getOrderDetails = async (item) => {
    setShowInfoPopup((prev) => {
      return {
        ...prev,
        flag: true,
        isLoading: true,
      };
    });
    const salesData = await fetchSalesOrderDetails("", {
      booking_id: item?.id,
    });
    const ticketTypes = await getTicketTypes();
    const ticketTypesList = ticketTypes?.ticket_types?.map((list) => ({
      label: list?.name,
      value: list?.id,
    }));

    setShowInfoPopup({
      flag: true,
      data: salesData?.map((list) => ({
        ...list,
        order_id_label: item?.booking_no ?? null,
      })),
      ticketTypesList: ticketTypesList,
      rowData: item,
      bg_id: item?.bg_id,
      isLoading: false,
    });
  };

  const getLogDetailsDetails = async (item) => {
    setShowLogDetailsModal((prev) => ({
      ...prev,
      flag: true,
      isLoading: true,
    }));
    const orderLogs = await fetchSalesOrderLogs("", {
      booking_id: item?.id,
    });
    const inventoryLogs = await fetchSalesInventoryLogs("", {
      ticket_id: item?.id,
    });
    setShowLogDetailsModal({
      flag: true,
      orderLogs: orderLogs,
      inventoryLogs: inventoryLogs,
      isLoading: false,
    });
  };
  const [uploadPopupLoading, setUploadPopupLoading] = useState(false);

  const handleUploadAction = async (rowData, rowIndex) => {
    try {
      // Set loading state before API call
      setUploadPopupLoading(true);

      // Show the popup with loading state
      setShowUploadPopup({
        show: true,
        loading: true,
        rowData: null,
        rowIndex,
      });

      // Fetch ticket details from API
      const response = await getSalesTicketDetails("", {
        booking_id: rowData?.id,
      });

      // Check different possible response structures
      let ticketDetails = response?.ticket_details || response;

      // Check ticket type to determine flow
      const ticketType = parseInt(
        rowData?.ticket_type || rowData?.ticket_types || rowData?.ticket_type_id
      );
      const isETicketFlow = ticketType === 4;
      const isPaperTicketFlow = ticketType === 3;
      const isNormalFlow = !isETicketFlow && !isPaperTicketFlow;

      // ENHANCED: Extract additional file templates data
      const additionalInfoDetails = {
        id: response?.additional_file_templates?.id || "",
        ticketId: response?.additional_file_templates?.ticket_id || "",
        sellTicketId: response?.additional_file_templates?.sell_ticket_id || "",
        templateName: response?.additional_file_templates?.template_name || "",
        dynamicContent:
          response?.additional_file_templates?.dynamic_content || "",
        ticketType: response?.additional_file_templates?.ticket_type || "",
        templateFile:
          response?.additional_file_templates?.template_file || null,
      };

      if (isETicketFlow) {
        // Existing E-Ticket flow logic
        const qrLinksData =
          ticketDetails?.map((ticket, index) => ({
            id: ticket.id,
            ticketId: ticket.ticket_id,
            serial: ticket.serial,
            qr_link_android: ticket.qr_link_android || "",
            qr_link_ios: ticket.qr_link_ios || "",
            isExisting: true,
            originalAndroid: ticket.qr_link_android || "",
            originalIos: ticket.qr_link_ios || "",
          })) || [];

        qrLinksData.sort((a, b) => a.serial - b.serial);

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            bookingId: rowData?.order_id,
            matchDate,
            matchTime,
            qrLinksData,
            originalTicketDetails: ticketDetails,
            fetchedAdditionalInfoDetails: additionalInfoDetails, // Pass the data
          },
          rowIndex,
        });
      } else if (isPaperTicketFlow && response?.tracking_details) {
        // Paper Ticket Flow Logic
        const paperTicketData = {
          courier_type: "company",
          courier_company: response?.tracking_details?.delivery_provider || "",
          tracking_details: response?.tracking_details?.tracking_number || "",
          tracking_link: response?.tracking_details?.tracking_link || "",
          pod_file: response?.tracking_details?.pod || null,
        };

        const paperTicketFileUpload = response?.tracking_details?.pod
          ? [
              {
                fileName: `POD_${response?.tracking_details.id}.png`,
                url: response?.tracking_details.pod,
                id: response?.tracking_details.id,
                ticketId: response?.tracking_details.ticket_id,
                serial: response?.tracking_details.serial || 1,
                isExisting: true,
                existingId: response?.tracking_details.id,
              },
            ]
          : [];

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            matchDate,
            bookingId: rowData?.order_id,
            matchTime,
            paper_ticket_details: paperTicketData,
            paperTicketFileUpload: paperTicketFileUpload,
            originalTicketDetails: ticketDetails,
            originalPaperTicketDetails: response?.tracking_details,
            fetchedAdditionalInfoDetails: additionalInfoDetails, // Pass the data
          },
          rowIndex,
        });
      } else {
        // Normal flow logic
        const myListingFileUpload =
          ticketDetails?.map((ticket, index) => ({
            fileName: ticket.ticket_file_name,
            url: ticket.ticket_file,
            id: ticket.id,
            ticketId: ticket.ticket_id,
            serial: ticket.serial,
            isExisting: true,
            existingId: ticket.id,
          })) || [];

        myListingFileUpload.sort((a, b) => a.serial - b.serial);

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            matchDate,
            bookingId: rowData?.order_id,
            matchTime,
            myListingFileUpload,
            originalTicketDetails: ticketDetails,
            fetchedAdditionalInfoDetails: additionalInfoDetails, // Pass the data
          },
          rowIndex,
        });
      }
    } catch (error) {
      console.error("Error in handleUploadAction:", error);
      toast.error("Failed to load ticket details");

      setShowUploadPopup({
        show: false,
        loading: false,
        rowData: null,
        rowIndex: null,
      });
    } finally {
      setUploadPopupLoading(false);
    }
  };

  const handleUploadClick = async (rowData, attendee) => {
    console.log("rowDatarowDatarowData", attendee);
    try {
      // Set loading state before API call
      setUploadPopupLoading(true);

      // Show the popup with loading state
      setShowUploadPopup({
        show: true,
        loading: true,
        rowData: null,
        rowIndex: "",
      });

      // Fetch ticket details from API
      const response = await getSalesTicketDetails("", {
        booking_id: rowData?.id,
      });

      // Check different possible response structures
      let ticketDetails = [
        response.ticket_details.find((ticket) => ticket?.id === attendee?.id),
      ];
      // Check ticket type to determine flow
      const ticketType = parseInt(
        rowData?.ticket_type || rowData?.ticket_types || rowData?.ticket_type_id
      );
      const isETicketFlow = ticketType === 4;
      const isPaperTicketFlow = ticketType === 3;
      const isNormalFlow = !isETicketFlow && !isPaperTicketFlow;

      if (isETicketFlow) {
        // Existing E-Ticket flow logic
        const qrLinksData =
          ticketDetails?.map((ticket, index) => ({
            id: ticket.id,
            ticketId: ticket.ticket_id,
            serial: ticket.serial,
            qr_link_android: ticket.qr_link || "",
            qr_link_ios: ticket.qr_link_ios || "",
            isExisting: true,
            originalAndroid: ticket.qr_link || "",
            originalIos: ticket.qr_link_ios || "",
          })) || [];

        qrLinksData.sort((a, b) => a.serial - b.serial);

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            matchDate,
            matchTime,
            qrLinksData,
            originalTicketDetails: ticketDetails,
          },
          rowIndex: "",
        });
      } else if (isPaperTicketFlow && response?.tracking_details) {
        // NEW: Paper Ticket Flow Logic

        // Prepare paper ticket data from first ticket detail only
        const paperTicketData = {
          courier_type: "company", // default value
          courier_company: response?.tracking_details?.delivery_provider || "",
          tracking_details: response?.tracking_details?.tracking_number || "",
          tracking_link: response?.tracking_details?.tracking_link || "",
          pod_file: response?.tracking_details?.pod || null,
        };

        // Prepare paper ticket file upload data if POD file exists
        const paperTicketFileUpload = response?.tracking_details?.pod
          ? [
              {
                fileName: `POD_${response?.tracking_details.id}.png`,
                url: response?.tracking_details.pod,
                id: response?.tracking_details.id,
                ticketId: response?.tracking_details.ticket_id,
                serial: response?.tracking_details.serial || 1,
                isExisting: true,
                existingId: response?.tracking_details.id,
              },
            ]
          : [];

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        // Update popup with paper ticket data
        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            matchDate,
            matchTime,
            paper_ticket_details: paperTicketData,
            paperTicketFileUpload: paperTicketFileUpload,
            originalTicketDetails: ticketDetails,
            originalPaperTicketDetails: response?.tracking_details,
          },
          rowIndex: "",
        });
      } else {
        // Existing normal flow logic
        const myListingFileUpload =
          ticketDetails?.map((ticket, index) => ({
            fileName: ticket.ticket_file_name,
            url: ticket.ticket_file,
            id: ticket.id,
            ticketId: ticket.ticket_id,
            serial: ticket.serial,
            isExisting: true,
            existingId: ticket.id,
          })) || [];

        myListingFileUpload.sort((a, b) => a.serial - b.serial);

        const matchDate = separateDateTime(rowData?.event_date)?.date;
        const matchTime = separateDateTime(rowData?.event_date)?.time;

        setShowUploadPopup({
          show: true,
          loading: false,
          rowData: {
            ...rowData,
            matchDate,
            matchTime,
            myListingFileUpload,
            originalTicketDetails: ticketDetails,
          },
          rowIndex: "",
        });
      }
    } catch (error) {
      console.error("Error in handleUploadAction:", error);
      toast.error("Failed to load ticket details");

      setShowUploadPopup({
        show: false,
        loading: false,
        rowData: null,
        rowIndex: null,
      });
    } finally {
      setUploadPopupLoading(false);
    }
  };

  // Create right sticky columns with action buttons
  const rightStickyColumns = salesData.map((item, index) => [
    {
      icon: (
        <Tooltip content="logs">
          <Clock
            onClick={() => getLogDetailsDetails(item)}
            className="size-4"
          />
        </Tooltip>
      ),
      className: " cursor-pointer",
    },
    ...(profile != "pending"
      ? [
          {
            icon: (
              <Tooltip content="upload">
                <Image
                  src={uploadListing}
                  alt="tick"
                  width={16}
                  height={16}
                  className={`${"cursor-pointer hover:text-blue-500 transition-colors"}`}
                  onClick={() => {
                    handleUploadAction(item, index);
                  }}
                />
              </Tooltip>
            ),
            className: " cursor-pointer",
          },
        ]
      : []),
    {
      icon: (
        <Tooltip content="Details">
          <Eye onClick={() => getOrderDetails(item)} className="size-5" />
        </Tooltip>
      ),
      className: " cursor-pointer",
    },
  ]);

  const getCountByStatus = (status) => {
    return salesCount?.find((item) => item.status === status)?.orders || "0";
  };

  const columnHeadersMap = {
    order_id: "Order Id",
    order_date: "Order Date", 
    order_value: "Order Value",
    event: "Event",
    venue: "Venue",
    event_date: "Event Date",
    delivery_date: "Expected Delivery Date",
    ticket_details: "Ticket Category",
    quantity: "Quantity",
    ticket_type_label: "Ticket Type",
    section: "Section",
    category: "Category",
    delivery_status_label: "Ticket Status",
    order_status_label: "Order Status",
    row: "Row",
    days_to_event: "Days to Event",
    tournament_id: "Tournament ID",
    match_id: "Match ID"
  };

  // Helper function to get amount by status
  const getAmountByStatus = (status) => {
    return (
      salesCount?.find((item) => item.status === status)?.amount || "£0.00"
    );
  };

  const tabsConfig = [
    {
      name: "Pending",
      key: "pending",
      count: getCountByStatus("pending") || "0",
      route: "/sales/pending",
      amount: getAmountByStatus("pending"),
    },
    {
      name: "Awaiting Delivery",
      key: "confirmed",
      count: getCountByStatus("confirmed"),
      route: "/sales/confirmed",
      amount: getAmountByStatus("confirmed"),
    },
    {
      name: "Delivered",
      key: "delivered",
      count: getCountByStatus("delivered"),
      route: "/sales/delivered",
      amount: getAmountByStatus("delivered"),
    },
    {
      name: "Completed",
      key: "completed",
      count: getCountByStatus("completed"),
      route: "/sales/completed",
      amount: getAmountByStatus("completed"),
    },
    {
      name: "Cancelled",
      key: "cancelled",
      count: getCountByStatus("cancelled"),
      route: "/sales/cancelled",
      amount: getAmountByStatus("cancelled"),
    },
    {
      name: "Replaced",
      key: "replaced",
      count: getCountByStatus("replaced"),
      route: "/sales/replaced",
      amount: getAmountByStatus("replaced"),
    },
  ];

  const activeTabConfig = tabsConfig.find((tab) => tab.key === activeTab);

  // Updated itemConfig with disabled property
  const itemConfig = {
    [profile]: [
      {
        name:
          (activeTabConfig?.name === "Delivered" || activeTab === "delivered"
            ? "Delivery"
            : activeTabConfig?.name || activeTab) + " Revenue",
        value: overViewData?.amount_with_currency,
      },
      {
        name: "Orders",
        value: overViewData?.orders,
        smallTooptip: `${overViewData.ticket_count} Tickets`,
      },
      {
        name: "E-Ticket",
        value: overViewData?.e_tickets_count,
        showCheckbox: true,
        key: "ticket_type_1",
        isChecked: selectedTicketTypes.includes("ticket_type_1"), // Check if in array
        disabled: overViewData?.e_tickets_count === 0,
      },
      {
        name: "External Transfer",
        value: overViewData?.external_transfer_count,
        showCheckbox: true,
        key: "ticket_type_2",
        isChecked: selectedTicketTypes.includes("ticket_type_2"), // Check if in array
        disabled: overViewData?.external_transfer_count === 0,
      },
      {
        name: "Mobile Link/PKPASS",
        value: overViewData?.mobile_ticket_count,
        showCheckbox: true,
        key: "ticket_type_3",
        isChecked: selectedTicketTypes.includes("ticket_type_3"), // Check if in array
        disabled: overViewData?.mobile_ticket_count === 0,
      },
      {
        name: "Paper Ticket",
        value: overViewData?.paper_ticket_count,
        showCheckbox: true,
        key: "ticket_type_4",
        isChecked: selectedTicketTypes.includes("ticket_type_4"), // Check if in array
        disabled: overViewData?.paper_ticket_count === 0,
      },
      {
        name: "Local Delivery",
        value: overViewData?.local_delivery_count,
        showCheckbox: true,
        key: "ticket_type_5",
        isChecked: selectedTicketTypes.includes("ticket_type_5"), // Check if in array
        disabled: overViewData?.local_delivery_count === 0,
      },
    ],
  };

  const [csvLoader, setCsvLoader] = useState(false);
  const [currency, setCurrency] = useState("GBP");

  // Configuration for filters per tab
  const filterConfig = {
    [profile]: [
      {
        type: "text",
        name: "query",
        value: filtersApplied?.query,
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
        parentClassName: "!w-[300px] max-sm:!w-full",
      },
      {
        type: "select",
        value: filtersApplied?.ticket_type,
        name: "ticket_type",
        label: "Ticket Type",
        options: response?.salesFilter?.data?.ticket_types?.map((type) => ({
          value: type?.id,
          label: type?.name,
        })),
        parentClassName: "!w-[15%] max-sm:!w-full",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },

      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        value: filtersApplied?.team_members,
        multiselect: true,
        options: teamMembers,
        parentClassName: "!w-[15%] max-sm:!w-full",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "checkbox",
        name: "ticket_in_hand",
        label: "Tickets In Hand",
        value: !!filtersApplied?.ticket_in_hand,
        beforeIcon: <Hand className="size-4"/>,
        parentClassName: " !w-[15%] max-sm:!w-full",
        className:
          "!py-[3px]  w-full text-xs sm:text-[10px] lg:text-xs",
        labelClassName:
          "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
        hideFromTable: true,
      },

      {
        type: "date",
        name: "orderDate",
        singleDateMode: false,
        value: {
          startDate: filtersApplied?.order_date_from,
          endDate: filtersApplied?.order_date_to,
        },
        label: "Order Date",
        parentClassName: "!w-[150px] max-sm:!w-full",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "delivery_date",
        singleDateMode: false,
        value: {
          startDate: filtersApplied?.delivery_date_from,
          endDate: filtersApplied?.delivery_date_to,
        },
        label: "Delivery Date",
        parentClassName: "!w-[150px] max-sm:!w-full",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "event_date",
        singleDateMode: false,
        value: {
          startDate: filtersApplied?.event_start_date,
          endDate: filtersApplied?.event_end_date,
        },
        label: "Event Date",
        parentClassName: "!w-[150px] max-sm:!w-full",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },

      {
        type: "select",
        value: filtersApplied?.category,
        name: "category",
        label: "Category",
        options: response?.salesFilter?.data?.categories?.map((type) => ({
          value: type?.id,
          label: type?.name,
        })),
        parentClassName: "!w-[15%] max-sm:!w-full",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  // Apply salesTableFilter (reorder + show only checked) from fieldSettings
  const computedFilterConfig = useMemo(() => {
    const baseList = filterConfig[profile] || [];
    const salesFilterList = fieldSettings?.salesTableFilter;
    if (!Array.isArray(salesFilterList) || !salesFilterList.length) {
      return filterConfig;
    }

    // Build maps for matching
    const byNormLabel = {};
    const byName = {};
    baseList.forEach((f) => {
      byNormLabel[normalize(f.label)] = f;
      byName[f.name] = f;
    });

    const ordered = [];
    const used = new Set();

    const toSingular = (s) => s?.replace(/s$/, "") || s;

    salesFilterList.forEach((item) => {
      const norm = normalize(item?.name);
      let match = byNormLabel[norm] || byNormLabel[normalize(toSingular(item?.name))];
      if (!match) {
        // try find by value/name key directly when labels diverge
        const found = baseList.find((f) => normalize(f.name) === norm);
        if (found) match = found;
      }
      if (match && !used.has(match.name)) {
        ordered.push({ ...match, checked: !!item?.checked });
        used.add(match.name);
      }
    });

    baseList.forEach((f) => {
      if (!used.has(f.name)) {
        ordered.push({ ...f, checked: true });
      }
    });

    return { [profile]: ordered };
  }, [filterConfig, profile, fieldSettings?.salesTableFilter, normalize]);

  // Persist filters (optional hooks if your UI exposes toggles/reorder)
  const persistSalesFilterSettings = useCallback(
    async (activeFiltersList, orderedFiltersList) => {
      try {
        const apiSource = fieldSettings?.salesTableFilter || [];
        const labelMap = {};
        (filterConfig[profile] || []).forEach((f) => {
          labelMap[f.name] = f.label;
        });

        const finalOrder = orderedFiltersList?.length
          ? orderedFiltersList
          : (filterConfig[profile] || []).map((f) => f.name);

        const valueArray = finalOrder.map((key, idx) => {
          const label = labelMap[key] || key;
          const original = apiSource.find(
            (item) => normalize(item?.name) === normalize(label)
          );
          return {
            id: original?.id || idx + 1,
            name: original?.name || label,
            checked: activeFiltersList
              ? activeFiltersList.includes(key)
              : true,
          };
        });

        const payload = {
          settings: [{ key: "salesTableFilter", value: valueArray }],
        };
        await saveFieldSettings("", payload);
      } catch (e) {
        console.error("Failed to save salesTableFilter", e);
      }
    },
    [fieldSettings?.salesTableFilter, filterConfig, profile, normalize]
  );

  // Handle column toggle with persistence
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [columnKey]: !prev[columnKey] };
      // Persist after local state update (fire-and-forget)
      setTimeout(() => persistSalesColumnSettings(next, orderedColumns), 0);
      return next;
    });
  };

  // NEW: Handle filters reorder -> persist using salesTableFilter
  const handleFiltersReorderPersist = useCallback(
    (tabKey, newOrder, reorderedItems) => {
      const activeKeys = (reorderedItems || [])
        .filter((i) => i.isActive)
        .map((i) => i.key);
      persistSalesFilterSettings(activeKeys, newOrder);
    },
    [persistSalesFilterSettings]
  );

  // NEW: Handle filter toggle -> persist using salesTableFilter
  const handleFilterTogglePersist = useCallback(
    (tabKey, activeKeys, orderedKeys) => {
      persistSalesFilterSettings(activeKeys, orderedKeys);
    },
    [persistSalesFilterSettings]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItems([]);
    setSelectedTicketTypes([]); // Reset to empty array instead of empty string
    // Reset pagination when changing tabs
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);
  };

  useEffect(() => {
    const currentTicketTypeValue = filtersApplied?.ticket_type_value;

    if (!currentTicketTypeValue) {
      setSelectedTicketTypes([]);
    } else {
      // Map ticket_type_value back to ticket_type keys for multi-select
      const typeMapping = {
        2: "ticket_type_1",
        6: "ticket_type_2",
        4: "ticket_type_3",
        3: "ticket_type_4",
        5: "ticket_type_5",
      };

      // Split comma-separated values and map them back to keys
      const selectedValues = currentTicketTypeValue
        .split(",")
        .map((val) => parseInt(val.trim()));
      const selectedKeys = selectedValues
        .map((val) => typeMapping[val])
        .filter((key) => key); // Remove any undefined values

      setSelectedTicketTypes(selectedKeys);
    }
  }, [filtersApplied?.ticket_type_value]);

  const handleFilterChange = async (filterKey, value) => {
    // Reset sort state when filters change (optional)
    setSortState(null);
    console.log(value, filterKey);
    let params = {};
    if (filterKey === "orderDate") {
      params = {
        ...params,
        order_date_from: value?.startDate,
        order_date_to: value?.endDate,
        page: 1,
      };
    } else if (filterKey === "delivery_date") {
      params = {
        ...params,
        delivery_date_from: value?.startDate,
        delivery_date_to: value?.endDate,
        page: 1,
      };
    } else if (filterKey === "event_date") {
      params = {
        ...params,
        event_start_date: value?.startDate,
        event_end_date: value?.endDate,
        page: 1,
      };
    } else if (filterKey == "order_date_to") {
      params = {
        ...params,
        order_date_to: "",
        order_date_from: "",
        page: 1,
      };
    } else if (filterKey == "delivery_date_to") {
      params = {
        ...params,
        delivery_date_to: "",
        delivery_date_from: "",
        page: 1,
      };
    } else if (filterKey == "ticket_in_hand") {
      params = {
        ...params,
        [filterKey]: value ? 1 : 0,
        page: 1,
      };
    } else if (filterKey == "event_end_date") {
      params = {
        ...params,
        event_end_date: "",
        event_start_date: "",
        page: 1,
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
        page: 1,
      };
    }

    // Reset pagination state
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);

    await apiCall(params);
  };

  const handleCheckboxToggle = (checkboxKey, isChecked) => {
    // Get the current item config to check if it's disabled
    const currentItems = itemConfig[profile] || [];
    const currentItem = currentItems.find((item) => item.key === checkboxKey);

    // Early return if the item is disabled
    if (currentItem?.disabled) {
      console.log(`Checkbox ${checkboxKey} is disabled and cannot be toggled`);
      return;
    }

    // Reset sort state when filters change (optional)
    setSortState(null);

    let updatedSelectedTypes = [...selectedTicketTypes];

    // If checkbox is being checked, add it to the array
    if (isChecked) {
      if (!updatedSelectedTypes.includes(checkboxKey)) {
        updatedSelectedTypes.push(checkboxKey);
      }
    } else {
      // If checkbox is being unchecked, remove it from the array
      updatedSelectedTypes = updatedSelectedTypes.filter(
        (type) => type !== checkboxKey
      );
    }

    // Update the state
    setSelectedTicketTypes(updatedSelectedTypes);

    // Map checkbox keys to their corresponding ticket type values
    const ticketTypeMapping = {
      ticket_type_1: "2", // E-Ticket
      ticket_type_2: "6", // External Transfer
      ticket_type_3: "4", // Mobile Link/PKPASS
      ticket_type_4: "3", // Paper Ticket
      ticket_type_5: "5", // Local Delivery
    };

    // Convert selected checkbox keys to their corresponding values
    const selectedValues = updatedSelectedTypes
      .map((key) => ticketTypeMapping[key])
      .filter((value) => value) // Remove any undefined values
      .join(","); // Join with comma

    let params = {
      ...filtersApplied,
      ticket_type_value: selectedValues || "", // Pass empty string if no selections
      page: 1,
    };

    apiCall(params);
  };

  console.log(filtersApplied, "ooooooooo");
  // Handle column toggle
  // const handleColumnToggle = (columnKey) => {
  //   setVisibleColumns((prev) => ({
  //     ...prev,
  //     [columnKey]: !prev[columnKey],
  //   }));
  // };

  const [tabCurrencies, setTabCurrencies] = useState({});

  const handleCurrencyChange = (currencyCode, tabKey) => {
    // Update the currency for the specific tab
    setTabCurrencies((prev) => ({
      ...prev,
      [tabKey]: currencyCode,
    }));

    // Reset pagination and call API with new currency
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);

    apiCall({ currency: currencyCode, page: 1 }, true);

    // Update global currency state if needed
    setCurrency(currencyCode);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sales_currency", currencyCode);
      }
    } catch (e) {
      /* ignore storage errors */
    }
  };

  const { downloadCSV } = useCSVDownload();

  const handleDownloadCSV = async () => {
    setCsvLoader(true);
    try {
      const response = await downloadSalesCSVReport("", {
        order_status: profile,
        currency: currency,
      });
      // Check if response is successful
      if (response) {
        downloadCSV(
          response,
          `Sales_${profile}_${new Date().toISOString().slice(0, 10)}.csv`
        );
        toast.success("Report downloaded");
      } else {
        console.error("No data received from server");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Error downloading Report");
    } finally {
      setCsvLoader(false);
    }
  };

  const refreshPopupData = () => {
    if (showInfoPopup.flag) {
      getOrderDetails({
        id: showInfoPopup?.data?.[0]?.order_details?.order_id,
      });
    }
  };

  // Rehydrate currency from localStorage (persist across /sales/* route/tab changes)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sales_currency");
        if (saved && saved !== currency) {
          setCurrency(saved);
          // Refetch with saved currency so data matches UI selection
          apiCall({ currency: saved, page: 1 }, true);
        }
      }
    } catch (e) {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleClearAllFilters = async () => {
    setSelectedTicketTypes([]); // Reset to empty array
    setSortState(null); // Reset sort state
    await apiCall({}, false, false, true);
  };

  const handleSort = async (sortData) => {
    try {
      // Set loading state to provide user feedback
      setPageLoader(true);

      // Reset pagination-related states when sorting
      setCurrentPage(1);
      setHasNextPage(true);
      setSalesData([]); // Clear existing data

      // Update sort state immediately for UI feedback
      setSortState(sortData);

      // Prepare sort parameters for API call
      const sortParams = sortData
        ? {
            order_by: sortData.sortableKey,
            sort_order: sortData.sort_order,
          }
        : {
            // Clear sorting when sortData is null
            order_by: undefined,
            sort_order: undefined,
          };

      // Call API with sort parameters - remove undefined values
      const updatedFilters = {
        ...filtersApplied,
        ...sortParams,
        page: 1, // Reset to first page when sorting
      };

      // Remove undefined/null values from the filters before API call
      const cleanedFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([_, value]) => value != null)
      );

      await apiCall(cleanedFilters, false, false, false);
    } catch (error) {
      console.error("Sort error:", error);
      toast.error("Error sorting data");
    } finally {
      setPageLoader(false);
    }
  };

  const customTableComponent = () => {
    return (
      <div className="p-4 max-sm:p-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 max-sm:p-3 border-b flex flex-col sm:flex-row justify-between border-gray-200 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg max-sm:text-base font-semibold">
                {formatTabName(activeTab)} Orders ({overViewData?.orders})
              </h2>
              {hasNextPage && (
                <span className="text-sm max-sm:text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <Button
              onClick={() => handleDownloadCSV()}
              variant="primary"
              loading={csvLoader}
              classNames={{
                root: "py-[4px] justify-center cursor-pointer max-sm:text-xs max-sm:py-[6px]",
                label_: "text-[12px] max-sm:text-[11px] px-[2]",
              }}
            >
              Export to CSV
            </Button>
          </div>

          {/* StickyDataTable with sorting functionality */}
          <div className="max-h-[calc(100vh-410px)] max-sm:max-h=[calc(100vh-350px)] overflow-auto">
            <StickyDataTable
              headers={headers}
              data={listData}
              rightStickyColumns={rightStickyColumns}
              loading={pageLoader}
              onSort={handleSort}
              currentSort={sortState}
              dateFormatConfig={{
                order_date: "dateOnly",
                event_date: "dateOnly",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Global currency options (shared across tabs)
  const globalCurrencyOptions = (response?.currencyValues || []).map((c) => ({
    label: c?.code,
    value: c?.code,
  }));
console.log(filtersApplied,'filtersAppliedfiltersApplied')
  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        tabs={tabsConfig}
        initialTab={profile || "pending"}
        listItemsConfig={itemConfig}
        useHeaderV2={true}
        onAddInventory={handleAddInventory}
        addInventoryText="Add Inventory"
        // Use computed filter config ordered/filtered by salesTableFilter
        filterConfig={computedFilterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
        onColumnToggle={handleColumnToggle}
        // NEW: persist on filter reorder/toggle
        onFiltersReorder={handleFiltersReorderPersist}
        onFilterToggle={handleFilterTogglePersist}
        // NEW: handle columns reorder so the table order updates
        onColumnsReorder={handleColumnsReorderPersist}
        onCurrencyChange={handleCurrencyChange}
        selectedCurrency={currency}
        tabCurrencies={{ options: globalCurrencyOptions }}
        visibleColumns={visibleColumns}
        showSelectedFilterPills={true}
        headerV2ClassName="mb-4"
        showTabFullWidth={true}
        currentFilterValues={{ ...filtersApplied, ticket_in_hand: !!filtersApplied?.ticket_in_hand, order_status: "" }}
        loading={pageLoader}
        excludedKeys={[
          "currency",
          "page",
          "ticket_type_value",
          "order_by",
          "sort_order",
          ...(filtersApplied?.ticket_in_hand == 0 ? ["ticket_in_hand"] : []),
        ]}
        customTableComponent={customTableComponent}
        showCustomTable={true}
        onScrollEnd={handleScrollEnd}
        isDraggableColumns={true}
        isDraggableFilters={true}
        showColumnSearch={true}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
        scrollThreshold={100}
        onClearAllFilters={handleClearAllFilters}
        columnHeadersMap={columnHeadersMap}
      />
      {showLogDetailsModal?.flag && (
        <InventoryLogsInfo
          show={showLogDetailsModal?.flag}
          onClose={() =>
            setShowLogDetailsModal({
              flag: false,
              orderLogs: [],
              inventoryLogs: [],
            })
          }
          orderLogs={showLogDetailsModal?.orderLogs}
          inventoryLogs={showLogDetailsModal?.inventoryLogs}
          isLoading={showLogDetailsModal?.isLoading}
          showTabs={true} // Enable tab functionality
        />
      )}

      <OrderInfo
        show={showInfoPopup?.flag}
        data={showInfoPopup?.data}
        onClose={(showOutsideLoader) => {
          setShowInfoPopup({ flag: false, data: [] });
          if (showOutsideLoader) {
            apiCall({ page: 1 });
          }
        }}
        ticketTypesList={showInfoPopup?.ticketTypesList}
        rowData={showInfoPopup?.rowData}
        refreshPopupData={refreshPopupData}
        type="sales"
        showShimmer={showInfoPopup?.isLoading}
        mySalesPage={profile == "pending" ? false : true}
        showAttendeeUpload={profile == "confirmed" ? true : false}
        handleUploadClick={handleUploadClick}
      />

      {showUploadPopup?.show && (
        <MySalesUploadTickets
          show={showUploadPopup?.show}
          loading={showUploadPopup?.loading} // Pass loading state
          rowData={showUploadPopup?.rowData}
          matchDetails={{
            match_name: showUploadPopup?.rowData?.event,
            match_date_format: showUploadPopup?.rowData?.matchDate,
            match_time: showUploadPopup?.rowData?.matchTime,
            stadium_name: showUploadPopup?.rowData?.venue,
          }}
          rowIndex={showUploadPopup?.rowIndex}
          mySalesPage={true}
          onClose={() => {
            setShowUploadPopup({
              show: false,
              loading: false,
              rowData: null,
              rowIndex: null,
            });
          }}
        />
      )}
    </div>
  );
};

export default SalesPage;
