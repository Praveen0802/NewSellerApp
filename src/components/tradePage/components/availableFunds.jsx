import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState } from "react";

const AvailableFunds = ({ fetchWalletBalance }) => {
  const demoData = fetchWalletBalance?.account_data;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? demoData.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === demoData.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <div className="flex flex-col">
      <p className="text-gray-500 text-xs">Available funds</p>
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handlePrev}
          className="text-gray-600 hover:text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Previous fund"
        >
          <IconStore.chevronLeft className="size-3" />
        </button>

        <div className="w-24 overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {demoData.map((item, index) => (
              <p
                key={index}
                className="text-[#343432] text-sm font-normal w-24 flex-shrink-0"
              >
                {item.balance_amount}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="text-gray-600 hover:text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Next fund"
        >
          <IconStore.chevronRight className="size-3" />
        </button>
      </div>

      {/* Optional: Dots indicator for number of slides */}
      {/* <div className="flex gap-1 mt-1 justify-center">
        {demoData.map((_, index) => (
          <span
            key={index}
            className={`h-1 rounded-full ${
              currentIndex === index ? "w-3 bg-indigo-600" : "w-1 bg-gray-300"
            }`}
          />
        ))}
      </div> */}
    </div>
  );
};

export default AvailableFunds;
