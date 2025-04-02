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
  getTransactionDetails,
} from "@/utils/apiHandler/request";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import Button from "../commonComponents/button";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingDateRange from "../commonComponents/dateRangeInput";

const ReportsPage = (props) => {
  const { apiData } = props;
  const { account_data, deposit_history, transaction_history, countriesList } =
    apiData;
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

  const [filterValues, setFilterValues] = useState({
    paymentReference: "",
    creditType: "",
    dateRange: "",
  });

  const values = account_data?.map((item) => {
    return {
      icon: flagMap[item.currency],
      amount: item.balance_amount,
      balance: "Available Balance",
      keys: {
        pendingDelivery: item?.pending_orders,
        pendingPayment: item?.pending_amount,
        confirmedOrder: item?.confirmed_orders,
        currency: item?.currency,
      },
    };
  });

  const [tabSwitchLoader, setTabSwitchLoader] = useState(false);
  const [payOutPopup, setPayOutPopup] = useState({ flag: false, data: "" });
  const [eyeViewPopup, setEyeViewPopup] = useState({ flag: false, data: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

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
    const currency = item?.keys?.currency;
    const response = await fetchBankAccountDetails("", "", "GET", "", {
      currency: currency,
    });
    setPayOutPopup({
      flag: true,
      data: { ...response[0], currency: currency },
    });
  };

  const handleEyeClick = async (item, transactionType) => {
    const payload = { id: item?.id };
    const response =
      transactionType == "transaction"
        ? await getTransactionDetails("", payload)
        : await getDepositDetails("", payload);
    setEyeViewPopup({
      flag: true,
      data: { ...response, transactionType: transactionType },
    });
  };

  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 1:
        return "Approved";
      case 2:
        return "Pending";
      case 3:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const depositData = depositHistory?.map((list) => {
    return {
      title: list?.month,
      headers: [
        "Reference No",
        "Amount",
        "Payment Method",
        "Status",
        "Date",
        "",
      ],
      data: list?.transactions?.map((listItems) => {
        return {
          referenceNo: listItems?.reference_no,
          amount: listItems?.price_with_currency,
          paymentMethod: listItems?.payment_transfer_by,
          status: getStatusText(listItems?.status),
          date: listItems?.created_date_time,
          eye: true,
          id: listItems?.id,
        };
      }),
    };
  });

  const transactionData = transactionHistory?.map((list) => {
    return {
      title: list?.month,
      headers: ["Reference No", "Amount", "Type", "Date", ""],
      data: list?.transactions?.map((listItems) => {
        return {
          referenceNo: listItems?.reference_no,
          amount: listItems?.price_with_currency,
          paymentMethod: listItems?.credit_debit,
          date: listItems?.created_date_time,
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

  return (
    <div className="bg-[#F5F7FA] w-full h-full flex flex-col overflow-auto">
      {/* Account Balance Section */}
      <div className="bg-white flex border-b-[1px] border-[#eaeaf1] justify-end px-3 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Button
            type="blueType"
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
                    ? "text-[#0137D5] border-b-[1px] border-[#0137D5]"
                    : "text-[#7D82A4]"
                } text-[14px] md:text-[16px] mobile:text-[12px] font-medium pb-2 cursor-pointer whitespace-nowrap`}
              >
                {item?.key}
              </p>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-3 md:p-4 mobile:p-2 flex flex-col gap-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-[60%] mobile:gap-2 flex-shrink-0">
              <div className="border-[1px] flex gap-2 items-center px-2 py-[6px] w-[50%] border-[#DADBE5] rounded-md">
                <IconStore.search className="size-4 stroke-[#130061] stroke-4" />
                <input
                  type="text"
                  placeholder="search Transactions"
                  onChange={(e) => setPaymentReference(e.target.value)}
                  value={paymentReference}
                  onBlur={(e) => handleInputBlurOrEnter(e, true)}
                  onKeyPress={(e) => handleInputBlurOrEnter(e)}
                  className="outline-none placeholder:text-[#130061] placeholder:font-[300] placeholder:opacity-50 text-xs sm:text-sm text-[#130061] w-full"
                />
              </div>

              <FloatingSelect
                label={
                  !transactionTab ? "Transaction Status" : "Transaction Type"
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
                selectedValue={transactionTab ? statusFilter : transactionType}
                keyValue="transactionType"
                className="!w-[25%]"
                onSelect={handleSelectChange}
                paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-sm w-full"
              />
              <FloatingDateRange
                id="transactionDate"
                name="transactionDate"
                keyValue="transactionDate"
                parentClassName="!w-[25%]"
                label="Transaction Date"
                className="!py-[6px] !px-[16px] mobile:text-sm "
                value={dateRange}
                onChange={handleDateChange}
              />
            </div>

            {/* Table Section */}
            <div className="flex-grow">
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
      />
      <OrderViewPopup
        show={eyeViewPopup?.flag}
        onClose={() => setEyeViewPopup({ flag: false, data: "" })}
        data={eyeViewPopup?.data}
        outSideClickClose={false}
      />
    </div>
  );
};

export default ReportsPage;
