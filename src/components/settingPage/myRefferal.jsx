import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Copy, Users, Check } from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomSelect from "../commonComponents/customSelect";
import Button from "../commonComponents/button";
import useCopyToClipboard from "@/Hooks/useCopyClipboard";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import { getReferralHistory } from "@/utils/apiHandler/request";

const MyReferrals = (props) => {
  console.log(props, "propsprops");
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
  const [currentPage, setCurrentPage] = useState(
    metaDetails?.current_page || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(metaDetails?.per_page || 10);
  const [totalPages, setTotalPages] = useState(metaDetails?.last_page || 1);
  const [isLoading, setIsLoading] = useState(false);

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
      console.log(params,'paramsparams')
      const response = await getReferralHistory("", params);
      console.log(response,'responseresponseresponseresponse')
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

  const handleInputBlurOrEnter = (e, isBlur = false) => {
    if (isBlur || e.key === "Enter") {
      handleApiCall({
        page: 1,
        per_page: itemsPerPage,
        keyword: searchText,
        ...(statusFilter && { status: statusFilter }),
      });
      setCurrentPage(1);
    }
  };

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

  const values = [
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
                <tr
                  key={user.refer_code || index}
                  className="hover:bg-gray-100"
                >
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
                  : "bg-[#343432] text-white hover:bg-[#130061]"
              }`}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="text-xs text-blue-600 bg-gray-50 p-2 rounded border break-all">
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
            return (
              <div
                key={index}
                className="border-[1px] w-full rounded-md border-[#eaeaf1] p-3 flex flex-col gap-1"
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
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                onBlur={(e) => handleInputBlurOrEnter(e, true)}
                onKeyPress={(e) => handleInputBlurOrEnter(e)}
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
          </div>

          {/* User count and pagination controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="p-3 sm:p-4 text-xs sm:text-sm text-[#343432] border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[#eaeaf1] font-medium w-full sm:w-auto">
              {metaDetails?.total || referralUsers.length} referrals
            </p>

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
    </div>
  );
};

export default MyReferrals;
