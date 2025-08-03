import {
  ADD_WALLET_POPUP,
  CONFIRM_PURCHASE_POPUP,
  FETCH_USER_ROLES,
  SHOW_FULL_DISPLAY,
  UPDATE_NOTIFICATION_COUNT,
  USER_ACCESS_ROUTES,
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

export const updateRoleAccess = (payload) => {
  return {
    type: FETCH_USER_ROLES,
    payload,
  };
};

export const getUserAccessRoutes = (payload) => {
  return {
    type: USER_ACCESS_ROUTES,
    payload,
  };
};
