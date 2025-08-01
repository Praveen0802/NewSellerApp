import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  RefreshCw,
  User,
  Building2,
  Loader2,
  LogIn,
  Mail,
  CheckCircle,
  Shield,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/router";

import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import {
  getCookie,
  readCookie,
  setCookie,
} from "@/utils/helperFunctions/cookie";
import {
  RegisterUser,
  fetchCityBasedonCountry,
} from "@/utils/apiHandler/request";
import useCountryCodes from "@/Hooks/useCountryCodes";
import { toast } from "react-toastify";

const SignupFlow = ({ refer_code } = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [currentUrl, setCurrentUrl] = useState("/signup");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "1",
    phone_country_code: "",
    phone_number: "",
    address: "",
    city: "",
    zip_code: "",
    country: "",
    currency: "",
    business_name: "",
    is_business: "0",
    dob: "",
    refer_code: refer_code || "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signUrl, setSignUrl] = useState("");
  const [actionId, setActionId] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  // City related states
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Refs for error fields
  const errorRefs = useRef({});

  const totalSteps = 4;

  // Get country and phone code options from hook
  const { allCountryCodeOptions, countryOptions } = useCountryCodes();

  // Currency options (keeping existing)
  const currencyOptions = [
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
    { value: "JPY", label: "¥ JPY" },
  ];

  // Stepper configuration
  const stepperSteps = [
    {
      id: 1,
      title: "Choose Account",
      icon: User,
      description: "Business or Individual",
    },
    {
      id: 2,
      title: "Register",
      icon: UserPlus,
      description: "Complete your details",
    },
    {
      id: 3,
      title: "Verify Email",
      icon: Mail,
      description: "Check your inbox",
    },
    {
      id: 4,
      title: "Complete KYC",
      icon: Shield,
      description: "Verify your identity",
      tooltip: "After email verification, Login to complete KYC",
    },
  ];

  // Function to scroll to first error field
  const scrollToFirstError = (errorFields) => {
    const firstErrorField = Object.keys(errorFields)[0];
    if (firstErrorField && errorRefs.current[firstErrorField]) {
      errorRefs.current[firstErrorField].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Focus the input field for better UX
      setTimeout(() => {
        const inputElement = errorRefs.current[firstErrorField].querySelector(
          "input, select, textarea"
        );
        if (inputElement) {
          inputElement.focus();
        }
      }, 500);
    }
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

    // Validate confirm password
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!formData.phone_country_code.trim()) {
      newErrors.phone_country_code = "Phone country code is required";
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

    if (!formData.currency.trim()) {
      newErrors.currency = "Currency is required";
    }

    if (userType === "business" && !formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }

    setErrors(newErrors);

    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        scrollToFirstError(newErrors);
      }, 100);
    }

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

    // Create payload with formatted DOB and exclude confirm_password
    const { confirm_password, ...apiFormData } = formData;
    const formattedFormData = {
      ...apiFormData,
      dob: formatDOB(apiFormData.dob),
    };

    const resp = await RegisterUser("", formattedFormData);
    return resp;
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
      // Save form data to cookies before API call
      setCookie(
        "signup_form_data",
        encodeURIComponent(JSON.stringify(formData)),
        7
      );

      const result = await startRegistrationProcess(formData);
      console.log(result, "result");

      const { message, success = false } = result ?? {};
      if (Boolean(success)) {
        toast.success(
          "Registration successful! Please check your email for verification."
        );
        setCurrentStep(3); // Move to email verification step
        return;
      } else {
        console.error("Registration failed:", message);
        const errorFields = {};
        Object.keys(message).forEach((key) => {
          errorFields[key] = message[key];
        });
        setErrors((prev) => ({
          ...prev,
          ...errorFields,
        }));

        // Scroll to first error field from API response
        setTimeout(() => {
          scrollToFirstError(errorFields);
        }, 100);

        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
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
      confirm_password: "",
      user_type: "1",
      phone_country_code: "",
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base cursor-pointer ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm lg:text-base cursor-pointer ${
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

  // Step 2: Form Submission
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
          <div className="space-y-4 lg:space-y-6 max-h-[60vh]  pr-2">
            {userType === "business" && (
              <div ref={(el) => (errorRefs.current.business_name = el)}>
                <FloatingLabelInput
                  label="Business Name"
                  id="business_name"
                  keyValue="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  error={errors.business_name}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={(el) => (errorRefs.current.first_name = el)}>
                <FloatingLabelInput
                  label="First Name"
                  id="first_name"
                  keyValue="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
              <div ref={(el) => (errorRefs.current.last_name = el)}>
                <FloatingLabelInput
                  label="Last Name"
                  id="last_name"
                  keyValue="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
            </div>

            <div ref={(el) => (errorRefs.current.email = el)}>
              <FloatingLabelInput
                label="Email Address"
                type="email"
                id="email"
                keyValue="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                showError={true}
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={(el) => (errorRefs.current.password = el)}>
                <FloatingLabelInput
                  label="Password"
                  type="password"
                  id="password"
                  keyValue="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
              <div ref={(el) => (errorRefs.current.confirm_password = el)}>
                <FloatingLabelInput
                  label="Confirm Password"
                  type="password"
                  id="confirm_password"
                  keyValue="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={errors.confirm_password}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div ref={(el) => (errorRefs.current.phone_country_code = el)}>
                  <FloatingSelect
                    label="Phone Code"
                    options={allCountryCodeOptions}
                    selectedValue={formData.phone_country_code}
                    onSelect={handleChange}
                    keyValue="phone_country_code"
                    error={errors.phone_country_code}
                    required
                    searchable={true}
                    showError={true}
                    paddingClassName="px-3 py-[11px]"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div ref={(el) => (errorRefs.current.phone_number = el)}>
                  <FloatingLabelInput
                    label="Phone Number"
                    type="tel"
                    id="phone_number"
                    keyValue="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={errors.phone_number}
                    required
                    showError={true}
                    className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                  />
                </div>
              </div>
            </div>

            <div ref={(el) => (errorRefs.current.dob = el)}>
              <FloatingLabelInput
                label="Date of Birth"
                type="date"
                id="dob"
                keyValue="dob"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
                required
                showError={true}
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                defaultFocus={true} // Focus on this field by default
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
              />
            </div>

            <div ref={(el) => (errorRefs.current.address = el)}>
              <FloatingLabelInput
                label="Address"
                id="address"
                keyValue="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                required
                showError={true}
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
              />
            </div>

            <div ref={(el) => (errorRefs.current.country = el)}>
              <FloatingSelect
                label="Country"
                options={countryOptions || []}
                selectedValue={formData.country}
                onSelect={handleChange}
                keyValue="country"
                error={errors.country}
                required
                showError={true}
                searchable={true}
              />
            </div>

            <div ref={(el) => (errorRefs.current.city = el)}>
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
                showError={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={(el) => (errorRefs.current.zip_code = el)}>
                <FloatingLabelInput
                  label="Zip Code"
                  id="zip_code"
                  keyValue="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  error={errors.zip_code}
                  required
                  showError={true}
                  className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                />
              </div>
              <div>
                <div ref={(el) => (errorRefs.current.currency = el)}>
                  <FloatingSelect
                    label="Currency"
                    options={currencyOptions}
                    selectedValue={formData.currency}
                    onSelect={handleChange}
                    keyValue="currency"
                    error={errors.currency}
                    required
                    searchable={true}
                    paddingClassName="px-3 py-[11px]"
                    showError={true}
                    openUpward={true}
                  />
                </div>
              </div>
            </div>

            <div ref={(el) => (errorRefs.current.refer_code = el)}>
              <FloatingLabelInput
                label="Referral Code (Optional)"
                type="text"
                id="refer_code"
                keyValue="refer_code"
                value={formData.refer_code}
                onChange={handleChange}
                error={errors.refer_code}
                required
                showError={true}
                className="!py-[8px] sm:!py-[10px] !px-[10px] sm:!px-[12px] !text-[#374151] !text-[13px] sm:!text-[14px]"
                readOnly={refer_code ? true : false}
              />
            </div>

            {errors.general && (
              <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                {errors.general}
              </div>
            )}
          </div>

          <button type="submit" style={{ display: "none" }} />
        </form>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center h-full px-4 lg:px-0">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" />
        </div>

        <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4">
          Check Your Email
        </h2>

        <p className="text-gray-600 mb-6 text-sm lg:text-base">
          We've sent a verification email to:
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-800">{formData.email}</p>
        </div>

        <p className="text-gray-600 text-sm lg:text-base mb-8">
          Please click the verification link in your email to complete your
          registration. The link will expire in 24 hours.
        </p>

        {/* <div className="space-y-4">
          <button
            className="w-full bg-[#10B981] text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            onClick={() => {
              // Resend email logic here
              toast.info("Verification email resent!");
            }}
          >
            Resend Email
          </button>

          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div> */}
      </div>
    </div>
  );

  // Stepper Component
  const renderStepper = () => (
    <div className="space-y-4">
      {stepperSteps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const IconComponent = step.icon;

        return (
          <div
            key={step.id}
            className="flex items-center gap-3"
            title={step.tooltip}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? "bg-[#10B981] text-white"
                  : isActive
                  ? "bg-[#10B981] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <IconComponent className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-medium transition-colors ${
                  isCompleted || isActive ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm transition-colors ${
                  isCompleted || isActive ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
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
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen lg:min-h-screen min-h-[100dvh] bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex flex-col lg:flex-row">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-6 lg:p-8 text-gray-800 bg-white border-r border-gray-200">
        <div>
          {/* Header with Sign In */}
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#10B981] via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg lg:text-xl">
                  SB
                </span>
              </div>
              <div>
                <span className="text-lg lg:text-xl font-bold text-gray-800">
                  SEATS BROKERS
                </span>
                <p className="text-xs lg:text-sm text-emerald-600 font-medium">
                  Global Ticket Sales
                </p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 text-[#10B981] hover:bg-emerald-50 rounded-lg font-medium transition-colors border border-[#10B981]"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800 leading-tight">
              Join the world's most trusted ticket selling platform.
            </h1>
            <p className="text-gray-600 text-base">
              Start selling tickets with confidence and reach millions of buyers
              worldwide.
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Registration Progress
            </h3>
            {renderStepper()}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-[#10B981] text-sm font-medium">
              Secure & Trusted Platform
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white flex flex-col min-h-[100dvh] lg:min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          {/* Top Sign In Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Already have an account?
                </span>
              </div>
              <button
                onClick={handleLogin}
                className="text-sm font-medium text-[#10B981] hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Sign In
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

            {/* Mobile Stepper */}
            <div className="mb-3">
              <div className="flex items-center justify-between relative">
                {stepperSteps.map((step, index) => {
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  const IconComponent = step.icon;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center flex-1 relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-200 relative z-10 ${
                          isCompleted
                            ? "bg-[#10B981] text-white"
                            : isActive
                            ? "bg-[#10B981] text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium text-center ${
                          isCompleted || isActive
                            ? "text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                      {index < stepperSteps.length - 1 && (
                        <div
                          className={`absolute top-4 left-full w-full h-0.5 -z-10 ${
                            isCompleted ? "bg-[#10B981]" : "bg-gray-200"
                          }`}
                          style={{
                            width: `calc(100% - 16px)`,
                            marginLeft: "8px",
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 flex flex-col overflow-scroll">
          <div className="flex-1 overflow-y-auto">{renderCurrentStep()}</div>
        </div>

        {/* Bottom Navigation - Sticky Footer */}
        <div className="p-4 lg:p-6 border-t bg-white sticky bottom-0 z-40 shadow-lg lg:shadow-none">
          <div className="flex justify-between max-w-2xl mx-auto">
            <button
              onClick={handleBack}
              disabled={
                currentStep === 1 || currentStep === 3 || currentStep === 4
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1 || currentStep === 3 || currentStep === 4
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
                    : "bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-600 shadow-md hover:shadow-lg cursor-pointer"
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

            {currentStep === 3 && (
              <button
                onClick={() => {
                  toast.info(
                    "After Email Verification you can login to your account and continue with the KYC process."
                  );
                }} //setCurrentStep(4)
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-600 shadow-md hover:shadow-lg"
              >
                <span>Continue to KYC</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-2 rounded-lg font-medium transition-colors min-w-[120px] justify-center bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-600 shadow-md hover:shadow-lg"
              >
                <span>Go to Login</span>
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;
