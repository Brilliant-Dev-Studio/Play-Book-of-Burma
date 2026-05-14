import Link from "next/link";
import { AuthPasswordField } from "@/app/components/auth-password-field";
import {
  AuthFieldLabel,
  AuthGoogleButton,
  AuthOrDivider,
  AuthPageShell,
  authInputClass,
  authPrimaryButtonClass,
} from "@/app/components/auth-page-shell";

export default function SignupPage() {
  return (
    <AuthPageShell heading="Sign up">
      <form className="flex flex-col gap-5" action="#" method="post">
        <div>
          <AuthFieldLabel htmlFor="signup-username">
            Username<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="signup-username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            className={authInputClass}
            required
          />
        </div>
        <div>
          <AuthFieldLabel htmlFor="signup-email">
            Email<span className="text-coral">*</span>
          </AuthFieldLabel>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            className={authInputClass}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-3">
          <AuthPasswordField
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            label={
              <>
                Password<span className="text-coral">*</span>
              </>
            }
          />
          <AuthPasswordField
            id="signup-password-confirm"
            name="password_confirm"
            autoComplete="new-password"
            placeholder="Re-enter password"
            label={
              <>
                Confirm<span className="text-coral">*</span>
              </>
            }
          />
        </div>
        <button type="submit" className={`mt-0.5 ${authPrimaryButtonClass}`}>
          Create account
        </button>
      </form>

      <AuthOrDivider />
      <AuthGoogleButton label="Sign up with Google" />

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm">
        <Link
          href="#"
          className="font-medium text-zinc-300 underline decoration-white/25 underline-offset-4 hover:text-coral hover:decoration-coral/50"
        >
          Terms &amp; Condition
        </Link>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-zinc-200 underline decoration-white/20 underline-offset-2 hover:text-coral hover:decoration-coral/45"
        >
          Log in
        </Link>
      </p>
    </AuthPageShell>
  );
}
