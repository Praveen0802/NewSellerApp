import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getLinkedCards,
  paymentConfig,
  removeSavedCards,
} from "@/utils/apiHandler/request";
import { Trash2 } from "lucide-react";
import DeleteConfirmation from "../commonComponents/deleteConfirmation";

const LinkedCards = (props) => {
  const [savedCards, setSavedCards] = useState(
    props?.linkedCards?.data?.linked_cards || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState(false); // Add delete confirmation state
  const [deleteCardId, setDeleteCardId] = useState(null); // Add state to store card ID to be deleted
  const [deleteLoader, setDeleteLoader] = useState(false); // Add delete loader state
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const cardElementRef = useRef(null);
  const stripeInitializedRef = useRef(false);

  // Load Stripe SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => {
      stripeRef.current = window.Stripe(process.env.STRIPE_PUBLIC_KEY);
      setStripeLoaded(true);
    };
    script.onerror = (err) => console.error("Stripe load error", err);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Fetch saved cards from API
  const fetchSavedCards = useCallback(async () => {
    try {
      const response = await getLinkedCards();

      const result = response;
      if (result.success) {
        setSavedCards(result.data.linked_cards);
      }
    } catch (err) {
      console.error("Error fetching cards", err);
      toast.error("Failed to fetch saved cards");
    }
  }, [props?.email]);

  // Handle delete click - show confirmation popup
  const handleDeleteClick = (paymentMethodId) => {
    setDeleteCardId(paymentMethodId);
    setDeleteConfirmPopup(true);
  };

  // Handle the actual delete operation
  const handleDeleteCard = async () => {
    if (!deleteCardId) return;

    setDeleteLoader(true);
    try {
      const response = await removeSavedCards("", {
        gateway: "stripe",
        card_id: deleteCardId,
      });

      if (response.success) {
        fetchSavedCards();
        toast.success("Card removed successfully!");
        setDeleteConfirmPopup(false);
        setDeleteCardId(null);
      } else {
        toast.error(response.error || "Failed to remove card");
      }
    } catch (err) {
      console.error("Remove card error", err);
      toast.error("Error removing card");
    } finally {
      setDeleteLoader(false);
    }
  };

  // Handle closing delete confirmation popup
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmPopup(false);
    setDeleteCardId(null);
  };

  // Get card logo URL based on brand
  const getCardLogoUrl = (brand) => {
    const brandMap = {
      visa: "visa.png",
      mastercard: "mastercard-logo.png",
      amex: "amex.png",
      discover: "discover.png",
      diners: "diners-club.png",
      jcb: "jcb.png",
      unionpay: "unionpay.png",
    };

    const slug = brand.toLowerCase();
    const fileName = brandMap[slug] || "bank-card-back-side.png";
    return `https://img.icons8.com/color/48/${fileName}`;
  };

  // Initialize Stripe Elements
  const initializeStripe = useCallback(async () => {
    if (
      isLoading ||
      !stripeLoaded ||
      stripeInitializedRef.current ||
      !stripeRef.current
    )
      return;

    setIsLoading(true);
    stripeInitializedRef.current = true;

    try {
      // Get payment config for setup intent
      const response = await paymentConfig("", {
        gateway: "stripe",
      });

      const config = response;
      if (!config.data?.client_secret) {
        throw new Error("Invalid config response");
      }

      // Create Stripe Elements
      elementsRef.current = stripeRef.current.elements();
      cardElementRef.current = elementsRef.current.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
        },
      });

      // Mount card element
      const container = document.getElementById("stripe-card-element");
      if (container) {
        container.innerHTML = "";
        cardElementRef.current.mount("#stripe-card-element");
      }

      // Handle card validation errors
      cardElementRef.current.on("change", (event) => {
        const displayError = document.getElementById("card-errors");
        if (displayError) {
          displayError.textContent = event.error ? event.error.message : "";
        }
      });
    } catch (err) {
      console.error("Stripe init error", err);
      toast.error("Failed to initialize payment form");
    } finally {
      setIsLoading(false);
    }
  }, [stripeLoaded, props?.email]);

  // Handle card saving
  const handleSaveCard = async () => {
    if (!stripeRef.current || !cardElementRef.current) return;

    setIsLoading(true);
    try {
      // Get setup intent client secret
      const response = await paymentConfig({ gateway: "stripe" });

      const config = await response;
      const { client_secret } = config.data;

      // Confirm card setup
      const result = await stripeRef.current.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElementRef.current,
          billing_details: {
            name: props?.customerName || "Customer",
          },
        },
      });

      if (result.error) {
        toast.error("Error saving card: " + result.error.message);
      } else {
        toast.success("Card saved successfully!");
        fetchSavedCards();
        setShowAddCard(false);
        stripeInitializedRef.current = false;
      }
    } catch (err) {
      console.error("Save card error", err);
      toast.error("Failed to save card");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Stripe when add card is shown
  useEffect(() => {
    if (showAddCard && stripeLoaded && !stripeInitializedRef.current) {
      initializeStripe();
    }
  }, [showAddCard, stripeLoaded, initializeStripe]);

  const handleCancelClick = () => {
    setShowAddCard(false);
    stripeInitializedRef.current = false;
    if (cardElementRef.current) {
      cardElementRef.current.unmount();
      cardElementRef.current = null;
    }
  };

  return (
    <div className="w-full h-full">
      <p className="pb-2 sm:pb-4 text-base sm:text-lg md:text-xl p-3 sm:p-4 font-semibold">
        Linked Cards
      </p>
      <div className="bg-white p-3 sm:p-4 border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full h-full">
        <div className="">
          {savedCards?.length > 0 ? (
            <div className="mb-6 grid grid-cols-2 gap-4">
              {savedCards?.map((card, index) => {
                const cardInfo = card.card;
                const cardType = cardInfo.brand || "visa";
                const lastFour = cardInfo.last4 || "XXXX";
                const logoUrl = getCardLogoUrl(cardType);

                return (
                  <div
                    key={card.id}
                    className="border border-gray-200 rounded-md p-4 mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium mb-2 flex gap-2 items-center">
                        <img
                          src={logoUrl}
                          alt={`${cardType} logo`}
                          width={50}
                          height={32}
                          className="h-8 w-12 object-contain"
                          onError={(e) => {
                            e.target.src =
                              "https://img.icons8.com/ios-filled/50/bank-card-back-side.png";
                          }}
                        />
                        {cardType.toUpperCase()}
                      </div>
                      <button
                        onClick={() => handleDeleteClick(card.id)} // Updated to use handleDeleteClick
                        className="mt-2 text-sm text-red-600 hover:text-red-800 cursor-pointer flex items-center gap-1 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <div>Card details</div>
                      <div>•••• •••• •••• {lastFour}</div>
                      <div>
                        Expires: {cardInfo.exp_month}/{cardInfo.exp_year}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border md:w-[40%]  border-gray-200 rounded-md p-4 mb-6 text-gray-600">
              <p>No saved cards</p>
            </div>
          )}

          <button
            onClick={() => {
              stripeInitializedRef.current = false;
              setShowAddCard(true);
            }}
            className="flex items-center cursor-pointer justify-center gap-2 bg-purple-700 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !stripeLoaded}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {isLoading ? "Loading..." : "Add card"}
          </button>

          {/* Add Card Form */}
          {showAddCard && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium text-gray-800 m-0">
                  Add Payment Method
                </h3>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 cursor-pointer rounded-full"
                  onClick={handleCancelClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Information
                </label>
                <div
                  id="stripe-card-element"
                  className="p-3 border border-gray-300 rounded-md"
                ></div>
                <div
                  id="card-errors"
                  className="text-red-600 text-sm mt-2"
                  role="alert"
                ></div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCard}
                  disabled={isLoading}
                  className="flex-1 bg-purple-700 text-white py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Card"}
                </button>
                <button
                  onClick={handleCancelClick}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Your card information is encrypted and secure.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmPopup && (
        <DeleteConfirmation
          content="Are you sure you want to remove this saved card?"
          handleClose={handleCloseDeleteConfirm}
          handleDelete={handleDeleteCard}
          loader={deleteLoader}
        />
      )}
    </div>
  );
};

export default LinkedCards;
