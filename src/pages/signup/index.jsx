import SignupFlow from "@/components/SignupPage";
import { fetchCurrency } from "@/utils/apiHandler/request";

const SignUp = ({ refer_code, currencies } = {}) => {
  return (
    <>
      <SignupFlow refer_code={refer_code} currencies={currencies} />
    </>
  );
};

export default SignUp;

export async function getServerSideProps(context) {
  const { refer_code = "" } = context.query;
  const currencies = await fetchCurrency();
  return {
    props: {
      refer_code: refer_code || null,
      currencies: currencies,
    },
  };
}
