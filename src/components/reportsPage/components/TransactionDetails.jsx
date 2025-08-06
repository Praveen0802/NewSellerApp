import React, { useState, useMemo, memo, useCallback } from "react";
import { X, ChevronDown, ChevronUp, CreditCard, FileText } from "lucide-react";
import RightViewModal from "@/components/commonComponents/rightViewModal";
import {
  getDepositDetails,
  getPayoutDetails,
  getTransactionDetails,
} from "@/utils/apiHandler/request";
import { getAuthToken } from "@/utils/helperFunctions";
import OrderInfo from "@/components/orderInfoPopup";

// Enhanced shimmer loading component with better visual hierarchy
const ShimmerLoader = memo(() => (
  <div className="bg-white">
    {/* Header Shimmer */}
    <div className="flex justify-between items-center px-8 py-6 border-b border-slate-200 bg-slate-50">
      <div>
        <div className="h-7 bg-slate-200 rounded-md w-56 mb-3 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div>
      </div>
      <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse"></div>
    </div>

    <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
      {/* Status Card Shimmer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 mb-8 border border-slate-200">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded w-28 animate-pulse"></div>
          </div>
          <div className="text-right space-y-3">
            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-48 mt-4 animate-pulse"></div>
      </div>

      {/* Transaction Details Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {Array.from({ length: 2 }, (_, colIndex) => (
          <div key={colIndex} className="space-y-6">
            {Array.from({ length: 4 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="bg-white rounded-lg border border-slate-200 p-4"
              >
                <div className="h-4 bg-slate-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="h-5 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Table Shimmer - Updated for 5 columns */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-6 mb-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-4 bg-slate-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
          {Array.from({ length: 4 }, (_, row) => (
            <div
              key={row}
              className="grid grid-cols-5 gap-6 mb-4 p-4 bg-slate-50 rounded-lg"
            >
              {Array.from({ length: 5 }, (_, col) => (
                <div
                  key={col}
                  className="h-4 bg-slate-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

// Simple transaction details row component (back to original style)
const TransactionDetailRow = memo(({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900 font-medium">{value || "-"}</span>
  </div>
));

// Enhanced booking table row component - Updated for 5 columns
const BookingRow = memo(({ booking, index, onClick = () => {} } = {}) => (
  <div
    key={booking.booking_id || index}
    className="grid grid-cols-5 gap-6 p-4 hover:bg-slate-50 transition-all duration-200 rounded-lg border border-slate-100 bg-white mb-3 cursor-pointer"
    onClick={() => onClick(booking)}
    title={"Click to view details"}
  >
    <div className="flex items-center">
      <span className="text-sm font-semibold text-slate-900 font-mono">
        {booking.booking_no || "—"}
      </span>
    </div>
    <div className="flex items-center">
      <span
        className="text-sm text-slate-700 truncate max-w-[180px] font-medium"
        title={booking.match_name}
      >
        {booking.match_name || "—"}
      </span>
    </div>
    <div className="flex items-center justify-center">
      <span className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-1 rounded-full">
        {booking.quantity || "—"}
      </span>
    </div>
    <div className="flex items-center justify-end">
      <span className="text-sm font-bold text-slate-900">
        {booking.amount || "—"}
      </span>
    </div>
    <div className="flex items-center justify-center">
      <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
        {booking.booking_status || "—"}
      </span>
    </div>
  </div>
));

// Enhanced accordion section component
const AccordionSection = memo(
  ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    itemCount,
    children,
    showHeader = true,
  }) => (
    <div className="mb-6">
      {showHeader && title && (
        <button
          onClick={onToggle}
          className="w-full bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-all duration-200 mb-4"
          aria-expanded={isOpen}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                {itemCount !== undefined && (
                  <p className="text-sm text-slate-500 mt-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
        </button>
      )}
      {isOpen && <div>{children}</div>}
    </div>
  )
);

const TransactionDetailsPopup = ({
  data,
  onClose,
  showShimmer = false,
  show = false,
}) => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(true);

  // Memoize expensive computations
  const { transactionData, bookings, formattedDates } = useMemo(() => {
    if (!data) return { transactionData: {}, bookings: [], formattedDates: {} };

    const transactionData = data;
    const bookings = data?.payoutTableData?.payout_orders || [];

    const formatDate = (dateString) => {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const formattedDates = {
      payoutDate: formatDate(transactionData.payout_date),
      expectedDate: formatDate(transactionData.expected_date),
    };

    return { transactionData, bookings, formattedDates };
  }, [data]);

  const [eyeViewPopup, setEyeViewPopup] = useState({
    flag: false,
    data: {},
    isLoading: false,
  });

  const handleEyeClick = async (item, transactionType) => {
    const { booking_id = null } = item ?? {};

    setEyeViewPopup((prev) => ({
      ...prev,
      flag: true,
      isLoading: true,
    }));

    try {
      const params = {
        booking_id,
      };
      const salesData = await getPayoutDetails("", params);
      setEyeViewPopup({
        flag: true,
        data: salesData?.map((list) => ({
          ...list,
          order_id_label: item?.bookingNo ?? null,
        })),
        bookingNo: booking_id,
      });
      return;
    } catch (error) {
      console.log("ERROR in handleEyeClick", error);
      setEyeViewPopup({
        flag: true,
        data: { ...item, transactionType: transactionType },
        isLoading: false,
      });
    }
  };

  // Simple transaction details configuration (back to original)
  const transactionDetails = useMemo(
    () => [
      [
        { label: "Reference Number", value: transactionData.reference_no },
        { label: "Amount", value: transactionData.amount },
        { label: "Currency", value: transactionData.currency },
        { label: "Total Orders", value: transactionData.total_orders },
      ],
      [
        { label: "Payout Date", value: formattedDates.payoutDate },
        { label: "Expected Date", value: formattedDates.expectedDate },
        { label: "To Account", value: transactionData.to_account },
        // { label: "Transaction ID", value: transactionData.id },
      ],
    ],
    [transactionData, formattedDates]
  );

  // Updated table headers for 5 columns
  const tableHeaders = useMemo(
    () => ["Booking ID", "Match Name", "Qty", "Amount", "Status"],
    []
  );

  // Callback handlers to prevent unnecessary re-renders
  const handleTransactionToggle = useCallback(() => {
    setIsTransactionOpen((prev) => !prev);
  }, []);

  const handleBookingToggle = useCallback(() => {
    setIsBookingOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Early return for shimmer state
  if (showShimmer) {
    return (
      <RightViewModal
        show={show}
        onClose={handleClose}
        className="!w-[60%] !max-w-6xl"
      >
        <ShimmerLoader />
      </RightViewModal>
    );
  }

  const refreshPopupData = async () => {
    if (eyeViewPopup?.flag) {
      await handleEyeClick({ booking_id: eyeViewPopup?.bookingNo });
    }
  };

  return (
    <RightViewModal show={show} onClose={handleClose} className="!w-[50%]">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Details
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto hideScrollbar max-h-[calc(90vh-80px)] m-2">
          {/* Transaction Information Accordion */}
          <AccordionSection
            title=""
            icon={CreditCard}
            isOpen={isTransactionOpen}
            onToggle={handleTransactionToggle}
            showHeader={false}
          >
            {/* Status and Amount Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Transaction Status
                  </p>
                  <span className="inline-flex px-3 py-1 rounded border border-gray-300 text-sm font-medium bg-white text-gray-800">
                    {transactionData.status_label || "-"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactionData.price_with_currency || "-"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Reference: {transactionData.reference_no || "-"}
              </p>
            </div>

            {/* Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transactionDetails.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-4">
                  {column.map((detail, index) => (
                    <TransactionDetailRow
                      key={`${columnIndex}-${index}`}
                      label={detail.label}
                      value={detail.value}
                    />
                  ))}
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* Enhanced Booking Details */}
          <AccordionSection
            title=""
            icon={FileText}
            isOpen={isBookingOpen}
            onToggle={handleBookingToggle}
            itemCount={bookings.length}
          >
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900">
                  Order Information
                </h4>
              </div>

              <div className="p-6">
                {/* Updated Table Header for 5 columns */}
                <div className="grid grid-cols-5 gap-6 mb-6 pb-4 border-b-2 border-slate-200">
                  {tableHeaders.map((header, index) => (
                    <div
                      key={index}
                      className={`text-xs font-bold text-slate-700 uppercase tracking-wider ${
                        index === 2 || index === 4
                          ? "text-center"
                          : index === 3
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {header}
                    </div>
                  ))}
                </div>

                {/* Enhanced Table Body */}
                <div className="space-y-3">
                  {bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                      <BookingRow
                        key={booking.booking_id || index}
                        booking={booking}
                        index={index}
                        onClick={() => handleEyeClick(booking)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-slate-500 mb-2">
                        No booking details available
                      </p>
                      <p className="text-sm text-slate-400">
                        Booking information will appear here when available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
      <OrderInfo
        show={eyeViewPopup?.flag}
        data={eyeViewPopup?.data}
        onClose={() => setEyeViewPopup({ flag: false, data: "" })}
        refreshPopupData={refreshPopupData}
        type="sales"
        showShimmer={eyeViewPopup?.isLoading}
      />
    </RightViewModal>
  );
};

export default memo(TransactionDetailsPopup);
