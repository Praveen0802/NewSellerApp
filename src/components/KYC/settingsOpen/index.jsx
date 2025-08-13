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

  const getSellerLevelData = async () => {
    const sellerData = await getSellerTickets("");
    const sellerLevel = await getSellerLevel("", { currency: "GBP" });
    console.log(sellerData, "sellerData", sellerLevel);
    setSellerCopyData(sellerData?.data);
    setSellerLevelData(sellerLevel?.data);
  };

  const { currentUser } = useSelector((state) => state.currentUser);

  console.log("sellerLevelData", sellerCopyData);

  useEffect(() => {
    getSellerLevelData();
  }, []);

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
          <div className="flex flex-col gap-4 p-4 pb-2 border-b border-[#E0E1EA]">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold capitalize text-gray-900">
                {currentUser?.first_name} {currentUser?.last_name}
              </h1>
            </div>
            {/* Menu Items */}
            <div className="space-y-4 ">
              <div
                onClick={() => router.push("/settings/myAccount")}
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
              <h4 className="w-full text-md font-[300] text-gray-500">
                You are not on track to maintain {currentLevelData?.level}{" "}
                status for next quarter
              </h4>
              <p className="w-full text-xs font-normal text-gray-500">
                Your GTV (Gross Transactional Value) activity during the current
                calendar quarter will determine your Seller Level in the next
                calendar quarter.&nbsp;
              </p>
            </div>
            <GTVLevelCard data={currentLevelData} />
          </div>

          {/* Slider Section */}
          <div className="p-4">
            <div className="relative overflow-hidden">
              {/* Slider Container */}
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {sellerCopyData?.seller_levels?.map((level, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="border border-gray-200 px-3 py-4 flex flex-col gap-5 mx-1">
                      <div className="flex flex-col gap-2">
                        <p className="text-base text-gray-600 leading-[1.125rem]">
                          Seller {level?.level}
                        </p>
                        <p className="text-xs font-normal text-gray-500 leading-[.875rem] block">
                          GTV: {level?.quarterly_gtv}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {level?.benefits?.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex gap-2">
                            <CheckCircle
                              className={`w-3 h-3 ${
                                benefit?.available
                                  ? "text-[#10B981]"
                                  : "text-gray-400"
                              }`}
                            />
                            <p className="text-xs font-normal">
                              {benefit?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center">
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOpen;
