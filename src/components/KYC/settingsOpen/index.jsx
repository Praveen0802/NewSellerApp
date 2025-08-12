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
            <h1 className="text-xl font-semibold capitalize text-gray-900 ">
              {currentUser?.first_name} {currentUser?.last_name}
            </h1>

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
          <div className="p-4">
         <GTVLevelCard data={currentLevelData} />
         </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOpen;
