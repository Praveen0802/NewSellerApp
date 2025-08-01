import React, { useState } from "react";
import ukFlag from "../../../public/uk.svg";
import usFlag from "../../../public/us.svg";
import euFalg from "../../../public/eu.svg";
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
  fetchDepositHistoryMonthly,
  fetchTransactionHistoryMonthly,
  getDepositDetails,
  getLMTPayPrefill,
  getTransactionDetails,
} from "@/utils/apiHandler/request";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import Button from "../commonComponents/button";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import { getAuthToken } from "@/utils/helperFunctions";
import SelectListItem from "../tradePage/components/selectListItem";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { formatDate } from "../tradePage/components/stickyDataTable";
import ActiveFiltersBox from "../tabbedLayout/ActiveFilterBoxs";

const ReportsPage = (props) => {
  const { apiData } = props;
  const { data, deposit_history, transaction_history, countriesList } = apiData;
  const { overview } = data ?? {};

  const flagMap = {
    GBP: ukFlag,
    USD: usFlag,
    EUR: euFalg,
    AED: Flag,
  };

  const dispatch = useDispatch();
  const [toggleDropDown, setToggleDropDown] = useState(true);
  const [transactionHistory, setTransactionHistory] =
    useState(transaction_history);
  const [depositHistory, setDepositHistory] = useState(deposit_history);

  const values = overview?.map((item) => {
    return {
      icon: flagMap?.[item.currency],
      amount: item?.available_fund,
      balance: "Available Balance",
      currency: item?.currency,
      bank_account: item?.bank_account,
      // Changed from "Total Earnings" to match your UI
      // Updated keys mapping to match the Wallet Overview structure
      keys: {
        pendingDelivery: item?.pending_fund,
        pendingPayment: item?.pending_fund,
        totalRevenue: item?.total_revenue, // Using total_amount as Total Revenue
        // currency: item.currency,
        // holding: item.holding,
      },
    };
  });
  const router = useRouter();
  const [tabSwitchLoader, setTabSwitchLoader] = useState(false);
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
  const [transactionType, setTransactionType] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isPayoutEntered, setIsPayoutEntered] = useState(false);

  const tabValues = [
    { key: "Transactions", value: "transaction" },
    { key: "Wallet History", value: "wallet" },
  ];

  const handleSelectTab = (value) => {
    setTabSwitchLoader(true);
    setDateRange({ startDate: "", endDate: "" });
    setStatusFilter("");
    setTransactionType("");
    setPaymentReference("");
    setTimeout(() => {
      setTabSwitchLoader(false);
    }, 1000);
    setSelectedTab(value);
  };

  const handlePlusClick = (item) => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const handleWalletPlusClick = async (item) => {
    const { currency } = item ?? {};
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

  const handleEyeClick = async (item, transactionType) => {
    setEyeViewPopup((prev) => ({ ...prev, flag: true, isLoading: true }));

    try {
      const payload = { id: item?.id };
      const response =
        transactionType == "transaction"
          ? await getTransactionDetails(getAuthToken(), payload)
          : await getDepositDetails(getAuthToken(), payload);
      //TODO : Update the setEyeViewPopup data with the response to get Additional details
      setEyeViewPopup({
        flag: true,
        data: { ...response, transactionType: transactionType },
        isLoading: false,
      });
    } catch (error) {
      console.log("ERROR in handleEyeClick", error);
      setEyeViewPopup({
        flag: true,
        data: { ...item, transactionType: transactionType },
        isLoading: false,
      });
    }
  };

  const getStatusText = (statusCode) => {
    return statusCode;
  };

  const depositData = depositHistory?.map((list) => {
    return {
      title: list?.month,
      headers: [
        "Payment Reference",
        "Amount",
        "Payment Method",
        "Date",
        "Status",
        "",
      ],
      data: list?.transactions?.map((listItems) => {
        return {
          referenceNo: listItems?.reference_no,
          amount: listItems?.price_with_currency,
          paymentMethod: listItems?.payment_transfer_by,
          date: formatDate(listItems?.created_date_time, "dateOnly"),
          status: getStatusText(listItems?.status_label),
          eye: true,
          id: listItems?.id,
        };
      }),
    };
  });

  const transactionData = transactionHistory?.map((list) => {
    return {
      title: list?.month,
      headers: ["Payment Reference", "Amount", "Type", "Date", ""],
      data: list?.transactions?.map((listItems) => {
        return {
          referenceNo: listItems?.reference_no,
          amount: listItems?.price_with_currency,
          paymentMethod: listItems?.credit_debit,
          date: formatDate(listItems?.created_date_time, "dateOnly"),
          eye: true,
          id: listItems?.id,
        };
      }),
    };
  });

  const [selectedTab, setSelectedTab] = useState("transaction");
  const transactionTab = selectedTab == "transaction";

  const filterChange = async (params) => {
    setIsLoading(true);
    const response = transactionTab
      ? await fetchTransactionHistoryMonthly("", params)
      : await fetchDepositHistoryMonthly("", params);
    if (transactionTab) {
      setTransactionHistory(response?.transaction_history);
    } else {
      setDepositHistory(response?.deposit_history);
    }
    setIsLoading(false);
  };

  const handleDateChange = (range) => {
    setDateRange(range);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(transactionTab &&
        transactionType && { payment_type: transactionType }),
      ...(!transactionTab && statusFilter && { status: statusFilter }),
      ...(range?.startDate && { start_date: range?.startDate }),
      ...(range?.endDate && { end_date: range?.endDate }),
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };
  const handleInputChange = (e, key, type) => {
    const value = e.target.value;
    setPaymentReference(value);
  };

  const handleInputBlurOrEnter = (e, isBlur = false) => {
    if (!isBlur && e.key !== "Enter") return;
    setIsPayoutEntered(true);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(transactionTab &&
        transactionType && { payment_type: transactionType }),
      ...(!transactionTab && statusFilter && { status: statusFilter }),
      ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  const handleSelectChange = (e, key, type) => {
    const value = e;
    transactionTab ? setTransactionType(value) : setStatusFilter(value);
    const params = {
      ...(paymentReference && { reference_no: paymentReference }),
      ...(transactionTab && value && { payment_type: value }),
      ...(!transactionTab && value && { status: value }),
      ...(dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(dateRange?.endDate && { end_date: dateRange?.endDate }),
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  // Helper function to get status/type label from value
  const getFilterLabel = (value, isTransaction = false) => {
    if (isTransaction) {
      // Transaction type labels
      return value; // CREDIT/DEBIT are already readable
    } else {
      // Status labels
      const statusMap = {
        1: "Approved",
        2: "Pending",
        3: "Rejected",
      };
      return statusMap[value] || value;
    }
  };

  // Create active filters object for ActiveFiltersBox
  const getActiveFilters = () => {
    const filters = {};

    if (paymentReference && isPayoutEntered) {
      // store the payment reference in ref
      filters.paymentReference = paymentReference;
    }

    if (transactionTab && transactionType) {
      filters.transactionType = getFilterLabel(transactionType, true);
    }

    if (!transactionTab && statusFilter) {
      filters.status = getFilterLabel(statusFilter, false);
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      filters.dateRange = `${dateRange.startDate} to ${dateRange.endDate}`;
    }

    return filters;
  };

  // Handle filter changes from ActiveFiltersBox
  const handleFilterChange = (filterKey, filterValue, allFilters) => {
    switch (filterKey) {
      case "paymentReference":
        setPaymentReference("");
        setIsPayoutEntered(false);
        break;
      case "transactionType":
        setTransactionType("");
        break;
      case "status":
        setStatusFilter("");
        break;
      case "dateRange":
        setDateRange({ startDate: "", endDate: "" });
        break;
      case "clearAll":
        setPaymentReference("");
        setTransactionType("");
        setStatusFilter("");
        setDateRange({ startDate: "", endDate: "" });
        break;
      default:
        break;
    }

    // Trigger filter change with cleared values
    const params = {
      ...(filterKey !== "paymentReference" &&
        filterKey !== "clearAll" &&
        paymentReference && { reference_no: paymentReference }),
      ...(filterKey !== "transactionType" &&
        filterKey !== "clearAll" &&
        transactionTab &&
        transactionType && { payment_type: transactionType }),
      ...(filterKey !== "status" &&
        filterKey !== "clearAll" &&
        !transactionTab &&
        statusFilter && { status: statusFilter }),
      ...(filterKey !== "dateRange" &&
        filterKey !== "clearAll" &&
        dateRange?.startDate && { start_date: dateRange?.startDate }),
      ...(filterKey !== "dateRange" &&
        filterKey !== "clearAll" &&
        dateRange?.endDate && { end_date: dateRange?.endDate }),
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    filterChange(filteredParams);
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setPaymentReference("");
    setTransactionType("");
    setStatusFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setIsPayoutEntered(false);

    // Trigger filter change with no filters
    filterChange({});
  };

  return (
    <div className="bg-[#F5F7FA] w-full h-full flex flex-col overflow-auto">
      {/* Account Balance Section */}
      <div className="bg-white flex border-b-[1px] border-[#eaeaf1] justify-end px-3 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Button
            type="primary"
            classNames={{
              root: "px-2 my-[8px] md:px-3 py-1.5 md:py-2",
              label_: "text-xs md:text-sm font-medium",
            }}
            onClick={() => {
              handlePlusClick();
            }}
            label="Add Deposit"
          />
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
            {values?.map((item, index) => (
              <ViewComponent
                key={index}
                onClick={handleWalletPlusClick}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Section - Now scrollable as part of the main page */}
      <div className="p-3 md:p-4 mobile:p-2 flex-grow">
        <div className="flex flex-col h-full bg-white">
          {/* Tab Navigation */}
          <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 pt-3 md:pt-4 border-b-[1px] border-[#eaeaf1] overflow-x-auto mobile:gap-2 mobile:px-2 flex-shrink-0">
            {tabValues?.map((item, index) => (
              <p
                key={index}
                onClick={() => handleSelectTab(item?.value)}
                className={`${
                  selectedTab == item?.value
                    ? "text-[#343432] border-b-[1px] border-[#0137D5]"
                    : "text-[#7D82A4]"
                } text-[14px] md:text-[16px] mobile:text-[12px] font-medium pb-2 cursor-pointer whitespace-nowrap`}
              >
                {item?.key}
              </p>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-3 md:p-4 mobile:p-2 flex flex-col gap-4">
            {/* Search and Filter Section - Improved mobile responsiveness */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-[60%] mobile:gap-2 flex-shrink-0">
              {/* Search input - Full width on mobile */}
              <div className="border-[1px] flex gap-2 items-center px-2 py-[6px] w-full sm:w-[50%] border-[#DADBE5] rounded-md">
                <IconStore.search className="size-4 stroke-[#130061] stroke-4" />
                <input
                  type="text"
                  placeholder="Search transactions"
                  onChange={(e) => {
                    setPaymentReference(e.target.value);
                  }}
                  value={paymentReference}
                  onBlur={(e) => handleInputBlurOrEnter(e, true)}
                  onKeyPress={(e) => handleInputBlurOrEnter(e)}
                  className="outline-none text-[#808082] placeholder:text-[#808082]  text-xs sm:text-sm  w-full"
                />
              </div>

              {/* Select and Date Range - Full width containers on mobile */}
              {!transactionTab && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <FloatingSelect
                    label={
                      !transactionTab
                        ? "Transaction status"
                        : "Transaction type"
                    }
                    options={
                      !transactionTab
                        ? [
                            { value: "1", label: "Approved" },
                            { value: "2", label: "Pending" },
                            { value: "3", label: "Rejected" },
                          ]
                        : [
                            { value: "CREDIT", label: "CREDIT" },
                            { value: "DEBIT", label: "DEBIT" },
                          ]
                    }
                    selectedValue={
                      transactionTab ? transactionType : statusFilter
                    }
                    keyValue="transactionType"
                    className="!w-full sm:!w-[50%]"
                    onSelect={handleSelectChange}
                    paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                  />
                  <FloatingDateRange
                    id="transactionDate"
                    name="transactionDate"
                    keyValue="transactionDate"
                    parentClassName="!w-full sm:!w-[50%]"
                    label="Transaction date"
                    className="!py-[8px] !px-[16px] mobile:text-xs"
                    value={dateRange}
                    onChange={handleDateChange}
                  />
                </div>
              )}
            </div>

            {/* Active Filters Box */}
            <ActiveFiltersBox
              activeFilters={getActiveFilters()}
              onFilterChange={handleFilterChange}
              onClearAllFilters={handleClearAllFilters}
              currentTab={selectedTab}
            />

            {/* Table Section */}
            <div className="flex-grow  mb-[10%]">
              {tabSwitchLoader ? (
                <div className="flex w-full h-full justify-center items-center">
                  <Spinner />
                </div>
              ) : (
                <CollapsablePaymentTable
                  sections={
                    selectedTab == "transaction" ? transactionData : depositData
                  }
                  selectedTab={selectedTab}
                  onRowClick={handleEyeClick}
                  isLoading={isLoading}
                  tableType="reports"
                />
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

export default ReportsPage;
