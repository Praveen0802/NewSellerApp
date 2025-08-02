import React, { useState, useMemo, memo, useCallback } from "react";
import { X, ChevronDown, ChevronUp, CreditCard, FileText } from "lucide-react";
import RightViewModal from "@/components/commonComponents/rightViewModal";

// Memoized shimmer loading component to prevent unnecessary re-renders
const ShimmerLoader = memo(() => (
  <div className="p-4">
    {/* Header Shimmer */}
    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
      <div>
        <div className="h-6 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
      </div>
      <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
    </div>

    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
      {/* Transaction Section Shimmer */}
      <div className="border-b border-gray-300">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
            </div>
            <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex justify-between items-center py-2 border-b border-gray-200"
                  >
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Section Shimmer */}
      <div>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
            </div>
            <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-7 gap-4 mb-4 pb-2 border-b border-gray-300">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-300 rounded animate-pulse"
                  ></div>
                ))}
              </div>
              {Array.from({ length: 4 }, (_, row) => (
                <div key={row} className="grid grid-cols-7 gap-4 mb-3 py-2">
                  {Array.from({ length: 7 }, (_, col) => (
                    <div
                      key={col}
                      className="h-4 bg-gray-300 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Transaction details row component
const TransactionDetailRow = memo(({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900 font-medium">{value || "-"}</span>
  </div>
));

// Booking table row component
const BookingRow = memo(({ booking, index }) => (
  <div
    key={booking.booking_id || index}
    className="grid grid-cols-7 gap-4 py-3 hover:bg-gray-50 transition-colors duration-150 rounded-lg border-b border-gray-100"
  >
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-900">
        {booking.booking_no || "-"}
      </span>
    </div>
    <div className="flex items-center">
      <span
        className="text-sm text-gray-900 truncate max-w-[160px]"
        title={booking.match_name}
      >
        {booking.match_name || "-"}
      </span>
    </div>
    <div className="flex items-center">
      <span
        className="text-sm text-gray-700 truncate max-w-[130px]"
        title={booking.customer_name}
      >
        {booking.customer_name || "-"}
      </span>
    </div>
    <div className="flex items-center justify-center">
      <span className="text-sm text-gray-600">
        {booking.ticket_type || "-"}
      </span>
    </div>
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium text-gray-700">
        {booking.quantity || "-"}
      </span>
    </div>
    <div className="flex items-center justify-end">
      <span className="text-sm font-medium text-gray-900">
        {booking.amount || "-"}
      </span>
    </div>
    <div className="flex items-center justify-center">
      <span className="text-xs font-medium px-2 py-1 rounded border border-gray-300 bg-white text-gray-800">
        {booking.booking_status || "-"}
      </span>
    </div>
  </div>
));

// Accordion section component
const AccordionSection = memo(
  ({ title, icon: Icon, isOpen, onToggle, itemCount, children }) => (
    <div className="border-b border-gray-300">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200"
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-medium text-gray-900 cursor-pointer">
              {title} {itemCount !== undefined && `(${itemCount} items)`}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && <div className="p-6 bg-white">{children}</div>}
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
      if (!dateString) return "-";
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

  // Memoize transaction details configuration
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
        { label: "Transaction ID", value: transactionData.id },
      ],
    ],
    [transactionData, formattedDates]
  );

  // Memoize table headers
  const tableHeaders = useMemo(
    () => [
      "Booking ID",
      "Match Details",
      "Customer",
      "Type",
      "Qty",
      "Amount",
      "Status",
    ],
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
      <RightViewModal show={show} onClose={handleClose} className="!w-[50%]">
        <ShimmerLoader />
      </RightViewModal>
    );
  }

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

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] m-2">
          {/* Transaction Information Accordion */}
          <AccordionSection
            title="Transaction Information"
            icon={CreditCard}
            isOpen={isTransactionOpen}
            onToggle={handleTransactionToggle}
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

          {/* Booking Details Accordion */}
          <AccordionSection
            title="Booking Details"
            icon={FileText}
            isOpen={isBookingOpen}
            onToggle={handleBookingToggle}
            itemCount={bookings.length}
          >
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 mb-4 pb-3 border-b-2 border-gray-300">
                  {tableHeaders.map((header, index) => (
                    <div
                      key={index}
                      className={`text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                        index === 3 || index === 4 || index === 6
                          ? "text-center"
                          : index === 5
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {header}
                    </div>
                  ))}
                </div>

                {/* Table Body */}
                <div className="space-y-3">
                  {bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                      <BookingRow
                        key={booking.booking_id || index}
                        booking={booking}
                        index={index}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No booking details available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
    </RightViewModal>
  );
};

export default memo(TransactionDetailsPopup);
