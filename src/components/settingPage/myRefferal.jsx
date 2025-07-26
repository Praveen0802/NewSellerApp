import React, { useState, useEffect, useMemo } from "react";
import { Copy, Users, DollarSign, UserCheck, UserX, Check } from "lucide-react";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import useCopyToClipboard from "@/Hooks/useCopyClipboard";

const MyReferrals = (props) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const { referralCode, referralHistory } = props ?? {};
  const { refer_code } = referralCode?.data || {};
  const { refer_user = [] } = referralHistory?.data || {};

  // Fix hydration issue by using state for domain
  const [domain, setDomain] = useState("");

  // Mock data - moved outside of useState for better performance
  const mockReferralData = {
    referralCode: refer_code,
    stats: {
      totalEarnings: "£0.00",
      totalReferrals: 0,
      activeReferrals: 0,
      inactiveReferrals: 0,
    },
    referredUsers: refer_user || [],
  };

  const [searchName, setSearchName] = useState("");
  const [referralStatus, setReferralStatus] = useState("");

  // Set domain only on client side to prevent hydration mismatch
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  // Memoize stats cards for better performance
  const statsCards = useMemo(
    () => [
      {
        title: mockReferralData.stats.totalEarnings,
        desc: "Referral earnings",
        icon: <DollarSign className="stroke-green-600 size-5" />,
      },
      {
        title: mockReferralData.stats.totalReferrals.toString(),
        desc: "Total Referrals",
        icon: <Users className="stroke-blue-600 size-5" />,
      },
      {
        title: mockReferralData.stats.activeReferrals.toString(),
        desc: "Active",
        icon: <UserCheck className="stroke-green-600 size-5" />,
      },
      {
        title: mockReferralData.stats.inactiveReferrals.toString(),
        desc: "Inactive",
        icon: <UserX className="stroke-red-600 size-5" />,
      },
    ],
    [mockReferralData.stats]
  );

  // Memoize filtered users for better performance
  const filteredUsers = useMemo(() => {
    return mockReferralData.referredUsers.filter((user) => {
      const nameMatch = searchName
        ? `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(searchName.toLowerCase())
        : true;
      const statusMatch = referralStatus
        ? user.status === referralStatus
        : true;
      return nameMatch && statusMatch;
    });
  }, [searchName, referralStatus, mockReferralData.referredUsers]);

  const fullReferralLink =
    `${domain}/signup?refer_code=` + mockReferralData.referralCode;

  // Optimized handlers
  const handleCopyLink = () => {
    if (domain) {
      copyToClipboard(fullReferralLink);
    }
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleStatusChange = (value) => {
    setReferralStatus(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border-l border-gray-200 h-full">
      {/* Header */}
      <div className="py-3 px-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">My Referrals</h2>
      </div>

      {/* Referral Link Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Share your referral link
          </span>
          <button
            onClick={handleCopyLink}
            disabled={!domain}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isCopied
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="text-sm text-blue-600 bg-white p-2 rounded border break-all">
          {domain ? fullReferralLink : "Loading..."}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Referral Code:{" "}
          <span className="font-mono font-medium">
            {mockReferralData.referralCode}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-gray-200">
        {statsCards.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-center mb-2">{item.icon}</div>
            <div className="text-lg font-semibold text-gray-900">
              {item.title}
            </div>
            <div className="text-xs text-gray-600">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end border-b border-gray-200 p-4">
        <FloatingLabelInput
          id="searchName"
          name="searchName"
          keyValue="searchName"
          type="text"
          label="Search name"
          value={searchName}
          onChange={handleSearchChange}
          className="!py-[7px] !px-[12px] !text-[#323A70] !text-[14px]"
          autoComplete="off"
        />

        <FloatingSelect
          label="Referral status"
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          selectedValue={referralStatus}
          keyValue="referral_status"
          onSelect={handleStatusChange}
          paddingClassName="!py-[6px] !px-[12px] w-full"
        />
      </div>

      {/* Results Section */}
      <div className="border-b border-gray-200">
        <div className="p-4 bg-gray-50 border-r border-gray-200 w-fit">
          <p className="text-sm text-gray-600">
            {filteredUsers.length} Result{filteredUsers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto mb-3 size-12 text-gray-300" />
            <p className="text-lg font-medium mb-1">No referrals found</p>
            <p className="text-sm">
              {mockReferralData.referredUsers.length === 0
                ? "Start sharing your referral link to see referred users here."
                : "Try adjusting your search filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 capitalize truncate">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Code:{" "}
                      <span className="font-mono">{user?.refer_code}</span>
                    </p>
                    {user?.join_date && (
                      <p className="text-xs text-gray-400">
                        Joined: {user?.join_date}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user?.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReferrals;
