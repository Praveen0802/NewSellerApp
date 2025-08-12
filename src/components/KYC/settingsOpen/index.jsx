import { getSellerLevel, getSellerTickets } from "@/utils/apiHandler/request";
import { HelpCircle, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GTVLevelCard from "./sellerLevelCard";

const SettingsOpen = ({ isOpen = false, onClose, showFullDisplay,handleLogout } = {}) => {
    const router = useRouter();
  const [sellerLevelData, setSellerLevelData] = useState([]);
  const [sellerCopyData, setSellerCopyData] = useState([]);
  const getSellerLevelData = async () => {
    const sellerData = await getSellerTickets("");
    const sellerLevel = await getSellerLevel("", { currency: "GBP" });
    console.log(sellerData, "sellerData", sellerLevel);
    setSellerCopyData(sellerData?.data);
    setSellerLevelData(sellerLevel?.data);
  };

  const { currentUser } = useSelector((state) => state.currentUser);

  console.log(sellerLevelData, "sellerLevelData", sellerCopyData);
  useEffect(() => {
    getSellerLevelData();
  }, []);
  if (!isOpen) return null;

  const sidebarWidth = showFullDisplay ? 174 : 60;
  const currentLevel = sellerCopyData.seller_levels.find(
    (level) => level.is_active === 1
  );
  const currentLevelData = sellerLevelData.seller_level;
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
        <div>
          <div className="flex flex-col gap-4 p-4 pb-2 border-b border-[#E0E1EA]">
            <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold capitalize text-gray-900">
              {currentUser?.first_name} {currentUser?.last_name}
            </h1>
            <p class="flex items-baseline w-full text-sm text-gray-500">Seller Level 3
                <span class="ml-[0.2rem] first:ml-2 w-[0.65rem] h-[0.65rem] rounded-sm bg-green-600 border-green-600"></span>
                <span class="ml-[0.2rem] first:ml-2 w-[0.65rem] h-[0.65rem] rounded-sm bg-green-600/25 border-green-600/25"></span>
                <span class="ml-[0.2rem] first:ml-2 w-[0.65rem] h-[0.65rem] rounded-sm bg-green-600/25 border-green-600/25"></span>
                <span class="ml-[0.2rem] first:ml-2 w-[0.65rem] h-[0.65rem] rounded-sm bg-yellow-100/25 border-yellow-100/25"></span>
            </p>
            </div>
            {/* Menu Items */}
            <div className="space-y-4 ">
              <div onClick={() => router.push("/settings/myAccount")} className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-gray-500">
                <Settings className="w-4 h-4 " />
                <span className="font-normal text-sm">Settings</span>
              </div>

              <div onClick={handleLogout} className="flex items-center gap-3  text-gray-700 cursor-pointer hover:text-gray-500">
                <LogOut className="w-4 h-4 " />
                <span className="font-normal text-sm">Logout</span>
              </div>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h4 class="w-full  text-md font-medium ">You are not on track to maintain Level 3 status for next quarter</h4>
              <p class="w-full text-sm font-normal text-gray-500">Your GTV (Gross Transactional Value) activity during the current calendar quarter will determine your Seller Level in the next calendar quarter.&nbsp;
                {/* <a class="font-medium text-violet-800 hover:text-indigo-500" href="" target="_blank">Learn more</a> */}
              </p>
            </div>
         <GTVLevelCard data={currentLevelData} />
         </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOpen;
