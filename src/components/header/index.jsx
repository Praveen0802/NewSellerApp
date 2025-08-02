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

  const { userDisplayName, isNameAvailable = false } =
    useUserDisplayName(currentUser);

  const title = () => {
    if (router.pathname.includes("my-listings")) {
      return "Inventory";
    } else {
      return isNameAvailable
        ? `${getGreeting()}, ${userDisplayName.name}`
        : `Welcome back`;
    }
  };

  return (
    <div className="px-4 sm:px-[24px] h-auto max-md:flex-row min-h-[60px] sm:h-[80px] py-3 sm:py-0 bg-white border-b-[1px] flex flex-col sm:flex-row w-full justify-between items-start sm:items-center border-[#eaeaf1] gap-3 sm:gap-0">
      <p className="text-[18px] sm:text-[24px] font-semibold text-[#343432]">
        {title()}
        <span className="capitalize">
          {currentUser?.first_name ? `, ${currentUser?.first_name}` : ""}
        </span>
      </p>
      <div className="flex gap-3 items-center self-end sm:self-auto">
        <button
          onClick={() => {
            handleModalPopupClick();
          }}
          className="cursor-pointer"
        >
          <Image
            src={botIcon}
            width={36}
            height={36}
            alt="boticon"
            className="w-9 h-9 sm:w-12 sm:h-12"
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
