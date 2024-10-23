import CredentialsRegister from "@/components/credentials-register";
import CredentialsSignIn from "@/components/credentials-sign-in";
import GoogleSignIn from "@/components/google-sign-in";

const Auth: React.FC = async () => {
  return (
    <main className="min-h-screen py-12 flex items-center justify-center">
      <div className="flex flex-col gap-12 w-96">
        <GoogleSignIn />

        <CredentialsSignIn />

        <CredentialsRegister />
      </div>
    </main>
  );
};

export default Auth;
