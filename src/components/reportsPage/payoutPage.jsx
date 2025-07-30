import React, { useState, useEffect } from "react";
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
  getLMTPayPrefill, // You'll need to create this API function
  getPayoutDetails, // You'll need to create this API function
} from "@/utils/apiHandler/request";
import Button from "../commonComponents/button";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import { getAuthToken } from "@/utils/helperFunctions";
import { toast } from "react-toastify";

const PayoutPage = (props) => {
  const { apiData } = props;

  const { payout_overview, payoutHistory, payoutOrders, countriesList } =
    apiData;

  console.log("payout_overview", payout_overview);

  const flagMap = {
    GBP: ukFlag,
    USD: usFlag,
    EUR: euFlag,
    AED: Flag,
  };

  const [toggleDropDown, setToggleDropDown] = useState(true);
  const [selectedTab, setSelectedTab] = useState("payout"); // New state for tab selection
  const [currentHistoryData, setCurrentHistoryData] = useState(
    payoutHistory?.payout_history || []
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

  // Update history data when tab changes
  useEffect(() => {
    if (selectedTab === "payout") {
      setCurrentHistoryData(payoutHistory?.payout_history || []);
    } else {
      setCurrentHistoryData(payoutOrders?.payout_history || []);
    }
    // Reset filters when switching tabs
    setPaymentReference("");
    setStatusFilter("");
    setDateRange({ startDate: "", endDate: "" });
  }, [selectedTab, payoutHistory, payoutOrders]);

  // Transform payout overview data for ViewComponent - Updated to match Wallet Overview
  const overviewValues = payout_overview?.map((item) => {
    return {
      icon: flagMap?.[item.currency],
      amount: item?.total_amount, // This will show as "Available Balance"
      balance: "Available Balance", // Changed from "Total Earnings" to match your UI
      // Updated keys mapping to match the Wallet Overview structure
      keys: {
        pendingDelivery:
          item?.pending_delivery?.total_ticket_amount_with_symbol,
        pendingPayment: item?.pending_payout?.total_ticket_amount_with_symbol,
        totalRevenue: item?.total_amount, // Using total_amount as Total Revenue
        currency: item?.currency,
        holding: item?.holding,
      },
    };
  });

  // const handleRequestPayout = async (item) => {
  //   const currency = item?.keys?.currency;
  //   setPayOutPopup((prev) => ({ ...prev, flag: true, isLoading: true }));
  //   const response = await fetchBankAccountDetails("", "", "GET", "", {
  //     currency: currency,
  //   })
  //     .then((response) => {
  //       setPayOutPopup({
  //         flag: true,
  //         data: { ...response[0], currency: currency },
  //       });
  //     })
  //     .catch(() => {
  //       toast.error("Failed to get payout account details. Please try again.");
  //     })
  //     .finally(() => {
  //       setPayOutPopup((prev) => ({ ...prev, isLoading: false }));
  //     });
  // };

  const handleRequestPayout = async (item) => {
    const currency = item?.keys?.currency;
    setPayOutPopup((prev) => ({ ...prev, flag: true, isLoading: true }));
    await getLMTPayPrefill("", "", "GET", "", {
      currency,
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

  const handleEyeClick = async (item) => {
    try {
      const payload = { id: item?.id };

      setEyeViewPopup({
        flag: true,
        data: { ...item, transactionType: selectedTab },
      });
    } catch (error) {
      console.log("ERROR in handleEyeClick", error);
      setEyeViewPopup({
        flag: true,
        data: { ...item, transactionType: selectedTab },
      });
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
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Transform history data for CollapsablePaymentTable based on selected tab
  const getTransformedData = () => {
    if (selectedTab === "payout") {
      // Payout History format
      return currentHistoryData?.map((list) => {
        return {
          title: list?.month,
          headers: [
            "Reference No",
            "Amount",
            "Status",
            "Payout Date",
            "Expected Date",
            "",
          ],
          data: list?.transactions?.map((listItems) => {
            const status = getStatusText(listItems?.status);
            return {
              referenceNo: listItems?.reference_no,
              amount: listItems?.price_with_currency,
              status: status,
              payoutDate: listItems?.payout_date,
              expectedDate: listItems?.expected_date,
              eye: true,
              id: listItems?.id,
            };
          }),
        };
      });
    } else {
      // Order History format
      return currentHistoryData?.map((list) => {
        return {
          title: list?.month,
          headers: [
            "Booking No",
            "Match Name",
            "Amount",
            "Status",
            "Payment Date",
            "Ticket",
            "",
          ],
          data: list?.transactions?.map((listItems) => {
            const status = getStatusText(listItems?.status);
            return {
              bookingNo: listItems?.booking_no,
              matchName: listItems?.match_name,
              amount: listItems?.amount_with_currency,
              status: status,
              paymentDate: listItems?.payment_date || "N/A",
              ticket: listItems?.ticket,
              eye: true,
              id: listItems?.booking_no, // Using booking_no as ID for orders
            };
          }),
        };
      });
    }
  };

  const filterChange = async (params) => {
    setIsLoading(true);
    try {
      // Uncomment when API is ready
      // const response = await fetchPayoutHistoryMonthly("", params);
      // if (selectedTab === "payout") {
      //   setCurrentHistoryData(response?.payoutHistory?.payout_history);
      // } else {
      //   setCurrentHistoryData(response?.payoutOrders?.payout_history);
      // }

      // For now, we'll just simulate loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
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
      tab: selectedTab, // Include current tab in params
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleInputBlurOrEnter = (e, isBlur = false) => {
    if (!isBlur && e.key !== "Enter") return;

    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(statusFilter && { status: statusFilter }),
      ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
      tab: selectedTab, // Include current tab in params
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
      tab: selectedTab, // Include current tab in params
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-full flex flex-col overflow-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mobile:grid-cols-1 mobile:gap-3">
            {overviewValues?.map((item, index) => (
              <ViewComponent
                key={index}
                onClick={handleRequestPayout}
                item={item}
                isPayout={true} // Add this prop to differentiate payout view
              />
            ))}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="p-3 md:p-4 mobile:p-2 flex-grow">
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
              {/* Search input */}
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

              {/* Select and Date Range */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <FloatingSelect
                  label={
                    selectedTab === "payout" ? "Payout status" : "Order status"
                  }
                  options={[
                    { value: "0", label: "Paid" },
                    { value: "1", label: "Pending" },
                    { value: "2", label: "Processing" },
                    { value: "3", label: "Failed" },
                  ]}
                  selectedValue={statusFilter}
                  keyValue={
                    selectedTab === "payout" ? "payoutStatus" : "orderStatus"
                  }
                  className="!w-full sm:!w-[50%]"
                  onSelect={handleSelectChange}
                  paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                />
                <FloatingDateRange
                  id={selectedTab === "payout" ? "payoutDate" : "orderDate"}
                  name={selectedTab === "payout" ? "payoutDate" : "orderDate"}
                  keyValue={
                    selectedTab === "payout" ? "payoutDate" : "orderDate"
                  }
                  parentClassName="!w-full sm:!w-[50%]"
                  label={
                    selectedTab === "payout" ? "Payout date" : "Order date"
                  }
                  className="!py-[8px] !px-[16px] mobile:text-xs"
                  value={dateRange}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="flex-grow mb-[8%]">
              <CollapsablePaymentTable
                sections={getTransformedData()}
                selectedTab={selectedTab}
                onRowClick={handleEyeClick}
                isLoading={isLoading}
                tableType={selectedTab}
              />
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
      <OrderViewPopup
        show={eyeViewPopup?.flag}
        onClose={() => setEyeViewPopup({ flag: false, data: "" })}
        data={eyeViewPopup?.data}
        outSideClickClose={false}
        showShimmer={eyeViewPopup?.isLoading}
      />
    </div>
  );
};

export default PayoutPage;
