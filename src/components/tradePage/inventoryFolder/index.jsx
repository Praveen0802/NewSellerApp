import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState, useEffect, useRef } from "react";
import blueLocation from "../../../../public/blue-location.svg";
import Image from "next/image";
import blueCalendar from "../../../../public/blue-calendar.svg";
import blueTicket from "../../../../public/blue-ticket.svg";
import hamburger from "../../../../public/hamburger.svg";
import blueClock from "../../../../public/blue-clock.svg";
import ToggleStatus from "./components/toggleStatus";
import beforeFaviurates from "../../../../public/before-favourates.svg";
import attachmentPin from "../../../../public/attachment-pin.svg";
import attachment6 from "../../../../public/attachment-6.svg";
import attachment3 from "../../../../public/attachment-3.svg";
import attachment1 from "../../../../public/attachment-1.svg";
import crossHand from "../../../../public/cross-hand.svg";
import oneHand from "../../../../public/One-hand.svg";
import star from "../../../../public/Star.svg";
import InventoryFilterForm from "./inventoryFilterForm";
import Button from "@/components/commonComponents/button";
import documentText from "../../../../public/document-text.svg";
import StickyDataTable from "../components/stickyDataTable";
import PinPatchMap from "./pinPatchMap";
import {
  dateFormat,
  desiredFormatDate,
  isEmptyObject,
} from "@/utils/helperFunctions";
import {
  AddFavouratesTracing,
  purchaseEvents,
  purchaseFavouratesTracking,
  purchaseTickets,
} from "@/utils/apiHandler/request";
import NonMatchSelectUI from "./nonMatchIdUI";
import { useDispatch } from "react-redux";
import { updateConfirmPurchasePopup } from "@/utils/redux/common/action";
import OrderDetails from "@/components/orderDetails";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import StadiumMap from "./pinPatchMap/mapSvg";
import ClearChip from "./components/clearChip";

