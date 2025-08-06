import CustomSelect from "@/components/commonComponents/customSelect";
import { fetchOrderHistory } from "@/utils/apiHandler/request";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import { useEffect, useRef, useState } from "react";

// Shimmer Component
const ShimmerRow = ({ isMobile }) => {
  if (isMobile) {
    return (
      <div className="border-t border-[#eaeaf1] p-3 flex flex-col">
        <div className="flex justify-between mb-2">
          <div className="flex flex-col space-y-2 w-2/3">
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex flex-col space-y-2 w-2/3">
            <div className="h-3 bg-gray-300 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Desktop/Web Shimmer
  return (
    <tr className="border-t border-[#eaeaf1]">
      <td className="p-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        </div>
      </td>
      <td className="p-3">
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </td>
      <td className="p-3">
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </td>
      <td className="p-3 text-center">
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto animate-pulse"></div>
      </td>
      <td className="p-3">
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </td>
    </tr>
  );
};

// No Data Component
const NoDataFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="text-gray-400 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M12 18v-6"></path>
          <path d="M9 15h6"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[#343432] mb-1">No Data Found</h3>
      <p className="text-sm text-gray-500 text-center">
        There are no bookings available for the selected period.
      </p>
    </div>
  );
};

const LatestBookingTable = ({ listValues, meta }) => {
  const [bookings, setBookings] = useState(listValues || []);
  const [currentPage, setCurrentPage] = useState(meta?.current_page || 1);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState();
  const [initialLoad, setInitialLoad] = useState(true);
  const tableRef = useRef(null);
  const isMobile = useIsMobile();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date, time) => {
    return `${formatDate(date)} ${time}`;
  };

  const handleApiCall = async (params) => {
    const data = await fetchOrderHistory("", params);
    return data;
  };

  const filterValues = {
    options: [
      { value: "7", label: "last 7 days" },
      { value: "15", label: "last 15 days" },
      { value: "30", label: "last 30 days" },
      { value: "45", label: "last 45 days" },
    ],
    selectedOption: selectedFilter,
    onchange: (option) => {
      setSelectedFilter(option);
    },
  };

  const handleFilterChange = async (option) => {
    setLoading(true);
    setSelectedFilter(option);
    setCurrentPage(1);
    setBookings([]);

    try {
      const response = await handleApiCall({
        ...(option && { days: option }),
        page: 1,
      });
      setBookings(response?.order_history || []);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (loading || currentPage >= meta?.last_page) return;
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await handleApiCall({
        page: nextPage,
        ...(selectedFilter && { days: selectedFilter }),
      });
      setBookings((prevBookings) => [
        ...prevBookings,
        ...(data.order_history || []),
      ]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modified scroll handler to trigger at 50% scroll position
  const handleScroll = () => {
    const container = tableRef.current;
    if (!container) return;

    // Calculate how far down the user has scrolled (as a percentage)
    const scrollPercentage =
      (container.scrollTop /
        (container.scrollHeight - container.clientHeight)) *
      100;

    // Load more content when user has scrolled past 50% of the current content
    if (scrollPercentage > 50 && !loading) {
      fetchNextPage();
    }
  };

  // Use a debounced version of the scroll handler
  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const debouncedHandleScroll = debounce(handleScroll, 200);

  useEffect(() => {
    const container = tableRef.current;
    if (container) {
      container.addEventListener("scroll", debouncedHandleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", debouncedHandleScroll);
      }
    };
  }, [loading, currentPage]);

  useEffect(() => {
    // Set initial load to false after component mount
    if (initialLoad && listValues) {
      setInitialLoad(false);
    }
  }, [listValues]);

  const showNoData =
    !loading && !initialLoad && (!bookings || bookings.length === 0);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-full flex flex-col gap-4 md:gap-5 bg-[#F5F7FA]">
        <div className="bg-white border border-[#eaeaf1] h-full flex flex-col gap-3 md:gap-5 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row justify-between sm:gap-5 items-start sm:items-center p-3 md:p-5 border-b-[1px] border-[#eaeaf1]">
              <p className="text-[#343432] font-medium text-sm md:text-[18px] whitespace-nowrap">
                Purchase History
              </p>
              <CustomSelect
                selectedValue={selectedFilter}
                options={filterValues?.options}
                onSelect={handleFilterChange}
                className="!w-[170px]"
                textSize="text-xs md:text-sm"
                buttonPadding="px-2 md:px-3 py-1 md:py-[2px] !w-[170px]"
                dropdownItemPadding="py-[6px] px-2 "
              />
            </div>

            <div
              className="overflow-auto max-h-[350px] px-3 md:px-5"
              ref={tableRef}
            >
              {/* No Data Found State */}
              {showNoData && <NoDataFound />}

              {/* Desktop Table View */}
              {!showNoData && (
                <table className="min-w-full border-collapse hidden sm:table">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-gray-400">
                      <th className="p-3 text-left text-sm font-medium">
                        Order No
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Match
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Date & Time
                      </th>
                      <th className="p-3 text-left text-sm font-medium">Qty</th>
                      <th className="p-3 text-left text-sm font-medium">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings?.map((booking) => (
                      <tr
                        key={booking?.booking_id}
                        className="border-t border-[#eaeaf1] hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm text-[#343432] text-left">
                          {booking?.booking_no}
                        </td>
                        <td
                          title={booking?.match_name}
                          className="p-3 max-w-[200px] text-sm text-[#343432]"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium truncate">
                              {booking?.match_name}
                            </span>
                            <span className="text-xs text-[#343432] truncate">
                              {booking?.tournament_name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[#343432] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <IconStore.calendarDays className="size-4 flex-shrink-0" />
                            {formatDateTime(
                              booking?.match_date,
                              booking?.match_time
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[#343432] text-center">
                          {booking?.quantity}
                        </td>
                        <td className="p-3 text-sm text-[#343432] whitespace-nowrap">
                          {booking?.price_with_currency}
                        </td>
                      </tr>
                    ))}

                    {/* Show shimmer rows when loading - ALWAYS VISIBLE at the bottom when loading */}
                    {loading && (
                      <>
                        <tr>
                          <td
                            colSpan="5"
                            className="p-2 text-center text-xs text-gray-500 border-t border-[#eaeaf1]"
                          >
                            Loading more bookings...
                          </td>
                        </tr>
                        {Array(3)
                          .fill()
                          .map((_, index) => (
                            <ShimmerRow
                              key={`loading-${index}`}
                              isMobile={false}
                            />
                          ))}
                      </>
                    )}
                  </tbody>
                </table>
              )}

              {/* Mobile List View */}
              {!showNoData && (
                <div className="sm:hidden">
                  {bookings?.map((booking) => (
                    <div
                      key={booking?.booking_id}
                      className="border-t border-[#eaeaf1] p-3 flex flex-col"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-[#343432]">
                            {booking?.match_name}
                          </span>
                          <span className="text-xs text-[#343432]">
                            {booking?.tournament_name}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {booking?.price_with_currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-[#343432]">
                            {formatDateTime(
                              booking?.match_date,
                              booking?.match_time
                            )}
                          </span>
                          <span className="text-xs text-[#343432]">
                            {booking?.stadium_name}
                          </span>
                          <span className="text-xs text-[#343432]">
                            {booking?.city_name}, {booking?.country_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-[#343432] bg-gray-100 px-2 py-1 rounded">
                            Qty: {booking?.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show shimmer rows when loading on mobile - ALWAYS VISIBLE */}
                  {loading && (
                    <>
                      <div className="p-2 text-center text-xs text-gray-500 border-t border-[#eaeaf1]">
                        Loading more bookings...
                      </div>
                      {Array(3)
                        .fill()
                        .map((_, index) => (
                          <ShimmerRow
                            key={`mobile-loading-${index}`}
                            isMobile={true}
                          />
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestBookingTable;
