import { formatDateTime } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const TransactionHistory = ({ transactions, onRowClick }) => {
  // Function to format date and time to match the dashboard format

  return (
    <div className="w-full">
      <div className="max-h-[300px] overflow-auto bg-white">
        <table className="min-w-full border-[1px] border-[#eaeaf1] rounded-md">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="bg-gray-50"></th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((transaction, index) => (
              <tr
                key={transaction?.id}
                className={` ${
                  index !== transactions?.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                  {transaction?.reference_no}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction?.amount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction?.currency}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction?.credit_depit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDateTime(transaction?.created_date_time)}
                </td>
                <td
                  title={transaction?.description}
                  className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                >
                  {transaction?.description}
                </td>
                <td
                  onClick={() =>
                    onRowClick && onRowClick(transaction, "transaction")
                  }
                  className="px-6 border-l-[1px] border-[#eaeaf1] hover:bg-gray-50 cursor-pointer py-4 text-sm text-gray-600 max-w-xs truncate"
                >
                  <IconStore.eye />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions?.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
