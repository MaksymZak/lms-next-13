import { AuthCard } from "../../_components/auth-card";
import { SignUpForm } from "../../_components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Start learning or teaching today"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/sign-in"
    >
      <SignUpForm />
    </AuthCard>
  );
}
