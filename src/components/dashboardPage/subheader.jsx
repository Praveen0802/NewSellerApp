import Image from "next/image";
import Button from "../commonComponents/button";
import calendarIcon from "../../../public/calendar-03.svg";
import { formatDate } from "@/utils/helperFunctions";
import { useDispatch, useSelector } from "react-redux";
import { ADD_WALLET_POPUP } from "@/utils/redux/common/type";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";

const Subheader = () => {
  const dispatch = useDispatch();
  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };
  const { userRoles } = useSelector((state) => state.common);
  const isLmtPayAccessable = userRoles?.permission?.filter(
    (item) => item?.name == "lmt-pay" && item.is_can_access == 1
  );

  return (
    <div className="bg-white flex items-center py-2 md:py-2 justify-between px-4 md:px-6 border-b border-[#eaeaf1]">
      <div className="flex gap-2 items-center">
        <Image src={calendarIcon} width={16} height={16} alt="logo" />
        <p className="text-[#343432] text-xs md:text-sm">
          {formatDate(new Date())}
        </p>
      </div>
      {isLmtPayAccessable?.length > 0 && (
        <Button
          type="primary"
          classNames={{
            root: "px-2 md:px-3 py-1.5 md:py-2",
            label_: "text-xs md:text-sm font-medium",
          }}
          onClick={() => {
            handleOpenAddWalletPopup();
          }}
          label="+ Add Deposit"
        />
      )}
    </div>
  );
};

export default Subheader;
