import React, { useEffect } from "react";
import LeftMenuBar from "../leftMenuBar";
import { useRouter } from "next/router";
import { hideHeaderPages, hideLeftMenuPages } from "@/utils/constants/contants";
import { useDispatch, useSelector } from "react-redux";
import { hidepageLoader, showpageLoader } from "@/utils/redux/loader/action";
import PageLoader from "../pageLoader";
import Header from "../header";
import RightViewModal from "../commonComponents/rightViewModal";
import {
  updateConfirmPurchasePopup,
  updateWalletPopupFlag,
} from "@/utils/redux/common/action";
import { ADD_WALLET_POPUP } from "@/utils/redux/common/type";
import AddDepositSummary from "../addDepositSummary";
import { fetchProfileDetails } from "@/utils/apiHandler/request";
import { updateCurrentUser } from "@/utils/redux/currentUser/action";
import ConfirmPurchasePopup from "../confirmPurchasePopup";

const SecureLayout = ({ children }) => {
  const router = useRouter();
  const hideLeftMenu = hideLeftMenuPages?.includes(router?.pathname);
  const hideHeader = hideHeaderPages?.includes(router?.pathname);
  const dispatch = useDispatch();
  const { pageLoader } = useSelector((state) => state.pageLoader);
  const { addWalletflag, confirmPurchasePopupFields } = useSelector(
    (state) => state.common
  );

  useEffect(() => {
    // dispatch(showpageLoader());
    const handleStart = () => dispatch(showpageLoader());
    const handleComplete = () => dispatch(hidepageLoader());

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const fetchUserName = async () => {
    const response = await fetchProfileDetails();
    dispatch(updateCurrentUser(response));
  };

  useEffect(() => {
    fetchUserName();
  }, [router]);

  const closeAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: false,
      })
    );
  };

  const closeConfirmPurchasePopup = () => {
    dispatch(
      updateConfirmPurchasePopup({
        flag: false,
        data: {},
      })
    );
  };

  return (
    <>
      <div className="flex h-screen">
        {!hideLeftMenu && <LeftMenuBar />}
        <div
          className={`flex flex-col ${
            hideHeader ? " " : "max-md:pt-20 overflow-hidden"
          } w-full `}
        >
          {!hideHeader && <Header />}
          <div className={`flex-1 ${hideHeader ? "" : "overflow-hidden"}`}>
            {pageLoader ? <PageLoader /> : <>{children}</>}
          </div>
        </div>
        <RightViewModal
          show={addWalletflag}
          onClose={() => {
            closeAddWalletPopup();
          }}
          className={"md:!w-[600px]"}
          outSideClickClose={true}
        >
          <AddDepositSummary
            show={addWalletflag}
            onClose={() => {
              closeAddWalletPopup();
            }}
          />
        </RightViewModal>

        <RightViewModal
          show={confirmPurchasePopupFields?.flag}
          onClose={() => {
            closeConfirmPurchasePopup();
          }}
          className={"md:!w-[650px]"}
          outSideClickClose={false}
        >
          <ConfirmPurchasePopup onClose={closeConfirmPurchasePopup} />
        </RightViewModal>
      </div>
    </>
  );
};

export default SecureLayout;
