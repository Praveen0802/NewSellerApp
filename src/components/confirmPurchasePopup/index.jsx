import { dateFormat, desiredFormatDate } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FooterButton from "../footerButton";
import Button from "../commonComponents/button";
import PurchaseCard from "./purchaseCard";
import EventDetails from "./eventDetails";
import PaymentDetails from "./paymentDetails";
import AddessDetails from "./addessDetails";
import {
  fetchAddressBookDetails,
  fetchCityBasedonCountry,
  fetchCountrieList,
  getDialingCode,
  paymentPurchaseDetails,
  paymentWithExistingCard,
  purchaseTicketConfirm,
  purchaseTicketsBuy,
  purchaseTicketValidate,
  updateNominee,
} from "@/utils/apiHandler/request";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import GuestDetails from "./guestDetails";
import useCountryCodes from "@/Hooks/useCountryCodes";
import { allCountryCodes } from "@/utils/constants/allContryCodes";
import StripeDropIn from "./adyenPurchaseNewCard";

const ConfirmPurchasePopup = ({ onClose }) => {
  const { confirmPurchasePopupFields } = useSelector((state) => state?.common);
  const [loader, setLoader] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({ name: "SB Pay" });
  const [addressDetails, setAddressDetails] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState();
  const [showStripeDropIn, setShowStripeDropIn] = useState(false); // Updated state name
  const [stripeBookingId, setStripeBookingId] = useState(null); // Updated state name
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [guestFormFieldValues, setGuestFormFieldValues] = useState({});
  const [guestDetails, setGuestDetails] = useState([]);
  const [hideCta, setHideCta] = useState(false);
  const [bookingNo, setBookingNo] = useState(null);
  console.log(selectedAddress, "selectedAddressselectedAddress");
  const { data = {} } = confirmPurchasePopupFields;
  const [selectedQuantity, setSelectedQuantity] = useState(
    data?.purchase?.price_breakdown?.ticket_quantity
  );
  const [totalAmount, setTotalAmount] = useState(
    data?.purchase?.price_breakdown?.grand_total
  );
  const [formFieldValues, setFormFieldValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dialing_code: "",
    mobile_no: "",
    country_id: "",
    city: "",
  });
  const handlePaymentChange = (name) => {
    setSelectedPayment(name);
  };

  const handleAddressChange = (id, field) => {
    setSelectedAddress(id);
    setFormFieldValues({
      ...formFieldValues,
      first_name: field?.first_name,
      last_name: field?.last_name,
      email: field?.email,
      dialing_code: field?.country_code?.includes("+")
        ? field?.country_code
        : `+${field?.country_code}`,
      mobile_no: field?.mobile_number,
      country: field?.country_id,
      city: field?.city_id,
    });
  };

  const { allCountryCodeOptions } = useCountryCodes();

  const fetchAddressPaymentDetails = async () => {
    try {
      const [addressDetails, paymentDetails, countryList] =
        await Promise.allSettled([
          fetchAddressBookDetails(),
          paymentPurchaseDetails("", {
            currency: data?.purchase?.price_breakdown?.currency,
          }),
          fetchCountrieList(),
        ]);
      setCountryOptions(
        countryList?.value?.map((item) => {
          return { label: item?.name, value: item?.id };
        })
      );
      setPhoneCodeOptions(
        allCountryCodes?.data?.map((item) => {
          return {
            value: item?.phone_code,
            label: `${item?.country_short_name} ${item?.country_code}`,
          };
        })
      );
      setPhoneCodeOptions(allCountryCodeOptions);
      setAddressDetails(addressDetails?.value);
      setPaymentDetails(paymentDetails?.value?.payment_methods);
      setSelectedAddress(
        addressDetails?.value?.findIndex((item) => item.primary_address == 1)
      );
      const address = addressDetails?.value?.filter(
        (item) => item.primary_address == 1
      );
      const primaryAddress = address[0];
      setFormFieldValues({
        ...formFieldValues,
        first_name: primaryAddress?.first_name,
        last_name: primaryAddress?.last_name,
        email: primaryAddress?.email,
        dialing_code: primaryAddress?.country_code?.includes("+")
          ? primaryAddress?.country_code
          : `+${primaryAddress?.country_code}`,
        mobile_no: primaryAddress?.mobile_number,
        country: Number(primaryAddress?.country_id),
        city: Number(primaryAddress?.city_id),
        address: primaryAddress?.address,
      });
      console.log(address, "address");
    } catch (error) {
      toast.error("Failed to load address and payment details");
    }
  };
  console.log(formFieldValues, "formFieldValues");
  useEffect(() => {
    fetchAddressPaymentDetails();
  }, []);

  const fetchCityDetails = async (id) => {
    if (!id) return;
    try {
      const response = await fetchCityBasedonCountry("", { country_id: id });
      const cityField =
        response?.length > 0
          ? response?.map((list) => {
              return { value: list?.id, label: list?.name };
            })
          : [];
      setCityOptions(cityField);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
    }
  };

  useEffect(() => {
    if (formFieldValues?.country) {
      fetchCityDetails(formFieldValues?.country);
    }
  }, [formFieldValues?.country]);

  const handleInputAdressChange = (e, key, type) => {
    const value = type == "select" ? e : e.target.value;
    setFormFieldValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const router = useRouter();

  const bookingConfirm = async (success, message, booking) => {
    console.log(success, message, booking);
    if (success) {
      toast.success(message);
      router.push(`/trade/purchase?success=true&booking_no=${booking}`);
      onClose();
    } else {
      toast.error(message || "Booking confirmation failed");
      setLoader(false);
    }
  };

  const paymentSubmit = async (paymentMethod, bookingId, bookingNo) => {
    if (paymentMethod == 1) {
      // SB Pay - existing logic
      const confirmationPayload = {
        booking_id: bookingId,
        payment_method: paymentMethod,
      };

      const confirmResponse = await purchaseTicketConfirm(
        "",
        confirmationPayload
      );
      if (confirmResponse?.result?.booking_status == "Success") {
        bookingConfirm(true, "Booking Confirmed Successfully", bookingId);
      } else {
        bookingConfirm(
          false,
          confirmResponse?.result?.message || "Booking confirmation failed"
        );
      }
    } else if (paymentMethod == 2) {
      // Stripe - new logic
      console.log("hidePaymentId", "hideCtalling", bookingId);
      setStripeBookingId(bookingId);
      setHideCta(true);
      setShowStripeDropIn(true);
    } else if (paymentMethod == 3) {
      // Existing card - existing logic
      const response = await paymentWithExistingCard("", {
        booking_id: bookingId,
        payment_method: 3,
        recurringDetailReference:
          selectedPayment?.field?.RecurringDetail?.recurringDetailReference,
      });
      if (response?.result?.status == 1) {
        bookingConfirm(true, "Booking Confirmed Successfully", bookingId);
      } else {
        bookingConfirm(false, response?.message || "Booking failed");
      }
    }
  };
  console.log(hideCta, "selectedPayment");

  function convertToAttendeesFormat(payload) {
    const attendees = [];

    // Get all the field names from the payload
    const fieldNames = Object.keys(payload);

    // Assuming all arrays have the same length, get the length from the first field
    const numAttendees =
      fieldNames.length > 0 ? payload[fieldNames[0]].length : 0;

    // Create attendee objects
    for (let i = 0; i < numAttendees; i++) {
      const attendee = {
        attendee: i + 1, // 1-based indexing
        fields: [],
      };

      // Add each field for this attendee
      fieldNames.forEach((fieldName) => {
        const fieldObj = {};
        fieldObj[fieldName] = payload[fieldName][i];
        attendee.fields.push(fieldObj);
      });

      attendees.push(attendee);
    }

    return { attendees };
  }

  const handleSubmit = async () => {
    // toast.error("Booking is not allowed at this moment");
    // return;
    try {
      setLoader(true);

      // Validate address selection
      if (selectedAddress <= 0) {
        bookingConfirm(false, "Please add a billing address");
        setLoader(false);
        return;
      }

      const paymentMethod =
        selectedPayment?.name == "SB Pay"
          ? 1
          : selectedPayment?.name == "New Credit or Debit Card"
          ? 2
          : 3;
      setSelectedPaymentMethod(paymentMethod);

      if (guestDetails?.length > 0) {
        try {
          const allFieldsFilled = guestDetails.every((guest) => {
            console.log(guest, "guestguest");
            return guest.required_fields.every((field) => {
              const fieldValue = guestFormFieldValues[field];
              return (
                fieldValue &&
                fieldValue[guest.index] &&
                fieldValue[guest.index].trim() !== ""
              );
            });
          });

          const result = convertToAttendeesFormat(guestFormFieldValues);
          console.log({ ...result }, "resultresultresult");
          if (allFieldsFilled) {
            await updateNominee("", {
              booking_id: stripeBookingId,
              ...result,
            });
            paymentSubmit(paymentMethod, stripeBookingId, bookingNo);
            return;
          } else {
            toast.error("submit all guest details");
            setLoader(false);
            return;
          }
        } catch (error) {
          console.error("Error validating guest details:", error);
          toast.error("An error occurred while validating guest details");
          setLoader(false);
          return;
        }
      }

      const fetchOrderIdPayload = {
        currrency: data?.purchase?.price_breakdown?.currency,
        client_country: "IN",
        lang: "en",
        match_id: `${data?.matchId}`,
        quantity: `${selectedQuantity}`,
        sell_ticket_id: `${data?.sNo}`,
        payment_method: `${paymentMethod}`,
      };

      const response = await purchaseTicketValidate(
        "",
        {},
        fetchOrderIdPayload
      );

      if (response?.status == 1) {
        const secondApiPayload = {
          cart_id: response?.cart_id,
          lang: "en",
          client_country: "IN",
          first_name: formFieldValues?.first_name,
          last_name: formFieldValues?.last_name,
          email: formFieldValues?.email,
          mobile_no: formFieldValues?.mobile_no,
          dialing_code: `${formFieldValues?.dialing_code}`,
          country: `${formFieldValues?.country}`,
          city: `${formFieldValues?.city}`,
          address: `${formFieldValues?.address}`,
          payment_method: `${paymentMethod}`,
        };

        const apiResponse = await purchaseTicketsBuy(
          "",
          response?.cart_id,
          {},
          secondApiPayload
        );

        setBookingNo(apiResponse?.booking_no);
        setStripeBookingId(apiResponse?.booking_id);

        if (apiResponse?.guest_data?.length > 0) {
          const guestKey = apiResponse?.guest_data?.some((guest) => {
            return guest?.required_fields?.length > 0;
          });
          if (guestKey) {
            const guestData = apiResponse?.guest_data;
            setGuestDetails(guestData);
            setLoader(false);
            return;
          }
        }
        if (apiResponse?.status == "success") {
          paymentSubmit(
            paymentMethod,
            apiResponse?.booking_id,
            apiResponse?.booking_no
          );
        } else {
          bookingConfirm(
            false,
            apiResponse?.message?.message || "Booking failed"
          );
        }
      } else {
        bookingConfirm(false, response?.message || "Booking failed");
      }
    } catch (error) {
      bookingConfirm(
        false,
        "An unexpected error occurred. Please try again later."
      );
    } finally {
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Toast container */}
      <ToastContainer position="top-right" closeOnClick autoClose={5000} />

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-[15px] font-semibold text-gray-800">
          Confirm Purchase
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
          aria-label="Close"
        >
          <IconStore.close className="size-5 text-gray-600" />
        </button>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4">
        <EventDetails data={data} />
        <PurchaseCard
          data={data}
          setSelectedQuantity={setSelectedQuantity}
          selectedQuantity={selectedQuantity}
          setTotalAmount={setTotalAmount}
          totalAmount={totalAmount}
        />
        <AddessDetails
          data={data}
          addressDetails={addressDetails}
          selectedAddress={selectedAddress}
          handleAddressChange={handleAddressChange}
          formFieldValues={formFieldValues}
          handleChange={handleInputAdressChange}
          phoneCodeOptions={phoneCodeOptions}
          countryList={countryOptions}
          cityOptions={cityOptions}
        />
        {guestDetails?.length > 0 && (
          <GuestDetails
            guestDetails={guestDetails}
            formFieldValues={guestFormFieldValues}
            setFormFieldValues={setGuestFormFieldValues}
          />
        )}
        <PaymentDetails
          data={data}
          selectedPayment={selectedPayment}
          handlePaymentChange={handlePaymentChange}
          paymentDetails={paymentDetails}
        />
      </div>

      {/* Footer - Fixed at Bottom */}
      {!hideCta && (
        <div className="flex-shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200 mt-auto">
          <div className="flex justify-start gap-3 sm:gap-4">
            <Button
              label="Cancel"
              type="secondary"
              onClick={onClose}
              classNames={{
                root: "py-2 px-3 sm:px-4 bg-white hover:bg-gray-50 w-[50%] justify-center rounded-md transition-all duration-200",
                label_: "text-sm font-medium text-gray-800",
              }}
            />
            <Button
              label="Submit"
              loading={loader}
              onClick={handleSubmit}
              classNames={{
                root: `py-2 px-4 sm:px-5 rounded-md w-[50%] justify-center transition-all duration-200 
          bg-green-500 hover:bg-green-600          
      `,
                label_: "text-sm font-medium text-white",
              }}
            />
          </div>
        </div>
      )}

      {showStripeDropIn && (
        <StripeDropIn
          bookingId={stripeBookingId}
          paymentMethod={2}
          bookingConfirm={bookingConfirm}
          setLoader={setLoader}
          setHideCta={setHideCta}
          setShowStripeDropIn={setShowStripeDropIn}
          bookingNo={bookingNo}
          amount={totalAmount || 0}
          currency={data?.purchase?.price_breakdown?.currency || "usd"}
          formFieldValues={formFieldValues}
        />
      )}
    </div>
  );
};

export default ConfirmPurchasePopup;
