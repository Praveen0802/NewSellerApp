import {
  ADD_WALLET_POPUP,
  CONFIRM_PURCHASE_POPUP,
  UPDATE_NOTIFICATION_COUNT,
} from "./type";

const initalState = {
  addWalletflag: false,
  confirmPurchasePopupFields: {
    flag: false,
    data: {},
  },
  notificationCountData: {
    notification: 0,
    activity: 0,
    isLoaded: false,
  },
};

const CommonReducers = (state = initalState, action) => {
  switch (action.type) {
    case ADD_WALLET_POPUP:
      return {
        ...state,
        addWalletflag: action?.payload?.flag,
      };
    case CONFIRM_PURCHASE_POPUP:
      return {
        ...state,
        confirmPurchasePopupFields: action?.payload,
      };
    case UPDATE_NOTIFICATION_COUNT:
      return {
        ...state,
        notificationCountData: {
          ...state.notificationCountData,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export default CommonReducers;
