import React, { useState, useEffect } from "react";
import StickyDataTable from "../components/stickyDataTable";
import AvailableList from "../components/availableList";
import FloatingLabelInput from "@/components/floatinginputFields";
import attachSquare from "../../../../public/attach-square.svg";
import oneHand from "../../../../public/One-hand.svg";
import star from "../../../../public/Star.svg";
import documentText from "../../../../public/document-text.svg";
import Image from "next/image";
import FloatingSelect from "@/components/floatinginputFields/floatingSelect";
import FloatingDateRange from "@/components/commonComponents/dateRangeInput";
import Button from "@/components/commonComponents/button";
import {
  dateFormat,
  desiredFormatDate,
  isEmptyObject,
} from "@/utils/helperFunctions";
import attachmentPin from "../../../../public/attachment-pin.svg";
import attachment6 from "../../../../public/attachment-6.svg";
import attachment3 from "../../../../public/attachment-3.svg";
import attachment1 from "../../../../public/attachment-1.svg";
import crossHand from "../../../../public/cross-hand.svg";
import {
  purchaseFavouratesTracking,
  purchaseTickets,
  purchaseTracking,
} from "@/utils/apiHandler/request";
import { updateConfirmPurchasePopup } from "@/utils/redux/common/action";
import { useDispatch } from "react-redux";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import ClearChip from "../inventoryFolder/components/clearChip";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const TrackingPage = (props) => {
  const { response = {} } = props;
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(
    response?.ticket_details
  );
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(
    response?.pagination?.current_page
  );
  const [lastPage, setLastPage] = useState(response?.pagination?.last_page);
  const [availableTypes, setAvailableTypes] = useState({
    available: response?.available,
    tracking: response?.tracking,
    sold: response?.sold,
  });
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const [filterApplied, setFIlterApplied] = useState({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const headers = [
    { key: "status", label: "Status" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "eventDate", label: "Event Date" },
    { key: "category", label: "Category" },
    { key: "ticketType", label: "Ticket Type" },
    { key: "qty", label: "Qty" },
    { key: "price_with_currency", label: "Ticket Price" },
    ...(isMobile
      ? [
          { key: "price", label: "Price" },
          { key: "attachment", label: "" },
          { key: "hand", label: "" },
          { key: "document", label: "" },
        ]
      : []),
  ];
  const trackingFetchApi = async (params, pagination, availablityStatus) => {
    setLoader(true);
    const response = await purchaseTracking("", "GET", params);
    if (pagination) {
      setSelectedTicketDetails([
        ...selectedTicketDetails,
        ...response?.ticket_details,
      ]);
    } else {
      setSelectedTicketDetails(response?.ticket_details);
    }
    setCurrentPage(response?.pagination?.current_page);
    setLastPage(response?.pagination?.last_page);
    // First update availableTypes
    setAvailableTypes({
      available: response?.available,
      tracking: response?.tracking,
      sold: response?.sold,
    });
    // Then update items with the new values
    setItems([
      { name: "Tracking", value: response?.tracking, showCheckbox: false },
      {
        name: "Available",
        value: response?.available,
        showCheckbox: true,
        isChecked: availablityStatus,
      },
      {
        name: "Sold",
        value: response?.sold,
        showCheckbox: false,
        isChecked: false,
      },
    ]);

    setLoader(false);
  };

  const data = selectedTicketDetails?.map((item) => {
    return {
      status: item?.availability_status,
      event: item?.match_name,
      venue: item?.stadium_name,
      eventDate: desiredFormatDate(item?.match_date),
      category: item?.Category,
      ticketType: item?.ticket_type,
      qty: item?.quantity,
      price_with_currency: item?.price_with_currency,
      ...(isMobile && {
        price: item?.price_with_currency,
        attachment: (
          <Image
            width={14}
            height={14}
            src={
              item?.ticket_type_id == 2
                ? attachmentPin
                : item?.ticket_type_id == 4 || item?.ticket_type_id == 6
                ? attachment6
                : item?.ticket_type_id == 3
                ? attachment3
                : item?.ticket_type_id == 1
                ? attachment1
                : attachmentPin
            }
            alt="attach"
          />
        ),
        hand: <Image width={16} height={16} src={crossHand} alt="hand" />,
        document: item?.listing_note?.length > 0 && (
          <Image width={20} height={20} src={documentText} alt="document" />
        ),
      }),
    };
  });

  const handleRemoveFavourite = async (item) => {
    const response = await purchaseFavouratesTracking(
      "",
      "DELETE",
      "",
      item?.tracking_id
    );
    setSelectedTicketDetails(
      selectedTicketDetails?.filter(
        (ticket) => ticket?.tracking_id !== item?.tracking_id
      )
    );
  };

  const handleClickItem = async (item) => {
    const data = await purchaseTickets("", item?.s_no, {
      currency: item?.price_type,
    });
    dispatch(
      updateConfirmPurchasePopup({
        flag: true,
        data: { ...data, sNo: item?.s_no, matchId: item?.m_id },
      })
    );
  };

  const fetchScrollEnd = async () => {
    if (currentPage == lastPage) return;
    const params = { ...filterApplied, page: currentPage + 1 };
    await trackingFetchApi(params, true);
    setFIlterApplied(params);
  };

  const rightStickyHeaders = isMobile ? [] : [];
  const rightStickyColumns = selectedTicketDetails?.map((item) => {
    return [
      ...(isMobile
        ? []
        : [
            // {
            //   icon: <p>{item?.price_with_currency}</p>,
            //   className:
            //     "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
            // },
            {
              icon: (
                <Image
                  width={14}
                  height={14}
                  src={
                    item?.ticket_type_id == 2
                      ? attachmentPin
                      : item?.ticket_type_id == 4 || item?.ticket_type_id == 6
                      ? attachment6
                      : item?.ticket_type_id == 3
                      ? attachment3
                      : item?.ticket_type_id == 1
                      ? attachment1
                      : attachmentPin
                  }
                  alt="attach"
                />
              ),
              className: "cursor-pointer pl-2",
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
                  {dateFormat(item?.expected_date_inhand)}
                </p>
              ),
              tooltipPosition: "top",
            },
            {
              icon: item?.listing_note?.length > 0 && (
                <Image
                  width={20}
                  height={20}
                  src={documentText}
                  alt="document"
                />
              ),
              className: "cursor-pointer pr-2",
              key: "document",
              tooltipComponent:
                item?.listing_note?.length > 0 &&
                item?.listing_note?.map((note, index) => (
                  <div className="flex flex-col gap-2" key={index}>
                    <p className="text-left">Benifits/Restrictions</p>
                    <ul
                      className={`list-disc ml-5 ${
                        item?.listing_note?.length > 3
                          ? "grid grid-cols-2 gap-1"
                          : ""
                      }`}
                    >
                      {Object.values(note).map((value, i) => (
                        <li key={i}>{value}</li>
                      ))}
                    </ul>
                  </div>
                )),
              tooltipPosition: "top",
            },
          ]),
      {
        icon: (
          <Image
            onClick={() => {
              handleRemoveFavourite(item);
            }}
            width={20}
            height={20}
            src={star}
            alt="star"
          />
        ),
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
      {
        icon: (
          <Button
            label="Buy"
            classNames={{
              label_: "text-white text-xs sm:text-sm",
              root: "bg-[#343432] py-1 px-2 rounded-md hover:bg-[#343432] transition-colors whitespace-nowrap",
            }}
            onClick={() => {
              handleClickItem(item);
            }}
          />
        ),
        key: "buy",
      },
    ];
  });

  const [items, setItems] = useState([
    { name: "Tracking", value: availableTypes?.tracking, showCheckbox: false },
    {
      name: "Available",
      value: availableTypes?.available,
      showCheckbox: true,
      isChecked: false,
    },
    {
      name: "Sold",
      value: availableTypes?.sold,
      showCheckbox: false,
      isChecked: false,
    },
  ]);

  const toggleItem = async (index) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, isChecked: !item.isChecked } : item
      )
    );
    const params = {
      ...filterApplied,
      availability: availabilityStatus != 1 ? "" : 1,
      page: 1,
    };
    await trackingFetchApi(
      params,
      false,
      availabilityStatus == 1 ? true : false
    );
    setAvailabilityStatus(availabilityStatus == 1 ? "" : 1);
    setFIlterApplied(params);
  };

  const handleMatchSearch = (e, key, type) => {
    const value = e?.target?.value;
    setSelectedMatch(value);
    const params = {
      ...filterApplied,
      search: value,
      page: 1,
    };
    trackingFetchApi(params);
    setFIlterApplied(params);
  };

  const handleClearChip = (key, value) => {
    const params = {
      ...filterApplied,
      [key]: "",
    };
    if (key === "match_date") {
      setSelectedDate("");
    }
    trackingFetchApi(params);
    setFIlterApplied(params);
  };

  const resetFilters = () => {
    setFIlterApplied({});
    setSelectedMatch("");
    setSelectedDate("");
    trackingFetchApi({});
  };

  const toggleFilterExpand = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  return (
    <div className="flex flex-col gap-[16px] md:gap-[24px]">
      <div className="bg-white">
        {/* Filter section */}
        <div className="py-[16px] md:py-[20px] px-[16px] md:px-[24px] border-b-[1px] border-[#E0E1EA] overflow-x-auto">
          <div className="flex gap-3 md:gap-4 md:w-[70%]">
            {items.map((item, index) => (
              <AvailableList
                key={index}
                list={{
                  name: item.name,
                  value: item.value,
                  showCheckbox: item.showCheckbox,
                  isChecked: item.isChecked,
                  onCheckChange: () => toggleItem(index),
                  onClick: item.showCheckbox
                    ? () => toggleItem(index)
                    : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Search filters section */}
        <div className="md:py-[20px] md:px-[24px] border-b-[1px] border-[#E0E1EA]">
          {isMobile ? (
            <div className="px-4 py-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleFilterExpand}
              >
                <div className="flex items-center gap-2">
                  {/* <IconStore.filter className="size-4" /> */}
                  <span className="text-[14px] font-medium">Filters</span>
                </div>
                <div className="bg-gray-100 p-1 rounded-full">
                  {isFilterExpanded ? (
                    <IconStore.chevronUp className="size-4" />
                  ) : (
                    <IconStore.chevronDown className="size-4" />
                  )}
                </div>
              </div>

              {isFilterExpanded && (
                <div className="mt-3 space-y-3">
                  <FloatingLabelInput
                    id="selectedMatch"
                    name="selectedMatch"
                    keyValue={"selectedMatch"}
                    type="text"
                    label="Search Match Event"
                    value={selectedMatch}
                    className={
                      "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]"
                    }
                    onChange={handleMatchSearch}
                    paddingClassName=""
                  />
                  <FloatingDateRange
                    id="eventDate"
                    name="eventDate"
                    keyValue="eventDate"
                    parentClassName="w-full"
                    label="Event Date"
                    className="!py-[8px] !px-[16px] text-xs"
                    value={selectedDate}
                    singleDateMode={true}
                    onChange={(dateValue) => {
                      setSelectedDate(dateValue);
                      const params = {
                        ...filterApplied,
                        match_date: dateValue?.startDate,
                        page: 1,
                      };
                      trackingFetchApi(params);
                      setFIlterApplied(params);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className=" flex max-md:flex-col gap-4 items-center w-[50%]">
              <FloatingLabelInput
                id="selectedMatch"
                name="selectedMatch"
                keyValue={"selectedMatch"}
                type="text"
                label="Search match event"
                value={selectedMatch}
                className={"!py-[7px] !px-[12px] !text-[#343432] !text-[14px]"}
                onChange={handleMatchSearch}
                paddingClassName=""
              />
              <FloatingDateRange
                id="eventDate"
                name="eventDate"
                keyValue="eventDate"
                parentClassName="md:w-[350px] !max-md:w-full"
                label="Event date"
                className="!py-[8px] !px-[16px] mobile:text-xs"
                value={selectedDate}
                singleDateMode={true}
                onChange={(dateValue) => {
                  setSelectedDate(dateValue);
                  const params = {
                    ...filterApplied,
                    match_date: dateValue?.startDate,
                  };
                  trackingFetchApi(params);
                  setFIlterApplied(params);
                }}
              />
            </div>
          )}
        </div>

        {/* Results count and filter chips */}
        <div className="border-b-[1px] border-[#E0E1EA] py-2 md:py-0 px-4 md:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <p
                className={
                  "md:p-[20px] p-2 text-[13px] md:text-[14px] w-fit text-[#343432] font-semibold md:border-r-[1px] border-[#E0E1EA]"
                }
              >
                {data?.length} purchases
              </p>
              <button
                onClick={() => resetFilters()}
                className="border-[1px] cursor-pointer border-[#DADBE5] p-[4px] hover:bg-gray-100"
              >
                <IconStore.reload className="size-3.5" />
              </button>
            </div>
            {!isEmptyObject(filterApplied) && (
              <div className="flex flex-wrap gap-2 items-center py-1 md:py-0">
                {Object.entries(filterApplied)?.map(([key, value], index) => {
                  if (key === "page" || !value || value?.length == 0)
                    return null;
                  return (
                    <ClearChip
                      key={index}
                      text={key}
                      value={
                        Array.isArray(value)
                          ? `${value?.length} selected`
                          : value
                      }
                      onClick={handleClearChip}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white shadow rounded-lg mx-[12px] md:mx-[24px] max-h-[350px] md:max-h-[350px] overflow-auto">
        <StickyDataTable
          headers={headers}
          data={data}
          rightStickyColumns={rightStickyColumns}
          loading={loader}
          rightStickyHeaders={rightStickyHeaders}
          onScrollEnd={fetchScrollEnd}
        />
      </div>
    </div>
  );
};

export default TrackingPage;