const InventoryFolder = (props) => {
  const { response = {}, matchId } = props;

  const {
    match_details = {},
    ticket_details = [],
    totalAmount = "",
    filters = {},
  } = response;
  const [selectedItem, setSelectedItem] = useState("all");
  const [displayTicketDetails, setDisplayTicketDetails] =
    useState(ticket_details);
  const [filtersApplied, setFiltersApplied] = useState({ page: 1 });
  const [lastPage, setLastPage] = useState(response?.meta?.last_page);
  const [currentPage, setCurrentPage] = useState(response?.meta?.current_page);
  const [showMap, setShowMap] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const defaultFilters = {
    category: "",
    quantity: "",
    ticket_type_id: "",
  };
  const [formFieldValues, setFormFieldValues] = useState(defaultFilters);
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const selectedMatchData = {
    match: `${match_details?.match_name}`,
    eventDate: desiredFormatDate(match_details?.match_date),
    eventTime: match_details?.match_time,
    Venue: `${match_details?.venue},${match_details?.country},${match_details?.city}`,
  };
  const currentCategoryRef = useRef(null);
  const svgContainerRef = useRef(null);
  // Set mobile state based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Automatically hide map on mobile
      if (window.innerWidth < 768) {
        setShowMap(false);
      }
    };

    handleResize(); // Run initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderListValue = (icon, text) => {
    return (
      <div className="flex gap-[8px] items-center">
        {icon}
        <p className="text-[12px] font-normal text-[#343432] truncate">
          {text}
        </p>
      </div>
    );
  };

  const fetchAPIDetails = async (params, pagination = false) => {
    setLoader(true);
    const response = await purchaseEvents("", matchId, params);
    if (pagination) {
      setDisplayTicketDetails([
        ...displayTicketDetails,
        ...response?.ticket_details,
      ]);
    } else {
      setDisplayTicketDetails([...response?.ticket_details]);
    }
    setLastPage(response?.meta?.last_page);
    setCurrentPage(response?.meta?.current_page);
    setLoader(false);
  };

  const handleChange = (e, key, type) => {
    const selectType = type === "select";
    const dateType = type == "date";
    const checkBoxType = type == "checkbox";
    const value = checkBoxType
      ? e.target.checked
      : selectType || dateType
      ? e
      : e.target.value;
    if (selectType) {
      let params = {
        ...filtersApplied,
        page: 1,
        [key]: value,
      };
      setFiltersApplied(params);
      fetchAPIDetails(params);
    }
    setFormFieldValues({ ...formFieldValues, [key]: value });
  };

  const renderListItem = (icon, text) => {
    return (
      <div className="flex gap-2 items-center">
        {icon && icon}
        <p className="text-[#343432] text-[12px] font-normal">{text}</p>
      </div>
    );
  };

  const fetchScrollEnd = async () => {
    if (currentPage >= lastPage) return;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const params = {
      ...filtersApplied,
      page: currentPage + 1,
    };

    await fetchAPIDetails(params, true);
    setFiltersApplied(params);
    // setTimeout(() => {
    //   window.scrollTo(0, scrollPosition);
    // }, 0);
  };

  const handleMapBlockClick = (blockId) => {
    const params = {
      ...filtersApplied,
      page: 1,
      category:
        filtersApplied?.category?.length > 0
          ? [...filtersApplied?.category, blockId]
          : blockId,
    };
    setFiltersApplied(params);
    fetchAPIDetails(params);
  };

  const headers = [
    { key: "qty", label: "Qty" },
    { key: "category", label: "Category" },
    { key: "section", label: "Section/Block" },
    { key: "row", label: "Row" },
    ...(isMobile
      ? [
          { key: "price", label: "Price" },
          { key: "attachment", label: "" },
          { key: "hand", label: "" },
          { key: "document", label: "" },
        ]
      : []),
  ];

  const data = displayTicketDetails?.map((item) => {
    return {
      qty: item?.quantity,
      category: item?.seat_category,
      section: item?.block_id,
      row: item?.row,
      ...(isMobile
        ? {
            price: item?.price_with_symbol,
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
          }
        : {}),
      seat_category_id: item?.seat_category_id,
    };
  });

  const handleClickFavourites = async (item) => {
    if (item?.trackingfound == 1) return;
    const payload = {
      m_id: matchId,
      s_no: item?.s_no,
    };
    const response = await AddFavouratesTracing("", "POST", payload);
    const updatedTicketDetails = displayTicketDetails?.map((ticket) => {
      if (ticket?.s_no == item?.s_no) {
        return {
          ...ticket,
          trackingfound: 1,
        };
      }
      return ticket;
    });

    setDisplayTicketDetails(updatedTicketDetails);
  };

  const handleClickItem = async (item) => {
    const data = await purchaseTickets("", item?.s_no, {
      currency: item?.price_type,
    });
    dispatch(
      updateConfirmPurchasePopup({
        flag: true,
        data: { ...data, sNo: item?.s_no, matchId: matchId },
      })
    );
  };

  const resetFilters = () => {
    setFiltersApplied({ page: 1 });
    setFormFieldValues(defaultFilters);
    fetchAPIDetails({ page: 1 });
  };

  const rightStickyHeaders = isMobile ? [] : ["Ticket Price"];

  const rightStickyColumns = displayTicketDetails?.map((item) => {
    return [
      ...(isMobile
        ? []
        : [
            {
              icon: <p>{item?.price_with_symbol}</p>,
              className:
                "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px]",
            },
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
              tooltipComponent: (
                <p className="text-center">{item?.ticket_type}</p>
              ),
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
              tooltipComponent: item?.listing_note?.length > 0 && (
                <div>
                  <p className="text-left">Benifits/Restrictions</p>
                  {item?.listing_note?.map((note, index) => (
                    <div className="flex flex-col gap-2" key={index}>
                      <ul
                        className={`list-disc ml-[20px] ${
                          item?.listing_note?.length > 3 &&
                          "grid grid-cols-2 gap-1"
                        }`}
                      >
                        {Object.values(note).map((value, i) => (
                          <li key={i}>{value}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ),
              tooltipPosition: "top",
            },
          ]),
      {
        icon: (
          <Image
            onClick={() => {
              handleClickFavourites(item);
            }}
            width={20}
            height={20}
            src={item?.trackingfound == 1 ? star : beforeFaviurates}
            alt="star"
          />
        ),
        tooltipComponent: <p className="text-center">Track this ticket</p>,
        className: "border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer",
        key: "star",
      },
      {
        icon: (
          <Button
            label="Buy"
            classNames={{
              label_: "text-white text-xs sm:text-sm",
              root: "bg-[#0137D5] py-1 px-2 rounded-md hover:bg-[#0137D5] transition-colors whitespace-nowrap",
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

  const handleTicketMouseEnter = (categoryId) => {
    if (!svgContainerRef.current) return;

    // Ensure categoryId is treated as a string for consistent comparison
    const categoryIdStr = String(categoryId);

    svgContainerRef.current
      .querySelectorAll("[data-section] .block")
      .forEach((block) => {
        const blockCategoryId = block?.getAttribute("data-category-id");

        // Convert blockCategoryId to string for proper comparison
        if (String(blockCategoryId) === categoryIdStr) {
          block.style.fill = "#7d7af9"; // Highlight color
          const text = block.closest("[data-section]")?.querySelector("text");
          if (text) text.style.fill = "#fff";
        } else {
          const originalColor = block.getAttribute("data-color");
          if (originalColor) block.style.fill = originalColor;
          const text = block.closest("[data-section]")?.querySelector("text");
          if (text) text.style.fill = "#000";
        }
      });

    // Update current category reference to maintain highlight after hover
    currentCategoryRef.current = categoryIdStr;
  };

  const handleTicketMouseLeave = () => {
    if (!svgContainerRef.current) return;
    svgContainerRef.current
      .querySelectorAll("[data-section] .block")
      .forEach((block) => {
        const originalColor = block.getAttribute("data-color");
        if (originalColor) {
          block.style.fill = originalColor;
        }

        const text = block.closest("[data-section]")?.querySelector("text");
        if (text) text.style.fill = "#000";
      });
  };

  const commonProps = {
    svgContainerRef,
    currentCategoryRef,
    handleMapBlockClick,
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleClearChip = (key, value) => {
    const params = {
      ...filtersApplied,
      [key]: "",
    };
    setFormFieldValues({ ...formFieldValues, [key]: "" });
    setFiltersApplied(params);
    fetchAPIDetails(params);
  };

  return (
    <>
      {matchId ? (
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-white w-full">
            {/* Match header info */}
            <div className="px-[16px] md:px-[30px] border-b-[1px] border-[#E0E1EA] flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
              <p className="py-[8px] md:py-[10px] whitespace-nowrap pr-0 md:pr-[20px] text-[12px] font-medium text-[#343432] border-b-[1px] md:border-b-0 w-full md:w-auto md:border-r-[1px] border-[#E0E1EA]">
                {selectedMatchData?.match}
              </p>
              <div className="py-[6px] md:py-[10px] flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center w-full">
                <div className="border-b-[1px] md:border-b-0 w-full md:w-auto md:pr-[20px] md:border-r-[1px] border-[#E0E1EA]">
                  {renderListValue(
                    <Image
                      src={blueCalendar}
                      alt="location"
                      width={14}
                      height={14}
                    />,
                    selectedMatchData?.eventDate
                  )}
                </div>
                <div className="border-b-[1px] md:border-b-0 w-full md:w-auto md:pr-[20px] md:border-r-[1px] border-[#E0E1EA]">
                  {renderListValue(
                    <Image
                      src={blueClock}
                      alt="location"
                      width={14}
                      height={14}
                    />,
                    selectedMatchData?.eventTime
                  )}
                </div>
                <div className="w-full md:w-auto">
                  {renderListValue(
                    <Image
                      src={blueLocation}
                      alt="location"
                      width={14}
                      height={14}
                    />,
                    selectedMatchData?.Venue
                  )}
                </div>
              </div>
            </div>

            {/* Filter form */}
            <div className="px-[16px] md:px-[24px] py-[16px] md:py-[12px] border-b-[1px] border-[#E0E1EA]">
              <InventoryFilterForm
                formFieldValues={formFieldValues}
                handleChange={handleChange}
                filters={filters}
              />
            </div>

            {/* Stats bar */}
            <div className="flex gap-2 items-center">
              <div className="border-b-[1px] border-[#E0E1EA] overflow-x-auto whitespace-nowrap">
                <div className="px-[16px] md:px-[21px] flex gap-3 items-center w-fit border-r-[1px] py-[10px] border-[#E0E1EA]">
                  {renderListItem(
                    <Image src={hamburger} width={18} height={18} alt="logo" />,
                    filters?.TotalListingTickets
                  )}
                  {renderListItem(
                    <Image
                      src={blueTicket}
                      width={18}
                      height={18}
                      alt="logo"
                    />,
                    filters?.TotalQtyTickets
                  )}
                  <button
                    onClick={() => resetFilters()}
                    className="border-[1px] cursor-pointer border-[#DADBE5] p-[4px]"
                  >
                    <IconStore.reload className="size-3.5" />
                  </button>
                </div>
              </div>
              {!isEmptyObject(filtersApplied) && (
                <div className="flex gap-2 flex-wrap items-center">
                  {Object.entries(filtersApplied)?.map(
                    ([key, value], index) => {
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
                    }
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Map toggle button - now visible on mobile */}
          <div className="px-[16px] md:px-[24px] flex gap-2">
            {isMobile && (
              <button
                onClick={toggleMap}
                className="bg-[#696D76] text-white px-3 py-2 rounded-md flex items-center gap-1 mb-2"
              >
                <span className="text-[12px] font-medium">
                  {showMap ? "Hide Map" : "View Map"}
                </span>
                <IconStore.chevronDown
                  className={`stroke-white text-white size-3 transition-transform duration-300 ${
                    showMap ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
          {/* Map and table container */}
          <div className="px-[16px] md:px-[24px] pb-[24px] flex flex-col md:flex-row relative">
            {!isMobile && !showMap && (
              <div
                onClick={() => setShowMap(!showMap)}
                className={`absolute top-10 z-[10] ${
                  showMap ? "left-[265px]" : "-left-9"
                } cursor-pointer -translate-y-1/2 -rotate-90 origin-center transition-all duration-300`}
              >
                <div className="px-3 text-white flex items-center gap-1 py-2 bg-[#343432] rounded-md">
                  <p className="text-white text-[12px] font-medium">View Map</p>
                  <IconStore.chevronDown
                    className={`stroke-white text-white size-3 transition-transform duration-300 ${
                      showMap ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Map Container - Full width on mobile when visible */}
            {showMap && (
              <div
                className={`transition-all duration-300 h-[300px] md:h-full overflow-hidden ${
                  isMobile
                    ? "w-full mb-4"
                    : "w-[50%] border-r-[1px] border-[#DADBE5]"
                }`}
              >
                <PinPatchMap
                  onClose={() => {
                    setShowMap(false);
                  }}
                  svgUrl={response?.match_details?.stadium_image}
                  mapData={response?.map}
                  displayTicketDetails={displayTicketDetails}
                  commonProps={commonProps}
                />
              </div>
            )}

            {/* Table Container */}
            <div
              className={`bg-white rounded-lg max-h-[450px] overflow-scroll ${
                isMobile || !showMap ? "w-full" : "w-[50%]"
              }`}
            >
              <StickyDataTable
                headers={headers}
                data={data}
                rightStickyColumns={rightStickyColumns}
                loading={loader}
                onScrollEnd={fetchScrollEnd}
                rightStickyHeaders={rightStickyHeaders}
                handleTicketMouseEnter={handleTicketMouseEnter}
                handleTicketMouseLeave={handleTicketMouseLeave}
              />
            </div>
          </div>
        </div>
      ) : (
        <NonMatchSelectUI />
      )}
    </>
  );
};

export default InventoryFolder;
