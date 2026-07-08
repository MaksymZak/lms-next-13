import { AuthCard } from "../../_components/auth-card";
import { SignInForm } from "../../_components/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue learning"
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkHref="/sign-up"
    >
      <SignInForm />
    </AuthCard>
  );
}
