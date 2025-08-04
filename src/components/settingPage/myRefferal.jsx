import React, { useState, useEffect, useMemo } from "react";
import { Copy, Users, Check } from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomSelect from "../commonComponents/customSelect";
import Button from "../commonComponents/button";
import useCopyToClipboard from "@/Hooks/useCopyClipboard";

const MyReferrals = (props) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { referralCode, referralHistory } = props ?? {};
  const { refer_code } = referralCode?.data || {};
  const { refer_user = [] } = referralHistory?.data || {};

  // State management
  const [domain, setDomain] = useState("");
  const [referralUsers, setReferralUsers] = useState(refer_user);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Set domain only on client side to prevent hydration mismatch
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  // Update referral users when props change
  useEffect(() => {
    setReferralUsers(refer_user);
  }, [refer_user]);

  // Fuzzy search implementation similar to MyTeamView
  const fuzzySearchUsers = (users, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return users;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase().trim();
    const searchWords = lowercaseSearchTerm.split(' ').filter(word => word.length > 0);
    
    return users.filter(user => {
      const searchableText = [
        user.first_name || '',
        user.last_name || '',
        user.refer_code || ''
      ].join(' ').toLowerCase();
      
      return searchWords.every(word => searchableText.includes(word));
    });
  };

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    let filtered = fuzzySearchUsers(referralUsers, searchText);
    
    if (statusFilter) {
      filtered = filtered.filter(user => {
        if (statusFilter === "active") return user.status === 1;
        if (statusFilter === "inactive") return user.status === 0;
        return true;
      });
    }
    
    return filtered;
  }, [referralUsers, searchText, statusFilter]);

  // Calculate pagination for filtered results
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredUsers / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Update current page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  // Reset pagination when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const viewOptions = {
    options: [
      { value: "10", label: "10" },
      { value: "20", label: "20" },
      { value: "50", label: "50" },
    ],
    selectedOption: itemsPerPage?.toString(),
    onChange: (value) => {
      setItemsPerPage(parseInt(value));
    },
  };

  const statusOptions = {
    options: [
      { value: "", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    selectedOption: statusFilter,
    onChange: (value) => {
      setStatusFilter(value);
    },
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputChange = (e) => {
    const page = parseInt(e.target.value) || 1;
    if (page > 0 && page <= totalPages && totalPages > 0) {
      setCurrentPage(page);
    } else if (page > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleCopyLink = () => {
    if (domain && refer_code) {
      const fullReferralLink = `${domain}/signup?refer_code=${refer_code}`;
      copyToClipboard(fullReferralLink);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const headerClassName = "px-2 sm:px-4 py-2 border-b border-r border-[#eaeaf1] text-xs sm:text-sm font-medium text-[#343432]";
  const rowClassName = "px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-b border-r border-[#eaeaf1]";

  // Mobile view component
  const renderMobileView = () => {
    return (
      <div className="flex flex-col gap-3 sm:hidden">
        {paginatedUsers && paginatedUsers.length > 0 ? (
          paginatedUsers.map((user, index) => (
            <div key={index} className="border rounded-md border-[#eaeaf1] p-3">
              <div className="flex justify-between items-center border-b border-[#eaeaf1] pb-2 mb-2">
                <span className="font-medium text-sm capitalize">
                  {user.first_name} {user.last_name}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status === 1 ? "Active" : "Inactive"}
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
            No referrals found
          </div>
        )}
      </div>
    );
  };

  // Table view component
  const renderTableView = () => {
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
            {paginatedUsers && paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-100">
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
                        user.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === 1 ? "Active" : "Inactive"}
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
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <p className="pb-2 sm:pb-4 text-base sm:text-lg md:text-xl p-3 sm:p-4 font-semibold">
        My Referrals
      </p>

      {/* Referral Link Section */}
      <div className="bg-white p-3 sm:p-4 border-[1px] border-[#eaeaf1] w-full mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Share your referral link
          </span>
          <button
            onClick={handleCopyLink}
            disabled={!domain || !refer_code}
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
        <div className="text-sm text-blue-600 bg-gray-50 p-2 rounded border break-all">
          {domain && refer_code 
            ? `${domain}/signup?refer_code=${refer_code}` 
            : "Loading..."}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Referral Code: <span className="font-mono font-medium">{refer_code}</span>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full flex-grow overflow-hidden">
        <div className="border-[1px] border-[#eaeaf1] rounded-md">
          {/* Search and filter area */}
          <div className="p-3 sm:p-4 border-b-[1px] border-[#eaeaf1] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="border-[1px] flex gap-2 items-center px-1 py-[4px] w-full sm:w-[40%] border-[#eaeaf1] rounded-md relative">
              <IconStore.search className="size-4 stroke-[#343432] stroke-4" />
              <input
                type="text"
                placeholder="Search by name or refer code"
                onChange={handleSearchChange}
                value={searchText}
                className="outline-none placeholder:font-[300] placeholder:opacity-50 text-xs sm:text-sm w-full"
              />
              {searchText && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto">
              <CustomSelect
                selectedValue={statusOptions.selectedOption}
                options={statusOptions.options}
                onSelect={statusOptions.onChange}
                textSize="text-xs sm:text-sm"
                buttonPadding="px-[10px] py-[6px]"
                dropdownItemPadding="py-1 pl-2 pr-6"
                placeholder="Filter by status"
              />
            </div>

            {(searchText || statusFilter) && (
              <div className="text-xs text-gray-600">
                {totalFilteredUsers} of {referralUsers.length} referrals found
              </div>
            )}
          </div>

          {/* User count and pagination controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="p-3 sm:p-4 text-xs sm:text-sm text-[#343432] border-b-[1px] sm:border-b-0 sm:border-r-[1px] border-[#eaeaf1] font-medium w-full sm:w-auto">
              {searchText || statusFilter ? `${totalFilteredUsers} filtered` : `${referralUsers.length} total`} referrals
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
                      disabled={currentPage === 1}
                      className={`p-1 ${
                        currentPage === 1 ? "text-gray-300" : "hover:bg-gray-100"
                      }`}
                    >
                      <IconStore.chevronLeft />
                    </button>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1 ${
                        currentPage === totalPages
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
            {paginatedUsers.length === 0 && (searchText || statusFilter) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No referrals found matching your filters</p>
                <button
                  onClick={() => {
                    handleClearSearch();
                    setStatusFilter("");
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs mt-2 underline"
                >
                  Clear filters to see all referrals
                </button>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-3 size-12 text-gray-300" />
                <p className="text-sm">No referrals found</p>
                <p className="text-xs mt-1">Start sharing your referral link to see referred users here.</p>
              </div>
            ) : (
              <>
                {renderMobileView()}
                {renderTableView()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReferrals;