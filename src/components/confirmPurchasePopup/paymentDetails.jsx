import Image from "next/image";
import React from "react";
import roundedChevron from "../../../public/rounded-chevron.svg";
import netBankingSupports from "../../../public/netBankingSupports.svg";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import { useDispatch, useSelector } from "react-redux";

const PaymentDetails = ({
  data,
  handlePaymentChange,
  selectedPayment,
  paymentDetails,
}) => {
  const dispatch = useDispatch();
  const { userRoles } = useSelector((state) => state.common);
  const isLmtPayAccessable = userRoles?.permission?.filter(
    (item) => item?.name == "lmt-pay" && item.is_can_access == 1
  );
  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  // Handle both Stripe and Adyen formats
  const linkedCards = paymentDetails?.[1]?.linked_cards?.data || [];

  // Function to get brand name
  const getBrandName = (item) => {
    // For Stripe format
    if (item.card?.brand) {
      const brand = item.card.brand.toLowerCase();
      switch (brand) {
        case 'visa':
          return 'Visa';
        case 'mastercard':
          return 'Mastercard';
        case 'amex':
          return 'American Express';
        case 'discover':
          return 'Discover';
        case 'diners':
          return 'Diners Club';
        case 'jcb':
          return 'JCB';
        case 'unionpay':
          return 'UnionPay';
        default:
          return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    // For Adyen format (existing logic)
    if (item.RecurringDetail?.paymentMethodVariant) {
      const variant = item.RecurringDetail.paymentMethodVariant;
      switch (variant) {
        case 'mc':
          return 'Mastercard';
        case 'visacredit':
          return 'Visa';
        case 'amex':
          return 'American Express';
        default:
          return variant;
      }
    }
    
    return 'Card';
  };

  // Function to get last 4 digits
  const getLastFour = (item) => {
    // For Stripe format
    if (item.card?.last4) {
      return item.card.last4;
    }
    
    // For Adyen format (existing logic)
    if (item.RecurringDetail?.card?.number) {
      return item.RecurringDetail.card.number;
    }
    
    return '****';
  };

  // Function to get card logo URL
  const getCardLogoUrl = (item) => {
    // For Stripe format
    if (item.card?.brand) {
      const brand = item.card.brand.toLowerCase();
      // Using a generic card logo service or you can host your own
      const logoMap = {
        'visa': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
        'mastercard': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
        'amex': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
        'discover': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg',
        'diners': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg',
        'jcb': 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg',
        'unionpay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg'
      };
      return logoMap[brand] || '';
    }
    
    // For Adyen format (existing logic)
    if (item.RecurringDetail?.variant) {
      return `https://cdf6519016.cdn.adyen.com/checkoutshopper/images/logos/${item.RecurringDetail.variant}.svg`;
    }
    
    return '';
  };

  const radioButtonFields = [
    {
      name: "SB Pay",
      component: (
        <div className="flex gap-4 items-center">
          <p className="text-[12px] text-gray-700">
            Available Balance:{" "}
            <b>
              {paymentDetails?.[0]?.wallet?.currencyIcons}
              {paymentDetails?.[0]?.wallet?.amount}
            </b>
          </p>
          {isLmtPayAccessable?.length > 0 && (
            <button
              onClick={() => {
                handleOpenAddWalletPopup();
              }}
              className="flex gap-2 bg-[#F0F1F5] cursor-pointer rounded-md py-[2px] px-[5px] items-center"
            >
              <Image src={roundedChevron} width={12} height={12} alt="logo" />
              <p className="text-[12px] font-normal">Deposit</p>
            </button>
          )}
        </div>
      ),
    },
    ...(linkedCards.length > 0 ? linkedCards.map((item) => ({
      name: `${getBrandName(item)} ****${getLastFour(item)}`,
      component: (
        <div className="flex items-center">
          <img
            src={getCardLogoUrl(item)}
            alt="Card Image"
            style={{ width: "50px", height: "auto", margin: "0 10px" }}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
            }}
          />
          <p className="text-[12px] text-gray-700">
            **** **** **** {getLastFour(item)}
          </p>
        </div>
      ),
      field: item,
    })) : []),
    {
      name: "New Credit or Debit Card",
      component: (
        <Image src={netBankingSupports} width={119} height={20} alt="logo" />
      ),
    },
  ];

  return (
    <div className="border border-gray-200 rounded-md">
      <p className="px-4 py-2 border-b border-gray-200 text-[14px] font-medium">
        Payment
      </p>
      <div>
        {radioButtonFields?.map((field, index) => (
          <label
            key={index}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
              index !== radioButtonFields?.length - 1
                ? "border-b border-gray-200"
                : ""
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                className="w-3 h-3 text-gray-600 cursor-pointer"
                checked={selectedPayment?.name === field?.name}
                onChange={() => handlePaymentChange(field)}
              />
              <div className="ml-3 flex items-center">
                <span className="text-gray-900 text-[13px] font-medium">
                  {field?.name}
                </span>
              </div>
            </div>
            {field?.component && (
              <div className="ml-auto">{field?.component}</div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentDetails;