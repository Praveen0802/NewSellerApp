import React, { useState } from "react";
import Button from "../commonComponents/button";
import botIcon from "../../../public/bot.svg";
import Image from "next/image";
import { useSelector } from "react-redux";
import CustomModal from "../commonComponents/customModal";
import MessagePopUp from "./messagePopUp";
import { getContactDetails } from "@/utils/apiHandler/request";
import { useUserDisplayName } from "@/Hooks/_shared";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Header = () => {
  const { currentUser } = useSelector((state) => state.currentUser);
  const [messageViewPopup, setMessageViewPopup] = useState(false);
  const [showMsgShimmer, setShowMsgShimmer] = useState(false);
  const [popUpData, setPopupData] = useState({});
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    } else if (currentHour >= 17 && currentHour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  const handleModalPopupClick = async () => {
    try {
      setShowMsgShimmer(true);
      setMessageViewPopup(true);
      const response = await getContactDetails();
      setPopupData(response?.[0]);
    } catch (error) {
      toast.error("Failed to fetch data");
      setMessageViewPopup(false);
    } finally {
      setShowMsgShimmer(false);
    }
  };
  const router = useRouter();

  const title = () => {
    const { pathname } = router;
    if (pathname.includes("my-listings")) {
      return "Inventory";
    } else if (pathname.includes("add-listings")) {
      return "Add Inventory";
    } else if (pathname.includes("bulk-listings")) {
      return "Bulk Inventory";
    } else {
      return (
        <>
          Welcome
          <span className="capitalize">
            {currentUser?.first_name ? `, ${currentUser?.first_name}` : ""}
          </span>
        </>
      );
    }
  };

  return (
    <div className="px-3 xs:px-4 sm:px-[24px] h-auto min-h-[56px] xs:min-h-[60px] sm:h-[80px] py-2 xs:py-3 sm:py-0 bg-white border-b-[1px] flex flex-col xs:flex-row sm:flex-row w-full justify-between items-start xs:items-center sm:items-center border-[#eaeaf1] gap-2 xs:gap-3 sm:gap-0">
      <p className="text-[16px] xs:text-[18px] sm:text-[24px] font-semibold text-[#343432] leading-tight xs:leading-normal">
        {title()}
      </p>
      <div className="flex gap-2 xs:gap-3 items-center self-end xs:self-auto sm:self-auto">
        <button
          onClick={() => {
            handleModalPopupClick();
          }}
          className="cursor-pointer p-1 xs:p-0 hover:opacity-80 transition-opacity"
        >
          <Image
            src={botIcon}
            width={36}
            height={36}
            alt="boticon"
            className="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12"
          />
        </button>
      </div>
      {messageViewPopup && (
        <CustomModal
          show={messageViewPopup}
          onClose={() => setMessageViewPopup(false)}
          outSideClickClose={true}
        >
          <MessagePopUp
            popUpData={popUpData}
            onClose={() => setMessageViewPopup(false)}
            showShimmer={showMsgShimmer}
          />
        </CustomModal>
      )}
    </div>
  );
};

export default Header;
