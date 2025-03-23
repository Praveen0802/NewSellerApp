import LoginPage from "@/components/loginPage";
import { checkValidAuthToken, nextRedirect } from "@/utils/helperFunctions";
import React from "react";

const Login = () => {
  return <LoginPage />;
};

export default Login;

export const getServerSideProps = async (context) => {
  const validToken = checkValidAuthToken(context);
  if (validToken) {
    return nextRedirect("dashboard");
  }

  return {
    props: {},
  };
};
