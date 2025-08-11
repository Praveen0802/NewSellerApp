import { loginUser, sendResetRequest } from "@/utils/apiHandler/request";
import { currentTimeEpochTimeInMilliseconds } from "@/utils/helperFunctions";
import { getCookie, setCookie } from "@/utils/helperFunctions/cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "../commonComponents/button";
import FloatingLabelInput from "../floatinginputFields";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loader, setLoader] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetRequestSent, setResetRequestSent] = useState(false);

  const router = useRouter();

  const handleChange = (e, key) => {
    const name = key;
    const { value } = e.target;
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
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!isForgotPassword && !formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoader(true);

      if (isForgotPassword) {
        // Handle forgot password request
        try {
          const response = await sendResetRequest({ email: formData?.email });
          setResetRequestSent(true);
          setLoader(false);
        } catch (error) {
          console.error("Error requesting password reset:", error);
          setErrors({
            email: "Failed to send reset request. Please try again.",
            password: "",
          });
          setLoader(false);
        }
      } else {
        // Handle normal login
        const body = {
          email: formData.email,
          password: formData.password,
        };
        try {
          const response = await loginUser(null, body);

          const {
            first_name,
            last_name,
            kyc_status = 0,
            token: authToken,
          } = response;
          if (authToken) {
            if (getCookie("auth_token")) {
              await setCookie("auth_token", "");
            }
            setCookie("auth_token", authToken);
            setCookie(
              "auth_token_validity",
              currentTimeEpochTimeInMilliseconds()
            );
            setCookie("user_token", response?.user_id);
            let redirectPath =
              kyc_status != 1 ? "/settings/kyc?handle=true" : "/dashboard";
            //TODO : add check for kyc status
            router.push(`${redirectPath}`);
          } else {
            const errorMessage =
              typeof response?.message === "string"
                ? response.message
                : "Invalid email or password";
            setErrors({
              email: errorMessage,
              password: errorMessage,
            });
          }
          setLoader(false);
        } catch (error) {
          console.error("Login error:", error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Invalid email or password";

          setErrors({
            email: errorMessage,
            password: errorMessage,
          });
          setLoader(false);
        }
      }
    } else {
      console.log("Form validation failed");
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setResetRequestSent(false);
    setErrors({ email: "", password: "" });
  };

  const backToLogin = () => {
    setIsForgotPassword(false);
    setResetRequestSent(false);
  };

  return (
    <>
      <div className="text-center flex flex-col gap-4">
        <p className="text-[#323A70] text-xl md:text-2xl font-semibold">
          {isForgotPassword ? "Forgot Password" : "Login"}
        </p>

        <p className="text-[#7D82A4] text-[13px] font-normal">
          {isForgotPassword
            ? "Enter your email address to receive a password reset link"
            : "Connecting trusted ticket sellers together with our worldwide distribution network"}
        </p>
      </div>

      {resetRequestSent ? (
        <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-700 font-medium">Reset link sent!</p>
            <p className="text-green-600 text-sm mt-1">
              Please check your email for instructions to reset your password.
            </p>
          </div>
          <Button
            label={"Back to Login"}
            type="secondary"
            classNames={{
              root: "justify-center items-center",
              label_: "text-base text-center w-full font-medium",
            }}
            onClick={backToLogin}
          />
        </div>
      ) : (
        <form
          className="flex flex-col max-md:gap-8 md:gap-8 w-full "
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <div>
              <FloatingLabelInput
                id="email"
                name="email"
                keyValue={"email"}
                type="email"
                label="Email Address"
                value={formData?.email}
                onChange={handleChange}
                error={errors.email}
                className={"!py-[10px] !px-[12px] !text-[#323A70] !text-[14px]"}
                autoComplete="off"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <FloatingLabelInput
                  id="password"
                  name="password"
                  type="password"
                  keyValue={"password"}
                  className={
                    "!py-[10px] !px-[12px] !text-[#323A70] !text-[14px]"
                  }
                  label="Password"
                  value={formData?.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <Button
              label={isForgotPassword ? "Send Reset Link" : "Login"}
              type="primary"
              classNames={{
                root: "justify-center bg-[#64EAA5] py-2 sm:py-3 px-4 sm:px-6 md:px-8 items-center",
                label_: "text-base text-center w-full font-medium",
              }}
              submitButton={true}
              loading={loader}
            />
            <p
              className="text-sm cursor-pointer hover:underline text-center text-[#130061] font-medium"
              onClick={toggleForgotPassword}
            >
              {isForgotPassword ? "Back to Login" : "Forgot Password?"}
            </p>
          </div>
        </form>
      )}
    </>
  );
};

export default LoginForm;
