import React from "react";
import CustomModal from "../commonComponents/customModal";
import TicketCategories from "./categoriesComponent";
import viewMap from "../../../public/viewMap.svg";
import Image from "next/image";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import RightViewModal from "../commonComponents/rightViewModal";

const ViewMapPopup = ({ show, onClose }) => {
  return (
    <RightViewModal show={show} onClose={onClose} className="w-[650px]">
      <div className="bg-white p-2 rounded-md ">
        <div className="flex justify-between items-center p-2 border-b-[1px]  border-[#DADBE5]">
          <p className="text-[18px] font-semibold">Old Trafford</p>
          <IconStore.close
            className="w-5 h-5 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col justify-center items-center">
          <Image
            src={viewMap}
            width={350}
            height={200}
            alt="View Map"
            className=""
          />
          <TicketCategories />
        </div>
      </div>
    </RightViewModal>
  );
};

export default ViewMapPopup;
