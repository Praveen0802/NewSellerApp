import Image from "next/image";
import React from "react";
import logo from "../../../public/logo.png";
import Button from "../commonComponents/button";
import { useRouter } from "next/router";

const LeftFold = ({ signUpForm, setSignUpForm, hideMobile = false }) => {
  const router = useRouter();
  const toggleForm = () => {
    if (!signUpForm) {
      router.push("/signup");
    }
    setSignUpForm(!signUpForm);
  };

  return (
    <div
      className={`${
        hideMobile ? "max-md:hidden bg-[#E0E1EA]" : "md:hidden"
      }  w-full md:w-1/2 rounded-t-xl md:rounded-tr-none md:rounded-l-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4`}
    >
      {/* <Image
        src={logo}
        width={200}
        height={170}
        alt="image-logo"
        className="max-md:hidden w-16 h-16 sm:w-20 sm:h-20 md:w-[200px] md:h-[90px]"
      /> */}
      <div className="flex flex-col gap-1 md:gap-4">
        <p className="text-lg sm:text-xl md:text-2xl text-center font-bold  text-[#343432]">
          {signUpForm ? "Already have an account?" : "Don't have an account?"}
        </p>
        <p className="text-xs sm:text-sm text-[#343432]  font-normal text-center">
          {signUpForm
            ? "Log in to access your account and manage your ticket listings or purchases."
            : "Whether you're a buyer or seller, Seats Brokers gives you access to the world's most sought-after event tickets!."}
        </p>
      </div>
      <Button
        label={signUpForm ? "Login" : "Sign Up Now"}
        classNames={{
          root: ` md:bg-[#64EAA5] md:border-none max-md:border-[#343432] rounded-md items-center justify-center py-2 sm:py-3 px-4 sm:px-6 md:px-8 w-full `,
          label_: "md:text-white text-sm sm:text-base  font-medium text-center",
        }}
        onClick={toggleForm}
      />
    </div>
  );
};

export default LeftFold;
