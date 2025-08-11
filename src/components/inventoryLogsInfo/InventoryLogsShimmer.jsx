// InventoryLogsShimmer.js - Separate shimmer components file

const ShimmerRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-2 border-r border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-4 py-2">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
    </td>
  </tr>
);

const ShimmerTable = () => (
  <div className="w-full md:w-1/2 px-2 mb-4">
    <table className="min-w-full border border-gray-200">
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(4)].map((_, index) => (
          <ShimmerRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

const ShimmerLogEntry = ({ index }) => (
  <div className="mb-3 border border-[#E0E1EA] rounded-lg overflow-hidden animate-pulse">
    <div className="bg-[#343432] flex justify-between items-center px-3">
      <div className="flex-1 py-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-5 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
        <div className="pl-3 ml-2 h-full border-l-[1px] border-l-[#E0E1EA] py-3">
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const InventoryLogsShimmer = ({ count = 6 }) => (
  <div className="max-h-[90vh] overflow-y-auto p-3">
    {[...Array(count)].map((_, index) => (
      <ShimmerLogEntry key={index} index={index} />
    ))}
  </div>
);

export { ShimmerRow, ShimmerTable, ShimmerLogEntry, InventoryLogsShimmer };
export default InventoryLogsShimmer;
