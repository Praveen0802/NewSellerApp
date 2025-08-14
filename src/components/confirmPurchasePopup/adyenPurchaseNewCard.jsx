import {
  stripeConfirmPayment,
  stripeSessionPayment,
} from "@/utils/apiHandler/request";
import React, { useEffect, useRef, useState } from "react";

const StripeDropIn = ({
  bookingId,
  paymentMethod,
  bookingConfirm,
  setHideCta,
  bookingNo,
  amount,
  currency = "usd",
  formFieldValues,
}) => {
  const cardElementRef = useRef(null);
  const cardErrorsRef = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadStripe = async () => {
      try {
        setHideCta(true);

        // Load Stripe script if not already loaded
        if (!window.Stripe) {
          const script = document.createElement("script");
          script.src = "https://js.stripe.com/v3/";
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize Stripe
        const stripeInstance = window.Stripe(process.env.STRIPE_PUBLIC_KEY);
        const elementsInstance = stripeInstance.elements();

        // Create card element with custom styling
        const cardElement = elementsInstance.create("card", {
          hidePostalCode: true,
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: "antialiased",
            },
            invalid: {
              color: "#9e2146",
            },
          },
        });

        // Mount card element
        if (cardElementRef.current) {
          cardElement.mount(cardElementRef.current);
        }

        // Handle card changes
        cardElement.on("change", (event) => {
          if (cardErrorsRef.current) {
            cardErrorsRef.current.textContent = event.error
              ? event.error.message
              : "";
          }
          setError(event.error ? event.error.message : null);
        });

        setStripe(stripeInstance);
        setElements(elementsInstance);
        setCard(cardElement);
        // setHideCta(false);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        setError("Failed to load payment form");
        // setHideCta(false);
      }
    };

    loadStripe();

    return () => {
      // Cleanup
      if (card) {
        card.destroy();
      }
      // setHideCta(false);
    };
  }, [bookingId, paymentMethod, setHideCta]);

  const handlePayment = async () => {
    if (!stripe || !elements || !card) {
      setError("Stripe is not loaded yet");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent on your backend
      const { data } = await stripeSessionPayment("", {
        gateway: "stripe",
        amount: amount * 100, // Convert to cents
        currency: currency,
        metadata: {
          order_id: bookingNo,
          booking_id: bookingId,
        },
      });
      const paymentData = data;
      console.log(paymentData, "paymentData");

      if (!paymentData.client_secret) {
        throw new Error("Failed to create payment intent");
      }

      // Step 2: Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(
        paymentData.client_secret,
        {
          payment_method: {
            card: card,
            billing_details: {
              // You can add billing details here if needed
              name:
                formFieldValues.first_name + " " + formFieldValues.last_name,
              email: formFieldValues.email,
            },
          },
        }
      );
      console.log(result, "result");
      if (result.error) {
        setError(result.error.message);
        bookingConfirm(false, `Payment failed: ${result.error.message}`);
      }
      else if (result.paymentIntent.status === "succeeded") {
        // Step 3: Confirm payment on your backend
        alert("Payment successful!");
        // const confirmData = await stripeConfirmPayment("", {
        //   currency: currency,
        //   payment_intent_id: result.paymentIntent.id,
        //   order_id: bookingNo,
        //   booking_id: bookingId,
        // });

       

        // if (confirmData.success) {
        //   bookingConfirm(
        //     true,
        //     "Payment successful & ticket booked!",
        //     bookingNo
        //   );
        // } else {
        //   bookingConfirm(false, "Payment succeeded but booking failed!");
        // }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "An error occurred during payment");
      bookingConfirm(false, error.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-container p-4 bg-white rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Payment Details
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          Amount: {currency.toUpperCase()} {amount}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div
          ref={cardElementRef}
          className="p-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        />
        <div
          ref={cardErrorsRef}
          className="text-red-600 text-sm mt-2 min-h-[20px]"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setHideCta(false)}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading || !stripe || !elements}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            `Pay ${currency.toUpperCase()} ${amount}`
          )}
        </button>
      </div>
    </div>
  );
};

export default StripeDropIn;
