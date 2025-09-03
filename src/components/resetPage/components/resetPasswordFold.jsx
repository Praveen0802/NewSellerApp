import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import logo from "../../../../public/logo.png";
import Button from "@/components/commonComponents/button";
import FloatingLabelInput from "@/components/floatinginputFields";
import { resetPassword } from "@/utils/apiHandler/request";

const ResetPasswordFold = ({ token }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loader, setLoader] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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
    const newErrors = { newPassword: "", confirmPassword: "" };

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      valid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoader(true);

      try {
        const body = {
          password: formData.newPassword,
          confirm_password: formData.confirmPassword,
          token: token,
        };
        const response = await resetPassword("", body);
        setResetSuccess(true);
        setLoader(false);
      } catch (error) {
        console.error("Error resetting password:", error);
        setErrors({
          newPassword: "Failed to reset password. Please try again.",
          confirmPassword: "",
        });
        setLoader(false);
      }
    }
  };

  const backToLogin = () => {
    router.push("/login");
  };

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
          Reset Password
        </p>
        <p className="text-[#7D82A4] text-sm font-normal">
          Create a new password that is at least 8 characters long
        </p>
      </div>

      {resetSuccess ? (
        <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-700 font-medium">
              Password Reset Successful!
            </p>
            <p className="text-green-600 text-sm mt-1">
              You can now log in with your new password.
            </p>
          </div>
          <Button
            label="Back to Login"
            type="secondary"
            classNames={{
              root: "justify-center items-center",
              label_: "text-base text-center w-full font-medium",
            }}
            onClick={backToLogin}
          />
        </div>
      ) : (
        <>
        <form
          className="flex flex-col gap-6 w-full max-w-xs mx-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4">
            <div>
              <FloatingLabelInput
                id="newPassword"
                name="newPassword"
                keyValue="newPassword"
                type="password"
                label="New Password"
                value={formData?.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                required
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <FloatingLabelInput
                id="confirmPassword"
                name="confirmPassword"
                keyValue="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData?.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              label="Reset Password"
              type="primary"
              classNames={{
                root: "justify-center items-center",
                label_: "text-base text-center w-full font-medium",
              }}
              submitButton={true}
              loading={loader}
            />
          </div>
        </form>
        <span className="text-sm text-[#343432] underline cursor-pointer" onClick={backToLogin}>Go Back to Login</span>
        </>
      )}
    </div>
  );
};

export default ResetPasswordFold;
