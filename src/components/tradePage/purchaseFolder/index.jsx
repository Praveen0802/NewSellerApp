import React, { useState, useEffect } from "react";
import AvailableList from "../components/availableList";
import FloatingSelect from "@/components/floatinginputFields/floatingSelect";
import FloatingDateRange from "@/components/commonComponents/dateRangeInput";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../components/stickyDataTable";
import FloatingLabelInput from "@/components/floatinginputFields";
import { purchaseHistory } from "@/utils/apiHandler/request";
import OrderDetails from "@/components/orderDetails";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import ClearChip from "../inventoryFolder/components/clearChip";
import { isEmptyObject } from "@/utils/helperFunctions";

const PurchaseFolder = (props) => {
  const { response, success, booking_no = "" } = props;
  const [listTicketDetails, setListTicketDetails] = useState(
    response?.data?.data
  );

  const [selectedTicketStatus, setSelectedTicketStatus] = useState("");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("");

  const [displayTabValues, setDisplayTabValues] = useState({
    total_count: response?.total_count,
    details_required: response?.details_required,
    expired_count: response?.expired_count,
    upcoming_count: response?.upcoming_count,
  });
  const [checkboxValue, setCheckboxValue] = useState({
    upcomming: false,
    expired: false,
  });
  const [lastPage, setLastPage] = useState(response?.data?.last_page);
  const [currentPage, setCurrentPage] = useState(response?.data?.current_page);
  const [selectedMatch, setSelectedMatch] = useState("");
  const initialListItems = [
    { name: "Purchases", value: displayTabValues?.total_count },
    {
      name: "Upcomming Event",
      value: displayTabValues?.upcoming_count,
      showCheckbox: true,
      key: "upcomming",
      isChecked: checkboxValue?.upcomming,
    },
    {
      name: "Past Events",
      value: displayTabValues?.expired_count,
      showCheckbox: true,
      key: "expired",
      isChecked: checkboxValue?.expired,
    },
    { name: "Details Required", value: displayTabValues?.details_required },
  ];
  const [listItems, setListItems] = useState(initialListItems);

  const [filtersApplied, setFiltersApplied] = useState({});
  const [eventDate, setEventDate] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [showOrderPopup, setShowOrderPopup] = useState({
    flag: false,
    data: {},
  });
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const isMobile = useIsMobile();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [orderDetailsLoader, setOrderDetailsLoader] = useState(false);

  useEffect(() => {
    if (success == "true") {
      toast.success("Booking Completed successfully");
      eyeIconClick({ booking_id: booking_no });
    }
  }, []);
  const eyeIconClick = async (item) => {
    // Check if item exists
    if (!item) {
      console.error("Item is null or undefined");
      return;
    }

    // Check if booking_id exists
    if (!item.booking_id) {
      console.error("Booking ID is missing");
      return;
    }

    try {
      // Show shimmer loader immediately
      setOrderDetailsLoader(true);
      setShowOrderPopup({
        flag: true,
        data: null, // Set to null to show shimmer
      });

      const response = await purchaseHistory("", {
        booking_no: item.booking_id ? item.booking_id : `${item.booking_id}`,
      });

      // Check if response exists and has data
      if (response && response.length > 0) {
        setShowOrderPopup({
          flag: true,
          data: response[0],
        });
      } else {
        console.warn("No data received from purchaseHistory");
        // Show popup with empty data or error message
        setShowOrderPopup({
          flag: true,
          data: null,
        });
      }
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      // Handle error appropriately
      setShowOrderPopup({
        flag: true,
        data: null,
      });
    } finally {
      // Hide shimmer loader
      setOrderDetailsLoader(false);
    }
  };

  const headers = [
    { key: "status", label: "Status" },
    { key: "bookingNo", label: "Booking Status" },
    { key: "listmyTicket", label: "Booking No" },
    { key: "orderDate", label: "Order Date" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "eventDate", label: "Event Date" },
    { key: "category", label: "Category" },
    { key: "ticketType", label: "Ticket Type" },
    { key: "qty", label: "Qty" },
    { key: "ticketPrice", label: "Ticket Price" },
    { key: "subTotal", label: "Subtotal" },
    { key: "total", label: "Total" },
  ];

  const data = listTicketDetails?.map((item) => {
    return {
      status: item?.ticket_status,
      bookingNo: item?.booking_status_text,
      listmyTicket: item?.booking_no,
      orderDate: item?.booking_date,
      event: item?.match_name,
      venue: item?.venue_name,
      eventDate: item?.match_datetime,
      category: item?.seat_category,
      ticketType: item?.ticket_type_name,
      qty: item?.quantity,
      ticketPrice: item?.ticket_price_converted,
      subTotal: item?.total_ticket_price_converted,
      total: item?.total_amount_converted,
    };
  });

  const rightStickyColumns = listTicketDetails?.map((item) => {
    return [
      {
        icon: (
          <IconStore.eye
            onClick={() => eyeIconClick(item)}
            className="size-5"
          />
        ),
        className: " cursor-pointer",
      },
    ];
  });

  const fetchAPiDetails = async (params, pagination) => {
    setLoader(true);
    const response = await purchaseHistory("", params);
    const { data = [], ...rest } = response;
    if (pagination) {
      setListTicketDetails([...listTicketDetails, ...response?.data?.data]);
    } else {
      setListTicketDetails(response?.data?.data);
    }
    setCurrentPage(response?.data?.current_page);
    setLastPage(response?.data?.last_page);
    setDisplayTabValues(rest);
    const updatedListItems = [
      { name: "Purchases", value: response?.total_count },
      {
        name: "Upcomming Event",
        value: response?.upcoming_count,
        showCheckbox: true,
        key: "upcomming",
        isChecked: params?.upcomming ? params?.upcomming : false,
      },
      {
        name: "Past Events",
        value: response?.expired_count,
        showCheckbox: true,
        key: "expired",
        isChecked: params?.expired ? params?.expired : false,
      },
      { name: "Details Required", value: response?.details_required },
    ];

    setListItems(updatedListItems);
    setFiltersApplied(params);
    setLoader(false);
  };

  const fetchScrollEnd = async () => {
    if (currentPage == lastPage) return;
    const params = { ...filtersApplied, page: currentPage + 1 };
    await fetchAPiDetails(params, true);
    setFiltersApplied(params);
  };

  const handleMatchSearch = (e, key, type) => {
    const value = e?.target?.value;
    setSelectedMatch(value);
    const params = {
      ...filtersApplied,
      searchParam: value,
      page: 1,
    };
    fetchAPiDetails(params);
  };

  const handleDateChange = (dateRange, key) => {
    let params = {};
    if (key == "eventDate") {
      setEventDate(dateRange);
      params = {
        ...filtersApplied,
        event_date_from: dateRange?.startDate,
        event_date_to: dateRange?.endDate,
        page: 1,
      };
    }
    if (key == "orderDate") {
      setOrderDate(dateRange);
      params = {
        ...filtersApplied,
        order_date_from: dateRange?.startDate,
        order_date_to: dateRange?.endDate,
      };
    }
    fetchAPiDetails(params);
  };
  const toggleItem = (index) => {
    const updatedItems = listItems?.map((item, i) => {
      if (i === index) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    setListItems(updatedItems);
    const key = listItems[index]?.key;
    const updatedCheckboxValue = {
      ...checkboxValue,
      [key]: !checkboxValue[key],
    };
    setCheckboxValue(updatedCheckboxValue);
    const params = {
      ...filtersApplied,
      upcomming: updatedCheckboxValue?.upcomming ? 1 : 0,
      expired: updatedCheckboxValue?.expired ? 1 : 0,
      page: 1,
    };
    fetchAPiDetails(params);
  };

  const handleSelectChange = (e, key) => {
    const value = e;
    key == "ticket_status"
      ? setSelectedTicketStatus(value)
      : setSelectedBookingStatus(value);

    const params = {
      ...filtersApplied,
      [key]: value,
      page: 1,
    };
    fetchAPiDetails(params);
  };

  const renderMobileFilters = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center gap-2 text-[#343432] font-medium"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <span>{isFilterExpanded ? "Hide Filters" : "Show Filters"}</span>
          <IconStore.chevronDown
            className={`size-4 transition-transform duration-300 ${
              isFilterExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <span className="text-sm text-gray-500">{displayTabValues?.total_count} purchases</span>
      </div>

      {isFilterExpanded && (
        <div className="flex flex-col gap-4">
          <FloatingLabelInput
            id="selectedMatch"
            name="selectedMatch"
            keyValue={"selectedMatch"}
            type="text"
            label="Search Match event or Booking number"
            value={selectedMatch}
            className={"!py-[7px] !px-[12px] !text-[#343432] !text-[14px]"}
            onChange={handleMatchSearch}
            paddingClassName=""
            autoComplete="off"
          />

          <FloatingDateRange
            id="eventDate"
            name="eventDate"
            keyValue="eventDate"
            parentClassName="!w-full"
            label="Event date"
            className="!py-[8px] !px-[16px] text-xs"
            value={eventDate}
            onChange={(dateValue) => handleDateChange(dateValue, "eventDate")}
          />

          <FloatingDateRange
            id="orderDate"
            name="orderDate"
            keyValue="orderDate"
            parentClassName="!w-full"
            label="Order date"
            className="!py-[8px] !px-[16px] text-xs"
            value={orderDate}
            onChange={(dateValue) => handleDateChange(dateValue, "orderDate")}
          />

          <FloatingSelect
            label={"Ticket status"}
            options={[
              { value: "fulfilled", label: "Fulfilled" },
              { value: "incomplete", label: "Incomplete" },
            ]}
            selectedValue={selectedTicketStatus}
            keyValue="ticket_status"
            className="!w-full"
            onSelect={(e) => {
              handleSelectChange(e, "ticket_status");
            }}
            paddingClassName="!py-[6px] !px-[12px] w-full text-xs"
            labelClassName="!text-[11px]"
          />

          <FloatingSelect
            label={"Booking status"}
            options={[
              { value: 0, label: "Failed" },
              { value: 1, label: "Confirmed" },
              { value: 2, label: "Pending" },
              { value: 3, label: "Cancelled" },
              { value: 4, label: "Shipped" },
              { value: 5, label: "Delivered" },
              { value: 6, label: "Downloaded" },
              { value: 8, label: "Rejected" },
            ]}
            selectedValue={selectedBookingStatus}
            keyValue="booking_status"
            className="!w-full"
            onSelect={(e) => {
              handleSelectChange(e, "booking_status");
            }}
            paddingClassName="!py-[6px] !px-[12px] w-full text-xs"
            labelClassName="!text-[11px]"
          />
        </div>
      )}
    </>
  );

  const bookingStatusOptions = [
    { value: 0, label: "Failed" },
    { value: 1, label: "Confirmed" },
    { value: 2, label: "Pending" },
    { value: 3, label: "Cancelled" },
    { value: 4, label: "Shipped" },
    { value: 5, label: "Delivered" },
    { value: 6, label: "Downloaded" },
    { value: 8, label: "Rejected" },
  ];

  function getStatusLabel(statusCode) {
    const statusOption = bookingStatusOptions.find(
      (option) => option.value === statusCode
    );
    return statusOption?.label;
  }

  // Desktop filters rendering - maintain original layout
  const renderDesktopFilters = () => (
    <div className="md:flex gap-4 items-center md:w-[90%]">
      <FloatingLabelInput
        id="selectedMatch"
        name="selectedMatch"
        keyValue={"selectedMatch"}
        type="text"
        label="Search Match event or Booking number"
        value={selectedMatch}
        className={"!py-[7px] !px-[12px] !text-[#343432] !text-[14px] "}
        onChange={handleMatchSearch}
        paddingClassName=""
        autoComplete="off"
      />
      <FloatingDateRange
        id="eventDate"
        name="eventDate"
        keyValue="eventDate"
        parentClassName="!w-[200px]"
        label="Event date"
        subParentClassName="!w-[200px]"
        className="!py-[8px] !px-[16px] mobile:text-xs"
        value={eventDate}
        onChange={(dateValue) => handleDateChange(dateValue, "eventDate")}
      />
      <FloatingDateRange
        id="orderDate"
        name="orderDate"
        keyValue="orderDate"
        parentClassName="!w-[350px]"
        subParentClassName="!w-[200px]"
        label="Order date"
        className="!py-[8px] !px-[16px] mobile:text-xs"
        value={orderDate}
        onChange={(dateValue) => handleDateChange(dateValue, "orderDate")}
      />
      <FloatingSelect
        label={"Ticket status"}
        options={[
          { value: "fulfilled", label: "Fulfilled" },
          { value: "incomplete", label: "Incomplete" },
        ]}
        selectedValue={selectedTicketStatus}
        keyValue="ticket_status"
        className="!w-[30%]"
        onSelect={(e) => {
          handleSelectChange(e, "ticket_status");
        }}
        paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
        labelClassName="!text-[11px]"
      />
      <FloatingSelect
        label={"Booking status"}
        options={bookingStatusOptions}
        selectedValue={selectedBookingStatus}
        keyValue="booking_status"
        className="!w-[30%]"
        onSelect={(e) => {
          handleSelectChange(e, "booking_status");
        }}
        paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
        labelClassName="!text-[11px]"
      />
    </div>
  );

  const handleClearChip = (key, value) => {
    let updatedParams = {};
    if (key == "event_date_from") {
      updatedParams = {
        event_date_from: "",
        event_date_to: "",
      };
      setEventDate("");
    } else if (key == "order_date_from") {
      updatedParams = {
        order_date_from: "",
        order_date_to: "",
      };
      setOrderDate("");
    } else {
      if (key == "ticket_status") {
        setSelectedTicketStatus("");
      } else if (key == "booking_status") {
        setSelectedBookingStatus("");
      } else if (key == "searchParam" || key == "selectedMatch") {
        // Clear the search input when its chip is cleared
        setSelectedMatch("");
      }
      updatedParams = {
        [key]: "",
      };
    }
    const params = {
      ...filtersApplied,
      ...updatedParams,
    };
    fetchAPiDetails(params);
  };

  const resetFilters = () => {
    setFiltersApplied({ page: 1 });
    setSelectedMatch("");
    setSelectedTicketStatus("");
    setSelectedBookingStatus("");
    setEventDate("");
    setCheckboxValue({
      upcomming: false,
      expired: false,
    });
    setOrderDate("");
    setListItems(initialListItems);
    fetchAPiDetails({ page: 1 });
  };

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="bg-white">
        {/* Tabs section - make scrollable on mobile */}
        <div className="px-[24px] py-[20px] border-b-[1px] border-[#E0E1EA] overflow-x-auto">
          <div className="flex gap-4  flex-nowrap min-w-min md:min-w-0">
            {listItems?.map((item, index) => {
              return (
                <AvailableList
                  key={index}
                  list={{
                    name: item?.name,
                    value: item?.value,
                    showCheckbox: item?.showCheckbox,
                    isChecked: item?.isChecked,
                    onCheckChange: () => toggleItem(index),
                    onClick: item?.showCheckbox
                      ? () => toggleItem(index)
                      : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Filters section */}
        <div className="px-[24px] py-[20px] border-b-[1px] border-[#E0E1EA]">
          {isMobile ? renderMobileFilters() : renderDesktopFilters()}
        </div>

        {/* Purchase count - hidden on mobile since we show it in filters section */}
        <div>
          <div
            className={`border-b-[1px] border-[#E0E1EA] flex items-center gap-4 ${
              isMobile ? "hidden" : ""
            }`}
          >
            <div className="flex gap-2 items-center">
              <p
                className={
                  "p-[20px] text-[14px] w-fit text-[#343432] font-semibold border-r-[1px] border-[#E0E1EA]"
                }
              >
                {displayTabValues?.total_count} purchases
              </p>
              <button
                onClick={() => resetFilters()}
                className="border-[1px] cursor-pointer border-[#DADBE5] p-[4px]"
              >
                <IconStore.reload className="size-3.5" />
              </button>
            </div>
            {!isEmptyObject(filtersApplied) && (
              <div className="flex gap-2 items-center">
                {Object.entries(filtersApplied)?.map(([key, value], index) => {
                  if (
                    key === "page" ||
                    !value ||
                    value?.length == 0 ||
                    key == "order_date_to" ||
                    key == "match_name" ||
                    key == "event_date_to"
                  )
                    return null;
                  return (
                    <ClearChip
                      key={index}
                      text={
                        key === "searchParam"
                          ? (/^\d+$/.test(String(value).trim())
                              ? "Booking No"
                              : "Event")
                          : key
                      }
                      value={
                        key == "booking_status"
                          ? `${getStatusLabel(value)}`
                          : key == "order_date_from"
                          ? `${value} - ${filtersApplied?.order_date_to}`
                          : key == "event_date_from"
                          ? `${value} - ${filtersApplied?.event_date_to}`
                          : Array.isArray(value)
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

      {/* Data table section - add horizontal scroll for mobile */}
      <div className="bg-white shadow rounded-lg mx-[24px]  max-h-[300px] overflow-scroll">
        <StickyDataTable
          headers={headers}
          data={data}
          rightStickyColumns={rightStickyColumns}
          loading={loader}
          onScrollEnd={fetchScrollEnd}
        />
      </div>

      <OrderDetails
        show={showOrderPopup?.flag}
        data={showOrderPopup?.data}
        showShimmer={orderDetailsLoader}
        onClose={() => {
          setShowOrderPopup({ flag: false, data: {} });
          setOrderDetailsLoader(false); // Reset loader when closing
        }}
      />
    </div>
  );
};

export default PurchaseFolder;
