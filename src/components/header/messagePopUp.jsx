import React from "react";
import { IconStore } from "@/utils/helperFunctions/iconStore";

const MessagePopUp = ({ popUpData, onClose, showShimmer = false }) => {
  const { title, sub_title, contact, email, content } = popUpData || {};

  // Shimmer component
  const ShimmerElement = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
  );

  // Shimmer skeleton
  if (showShimmer) {
    return (
      <div className="w-full max-md:p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 relative animate-fade-in min-w-80 sm:min-w-[486px]">
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
          >
            <IconStore.close className="size-4" />
          </button>

          <div className="mb-4 sm:mb-6">
            <ShimmerElement className="h-6 sm:h-8 w-3/4 mb-1 sm:mb-2" />
            <ShimmerElement className="h-4 sm:h-5 w-1/2" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="bg-gray-200 animate-pulse rounded-full p-2 mr-3 w-8 h-8 sm:w-9 sm:h-9"></div>
              <div className="flex-1">
                <ShimmerElement className="h-3 sm:h-4 w-12 mb-1" />
                <ShimmerElement className="h-4 sm:h-5 w-24" />
              </div>
            </div>

            <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="bg-gray-200 animate-pulse rounded-full p-2 mr-3 w-8 h-8 sm:w-9 sm:h-9"></div>
              <div className="flex-1">
                <ShimmerElement className="h-3 sm:h-4 w-12 mb-1" />
                <ShimmerElement className="h-4 sm:h-5 w-32" />
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <ShimmerElement className="w-full h-10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Original content
  return (
    <div className="w-full max-md:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
        >
          <IconStore.close className="size-4" />
        </button>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-medium text-blue-600 mb-1 sm:mb-2">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">{sub_title}</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Phone</p>
              <p className="text-sm sm:text-base">{contact}</p>
            </div>
          </div>

          <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <p className="text-sm sm:text-base break-words">{email}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePopUp;
