import React from "react";
import AddressList from "./addressList";

const AddressView = ({
  title,
  titleIcon,
  handleEditClick,
  handleDeleteClick,
  addressValues,
  component,
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium md:text-base flex items-center gap-1">
          {title} {titleIcon && titleIcon}
        </p>
        {component && component}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {addressValues?.map((item, index) => {
          return (
            <AddressList
              handleEditClick={handleEditClick}
              handleDeleteClick={handleDeleteClick}
              item={item}
              index={index}
              key={index}
            />
          );
        })}
      </div>
    </>
  );
};

export default AddressView;
