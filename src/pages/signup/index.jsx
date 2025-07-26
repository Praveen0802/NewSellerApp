import SignupFlow from "@/components/SignupPage";

const SignUp = ({ refer_code } = {}) => {
  return (
    <>
      <SignupFlow refer_code={refer_code} />
    </>
  );
};

export default SignUp;

export async function getServerSideProps(context) {
  const { refer_code = "" } = context.query;

  return {
    props: {
      refer_code: refer_code || null,
    },
  };
}
