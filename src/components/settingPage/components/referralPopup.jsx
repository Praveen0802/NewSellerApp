import RightViewModal from "@/components/commonComponents/rightViewModal";
import React, { useState, useEffect } from "react";

const ReferralPopup = ({ show, onClose, data = {}, isLoading = false, error = false }) => {
  console.log(data, 'datadata');
  
  const { referral_bookings = [], meta = {} } = data || {};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Shimmer loading component
  const ShimmerRow = () => (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-2">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      </td>
      <td className="py-4 px-2">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </td>
      <td className="py-4 px-2 text-right">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto"></div>
      </td>
      <td className="py-4 px-2 text-right">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
      </td>
      <td className="py-4 px-2 text-right">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-18 ml-auto"></div>
      </td>
    </tr>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Booking
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Match Details
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Earned
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Render 5 shimmer rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <ShimmerRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error loading bookings</div>
          <p className="text-gray-500 text-sm">
            Failed to load referral bookings. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!referral_bookings || referral_bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No referral bookings found</div>
          <p className="text-gray-500 text-sm">Your referral bookings will appear here once available.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Booking
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Match Details
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Amount
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Earned
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {referral_bookings.map((booking, index) => (
              <tr 
                key={booking.booking_id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 text-sm">
                      #{booking.booking_no}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {booking.booking_id}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {booking.match_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(booking.match_date)} at {formatTime(booking.match_time)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="font-medium text-gray-900 text-sm">
                    €{booking.amount.toFixed(2)}
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="font-medium text-green-700 text-sm">
                    +{booking.earned_amount_with_currency}
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="font-semibold text-gray-900 text-sm">
                    {booking.amount_with_currency}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <RightViewModal
      className={`transition-all duration-300 ease-in-out !w-[650px]`}
      show={show}
      onClose={onClose}
    >
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Referral Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                ) : (
                  `${meta.total || 0} booking${meta.total !== 1 ? 's' : ''} found`
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </RightViewModal>
  );
};

export default ReferralPopup;