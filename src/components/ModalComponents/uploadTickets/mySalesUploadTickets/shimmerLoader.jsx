import React from 'react';

const ShimmerLoader = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded h-4 w-full"></div>
    </div>
  );
};

const ShimmerBox = ({ width = "w-full", height = "h-4", className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className={`bg-gray-200 rounded ${height} ${width}`}></div>
    </div>
  );
};

const UploadTicketsShimmer = () => {
  return (
    <div className="w-full h-full bg-white rounded-lg relative flex flex-col">
      {/* Header Shimmer */}
      <div className="flex justify-between items-center p-4 border-b border-[#E0E1EA] flex-shrink-0">
        <ShimmerBox width="w-64" height="h-6" />
        <ShimmerBox width="w-5" height="h-5" />
      </div>

      {/* Match Header Shimmer */}
      <div className="bg-gray-300 text-xs py-3 rounded-t-md px-4 flex items-center justify-between min-w-0 m-4 mb-0">
        <ShimmerBox width="w-48" height="h-4" className="bg-gray-400" />
        <div className="flex items-center gap-4 flex-shrink-0">
          <ShimmerBox width="w-20" height="h-4" className="bg-gray-400" />
          <ShimmerBox width="w-16" height="h-4" className="bg-gray-400" />
          <ShimmerBox width="w-24" height="h-4" className="bg-gray-400" />
          <ShimmerBox width="w-4" height="h-4" className="bg-gray-400" />
        </div>
      </div>

      {/* Ticket Details Shimmer */}
      <div className="border-[1px] border-[#E0E1EA] rounded-b-md flex-shrink-0 mx-4">
        <div className="grid grid-cols-4 bg-gray-100 px-3 py-2 border-b border-gray-200">
          <ShimmerBox width="w-16" height="h-3" />
          <ShimmerBox width="w-16" height="h-3" />
          <ShimmerBox width="w-20" height="h-3" />
          <ShimmerBox width="w-16" height="h-3" />
        </div>
        <div className="grid grid-cols-4 bg-[#F9F9FB] py-2 px-3 border-b border-gray-200">
          <ShimmerBox width="w-12" height="h-3" />
          <ShimmerBox width="w-8" height="h-3" />
          <ShimmerBox width="w-24" height="h-3" />
          <ShimmerBox width="w-16" height="h-3" />
        </div>
      </div>

      {/* Main Content Area Shimmer */}
      <div className="flex-1 p-4 space-y-4">
        {/* Upload Section Shimmer */}
        <div className="border-1 bg-[#F9F9FB] border-dashed border-gray-300 rounded-lg p-4 flex flex-col gap-1 items-center justify-center">
          <ShimmerBox width="w-10" height="h-10" className="rounded-full" />
          <ShimmerBox width="w-48" height="h-3" className="mt-2" />
          <ShimmerBox width="w-16" height="h-3" />
          <ShimmerBox width="w-24" height="h-8" className="mt-2 rounded-sm" />
        </div>

        {/* Files List Shimmer */}
        <div className="space-y-2">
          <ShimmerBox width="w-32" height="h-4" />
          <div className="border border-[#E0E1EA] rounded p-4">
            <ShimmerBox width="w-full" height="h-16" />
          </div>
        </div>

        {/* Assignment Section Shimmer */}
        <div className="space-y-2">
          <ShimmerBox width="w-40" height="h-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="grid grid-cols-2 items-center border-b border-gray-200 py-2">
                <ShimmerBox width="w-20" height="h-3" />
                <ShimmerBox width="w-full" height="h-8" className="rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Shimmer */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-4 justify-end w-full">
          <ShimmerBox width="w-16" height="h-8" className="rounded" />
          <ShimmerBox width="w-20" height="h-8" className="rounded" />
        </div>
      </div>
    </div>
  );
};

export { ShimmerLoader, ShimmerBox, UploadTicketsShimmer };