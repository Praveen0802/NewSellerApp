import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Copy, Users, Check, X, Eye } from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomSelect from "../commonComponents/customSelect";
import Button from "../commonComponents/button";
import useCopyToClipboard from "@/Hooks/useCopyClipboard";
import reloadIcon from "../../../public/reload.svg";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import {
  getReferralBookings,
  getReferralHistory,
} from "@/utils/apiHandler/request";
import FloatingDateRange from "../commonComponents/dateRangeInput";

// Add this import at the top of your MyReferrals component
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import ReferralPopup from "./components/referralPopup";

const MyReferrals = (props) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  // Memoize destructured values to prevent unnecessary re-renders
  const referCodeData = useMemo(() => {
    return props?.referralCode?.data?.refer_code || "";
  }, [props?.referralCode?.data?.refer_code]);

  const referUserData = useMemo(() => {
    return props?.referralHistory?.data?.referral_users || [];
  }, [props?.referralHistory?.data?.referral_users]);

  const metaDetails = useMemo(() => {
    return props?.referralHistory?.data?.meta || {};
  }, [props?.referralHistory?.data?.meta]);

  // State management
  const [domain, setDomain] = useState("");
  const [referralUsers, setReferralUsers] = useState(referUserData);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(
    metaDetails?.current_page || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(metaDetails?.per_page || 10);
  const [totalPages, setTotalPages] = useState(metaDetails?.last_page || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState({
    show: false,
    data: "",
  });

  // Set domain only on client side to prevent hydration mismatch
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  // Update referral users when props change
  useEffect(() => {
    setReferralUsers(referUserData);
  }, [referUserData]);

  // Update pagination details when meta changes
  useEffect(() => {
    setTotalPages(metaDetails?.last_page || 1);
    setCurrentPage(metaDetails?.current_page || 1);
  }, [metaDetails?.last_page, metaDetails?.current_page]);

  // API call handler similar to MyTeamView
  const handleApiCall = async (params) => {
    setIsLoading(true);
    try {
      const response = await getReferralHistory("", params);

      setReferralUsers(response?.data?.referral_users || []);
      // Update meta details if returned by API
      if (response?.meta) {
        setTotalPages(response.meta.last_page);
        setCurrentPage(response.meta.current_page);
      }
    } catch (error) {
      console.error("Error fetching referral history:", error);
    }
    setIsLoading(false);
  };

  // Debounce search to avoid too many API calls
  const debounceTimer = useCallback(() => {
    let timeoutId;
    return (callback, delay) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }, []);

  const debouncedSearch = useMemo(() => debounceTimer(), [debounceTimer]);

  // Trigger API call when pagination or filters change
  useEffect(() => {
    if (currentPage && getReferralHistory) {
      handleApiCall({
        page: currentPage,
        per_page: itemsPerPage,
        keyword: searchText,
        ...(statusFilter && { status: statusFilter }),
      });
    }
  }, [currentPage, itemsPerPage]);

  // Handle search text change with debounce
  const handleSearchChange = useCallback(
    (e) => {
      const newSearchText = e.target.value;
      setSearchText(newSearchText);

      // Debounce the API call by 300ms to avoid excessive requests
      debouncedSearch(() => {
        handleApiCall({
          page: 1,
          per_page: itemsPerPage,
          keyword: newSearchText,
          ...(statusFilter && { status: statusFilter }),
          ...(startDate?.startDate && { start_date: startDate?.startDate }),
          ...(endDate?.startDate && { end_date: endDate?.startDate }),
        });
        setCurrentPage(1);
      }, 300);
    },
    [
      itemsPerPage,
      statusFilter,
      startDate,
      endDate,
      debouncedSearch,
      handleApiCall,
    ]
  );

  // Memoize options objects
  const viewOptions = useMemo(
    () => ({
      options: [
        { value: "10", label: "10" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
      ],
      selectedOption: itemsPerPage?.toString(),
      onChange: (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
      },
    }),
    [itemsPerPage]
  );

  // Memoize event handlers
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePageInputChange = useCallback(
    (e) => {
      const page = parseInt(e.target.value) || 1;
      if (page > 0 && page <= totalPages && totalPages > 0) {
        setCurrentPage(page);
      } else if (page > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else {
        setCurrentPage(1);
      }
    },
    [totalPages]
  );

  const handleStatusChange = async (value) => {
    setStatusFilter(value);
    await handleApiCall({
      page: 1,
      per_page: itemsPerPage,
      keyword: searchText,
      ...(value && { status: value }),
    });
    setCurrentPage(1);
  };

  const handleDateChange = async (range, key) => {
    setStartDate(range);

    await handleApiCall({
      page: 1,
      per_page: itemsPerPage,
      keyword: searchText,
      ...(range?.startDate && { start_date: range?.startDate }),
    });
    setCurrentPage(1);
  };

  const handleEndDateChange = async (range, key) => {
    setEndDate(range);

    await handleApiCall({
      page: 1,
      per_page: itemsPerPage,
      keyword: searchText,
      ...(range?.startDate && { end_date: range?.startDate }),
    });
    setCurrentPage(1);
  };

  const values = [
    {
      name: "Referral earnings",
      value:
        props?.referralHistory?.data?.overview?.total_amounts?.map(
          (item) => item?.amount_with_currency
        ) || 0,
      key: "referral_earnings",
    },
    {
      name: "Total Users",
      key: "total_user",
      value: props?.referralHistory?.data?.overview?.total_user || 0,
    },
    {
      name: "Active Users",
      key: "active_user",
      value: props?.referralHistory?.data?.overview?.active_user || 0,
    },
    {
      name: "Inactive Users",
      value: props?.referralHistory?.data?.overview?.inactive_user || 0,
      key: "inactive_user",
    },
  ];

  const handleCopyLink = useCallback(() => {
    if (domain && referCodeData) {
      const fullReferralLink = `${domain}/signup?refer_code=${referCodeData}`;
      copyToClipboard(fullReferralLink);
    }
  }, [domain, referCodeData, copyToClipboard]);

  // Memoize format date function
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);
  const [earningsIndex, setEarningsIndex] = useState(0);

  const handleEarningsNext = useCallback(() => {
    const earningsArray =
      values.find((v) => v.key === "referral_earnings")?.value || [];
    if (Array.isArray(earningsArray) && earningsArray.length > 0) {
      setEarningsIndex((prevIndex) =>
        prevIndex === earningsArray.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [values]);

  const handleEarningsPrev = useCallback(() => {
    const earningsArray =
      values.find((v) => v.key === "referral_earnings")?.value || [];
    if (Array.isArray(earningsArray) && earningsArray.length > 0) {
      setEarningsIndex((prevIndex) =>
        prevIndex === 0 ? earningsArray.length - 1 : prevIndex - 1
      );
    }
  }, [values]);

  // Memoize class names
  const headerClassName = useMemo(
    () =>
      "px-2 sm:px-4 py-2 border-b border-r border-[#eaeaf1] text-xs sm:text-sm font-medium text-[#343432]",
    []
  );

  const rowClassName = useMemo(
    () =>
      "px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-b border-r border-[#eaeaf1]",
    []
  );

  // Mobile view component - memoized
  const MobileView = useMemo(() => {
    return (
      <div className="flex flex-col gap-3 sm:hidden">
        {referralUsers && referralUsers.length > 0 ? (
          referralUsers.map((user, index) => (
            <div
              key={user.refer_code || index}
              className="border rounded-md border-[#eaeaf1] p-3"
            >
              <div className="flex justify-between items-center border-b border-[#eaeaf1] pb-2 mb-2">
                <span className="font-medium text-sm capitalize">
                  {user.first_name} {user.last_name}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 1 || user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status === 1 || user.status === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Refer Code:</span>
                  <span className="font-mono">{user.refer_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border rounded-md border-[#eaeaf1] p-4 text-center text-gray-500">
            {isLoading ? "Loading..." : "No referrals found"}
          </div>
        )}
      </div>
    );
  }, [referralUsers, formatDate, isLoading]);

  // In MyReferrals component, update the handleEyeIconClick function:

  const handleEyeIconClick = async (user) => {
    console.log(user, "useruseruser");

    // Show popup immediately with loading state
    setShowReferralPopup({ show: true, data: null, isLoading: true });

    try {
      const values = await getReferralBookings("", { user_id: user.id });
      // Update popup with actual data and remove loading state
      setShowReferralPopup({ show: true, data: values, isLoading: false });
    } catch (error) {
      console.error("Error fetching referral bookings:", error);
      // Handle error state
      setShowReferralPopup({
        show: true,
        data: null,
        isLoading: false,
        error: true,
      });
    }
  };

  // Table view component - memoized
  const TableView = useMemo(() => {
    return (
      <div className="w-full border-[1px] hidden sm:block max-h-[calc(100vh-400px)] overflow-auto border-[#eaeaf1] rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className={headerClassName}>Name</th>
              <th className={headerClassName}>Refer Code</th>
              <th className={headerClassName}>Status</th>
              <th className={headerClassName}>Joined Date</th>
              <th className={headerClassName}>View Bookings</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : referralUsers && referralUsers.length > 0 ? (
              referralUsers.map((user, index) => (
                <tr key={user.refer_code || index} className="">
                  <td className={rowClassName}>
                    <span className="capitalize">
                      {user.first_name} {user.last_name}
                    </span>
                  </td>
                  <td className={rowClassName}>
                    <span className="font-mono">{user.refer_code}</span>
                  </td>
                  <td className={rowClassName}>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 1 || user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === 1 || user.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className={rowClassName}>
                    {formatDate(user.created_at)}
                  </td>
                  <td className={`${rowClassName} text-center`}>
                    <Eye
                      onClick={() => {
                        handleEyeIconClick(user);
                      }}
                      className="size-5 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No referrals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }, [referralUsers, headerClassName, rowClassName, formatDate, isLoading]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      <p className="pb-2 sm:pb-4 text-base sm:text-lg md:text-xl p-3 sm:p-4 font-semibold">
        My Referrals
      </p>

      {/* Referral Link Section */}
      <div className="bg-white p-3 flex gap-4 items-center sm:p-4 border-[1px] border-[#eaeaf1] w-full mb-4">
        <div className="w-[50%]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Share your referral link
            </span>
            <button
              onClick={handleCopyLink}
              disabled={!domain || !referCodeData}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isCopied
                  ? "bg-green-600 text-white"
                  : "bg-[#343432] text-white hover:bg-[#343432]"
              }`}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border break-all">
            {domain && referCodeData
              ? `${domain}/signup?refer_code=${referCodeData}`
              : "Loading..."}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Referral Code:{" "}
            <span className="font-mono font-medium">{referCodeData}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center w-full">
          {values?.map((list, index) => {
            // Special handling for referral earnings
            if (list.key === "referral_earnings" && Array.isArray(list.value)) {
              const earningsArray = list.value;

              // If no earnings data, show default
              if (earningsArray.length === 0) {
                return (
                  <div
                    key={index}
                    className="border-[1px] w-full rounded-md border-[#eaeaf1] p-3 flex flex-col gap-3"
                  >
                    <p className="font-semibold text-sm">0</p>
                    <p className="text-xs">{list.name}</p>
                  </div>
                );
              }

              // If only one currency, show without navigation
              if (earningsArray.length === 1) {
                return (
                  <div
                    key={index}
                    className="border-[1px] w-full rounded-md border-[#eaeaf1] p-3 flex flex-col gap-3"
                  >
                    <p className="font-semibold text-sm">{earningsArray[0]}</p>
                    <p className="text-xs">{list.name}</p>
                  </div>
                );
              }

              // Multiple currencies - show with slider
              return (
                <div
                  key={index}
                  className="border-[1px] w-full rounded-md border-[#eaeaf1] p-3 flex flex-col gap-3 relative"
                >
                  {/* Navigation buttons */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      onClick={handleEarningsPrev}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Previous currency"
                    >
                      <ChevronLeft size={12} className="text-gray-600" />
                    </button>
                    <button
                      onClick={handleEarningsNext}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Next currency"
                    >
                      <ChevronRight size={12} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Current earning value */}
                  <p className="font-semibold text-sm pr-12">
                    {earningsArray[earningsIndex] || earningsArray[0]}
                  </p>

                  {/* Label and indicators */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs">{list.name}</p>

                    {/* Dot indicators */}
                  </div>
                </div>
              );
            }

            // Regular handling for other values
            return (
              <div
                key={index}
                className="border-[1px] w-full rounded-md border-[#eaeaf1] p-3 flex flex-col gap-3"
              >
                <p className="font-semibold text-sm">{list?.value}</p>
                <p className="text-xs">{list?.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full flex-grow overflow-hidden">
        <div className="border-[1px] border-[#eaeaf1] rounded-md">
          {/* Search and filter area */}
          <div className="p-3 sm:p-4 border-b-[1px] border-[#eaeaf1] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="border-[1px] flex gap-2 items-center px-1 py-[4px] w-full sm:w-[40%] border-[#eaeaf1] rounded-md">
              <IconStore.search className="size-4 stroke-[#343432] stroke-4" />
              <input
                type="text"
                placeholder="Search by name or refer code"
                onChange={handleSearchChange}
                value={searchText}
                className="outline-none placeholder:font-[300] placeholder:opacity-50 text-xs sm:text-sm w-full"
              />
            </div>
            <FloatingSelect
              label={"Status"}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              selectedValue={statusFilter}
              keyValue="referral_status"
              className="!w-[20%]"
              onSelect={(value) => {
                handleStatusChange(value);
              }}
              paddingClassName="!py-[6px] !px-[12px] w-[20%] text-xs"
              parentClassName=""
              labelClassName="!text-[11px]"
            />
            <FloatingDateRange
              label={"Start Date"}
              value={startDate}
              keyValue="start_date"
              className="!w-full"
              singleDateMode={true}
              onChange={handleDateChange}
              paddingClassName="!py-[6px] !px-[12px] w-[20%] text-xs"
              parentClassName="!w-[20%]"
              labelClassName="!text-[11px]"
            />
            <FloatingDateRange
              label={"End Date"}
              value={endDate}
              keyValue="end_date"
              className="!w-full"
              singleDateMode={true}
              onChange={handleEndDateChange}
              paddingClassName="!py-[6px] !px-[12px] w-[20%] text-xs"
              parentClassName="!w-[20%]"
              labelClassName="!text-[11px]"
            />
          </div>

          {/* User count and pagination controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <p className="p-3 sm:p-4 text-xs sm:text-sm text-[#343432] border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[#eaeaf1] font-medium w-full sm:w-auto">
                {metaDetails?.total || referralUsers.length} referrals
              </p>
              {(searchText ||
                statusFilter ||
                startDate?.startDate ||
                endDate?.startDate) && (
                <div className="flex gap-3 items-center flex-wrap">
                  <button
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium underline cursor-pointer"
                    title="Clear all filters"
                    onClick={() => {
                      setSearchText("");
                      setStatusFilter("");
                      setStartDate("");
                      setEndDate("");
                      handleApiCall({
                        page: 1,
                        per_page: itemsPerPage,
                        keyword: "",
                      });
                      setCurrentPage(1);
                    }}
                  >
                    <Image
                      src={reloadIcon}
                      width={30}
                      height={30}
                      alt="image-logo"
                    />
                  </button>

                  {/* Search Filter Chip */}
                  {searchText && (
                    <div className="py-2 px-3 flex gap-1 items-center text-sm border-[1px] border-[#eaeaf1] rounded-md">
                      Search: {searchText}
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          setSearchText("");
                          handleApiCall({
                            page: 1,
                            per_page: itemsPerPage,
                            keyword: "",
                            ...(statusFilter && { status: statusFilter }),
                            ...(startDate?.startDate && {
                              start_date: startDate.startDate,
                            }),
                            ...(endDate?.startDate && {
                              end_date: endDate.startDate,
                            }),
                          });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}

                  {/* Status Filter Chip */}
                  {statusFilter && (
                    <div className="py-2 px-3 flex gap-1 items-center text-sm border-[1px] border-[#eaeaf1] rounded-md">
                      Status: {statusFilter === "1" ? "Active" : "Inactive"}
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          setStatusFilter("");
                          handleApiCall({
                            page: 1,
                            per_page: itemsPerPage,
                            keyword: searchText,
                            ...(startDate?.startDate && {
                              start_date: startDate.startDate,
                            }),
                            ...(endDate?.startDate && {
                              end_date: endDate.startDate,
                            }),
                          });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}

                  {/* Start Date Filter Chip */}
                  {startDate?.startDate && (
                    <div className="py-2 px-3 flex gap-1 items-center text-sm border-[1px] border-[#eaeaf1] rounded-md">
                      Start Date: {formatDate(startDate.startDate)}
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          setStartDate("");
                          handleApiCall({
                            page: 1,
                            per_page: itemsPerPage,
                            keyword: searchText,
                            ...(statusFilter && { status: statusFilter }),
                            ...(endDate?.startDate && {
                              end_date: endDate.startDate,
                            }),
                          });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}

                  {/* End Date Filter Chip */}
                  {endDate?.startDate && (
                    <div className="py-2 px-3 flex gap-1 items-center text-sm border-[1px] border-[#eaeaf1] rounded-md">
                      End Date: {formatDate(endDate.startDate)}
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          setEndDate("");
                          handleApiCall({
                            page: 1,
                            per_page: itemsPerPage,
                            keyword: searchText,
                            ...(statusFilter && { status: statusFilter }),
                            ...(startDate?.startDate && {
                              start_date: startDate.startDate,
                            }),
                          });
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap sm:flex-nowrap justify-between w-full sm:w-auto border-t-[1px] sm:border-t-0 sm:border-l-[1px] p-3 sm:pl-4 border-[#eaeaf1] items-center text-[#343432] text-xs sm:text-sm">
              <div className="flex items-center mb-2 sm:mb-0 mr-0 sm:mr-4">
                <span className="mr-2">View</span>
                <CustomSelect
                  selectedValue={viewOptions.selectedOption}
                  options={viewOptions.options}
                  onSelect={viewOptions.onChange}
                  textSize="text-xs sm:text-sm"
                  buttonPadding="px-[10px] py-[4px]"
                  dropdownItemPadding="py-1 pl-2 pr-6"
                />
              </div>

              {totalPages > 1 && (
                <>
                  <div className="flex items-center mb-2 sm:mb-0 mr-0 sm:mr-4">
                    <span className="mr-2">Page</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={handlePageInputChange}
                      className="w-8 h-8 text-center border border-[#eaeaf1] rounded mx-1"
                    />
                    <span>of {totalPages}</span>
                  </div>

                  <div className="flex items-center sm:border-l border-[#eaeaf1] sm:pl-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isLoading}
                      className={`p-1 ${
                        currentPage === 1 || isLoading
                          ? "text-gray-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <IconStore.chevronLeft />
                    </button>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || isLoading}
                      className={`p-1 ${
                        currentPage === totalPages || isLoading
                          ? "text-gray-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <IconStore.chevronRight />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 flex-grow max-md:pb-10 overflow-auto">
          <div className="min-h-0 overflow-auto">
            {referralUsers.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-3 size-12 text-gray-300" />
                <p className="text-sm">No referrals found</p>
                <p className="text-xs mt-1">
                  Start sharing your referral link to see referred users here.
                </p>
              </div>
            ) : (
              <>
                {MobileView}
                {TableView}
              </>
            )}
          </div>
        </div>
      </div>
      {showReferralPopup?.show && (
        <ReferralPopup
          show={showReferralPopup.show}
          onClose={() =>
            setShowReferralPopup({ show: false, data: null, isLoading: false })
          }
          data={showReferralPopup.data}
          isLoading={showReferralPopup.isLoading}
          error={showReferralPopup.error}
        />
      )}
    </div>
  );
};

export default MyReferrals;
