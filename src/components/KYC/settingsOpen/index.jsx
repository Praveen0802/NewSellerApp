import { getSellerLevel, getSellerTickets } from "@/utils/apiHandler/request";
import {
  CheckCircle,
  HelpCircle,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GTVLevelCard from "./sellerLevelCard";

// Shimmer Loader Component for slider section
const ShimmerLoader = () => (
  <div className="animate-pulse">
    <div className="flex flex-col px-3 gap-5 mx-1">
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div key={index} className="flex gap-2 items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Full page shimmer loader component
const FullPageShimmerLoader = () => (
  <div className="animate-pulse p-4 space-y-6">
    {/* Header section shimmer */}
    <div className="flex flex-col gap-4 pb-2 border-b border-[#E0E1EA]">
      <div className="flex flex-col gap-1">
        <div className="h-6 bg-gray-300 rounded w-32"></div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
      </div>
    </div>

    {/* GTV section shimmer */}
    <div className="px-1 pt-2 pb-5 border-b border-[#E0E1EA] flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
      {/* GTV Card shimmer */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="h-6 bg-gray-300 rounded w-24 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>

    {/* Slider section shimmer */}
    <div className="border border-gray-200 py-4 flex flex-col gap-5">
      <ShimmerLoader />
      <div className="flex gap-2 px-3 items-center">
        <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
        <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  </div>
);

const SettingsOpen = ({
  isOpen = false,
  onClose,
  showFullDisplay,
  handleLogout,
} = {}) => {
  const router = useRouter();
  const [sellerLevelData, setSellerLevelData] = useState([]);
  const [sellerCopyData, setSellerCopyData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getSellerLevelData = async () => {
    setIsLoading(true);
    try {
      const sellerData = await getSellerTickets("");
      const sellerLevel = await getSellerLevel("", { currency: "GBP" });
      setSellerCopyData(sellerData?.data);
      setSellerLevelData(sellerLevel?.data);
    } catch (error) {
      console.error("Error fetching seller data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { currentUser } = useSelector((state) => state.currentUser);

  useEffect(() => {
    if (isOpen) {
      getSellerLevelData();
    }
  }, [isOpen]);

  // Set initial slide to current active level
  useEffect(() => {
    if (sellerCopyData?.seller_levels?.length > 0) {
      const activeIndex = sellerCopyData.seller_levels.findIndex(
        (level) => level.is_active === 1
      );
      if (activeIndex !== -1) {
        setCurrentSlide(activeIndex);
      }
    }
  }, [sellerCopyData]);

  if (!isOpen) return null;

  const sidebarWidth = showFullDisplay ? 165 : 60;
  const currentLevel = sellerCopyData?.seller_levels?.find(
    (level) => level.is_active === 1
  );
  const currentLevelData = sellerLevelData?.seller_level;

  const totalSlides = sellerCopyData?.seller_levels?.length || 0;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Desktop layout
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 bg-opacity-50"
        onClick={onClose}
      />

      {/* Popup positioned to span from sidebar to right edge */}
      <div
        className="absolute top-0 bottom-0 w-[320px] bg-white rounded-r-xl shadow-xl z-[10000]"
        style={{
          left: `${sidebarWidth}px`,
          right: "20px",
        }}
      >
        <div className="h-[100vh] overflow-auto hideScrollbar">
          {/* Show full page loader while loading, otherwise show content */}
          {isLoading ? (
            <FullPageShimmerLoader />
          ) : (
            <>
              <div className="flex flex-col gap-4 p-4 pb-4 border-b border-[#E0E1EA]">
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-semibold capitalize text-gray-900">
                    {currentUser?.first_name} {currentUser?.last_name}
                  </h1>
                </div>
                {/* Menu Items */}
                <div className="space-y-4 ">
                  <div
                    onClick={() => {
                      onClose();
                      router.push("/settings/myAccount");
                    }}
                    className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-gray-500"
                  >
                    <Settings className="w-4 h-4 " />
                    <span className="font-normal text-sm">Settings</span>
                  </div>

                  <div
                    onClick={handleLogout}
                    className="flex items-center gap-3  text-gray-700 cursor-pointer hover:text-gray-500"
                  >
                    <LogOut className="w-4 h-4 " />
                    <span className="font-normal text-sm">Logout</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pt-6 pb-5 border-b border-[#E0E1EA] flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <h4 className="w-full text-base font-[300] text-gray-700">
                    You're currently falling short of maintaining{" "}
                    {currentLevelData?.level} status for the next quarter.
                  </h4>
                  <p className="w-full text-xs font-normal text-gray-500">
                    Your GTV (Gross Transactional Value) activity during the
                    current calendar quarter will determine your Seller Level in
                    the next calendar quarter.&nbsp;
                  </p>
                </div>
                {currentLevelData && <GTVLevelCard data={currentLevelData} />}
              </div>

              {/* Slider Section */}
              <div className="p-4">
                <div className="relative border border-gray-200 py-4 flex flex-col gap-5 overflow-hidden">
                  {/* Slider Container */}
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {sellerCopyData?.seller_levels?.map((level, index) => {
                      const isActive = level?.is_active === 1;
                      const isCurrentSlide = index === currentSlide;

                      return (
                        <div key={index} className="w-full flex-shrink-0">
                          <div
                            className={`flex flex-col px-3 gap-5 mx-1 ${
                              !isActive && !isCurrentSlide ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex flex-col gap-2">
                              <p
                                className={`text-base leading-[1.125rem] ${
                                  isActive
                                    ? "text-gray-900 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                Seller {level?.level}
                              </p>
                              <p
                                className={`text-xs font-normal leading-[.875rem] block ${
                                  isActive ? "text-gray-700" : "text-gray-500"
                                }`}
                              >
                                GTV: {level?.quarterly_gtv}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {level?.benefits?.map((benefit, benefitIndex) => (
                                <div
                                  key={benefitIndex}
                                  className="flex gap-2 items-center"
                                >
                                  <CheckCircle
                                    className={`w-3 h-3 ${
                                      isActive && benefit?.available
                                        ? "text-[#10B981]"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <p
                                    className={`text-xs font-normal ${
                                      isActive && benefit?.available
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {benefit?.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex gap-2 px-3 items-center">
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className={`bg-gray-300 p-1 rounded-md ${
                        currentSlide === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={nextSlide}
                      disabled={currentSlide === totalSlides - 1}
                      className={`bg-gray-300 p-1 rounded-md ${
                        currentSlide === totalSlides - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsOpen;
