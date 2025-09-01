import React, { useState, useEffect, useCallback, useRef } from "react";
import ukFlag from "../../../public/uk.svg";
import usFlag from "../../../public/us.svg";
import euFlag from "../../../public/eu.svg";
import Flag from "../../../public/flag.svg";

import ViewComponent from "./components/viewComponent";
import CollapsablePaymentTable from "../collapsablePaymentTable";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import Spinner from "../commonComponents/spinner";
import AddPayOutPopup from "./components/addPayOutPopup";
import OrderViewPopup from "./components/orderViewPopup";
import {
  fetchBankAccountDetails,
  fetchPayoutHistoryMonthly,
  getLMTPayPrefill,
  getPayoutDetails,
  getPayoutHistoryReport,
  getPayoutOrderDetails,
  getPayoutOrderReport,
  payOutBankAccount,
  payOutHistory,
  payOutOrderHistory,
} from "@/utils/apiHandler/request";
import Button from "../commonComponents/button";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import { toast } from "react-toastify";
import { formatDate } from "../tradePage/components/stickyDataTable";
import OrderInfo from "../orderInfoPopup";
import DownloadButton from "../DownloadButton";
import useCSVDownload from "@/Hooks/useCsvDownload";
import ActiveFiltersBox from "../tabbedLayout/ActiveFilterBoxs";
import TransactionDetailsPopup from "./components/TransactionDetails";

