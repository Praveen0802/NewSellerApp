import {
  ADD_WALLET_POPUP,
  CONFIRM_PURCHASE_POPUP,
  SHOW_FULL_DISPLAY,
  UPDATE_NOTIFICATION_COUNT,
} from "./type";

export const updateWalletPopupFlag = (payload) => {
  return {
    type: ADD_WALLET_POPUP,
    payload,
  };
};

export const updateConfirmPurchasePopup = (payload) => {
  return {
    type: CONFIRM_PURCHASE_POPUP,
    payload,
  };
};

export const updateNotificationCount = (payload) => {
  return {
    type: UPDATE_NOTIFICATION_COUNT,
    payload,
  };
};

export const updateLeftMenuDisplay = (payload) => {
  return {
    type: SHOW_FULL_DISPLAY,
    payload,
  };
};
