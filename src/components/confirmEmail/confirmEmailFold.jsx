import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import logo from "../../../public/logo.png";
import Button from "@/components/commonComponents/button";
import { VerifyEmail, ResendVerificationRequest } from "@/utils/apiHandler/request";

const ConfirmEmailFold = ({ token, email: initialEmail = "" }) => {
  const [loader, setLoader] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [error, setError] = useState("");
  const [resendLoader, setResendLoader] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [email, setEmail] = useState(initialEmail);

  const router = useRouter();

  const handleVerify = async () => {
    setLoader(true);
    setError("");

    try {
      const body = {
        token: token,
      };
      const response = await VerifyEmail("", body);
      if (response?.error) {
        console.error("Error verifying email:", error);
        setError(response?.error);
        setVerifySuccess(false);
      } else {
        console.log("VerifyEmail response:", response);
        if (response?.success) {
          setVerifySuccess(true);
        } else {
          setVerifySuccess(false);
        }
        setVerifyMessage(response?.message);
        // Capture email from response data for resend if needed
        if (response?.data?.email) {
          setEmail(response.data.email);
        }
      }

      setLoader(false);
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerifySuccess(false);
      setError("Failed to verify email. Please try again.");
      setLoader(false);
    }
  };

  useEffect(() => {
    handleVerify();
  }, []);

  const goToLogin = () => {
    router.push("/login");
  };

  const handleResend = async () => {
    if (!email) return; // need email to resend
    setResendLoader(true);
    setResendMessage("");
    try {
      const body = { email };
      const response = await ResendVerificationRequest("", body);
      if (response?.success) {
        setResendMessage(response?.message || "Verification email resent.");
  setError("");
  // Clear old verify failure message so it doesn't show alongside success
  setVerifyMessage("");
      } else {
        setError(response?.message || "Failed to resend verification email.");
      }
    } catch (e) {
      setError("Failed to resend verification email.");
    } finally {
      setResendLoader(false);
    }
  };

  // Decide if we should show resend option (failed verification attempt)
  const isResendMode = !verifySuccess && !loader && (error || verifyMessage);
  const buttonLabel = isResendMode ? "Resend Verification Email" : "Verify Email";
  const isAnyLoading = loader || resendLoader;

  // Determine if we should show the failure block (avoid when we have a resend success message)
  const showFailureBlock = (error || (!verifySuccess && !loader && verifyMessage)) && !resendMessage;

  return (
    <div className="flex flex-col gap-6 px-6 md:px-8 justify-center items-center py-6 md:py-8 bg-white w-full rounded-xl">
      {/* <Image
        src={logo}
        width={80}
        height={80}
        alt="image-logo"
        className="w-20 h-20 md:w-28 md:h-28"
      /> */}
      <div className="text-center flex flex-col gap-2 md:gap-3">
        <p className="text-[#343432] text-xl md:text-2xl font-semibold">
          Email Verification
        </p>
      </div>

      {verifySuccess ? (
        <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-600 text-sm mt-1">
              {verifyMessage ||
                "Your email has been verified. You can now log in to your account."}
            </p>
          </div>
          <Button
            label="Go to Login"
            type="secondary"
            classNames={{
              root: "justify-center items-center",
              label_: "text-base text-center w-full font-medium",
            }}
            onClick={goToLogin}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-xs mx-auto">
          {showFailureBlock && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error || verifyMessage || "Verification failed."}</p>
            </div>
          )}
          {isResendMode && email && !resendMessage && (
            <p className="text-[11px] text-center text-gray-500 -mt-4">We can resend a new verification link to <span className="font-medium">{email}</span>.</p>
          )}
          {resendMessage && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 text-sm text-center">{resendMessage}</p>
            </div>
          )}
          <Button
            label={buttonLabel}
            type="primary"
            classNames={{
              root: "justify-center items-center",
              label_: "text-base text-center w-full font-medium",
            }}
            onClick={isResendMode ? handleResend : handleVerify}
            loading={isAnyLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ConfirmEmailFold;