const PayoutPage = (props) => {
  const { apiData } = props;
  const { payout_overview, payoutHistory, payoutOrders, countriesList } =
    apiData;

  const flagMap = {
    GBP: ukFlag,
    USD: usFlag,
    EUR: euFlag,
    AED: Flag,
  };

  console.log(apiData, "apiDataapiData");

  const [toggleDropDown, setToggleDropDown] = useState(true);
  const [selectedTab, setSelectedTab] = useState("payout");
  const [currentHistoryData, setCurrentHistoryData] = useState(
    payoutHistory?.payout_history || []
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [meta, setMeta] = useState(
    selectedTab === "payout" ? payoutHistory?.meta : payoutOrders?.meta
  );

  const [payOutPopup, setPayOutPopup] = useState({
    flag: false,
    data: "",
    isLoading: false,
  });
  const [eyeViewPopup, setEyeViewPopup] = useState({
    flag: false,
    data: "",
    isLoading: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // Scroll detection ref
  const scrollContainerRef = useRef(null);

  // Update history data when tab changes
  useEffect(() => {
    if (selectedTab === "payout") {
      setCurrentHistoryData(payoutHistory?.payout_history || []);
      setMeta(payoutHistory?.meta);
    } else {
      setCurrentHistoryData(payoutOrders?.payout_history || []);
      setMeta(payoutOrders?.meta);
    }

    // Reset pagination and filters when switching tabs
    setCurrentPage(1);
    setPaymentReference("");
    setStatusFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setHasMoreData(true);
  }, [selectedTab, payoutHistory, payoutOrders]);

  // Update hasMoreData based on meta
  useEffect(() => {
    if (meta) {
      setHasMoreData(meta.current_page < meta.last_page);
    }
  }, [meta]);

  // Function to load more data
  const loadMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params = {
        page: nextPage,
        ...(paymentReference && {
          [selectedTab === "payout" ? "payout_reference" : "reference"]:
            paymentReference,
        }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
        ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null)
      );

      let response;
      if (selectedTab === "payout") {
        response = await payOutHistory("", filteredParams);
      } else {
        response = await payOutOrderHistory("", filteredParams);
      }

      if (response?.payout_history?.length > 0) {
        // Append new data to existing data
        setCurrentHistoryData((prev) => [...prev, ...response.payout_history]);
        setCurrentPage(nextPage);
        setMeta(response.meta);

        // Check if there's more data
        setHasMoreData(response.meta.current_page < response.meta.last_page);
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Error loading more data:", error);
      toast.error("Failed to load more data. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    selectedTab,
    currentPage,
    isLoadingMore,
    hasMoreData,
    paymentReference,
    statusFilter,
    dateRange,
  ]);
  // Scroll event handler
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when user scrolls to 90% of the content
      if (scrollPercentage >= 0.9 && hasMoreData && !isLoadingMore) {
        loadMoreData();
      }
    },
    [hasMoreData, isLoadingMore, loadMoreData]
  );

  // Attach scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Transform payout overview data for ViewComponent
  const overviewValues = payout_overview?.map((item) => {
    return {
      icon: flagMap?.[item.currency],
      amount: item?.total_amount,
      balance: "Available Balance",
      keys: {
        pendingDelivery:
          item?.pending_delivery?.total_ticket_amount_with_symbol,
        pendingPayment: item?.pending_payout?.total_ticket_amount_with_symbol,
        totalRevenue: item?.total_amount,
        currency: item?.currency,
        holding: item?.holding,
      },
    };
  });

  const handleRequestPayout = async (item) => {
    const currency = item?.keys?.currency;
    setPayOutPopup((prev) => ({ ...prev, flag: true, isLoading: true }));
    await payOutBankAccount("", {
      currency: currency,
    })
      .then((response) => {
        setPayOutPopup((prev) => ({
          ...prev,
          data: { ...response?.bank_account?.[0], currency: currency },
          isLoading: false,
        }));
      })
      .catch(() => {
        toast.error("Failed to get payout account details. Please try again.");
      })
      .finally(() => {
        setPayOutPopup((prev) => ({ ...prev, isLoading: false }));
      });
  };

  const isOrderTab = selectedTab === "order";

  const handleEyeClick = async (item) => {
    try {
      setEyeViewPopup({
        flag: true,
        isLoading: true,
      });
      const { bookingNo } = item ?? {};
      const booking_id = Number(bookingNo?.replace("1BX", ""));
      if (isOrderTab) {
        const params = {
          booking_id,
        };
        const salesData = await getPayoutDetails("", params);
        console.log(salesData, "salesDatasalesData");
        setEyeViewPopup({
          flag: true,
          data: salesData?.map((list) => ({
            ...list,
            order_id_label: booking_id ?? null,
          })),
          bookingNo,
        });
        return;
      }

      const { referenceNo, id } = item ?? {};
      const transData =
        currentHistoryData
          ?.map((list) => list?.transactions)
          ?.flat()
          ?.find(
            (list) => list?.reference_no === referenceNo && list?.id === id
          ) ?? {};

      try {
        const payoutOrderDetails = await getPayoutOrderDetails("", {
          payout_id: id,
        });
        console.log(payoutOrderDetails, "payoutOrderDetailspayoutOrderDetails");
        setEyeViewPopup({
          flag: true,
          data: {
            ...transData,
            transactionType: selectedTab,
            payoutTableData: payoutOrderDetails,
          },
        });
      } catch (error) {
        toast.error("Failed to get payout order details. Please try again.");
        setEyeViewPopup({
          flag: true,
          data: { ...transData, transactionType: selectedTab },
        });
      }
    } catch (error) {
      console.log("ERROR in handleEyeClick", error);
      setEyeViewPopup({
        flag: true,
        data: { ...item, transactionType: selectedTab },
      }).finally(() => {
        setEyeViewPopup((prev) => ({ ...prev, isLoading: false }));
      });
    }
  };

  const refreshPopupData = async () => {
    if (eyeViewPopup?.flag) {
      await handleEyeClick({ bookingNo: eyeViewPopup?.bookingNo });
    }
  };

  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 0:
        return "Paid";
      case 1:
        return "Pending";
      case 2:
        return "Processing";
      case 3:
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-gray-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  console.log("currentHistoryData", currentHistoryData);

  // Transform history data for CollapsablePaymentTable based on selected tab
  const getTransformedData = () => {
    if (selectedTab === "payout") {
      return currentHistoryData?.map((list) => {
        return {
          title: list?.month,
          headers: [
            "Payment Reference",
            "To Account",
            "Amount",
            "Payout Date",
            "Expected Date",
            "Status",
            "",
          ],
          data: list?.transactions?.map((listItems) => {
            return {
              referenceNo: listItems?.reference_no,
              to_account: listItems?.to_account,
              amount: listItems?.price_with_currency,
              payoutDate: formatDate(listItems?.payout_date, "dateOnly"),
              expectedDate: formatDate(listItems?.expected_date, "dateOnly"),
              status: listItems?.status_label,
              eye: true,
              id: listItems?.id,
            };
          }),
        };
      });
    } else {
      return currentHistoryData?.map((list) => {
        return {
          title: list?.month,
          headers: [
            "Booking No",
            "Payout Number",
            "Match Name",
            "Amount",
            "Payment Date",
            "Ticket",
            "Status",
            "",
          ],
          data: list?.transactions?.map((listItems) => {
            return {
              bookingNo: listItems?.booking_no,
              payoutNo: listItems?.payout_no,
              matchName: listItems?.match_name,
              amount: listItems?.amount_with_currency,
              paymentDate:
                formatDate(listItems?.payment_date, "dateOnly") || "N/A",
              ticket: listItems?.ticket,
              status: listItems?.payout_status,
              eye: true,
              id: listItems?.booking_no,
            };
          }),
        };
      });
    }
  };

  const filterChange = async (params) => {
    setIsLoading(true);

    // Reset pagination when filtering
    setCurrentPage(1);
    setHasMoreData(true);

    try {
      const { tab, reference_no = null, ...restParams } = params ?? {};
      const payoutParamsQuery = {
        page: 1, // Always start from page 1 when filtering
        ...(reference_no && { payout_reference: reference_no }),
        ...restParams,
      };
      const orderHistoryParams = {
        page: 1, // Always start from page 1 when filtering
        ...(reference_no && { reference: reference_no }),
        ...restParams,
      };

      if (selectedTab === "payout") {
        try {
          const response = await payOutHistory("", payoutParamsQuery);
          setCurrentHistoryData(response?.payout_history || []);
          setMeta(response?.meta);
          setHasMoreData(
            response?.meta?.current_page < response?.meta?.last_page
          );
        } catch (error) {
          toast.error("Failed to get payout history. Please try again.");
        } finally {
          setIsLoading(false);
        }
        return;
      } else {
        try {
          const response = await payOutOrderHistory("", orderHistoryParams);
          setCurrentHistoryData(response?.payout_history || []);
          setMeta(response?.meta);
          setHasMoreData(
            response?.meta?.current_page < response?.meta?.last_page
          );
        } catch (error) {
          toast.error("Failed to get order history. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("Error in filterChange:", error);
      setIsLoading(false);
    }
  };

  const handleDateChange = (range) => {
    setDateRange(range);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(statusFilter && { status: statusFilter }),
      ...(range?.startDate && { start_date: range?.startDate }),
      ...(range?.endDate && { end_date: range?.endDate }),
      tab: selectedTab,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const [isPayoutEntered, setIsPayoutEntered] = useState(null);

  const handleInputBlurOrEnter = (e, isBlur = false) => {
    if (!isBlur && e.key !== "Enter") return;
    setIsPayoutEntered(e?.target?.value);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(statusFilter && { status: statusFilter }),
      ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
      tab: selectedTab,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleSelectChange = (value) => {
    setStatusFilter(value);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(value && { status: value }),
      ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
      tab: selectedTab,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const getStatusLabel = (value) => {
    const statusMap = {
      0: "Pending",
      1: "Paid",
      2: "Dispute",
      3: "Failed",
    };
    return statusMap[value] || value;
  };

  const getActiveFilters = () => {
    const filters = {};

    if (isPayoutEntered !== null) {
      filters.paymentReference = isPayoutEntered;
    }

    if (statusFilter) {
      filters.status = getStatusLabel(statusFilter);
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      filters.dateRange = `${dateRange.startDate} to ${dateRange.endDate}`;
    }

    return filters;
  };

  const handleFilterChange = (filterKey, filterValue, allFilters) => {
    switch (filterKey) {
      case "paymentReference":
        setPaymentReference("");
        setIsPayoutEntered(null);
        break;
      case "status":
        setStatusFilter("");
        break;
      case "dateRange":
        setDateRange({ startDate: "", endDate: "" });
        break;
      case "clearAll":
        setPaymentReference("");
        setStatusFilter("");
        setDateRange({ startDate: "", endDate: "" });
        break;
      default:
        break;
    }

    const params = {
      ...(filterKey !== "paymentReference" &&
        filterKey !== "clearAll" &&
        paymentReference && { reference_no: paymentReference }),
      ...(filterKey !== "status" &&
        filterKey !== "clearAll" &&
        statusFilter && { status: statusFilter }),
      ...(filterKey !== "dateRange" &&
        filterKey !== "clearAll" &&
        dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(filterKey !== "dateRange" &&
        filterKey !== "clearAll" &&
        dateRange?.endDate && { end_date: dateRange?.endDate }),
      tab: selectedTab,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleClearAllFilters = () => {
    setPaymentReference("");
    setStatusFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setIsPayoutEntered(null);
    filterChange({ tab: selectedTab });
  };

  const [csvLoader, setCsvLoader] = useState(false);
  const { downloadCSV } = useCSVDownload();

  const handleDownloadCSV = async () => {
    setCsvLoader(true);
    try {
      const response = isOrderTab
        ? await getPayoutOrderReport()
        : await getPayoutHistoryReport();
      if (response) {
        downloadCSV(
          response,
          `Seller_${isOrderTab ? "PayoutOrders" : "PayoutReports"}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`
        );
        toast.success(`${isOrderTab ? "Order" : "Payout"} report downloaded`);
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

  return (
    <div className="bg-[#F5F7FA] w-full h-full flex flex-col overflow-auto pb-[50px]">
      {/* Payout Overview Section */}
      <div className="bg-white flex border-b-[1px] border-[#eaeaf1] justify-end px-3 py-3 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setToggleDropDown(!toggleDropDown)}
            className="border-l-[1px] cursor-pointer border-[#eaeaf1] h-full pl-4 pr-2"
          >
            {!toggleDropDown ? (
              <IconStore.chevronDown className="size-4" />
            ) : (
              <IconStore.chevronUp className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`bg-white overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${
          toggleDropDown ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 md:px-[24px] py-4 md:py-[20px]">
          <div className="md:grid  md:grid-cols-4 gap-4 max-md:flex max-md:items-center max-md:overflow-auto hideScrollbar">
            {overviewValues?.map((item, index) => (
              <ViewComponent
                key={index}
                onClick={handleRequestPayout}
                item={item}
                isPayout={true}
              />
            ))}
          </div>
        </div>
      </div>

      {/* History Section with Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="p-3 md:p-4 mobile:p-2 flex-grow max-h-[calc(100vh-450px)] overflow-auto"
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header with Tabs */}
          <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 pt-3 md:pt-4 border-b-[1px] border-[#eaeaf1] overflow-x-auto mobile:gap-2 mobile:px-2 flex-shrink-0">
            <button
              onClick={() => handleTabChange("payout")}
              className={`text-[14px] md:text-[16px] mobile:text-[12px] font-medium pb-2 whitespace-nowrap transition-colors duration-200 ${
                selectedTab === "payout"
                  ? "text-[#343432] border-b-[1px] border-[#0137D5]"
                  : "text-gray-500 hover:text-[#343432]"
              }`}
            >
              Payout History
            </button>
            <button
              onClick={() => handleTabChange("order")}
              className={`text-[14px] md:text-[16px] mobile:text-[12px] font-medium pb-2 whitespace-nowrap transition-colors duration-200 ${
                selectedTab === "order"
                  ? "text-[#343432] border-b-[1px] border-[#0137D5]"
                  : "text-gray-500 hover:text-[#343432]"
              }`}
            >
              Order History
            </button>
          </div>

          {/* Content Area */}
          <div className="p-3 md:p-4 mobile:p-2 flex flex-col gap-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-[60%] mobile:gap-2 flex-shrink-0">
              <div className="border-[1px] flex gap-2 items-center px-2 py-[6px] w-full sm:w-[50%] border-[#DADBE5] rounded-md">
                <IconStore.search className="size-4 stroke-[#130061] stroke-4" />
                <input
                  type="text"
                  placeholder={
                    selectedTab === "payout"
                      ? "Search payouts"
                      : "Search orders"
                  }
                  onChange={(e) => setPaymentReference(e.target.value)}
                  value={paymentReference}
                  onBlur={(e) => handleInputBlurOrEnter(e, true)}
                  onKeyPress={(e) => handleInputBlurOrEnter(e)}
                  className="outline-none text-[#808082] placeholder:text-[#808082] text-xs sm:text-sm w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {selectedTab != "payout" && (
                  <FloatingSelect
                    label={
                      selectedTab === "payout"
                        ? "Payout status"
                        : "Order status"
                    }
                    options={[
                      { value: "1", label: "Paid" },
                      { value: "0", label: "Pending" },
                      { value: "2", label: "Dispute" },
                    ]}
                    selectedValue={statusFilter}
                    keyValue={
                      selectedTab === "payout" ? "payoutStatus" : "status"
                    }
                    className="!w-full sm:!w-[50%]"
                    onSelect={handleSelectChange}
                    paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                  />
                )}
              </div>
            </div>

            {/* Active Filters Box */}
            <ActiveFiltersBox
              activeFilters={getActiveFilters()}
              onFilterChange={handleFilterChange}
              onClearAllFilters={handleClearAllFilters}
              currentTab={selectedTab}
            />

            {/* Table Section */}
            <div className="flex-grow">
              <CollapsablePaymentTable
                sections={getTransformedData()}
                selectedTab={selectedTab}
                onRowClick={handleEyeClick}
                isLoading={isLoading}
                tableType={selectedTab}
              />

              {/* Loading indicator for pagination */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4">
                  <Spinner />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading more...
                  </span>
                </div>
              )}

              {/* End of data indicator */}
              {!hasMoreData && currentHistoryData.length > 0 && (
                <div className="flex justify-center items-center py-4">
                  <span className="text-sm text-gray-500">
                    No more data to load
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      <AddPayOutPopup
        show={payOutPopup?.flag}
        onClose={() => {
          setPayOutPopup({ flag: false, data: "" });
        }}
        item={payOutPopup?.data}
        countriesList={countriesList}
        showShimmer={payOutPopup?.isLoading}
      />

      <div className="fixed bottom-0 w-full left-0 right-0 z-50 bg-[white] py-[16px] px-[16px] border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-end">
          <DownloadButton
            label={`Download ${isOrderTab ? "Order" : "Payout"} Report`}
            loader={csvLoader}
            onClick={handleDownloadCSV}
            disabled={csvLoader}
            className="min-w-[200px]"
          />
        </div>
      </div>

      {isOrderTab ? (
        <>
          {eyeViewPopup?.flag && (
            <OrderInfo
              show={eyeViewPopup?.flag}
              data={eyeViewPopup?.data}
              onClose={() => setEyeViewPopup({ flag: false, data: "" })}
              refreshPopupData={refreshPopupData}
              type="sales"
              showShimmer={eyeViewPopup?.isLoading}
            />
          )}
        </>
      ) : (
        <TransactionDetailsPopup
          show={eyeViewPopup?.flag}
          data={eyeViewPopup?.data}
          onClose={() => setEyeViewPopup({ flag: false, data: "" })}
          refreshPopupData={refreshPopupData}
          showShimmer={eyeViewPopup?.isLoading}
        />
      )}
    </div>
  );
};

export default PayoutPage;
