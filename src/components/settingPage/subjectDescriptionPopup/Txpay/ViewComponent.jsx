import React from "react";

const ViewComponent = ({ item, onClick, hidePlus = true }) => {
  const { icon, amount, balance, keys } = item;
  const {
    pendingDelivery,
    pendingPayment,
    confirmedOrder,
    currency,
    totalRevenue,
  } = keys;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header with flag and amount */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={icon.src} alt={currency} className="w-8 h-8" />
          <div>
            <div className="text-lg font-semibold text-gray-900">{amount}</div>
            <div className="text-sm text-gray-500">{balance}</div>
          </div>
        </div>
        {!hidePlus && (
          <button
            onClick={() => onClick && onClick(item)}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2">
        {confirmedOrder && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Confirmed Orders</span>
            <span className="text-sm font-medium text-gray-900">
              {confirmedOrder}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pending Delivery</span>
          <span className="text-sm font-medium text-gray-900">
            {pendingDelivery}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pending Payment</span>
          <span className="text-sm font-medium text-gray-900">
            {pendingPayment}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Revenue</span>
          <span className="text-sm font-medium text-gray-900">
            {totalRevenue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ViewComponent;
