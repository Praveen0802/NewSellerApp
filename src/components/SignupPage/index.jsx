import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  RefreshCw,
  User,
  Building2,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/router";

import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import { readCookie, setCookie } from "@/utils/helperFunctions/cookie";
import {
  RegisterUser,
  zohoEmbed,
  fetchCityBasedonCountry,
} from "@/utils/apiHandler/request";
import useCountryCodes from "@/Hooks/useCountryCodes";

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [currentUrl, setCurrentUrl] = useState("/signup");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    user_type: "1",
    phone_country_code: "+91",
    phone_number: "",
    address: "",
    city: "",
    zip_code: "",
    country: "", // Changed to empty string to force selection
    currency: "",
    business_name: "",
    is_business: "0",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signUrl, setSignUrl] = useState("");
  const [actionId, setActionId] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  // City related states
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const totalSteps = 4;

  // Get country and phone code options from hook
  const { allCountryCodeOptions, countryOptions } = useCountryCodes();

  // Phone code options (keeping existing structure)
  const phoneCodeOptions = [
    { value: "+91", label: "+91 (India)" },
    { value: "+1", label: "+1 (US)" },
    { value: "+44", label: "+44 (UK)" },
    { value: "+33", label: "+33 (France)" },
    { value: "+49", label: "+49 (Germany)" },
  ];

  // Currency options (keeping existing)
  const currencyOptions = [
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
    { value: "JPY", label: "¥ JPY" },
  ];

  // Calculate progress percentage based on actual completion
  const calculateProgress = () => {
    let completedSteps = 0;

    // Step 1: User type selection
    if (userType) {
      completedSteps = 1;
    }

    // Step 2: Form completion - check if step 2 is completed (form submitted)
    if (currentStep >= 2 && userType) {
      completedSteps = 2;
    }

    // Step 3: Document signing (when currentStep reaches 3)
    if (currentStep >= 3) {
      completedSteps = 3;
    }

    // Step 4: Completion
    if (currentStep >= 4) {
      completedSteps = 4;
    }

    return (completedSteps / totalSteps) * 100;
  };

  // Load saved data from cookies on component mount
  useEffect(() => {
    const savedStep = readCookie("signup_step");
    const savedUserType = readCookie("user_type");
    const savedFormData = readCookie("signup_form_data");

    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }

    if (savedUserType) {
      setUserType(savedUserType);
    }

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(savedFormData));
        setFormData((prev) => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  // Load cities when country changes
  useEffect(() => {
    const loadCities = async () => {
      if (formData.country && formData.country !== "") {
        setIsLoadingCities(true);
        setCityOptions([]);

        // Reset city when country changes
        setFormData((prev) => ({ ...prev, city: "" }));

        try {
          const response = await fetchCityBasedonCountry("", {
            country_id: parseInt(formData.country),
          });

          if (response.length > 0) {
            const cityOptionsList = response.map((city) => ({
              label: city.name,
              value: city.id.toString(),
            }));
            setCityOptions(cityOptionsList);
          } else {
            setCityOptions([]);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
          setCityOptions([]);
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setCityOptions([]);
        setFormData((prev) => ({ ...prev, city: "" }));
      }
    };

    loadCities();
  }, [formData.country]);

  // Save current step to cookies
  useEffect(() => {
    setCookie("signup_step", currentStep.toString(), 7);
  }, [currentStep]);

  // Save form data to cookies whenever it changes
  // useEffect(() => {
  //   setCookie(
  //     "signup_form_data",
  //     encodeURIComponent(JSON.stringify(formData)),
  //     7
  //   );
  // }, [formData]);

  // Simulate URL changes for demo purposes
  const updateUrl = (path) => {
    setCurrentUrl(path);
    console.log("URL would be:", path);
  };

  const handleChange = (e, key, type) => {
    const name = key;
    let value;

    if (type === "select") {
      value = e;
    } else if (type === "checkbox") {
      value = e.target.checked;
    } else {
      value = e.target?.value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = "Zip code is required";
    }

    if (!formData.dob.trim()) {
      newErrors.dob = "Date of birth is required";
    }

    if (userType === "business" && !formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startRegistrationProcess = async (formData) => {
    // Parse DOB from YYYY-MM-DD to D-M-YYYY format (without leading zeros)
    const formatDOB = (dateString) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      // Remove leading zeros from day and month
      return `${parseInt(day)}-${
        parseInt(month) > 9 ? parseInt(month) : "0" + parseInt(month)
      }-${year}`;
    };

    // Create payload with formatted DOB
    const formattedFormData = {
      ...formData,
      dob: formatDOB(formData.dob),
    };

    const zohoEmbedPayload = {
      recipient_name: `${formData.first_name} ${formData.last_name}`,
      recipient_email: formData.email,
      ...(formData?.is_business == 1
        ? { company_name: formData?.business_name }
        : {}),
      location: formData.address,
      testing: true,
    };

    try {
      const promises = [];
      promises.push(RegisterUser("", formattedFormData));
      promises.push(zohoEmbed("", zohoEmbedPayload));
      const [registerResponse, zohoEmbedResponse] = await Promise.all(promises);

      console.log("registerResponse", registerResponse);
      console.log("zohoEmbedResponse", zohoEmbedResponse);

      return { success: true, data: { registerResponse, zohoEmbedResponse } };
    } catch (error) {
      console.error("Registration process error:", error);
      return { success: false, error };
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    setIsLoading(true);
    try {
      const result = await startRegistrationProcess(formData);

      // if (result.success) {
      //   // Move to step 3 after successful form submission
      //   setCurrentStep(3);
      //   // Clear any existing errors
      //   setErrors({});
      // } else {
      //   // Handle API errors - map them to form fields
      //   if (
      //     result.error &&
      //     result.error.response &&
      //     result.error.response.data
      //   ) {
      //     const apiResponse = result.error.response.data;

      //     if (!apiResponse.success && apiResponse.message) {
      //       const apiErrors = {};

      //       // Map API error fields to form field names
      //       Object.keys(apiResponse.message).forEach((fieldName) => {
      //         const errorMessages = apiResponse.message[fieldName];
      //         // Take the first error message for each field
      //         apiErrors[fieldName] = Array.isArray(errorMessages)
      //           ? errorMessages[0]
      //           : errorMessages;
      //       });

      //       setErrors(apiErrors);
      //       console.error("API validation errors:", apiErrors);
      //     }
      //   } else {
      //     // Generic error handling
      //     console.error("Form submission error:", result.error);
      //     setErrors({
      //       general: "An error occurred during registration. Please try again.",
      //     });
      //   }
      // }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (actionId) => {
    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const isComplete = Math.random() > 0.7;

        if (isComplete) {
          clearInterval(pollInterval);
          setIsPolling(false);
          setCurrentStep(4);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
    }, 120000);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!userType) {
        return;
      }
      const businessValue = userType === "business" ? "1" : "0";
      setFormData((prev) => ({ ...prev, is_business: businessValue }));
      setCookie("user_type", userType, 7);
      updateUrl(`/signup/${userType}`);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      if (currentStep === 2) {
        updateUrl("/signup");
      }
    }
  };

  const handleReset = () => {
    setCookie("signup_step", "", -1);
    setCookie("user_type", "", -1);
    setCookie("signup_form_data", "", -1);

    setUserType("");
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_type: "1",
      phone_country_code: "+91",
      phone_number: "",
      address: "",
      city: "",
      zip_code: "",
      country: "",
      currency: "",
      business_name: "",
      is_business: "0",
      dob: "",
    });
    setErrors({});
    setCurrentStep(1);
    setSignUrl("");
    setActionId("");
    setIsPolling(false);
    setCityOptions([]);
    updateUrl("/signup");
  };

  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  // Step 1: User Type Selection
  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center h-full px-4 lg:px-0">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4">
            Which type of Seller Account?
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            Choose your seller account type to start selling tickets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
          {/* Individual Seller */}
          <div
            className={`p-6 lg:p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              userType === "individual"
                ? "border-[#10B981] bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onClick={() => setUserType("individual")}
          >
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3">
                Individual Seller
              </h3>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Perfect for individuals selling tickets for events they can't
                attend or reselling tickets.
              </p>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  userType === "individual"
                    ? "bg-[#10B981] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {userType === "individual" ? "Selected" : "Select"}
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Business Seller */}
          <div
            className={`p-6 lg:p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              userType === "business"
                ? "border-[#10B981] bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            onClick={() => setUserType("business")}
          >
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3">
                Business Seller
              </h3>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Ideal for event organizers, venues, and businesses selling
                tickets at scale.
              </p>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  userType === "business"
                    ? "bg-[#10B981] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {userType === "business" ? "Selected" : "Select"}
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Form Submission - Updated with proper field ordering
  const renderStep2 = () => (
    <div className="flex flex-col justify-center h-full px-4 lg:px-0 py-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4">
            Seller Account Details
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            {userType === "business"
              ? "Complete your business seller account setup"
              : "Complete your individual seller account setup"}
          </p>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4 lg:space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {userType === "business" && (
              <FloatingLabelInput
                label="Business Name"
                id="business_name"
                keyValue="business_name"
                value={formData.business_name}
                onChange={handleChange}
                error={errors.business_name}
                required
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="First Name"
                id="first_name"
                keyValue="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
              <FloatingLabelInput
                label="Last Name"
                id="last_name"
                keyValue="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
            </div>

            <FloatingLabelInput
              label="Email Address"
              type="email"
              id="email"
              keyValue="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
            />

            <FloatingLabelInput
              label="Password"
              type="password"
              id="password"
              keyValue="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <FloatingSelect
                  label="Phone Code"
                  options={allCountryCodeOptions}
                  selectedValue={formData.phone_country_code}
                  onSelect={handleChange}
                  keyValue="phone_country_code"
                  error={errors.phone_country_code}
                  required
                  searchable={true}
                />
              </div>
              <div className="md:col-span-2">
                <FloatingLabelInput
                  label="Phone Number"
                  type="tel"
                  id="phone_number"
                  keyValue="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={errors.phone_number}
                  required
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
            </div>

            <FloatingLabelInput
              label="Date of Birth"
              type="date"
              id="dob"
              keyValue="dob"
              value={formData.dob}
              onChange={handleChange}
              error={errors.dob}
              required
              className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
            />

            <FloatingLabelInput
              label="Address"
              id="address"
              keyValue="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
              className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
            />

            {/* Country field - made searchable */}
            <FloatingSelect
              label="Country"
              options={countryOptions || []}
              selectedValue={formData.country}
              onSelect={handleChange}
              keyValue="country"
              error={errors.country}
              required
              searchable={true}
            />

            {/* City field - comes right after country - made searchable */}
            <FloatingSelect
              label={isLoadingCities ? "Loading Cities..." : "City"}
              options={cityOptions}
              selectedValue={formData.city}
              onSelect={handleChange}
              keyValue="city"
              error={errors.city}
              required
              disabled={!formData.country || isLoadingCities}
              placeholder={
                !formData.country
                  ? "Select country first"
                  : isLoadingCities
                  ? "Loading..."
                  : "Select city"
              }
              searchable={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Zip Code"
                id="zip_code"
                keyValue="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                error={errors.zip_code}
                required
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
              <div>
                <FloatingSelect
                  label="Currency"
                  options={currencyOptions}
                  selectedValue={formData.currency}
                  onSelect={handleChange}
                  keyValue="currency"
                  error={errors.currency}
                  required
                  searchable={true}
                />
              </div>
            </div>

            {/* Display general error if any */}
            {errors.general && (
              <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                {errors.general}
              </div>
            )}
          </div>

          {/* Hidden submit button */}
          <button type="submit" style={{ display: "none" }} />
        </form>
      </div>
    </div>
  );

  // Step 3: Document Signing
  const renderStep3 = () => (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4 lg:mb-6 px-4">
        <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4">
          Complete Document Signing
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Please sign the required seller agreement documents to complete your
          registration
        </p>
        {isPolling && (
          <div className="flex items-center justify-center gap-2 mt-4 text-[#10B981]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Waiting for signature completion...</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-4">
        {signUrl && (
          <iframe
            src={signUrl}
            className="w-full h-full border border-gray-300 rounded-lg"
            title="Document Signing"
            frameBorder="0"
          />
        )}
      </div>
    </div>
  );

  // Step 4: Success
  const renderStep4 = () => (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 lg:w-10 lg:h-10 text-[#10B981]" />
        </div>
        <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4">
          Welcome to Seats Brokers!
        </h2>
        <p className="text-gray-600 mb-6 text-sm lg:text-base">
          Your seller account has been successfully created and documents have
          been signed. You can now start selling tickets on our platform.
        </p>
        <div className="space-y-4">
          <button className="w-full bg-[#10B981] text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
            Start Selling
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  // Get the actual progress percentage
  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex">
      {/* Left Sidebar - Hidden on mobile for step 3 */}
      <div
        className={`${
          currentStep === 3
            ? "hidden lg:flex lg:w-1/4"
            : "hidden lg:flex lg:w-2/5"
        } flex-col justify-between p-6 lg:p-8 text-gray-800 bg-gradient-to-br from-gray-50 via-white to-emerald-50 border-r border-gray-200 relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#10B981] rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-10 w-24 h-24 bg-emerald-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#10B981] rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#10B981] via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg lg:text-xl">
                SB
              </span>
            </div>
            <div>
              <span className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                SEATS BROKERS
              </span>
              <p className="text-xs lg:text-sm text-emerald-600 font-medium">
                Powering Global Ticket Sales
              </p>
            </div>
          </div>

          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800 leading-tight">
              Join the world's most trusted ticket selling platform for
              professionals.
            </h1>
          </div>

          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#10B981] to-emerald-400 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <LogIn className="w-5 h-5 text-[#10B981]" />
              <h3 className="font-semibold text-gray-800">
                Already have an account?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sign in to access your seller dashboard and manage your listings.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#10B981] to-emerald-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Dashboard
            </button>
          </div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-[#10B981] text-sm font-medium">
              Global reach. Trusted sales.
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div
        className={`${
          currentStep === 3 ? "flex-1" : "flex-1"
        } bg-white flex flex-col`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          {/* Top Sign In Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-gray-600">
                  Already have an account?
                </span>
              </div>
              <button
                onClick={handleLogin}
                className="text-sm font-medium text-[#10B981] hover:text-emerald-700 transition-colors"
              >
                Sign In →
              </button>
            </div>
          </div>

          {/* Main Header */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">SB</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-sm">
                    SEATS BROKERS
                  </span>
                  <p className="text-xs text-emerald-600">
                    Global Ticket Sales
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#10B981] to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:overflow-hidden">
          {renderCurrentStep()}
        </div>

        {/* Bottom Navigation - Sticky on Mobile */}
        <div className="p-4 lg:p-6 border-t bg-white lg:relative sticky bottom-0 z-40 shadow-lg lg:shadow-none">
          <div className="flex justify-between max-w-2xl mx-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || currentStep === 4}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1 || currentStep === 4
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {currentStep === 1 && (
              <button
                onClick={handleNext}
                disabled={!userType}
                className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
                  !userType
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-600 shadow-md hover:shadow-lg"
                }`}
              >
                <span>Next</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="submit"
                form="signup-form"
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-600 shadow-md hover:shadow-lg"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  // Find the form and submit it
                  const form = document.querySelector("form");
                  if (form) {
                    form.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    );
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;
