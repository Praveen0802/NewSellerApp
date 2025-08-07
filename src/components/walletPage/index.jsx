import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useRef, useState } from "react";
import AvailableCard from "./components/availableCard";
import CustomSelect from "../commonComponents/customSelect";
import TransactionTable from "./components/transactionTable";
import TableContainer from "./components/tableContainer";
import TopPopupModal from "./components/topPopupModal";
import { set } from "lodash";

const WalletPage = () => {
  const accountDetails = {
    accountName: "Tixstock SA Re:Seller Fund in",
    iban: "HSGHSGAYATY989898I",
    swift: "MOYPGS",
    refernce: "22VSTS",
    note: "Please include the reference when making the bank transfer. This ensures your funds are transferred directly to your SB pay wallet",
    fundingAccount: {
      name: "first Abu Dhabi Bank",
      ticket: "Ticket Services DMCCC",
      accNo: "AEYSHJSHJHSJHS",
    },
  };
  const [activeSelected, setActiveSelected] = useState("wallet");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showAccountDetailForm, setShowAccountDetailForm] = useState(true);
  const contentRefs = useRef({});

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const handleShowAccountDetailsForm = () => {
    setShowAccDetailForm(true);
  };

  const walletValues = [
    { name: "Wallet", count: "1,234.00", key: "wallet" },
    { name: "Deposit", count: "1,234.00", key: "deposit" },
  ];

  const fundAvailablity = [
    {
      title: "Available funds",
      amount: "1,234.00",
      icon: <IconStore.circleTick className="stroke-green-500 size-6" />,
      ctaValues: [
        {
          name: "Deposit",
          icon: (
            <IconStore.download className="stroke-1 size-5 stroke-[#130061]" />
          ),
          onClick: () => {},
        },
        {
          name: "Withdraw",
          icon: (
            <IconStore.upload className="stroke-1 size-5 stroke-[#130061]" />
          ),
          onClick: () => {},
        },
      ],
    },
    {
      title: "Pending funds",
      amount: "0.00",
      icon: <IconStore.clock className="stroke-gray-500 size-6" />,
      note: "2 Orders Pending",
    },
    {
      title: "Total Revenue",
      amount: "31725.00",
      note1: "YTD:0.00",
      note: "Last Year:6,285",
    },
    {
      title: "Wallet Details",
      icon: (
        <IconStore.settings
          onClick={() => {}}
          className="stroke-1 size-5 stroke-[#130061]"
        />
      ),
      accountDetails: [
        { name: "Account Holder", value: "Amir Khan" },
        { name: "Base Currency", value: "Amir Khan" },
        { name: "IBAN", value: "Amir Khan" },
      ],
    },
  ];

  const selectOptions = {
    options: [
      { value: "today", label: "Today" },
      { value: "yesterday", label: "Yesterday" },
    ],
    selectedOption: "today",
    onChange: () => {},
  };

  const transactionStatus = [
    {
      key: "March 2025",
      value: [
        {
          date: "14 March",
          type: "credit",
          amount: "388",
          payoutReferance: "PR-2025-0035",
          description: "Completed Sales",
        },
        {
          date: "08 March",
          type: "Tx trade",
          amount: "388",
          payoutReferance: "PR-2025-0035",
          description: "Completed Sales",
        },
      ],
    },

    {
      key: "Febrauary 2025",
      value: [
        {
          date: "28 feb",
          type: "credit",
          amount: "388",
          payoutReferance: "PR-2025-0035",
          description: "Completed Sales",
        },
        {
          date: "08 Feb",
          type: "Tx trade",
          amount: "388",
          payoutReferance: "PR-2025-0035",
          description: "Completed Sales",
        },
      ],
    },
  ];

  return (
    <div className="bg-[#F5F7FA] w-full h-full">
      <div className="px-4 pt-4 flex items-center">
        {walletValues?.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => setActiveSelected(item?.key)}
              className={`${
                activeSelected === item?.key
                  ? "bg-white py-4"
                  : "bg-[#f9f9f9] py-3"
              } rounded-md px-3 flex gap-8 border-t-[1px] cursor-pointer border-x-[1px] border-[#E0E1EA] items-center justify-between`}
            >
              <p className="text-[16px] font-medium text-[#343432] ">
                {item?.name}
              </p>
              <p className="text-white bg-[#343432] text-[12px] rounded-md px-[4px] py-[2px]">
                {item?.count}
              </p>
            </div>
          );
        })}
      </div>
      <div className="bg-white ">
        <div className="grid grid-cols-4 gap-4 p-4 border-b-[1px] border-[#E0E1EA]">
          {fundAvailablity?.map((listItem, index) => {
            return <AvailableCard index={index} listItem={listItem} />;
          })}
        </div>
        <div className="p-4 flex gap-3 items-center border-b-[1px] border-[#E0E1EA]">
          <div className="border-[1px] flex gap-2 items-center px-1 py-[4px] w-full sm:w-[40%] border-[#cacacc] rounded-md">
            <IconStore.search className="size-4 stroke-[#130061] stroke-4" />
            <input
              type="text"
              placeholder="Search"
              className="outline-none placeholder:text-[#130061] text-xs sm:text-[16px] text-[#130061] w-full"
            />
          </div>
          <CustomSelect
            selectedValue={selectOptions.selectedOption}
            options={selectOptions.options}
            onSelect={selectOptions.onChange}
            textSize="text-xs sm:text-sm"
            buttonPadding="px-[10px] py-[4px]"
            dropdownItemPadding="py-1 pl-2 pr-6"
          />
        </div>
        <div className="border-b-[1px] border-[#E0E1EA]">
          <p className="p-4  w-fit border-[#E0E1EA] border-r-[1px] text-[14px] text-[#343432] font-semibold">
            {transactionStatus?.length} transactions
          </p>
        </div>
      </div>
      <div className="p-4">
        <TableContainer
          transactionStatus={transactionStatus}
          contentRefs={contentRefs}
          toggleMonth={toggleMonth}
          expandedMonths={expandedMonths}
        />
      </div>
      <TopPopupModal
        show={showAccountDetailForm}
        setShow={setShowAccountDetailForm}
        accountDetails={accountDetails}
      />
    </div>
  );
};

export default WalletPage;
