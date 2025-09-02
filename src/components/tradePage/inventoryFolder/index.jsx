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
  console.log(response, "responseresponse");
  const {
    match_details = {},
    ticket_details = [],
    totalAmount = "",
    filters: filterValues = {},
  } = response;
  const [selectedItem, setSelectedItem] = useState("all");
  const [filters, setFilters] = useState(filterValues);
  const [displayTicketDetails, setDisplayTicketDetails] =
    useState(ticket_details);
  const [filtersApplied, setFiltersApplied] = useState({ page: 1 });
  const [lastPage, setLastPage] = useState(response?.meta?.last_page);
  const [currentPage, setCurrentPage] = useState(response?.meta?.current_page);
  const [showMap, setShowMap] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  // Enhanced mobile detection with better breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 768;
      setIsMobile(isMobileDevice);

      // Auto-hide map on mobile initially
      if (isMobileDevice && showMap) {
        setShowMap(false);
      }

      // Auto-show map on desktop
      if (!isMobileDevice && !showMap) {
        setShowMap(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showMap]);

  const renderListValue = (icon, text) => {
    return (
      <div className="flex gap-[8px] items-center min-w-0">
        <div className="flex-shrink-0">{icon}</div>
        <p className="text-[12px] sm:text-[14px] font-normal text-[#343432] truncate">
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
    setFilters(response?.filters);
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
  const rightStickyColumns = displayTicketDetails?.map((item) => {
    return [
      // Price as first sticky column for both mobile and desktop
      {
        icon: <p className="text-[12px] lg:text-[14px] font-medium">{item?.price_with_symbol}</p>,
        className: "border-r-[1px] border-[#E0E1EA] text-[#343432] text-[12px] bg-white",
      },
      // Desktop-only action icons
      ...(isMobile
        ? []
        : [
            // Desktop sticky columns (excluding price which is now first)
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
                <p className="text-center text-[12px]">{item?.ticket_type}</p>
              ),
              key: "attach",
            },
            {
              icon: <Image width={16} height={16} src={crossHand} alt="hand" />,
              className: "cursor-pointer px-2",
              key: "oneHand",
              tooltipComponent: (
                <div className="text-[12px]">
                  <p className="text-center">
                    Expected Delivery Date:
                    <br />
                    {dateFormat(item?.expected_date_inhand)}
                  </p>
                </div>
              ),
              tooltipPosition: "top",
            },
            {
              icon: (
                <Image
                  width={20}
                  height={20}
                  src={documentText}
                  alt="document"
                />
              ),
              className: "cursor-pointer pr-2",
              key: "document",
              tooltipComponent: (
                <div className="max-w-[250px]">
                  <div className="font-medium text-gray-800 mb-2 text-xs pb-1 border-b border-gray-200">
                    Benefits/Restrictions
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {(item?.listing_note?.length > 0
                      ? item?.listing_note
                      : [{ ticket_note: "No Restrictions" }]
                    )?.map((note, index) => (
                      <div key={index}>
                        {typeof note === "object" && note !== null ? (
                          <div className="space-y-1">
                            {Object.values(note).map((value, i) => (
                              <div
                                key={i}
                                className="text-gray-700 leading-tight"
                              >
                                •{" "}
                                {typeof value === "string"
                                  ? value
                                  : String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-700 leading-tight">
                            • {typeof note === "string" ? note : String(note)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
              tooltipPosition: "top",
            },
          ]),
      // Star (favorites) - common for both mobile and desktop
      {
        icon: (
          <Image
            onClick={() => {
              handleClickFavourites(item);
            }}
            width={isMobile ? 16 : 20}
            height={isMobile ? 16 : 20}
            src={item?.trackingfound == 1 ? star : beforeFaviurates}
            alt="star"
          />
        ),
        tooltipComponent: <p className="text-center text-[12px]">Track this ticket</p>,
        className: `border-x-[1px] px-2 border-[#E0E1EA] cursor-pointer bg-white ${isMobile ? 'px-1' : 'px-2'}`,
        key: "star",
      },
      // Buy button - common for both mobile and desktop
      {
        icon: (
          <button
            onClick={() => {
              handleClickItem(item);
            }}
            className={`bg-[#343432] py-1 rounded-md hover:bg-[#343432] text-white font-medium transition-colors whitespace-nowrap ${
              isMobile ? 'px-2 text-[10px]' : 'px-2 text-xs'
            }`}
          >
            Buy
          </button>
        ),
        className: "bg-white",
        key: "buy",
      },
    ];
  });

  const renderListItem = (icon, text) => {
    return (
      <div className="flex gap-2 items-center whitespace-nowrap">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <p className="text-[#343432] text-[12px] sm:text-[14px] font-normal truncate">
          {text}
        </p>
      </div>
    );
  };

  const fetchScrollEnd = async () => {
    console.log(currentPage, lastPage, "ppppppppppppppppppppppp");
    if (currentPage >= lastPage) return;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const params = {
      ...filtersApplied,
      page: currentPage + 1,
    };

    await fetchAPIDetails(params, true);
    setFiltersApplied(params);
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

  // Enhanced headers for different screen sizes
  const headers = [
    { key: "qty", label: "Qty" },
    { key: "category", label: "Category" },
    { key: "section", label: isMobile ? "Block" : "Section/Block" },
    { key: "row", label: "Row" },
    // Remove the mobile-specific actions column since individual actions will be sticky
  ];

  // Enhanced data mapping for mobile
  const data = displayTicketDetails?.map((item) => {
    return {
      qty: item?.quantity,
      category: item?.seat_category,
      section: item?.block_id,
      row: item?.row,
      // Remove mobile price from here since it will be in sticky columns
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

  const rightStickyHeaders = isMobile ? ["Price"] : ["Ticket Price"];

  // Enhanced right sticky columns with better mobile handling
 

  const handleTicketMouseEnter = (categoryId) => {
    if (!svgContainerRef.current) return;

    const categoryIdStr = String(categoryId);

    svgContainerRef.current
      .querySelectorAll("[data-section] .block")
      .forEach((block) => {
        const blockCategoryId = block?.getAttribute("data-category-id");

        if (String(blockCategoryId) === categoryIdStr) {
          block.style.fill = "#7d7af9";
          const text = block.closest("[data-section]")?.querySelector("text");
          if (text) text.style.fill = "#fff";
        } else {
          const originalColor = block.getAttribute("data-color");
          if (originalColor) block.style.fill = originalColor;
          const text = block.closest("[data-section]")?.querySelector("text");
          if (text) text.style.fill = "#000";
        }
      });

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
            {/* Enhanced Match header info with better mobile layout */}
            <div className="px-[16px] lg:px-[30px] border-b-[1px] border-[#E0E1EA]">
              {/* Match title - full width on mobile */}
              <div className="py-[8px] lg:py-[10px] border-b-[1px] lg:border-b-0 lg:inline-block lg:pr-[20px] lg:border-r-[1px] border-[#E0E1EA]">
                <p className="text-[12px] lg:text-[14px] font-medium text-[#343432] break-words">
                  {selectedMatchData?.match}
                </p>
              </div>

              {/* Match details - responsive grid */}
              <div className="py-[6px] lg:py-[10px] lg:inline-block lg:ml-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 lg:gap-4">
                  <div className="pb-2 sm:pb-0 lg:pr-[20px] lg:border-r-[1px] border-[#E0E1EA]">
                    {renderListValue(
                      <Image
                        src={blueCalendar}
                        alt="calendar"
                        width={14}
                        height={14}
                      />,
                      selectedMatchData?.eventDate
                    )}
                  </div>
                  <div className="pb-2 sm:pb-0 lg:pr-[20px] lg:border-r-[1px] border-[#E0E1EA]">
                    {renderListValue(
                      <Image
                        src={blueClock}
                        alt="clock"
                        width={14}
                        height={14}
                      />,
                      selectedMatchData?.eventTime
                    )}
                  </div>
                  <div className="min-w-0">
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
            </div>

            {/* Enhanced Filter form with toggle on mobile */}
            <div className="border-b-[1px] border-[#E0E1EA]">
              {isMobile ? (
                <>
                  <div className="px-[16px] py-[12px] flex justify-between items-center">
                    <h3 className="text-[14px] font-medium text-[#343432]">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-3 py-1 bg-[#F5F5F7] rounded-md"
                    >
                      <span className="text-[12px] font-medium text-[#343432]">
                        {showFilters ? "Hide" : "Show"}
                      </span>
                      <IconStore.chevronDown
                        className={`size-4 transition-transform duration-200 ${
                          showFilters ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {showFilters && (
                    <div className="px-[16px] pb-[16px]">
                      <InventoryFilterForm
                        formFieldValues={formFieldValues}
                        handleChange={handleChange}
                        filters={filters}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="px-[24px] py-[12px]">
                  <InventoryFilterForm
                    formFieldValues={formFieldValues}
                    handleChange={handleChange}
                    filters={filters}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Stats bar with horizontal scroll on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center">
              <div className="border-b-[1px] sm:border-b-[1px] border-[#E0E1EA] overflow-x-auto w-full sm:w-auto">
                <div className="px-[16px] lg:px-[21px] flex gap-3 items-center w-fit border-r-[1px] py-[10px] border-[#E0E1EA] min-w-max">
                  {renderListItem(
                    <Image
                      src={hamburger}
                      width={16}
                      height={16}
                      alt="listings"
                    />,
                    `${filters?.TotalListingTickets} Listings`
                  )}
                  {renderListItem(
                    <Image
                      src={blueTicket}
                      width={16}
                      height={16}
                      alt="tickets"
                    />,
                    `${filters?.TotalQtyTickets} Tickets`
                  )}
                  <button
                    onClick={() => resetFilters()}
                    className="border-[1px] cursor-pointer border-[#DADBE5] p-[4px] rounded hover:bg-[#F5F5F7] transition-colors"
                  >
                    <IconStore.reload className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter chips with horizontal scroll */}
              {!isEmptyObject(filtersApplied) && (
                <div className="px-[16px] sm:px-0 sm:pl-2 w-full sm:w-auto overflow-x-auto">
                  <div className="flex gap-2 items-center min-w-max pb-2 sm:pb-0">
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
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Map toggle with better mobile styling */}
          <div className="px-[16px] lg:px-[24px]">
            {isMobile && (
              <button
                onClick={toggleMap}
                className="bg-[#696D76] text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-4 shadow-sm hover:bg-[#5a5e67] transition-colors"
              >
                <span className="text-[14px] font-medium">
                  {showMap ? "Hide Map" : "View Stadium Map"}
                </span>
                <IconStore.chevronDown
                  className={`stroke-white text-white size-4 transition-transform duration-300 ${
                    showMap ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* Enhanced Map and table container */}
          <div className="px-[16px] lg:px-[24px] pb-[24px] flex flex-col lg:flex-row relative">
            {/* Desktop map toggle */}
            {!isMobile && !showMap && (
              <div
                onClick={() => setShowMap(!showMap)}
                className={`absolute top-10 z-[10] ${
                  showMap ? "left-[265px]" : "-left-9"
                } cursor-pointer -translate-y-1/2 -rotate-90 origin-center transition-all duration-300`}
              >
                <div className="px-3 text-white flex items-center gap-1 py-2 bg-[#343432] rounded-md hover:bg-[#2a2a28] transition-colors">
                  <p className="text-white text-[12px] font-medium">View Map</p>
                  <IconStore.chevronDown
                    className={`stroke-white text-white size-3 transition-transform duration-300 ${
                      showMap ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Enhanced Map Container */}
            {showMap && (
              <div
                className={`transition-all duration-300 overflow-hidden bg-white rounded-lg ${
                  isMobile
                    ? "w-full h-[280px] sm:h-[350px] mb-4 shadow-sm"
                    : "w-[50%] h-[400px] xl:h-[500px] border-r-[1px] border-[#DADBE5]"
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

            {/* Enhanced Table Container */}
            <div
              className={`bg-white rounded-lg shadow-sm ${
                isMobile || !showMap ? "w-full" : "w-[50%]"
              }`}
            >
              <div
                className={`${
                  isMobile ? "max-h-[400px]" : "max-h-[400px] xl:max-h-[500px]"
                } overflow-auto`}
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
                  stickyColumnsConfig={{
                    columnWidths: isMobile ? [
                      80, // Price
                      40, // Star icon
                      60, // Buy button
                    ] : [
                      120, // Ticket Price
                      50,  // Attachment icon
                      50,  // Hand icon
                      50,  // Document icon
                      50,  // Star icon
                      80,  // Buy button
                    ],
                  }}
                />
              </div>
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
