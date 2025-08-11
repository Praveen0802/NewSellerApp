import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const AddressList = ({ handleEditClick, handleDeleteClick, item, index }) => {
  return (
    <div
      key={index}
      className="border-[1px] md:w-[50%] border-[#eaeaf1] rounded-lg"
    >
      <div className="flex justify-between items-center p-3 md:p-4 border-b-[1px] border-[#eaeaf1]">
        <p className="text-sm md:text-base text-[#343432] font-medium">
          {item?.title}
        </p>
        <div className="flex gap-2 items-center">
          <div
            onClick={() => {
              handleEditClick(item);
            }}
            className="cursor-pointer"
          >
            <IconStore.pencilEdit className="size-4 stroke-2 cursor-pointer stroke-[#000000]" />
          </div>
          <div
            onClick={() => {
              handleDeleteClick(item);
            }}
            className="cursor-pointer"
          >
            <IconStore.trash className="size-4 stroke-2 cursor-pointer stroke-[#000000]" />
          </div>
        </div>
      </div>
      <p className="p-3 md:p-4 max-w-[150px] min-h-[120px] w-full text-xs md:text-sm">
        {item?.address}
      </p>
      {/* <p className="p-3 md:p-4 border-t-[1px] text-xs md:text-sm border-[#eaeaf1]">
        {item?.phoneNumber}
      </p> */}
    </div>
  );
};

export default AddressList;
