import { useEffect, useState } from "react";
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
} from "@/utils/apiHandler/request";
import { Clock, Eye, Upload } from "lucide-react";
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
    { key: "order_status_label", label: "Order Status" },
    { key: "delivery_status_label", label: "Delivery Status" },
    {
      key: "row",
      label: "Row",
      sortable: true,
      sortableKey: "row",
    },
    { key: "days_to_event", label: "Days to Event" },
  ];

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

  // Helper function to safely format tab name
  const formatTabName = (tabKey) => {
    if (!tabKey || typeof tabKey !== "string") {
      return "Pending";
    }
    return (
      tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/[-_]/g, " ")
    );
  };

  const listData = salesData?.map((item) => ({
    ...item,
  }));

  // Filter headers based on visibility
  const headers = allHeaders.filter((header) => visibleColumns[header.key]);

  const getOrderDetails = async (item) => {
    setShowInfoPopup((prev) => {
      return {
        ...prev,
        flag: true,
        isLoading: true,
      };
    });

    const salesData = await fetchSalesOrderDetails("", {
      booking_id: item?.order_id?.replace("1BX", ""),
    });
    const ticketTypes = await getTicketTypes();
    const ticketTypesList = ticketTypes?.ticket_types?.map((list) => ({
      label: list?.name,
      value: list?.id,
    }));
    console.log("salesData", salesData);

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
      booking_id: item?.order_id?.replace("1BX", ""),
    });
    const inventoryLogs = await fetchSalesInventoryLogs("", {
      ticket_id: item?.order_id?.replace("1BX", ""),
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

      // Check different possible response structures
      let ticketDetails = [attendee];

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
    return salesCount?.find((item) => item.status === status)?.orders || 0;
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
      count: getCountByStatus("pending"),
      route: "/sales/pending",
      amount: getAmountByStatus("pending"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Awaiting Delivery",
      key: "confirmed",
      count: getCountByStatus("confirmed"),
      route: "/sales/confirmed",
      amount: getAmountByStatus("confirmed"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Delivered",
      key: "delivered",
      count: getCountByStatus("delivered"),
      route: "/sales/delivered",
      amount: getAmountByStatus("delivered"),
      currencyDropdown: true,
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Completed",
      key: "completed",
      count: getCountByStatus("completed"),
      route: "/sales/completed",
      amount: getAmountByStatus("completed"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Cancelled",
      key: "cancelled",
      count: getCountByStatus("cancelled"),
      route: "/sales/cancelled",
      amount: getAmountByStatus("cancelled"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Replaced",
      key: "replaced",
      count: getCountByStatus("replaced"),
      route: "/sales/replaced",
      amount: getAmountByStatus("replaced"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
  ];

  const activeTabConfig = tabsConfig.find(tab => tab.key === activeTab);


  // Updated itemConfig with disabled property
  const itemConfig = {
    [profile]: [
      {
        name: (activeTabConfig?.name === "Delivered" || activeTab === "delivered"? "Delivery": activeTabConfig?.name || activeTab) +" Revenue",
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
        isChecked: selectedTicketType === "ticket_type_1",
        disabled: overViewData?.e_tickets_count === 0, // Disable if count is 0
      },
      {
        name: "External Transfer",
        value: overViewData?.external_transfer_count,
        showCheckbox: true,
        key: "ticket_type_2",
        isChecked: selectedTicketType === "ticket_type_2",
        disabled: overViewData?.external_transfer_count === 0, // Disable if count is 0
      },
      {
        name: "Mobile Link/PKPASS",
        value: overViewData?.mobile_ticket_count,
        showCheckbox: true,
        key: "ticket_type_3",
        isChecked: selectedTicketType === "ticket_type_3",
        disabled: overViewData?.mobile_ticket_count === 0, // Disable if count is 0
      },
      {
        name: "Paper Ticket",
        value: overViewData?.paper_ticket_count,
        showCheckbox: true,
        key: "ticket_type_4",
        isChecked: selectedTicketType === "ticket_type_4",
        disabled: overViewData?.paper_ticket_count === 0, // Disable if count is 0
      },
      {
        name: "Local Delivery",
        value: overViewData?.local_delivery_count,
        showCheckbox: true,
        key: "ticket_type_5",
        isChecked: selectedTicketType === "ticket_type_5",
        disabled: overViewData?.local_delivery_count === 0, // Disable if count is 0
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
        parentClassName: "!w-[300px]",
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
        parentClassName: "!w-[15%]",
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
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "checkbox",
        name: "ticket_in_hand",
        label: "Tickets In Hand",
        value: filtersApplied?.ticket_in_hand || false,
        parentClassName: " !w-[15%] ",
        className:
          "!py-[3px] !px-[12px] pr-[20px] w-full text-xs sm:text-[10px] lg:text-xs",
        labelClassName:
          "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
        hideFromTable: true,
      },

      {
        type: "date",
        name: "orderDate",
        singleDateMode: false,
        value: filtersApplied?.orderDate,
        label: "Order Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "delivery_date",
        singleDateMode: false,
        label: "Delivery Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "event_Date",
        singleDateMode: false,
        label: "Event Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },

      // {
      //   type: "select",
      //   name: "tournament",
      //   label: "Tournament",
      //   value: filtersApplied?.tournament,
      //   options: tournamentOptions,
      //   parentClassName: "!w-[15%]",
      //   className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
      //   labelClassName: "!text-[11px]",
      // },

      // {
      //   type: "select",
      //   name: "order_status",
      //   label: "Order Status",
      //   value: filtersApplied?.order_status,
      //   options: [
      //     { value: "paid", label: "Paid" },
      //     { value: "completed", label: "Completed" },
      //   ],
      //   parentClassName: "!w-[12%]",
      //   className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      //   labelClassName: "!text-[11px]",
      // },
      // {
      //   type: "select",
      //   name: "payment_status",
      //   label: "Payment Status",
      //   value: filtersApplied?.payment_status,
      //   options: [
      //     { value: "paid", label: "Paid" },
      //     { value: "unpaid", label: "Unpaid" },
      //   ],
      //   parentClassName: "!w-[12%]",
      //   className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      //   labelClassName: "!text-[11px]",
      // },
      {
        type: "select",
        value: filtersApplied?.category,
        name: "category",
        label: "Category",
        options: response?.salesFilter?.data?.categories?.map((type) => ({
          value: type?.id,
          label: type?.name,
        })),
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItems([]);
    setSelectedTicketType(""); // Clear ticket type selection when changing tabs
    // Reset pagination when changing tabs
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);
  };

  useEffect(() => {
    const currentTicketTypeValue = filtersApplied?.ticket_type_value;

    if (!currentTicketTypeValue) {
      setSelectedTicketType("");
    } else {
      // Map ticket_type_value back to ticket_type key
      const typeMapping = {
        2: "ticket_type_1",
        6: "ticket_type_2",
        4: "ticket_type_3",
        3: "ticket_type_4",
        5: "ticket_type_5",
      };

      setSelectedTicketType(typeMapping[currentTicketTypeValue] || "");
    }
  }, [filtersApplied?.ticket_type_value]);

  const handleFilterChange = async (filterKey, value) => {
    // Reset sort state when filters change (optional)
    setSortState(null);

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
        event_date_from: value?.startDate,
        event_date_to: value?.endDate,
        page: 1,
      };
    } else if (filterKey == "ticket_in_hand") {
      params = {
        ...params,
        [filterKey]: value ? 1 : 0,
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

  const handleCheckboxToggle = (checkboxKey, isChecked, allCheckboxValues) => {
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

    let params = {};

    // If the same checkbox is clicked again, uncheck it
    if (selectedTicketType === checkboxKey && isChecked) {
      setSelectedTicketType("");
      params = {
        ...filtersApplied,
        ticket_type_value: "",
        page: 1,
      };
    } else {
      // Set new selection
      setSelectedTicketType(checkboxKey);

      if (checkboxKey === "ticket_type_1") {
        params = {
          ...filtersApplied,
          ticket_type_value: isChecked ? "2" : "",
          page: 1,
        };
      } else if (checkboxKey === "ticket_type_2") {
        params = {
          ...filtersApplied,
          ticket_type_value: isChecked ? "6" : "",
          page: 1,
        };
      } else if (checkboxKey === "ticket_type_3") {
        params = {
          ...filtersApplied,
          ticket_type_value: isChecked ? "4" : "",
          page: 1,
        };
      } else if (checkboxKey === "ticket_type_4") {
        params = {
          ...filtersApplied,
          ticket_type_value: isChecked ? "3" : "",
          page: 1,
        };
      } else if (checkboxKey === "ticket_type_5") {
        params = {
          ...filtersApplied,
          ticket_type_value: isChecked ? "5" : "",
          page: 1,
        };
      } else {
        params = {
          ...filtersApplied,
          [checkboxKey]: isChecked ? 1 : 0,
          page: 1,
        };
      }
    }

    apiCall(params);
  };
  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

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
  };


  const { downloadCSV } = useCSVDownload();

  const handleDownloadCSV = async () => {
    setCsvLoader(true);
    try {
      const response = await downloadSalesCSVReport({
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
        toast.error("No data received");
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
      getOrderDetails({ bg_id: showInfoPopup?.bg_id });
    }
  };
  const handleClearAllFilters = async () => {
    setSelectedTicketType("");
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
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b flex justify-between border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {formatTabName(activeTab)} Orders ({listData.length})
              </h2>
              {hasNextPage && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <Button
              onClick={() => handleDownloadCSV()}
              variant="primary"
              loading={csvLoader}
              classNames={{
                root: "py-[4px] justify-center cursor-pointer",
                label_: "text-[12px] px-[2]",
              }}
            >
              Export to CSV
            </Button>
          </div>

          {/* StickyDataTable with sorting functionality */}
          <div className="">
            <StickyDataTable
              headers={headers}
              data={listData}
              rightStickyColumns={rightStickyColumns}
              loading={pageLoader}
              onSort={handleSort} // Add sort handler
              currentSort={sortState} // Add current sort state
              // Add date format config if needed
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        tabs={tabsConfig}
        initialTab={profile || "pending"}
        listItemsConfig={itemConfig}
        useHeaderV2={true}
        filterConfig={filterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
        onColumnToggle={handleColumnToggle}
        onCurrencyChange={handleCurrencyChange}
        selectedCurrency={currency}
        tabCurrencies={tabCurrencies}
        visibleColumns={visibleColumns}
        showSelectedFilterPills={true}
        headerV2ClassName="mb-4"
        showTabFullWidth={true}
        currentFilterValues={{ ...filtersApplied, order_status: "" }}
        loading={pageLoader}
        excludedKeys={[
          "currency",
          "page",
          "ticket_type_value",
          "order_by", // Add sorting parameter
          "sort_order", // Add sorting parameter
          ...(filtersApplied?.ticket_in_hand == 0 ? ["ticket_in_hand"] : []),
        ]}
        customTableComponent={customTableComponent}
        showCustomTable={true}
        // NEW PROPS FOR SCROLL HANDLING
        onScrollEnd={handleScrollEnd}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
        scrollThreshold={100}
        onClearAllFilters={handleClearAllFilters}
      />
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
