/**
 * Signup — account registration page (View).
 * Form state and submission live in useSignupViewModel; the marketing story
 * panel and the form are their own components. Presentation only.
 */
import { PlatformStory } from "../components/signup/PlatformStory";
import { SignupForm } from "../components/signup/SignupForm";
import { useSignupViewModel } from "../viewmodels/useSignupViewModel";

export function Signup() {
  const { error, formData, freeFee, handleSubmit, passwordError, setFormData } = useSignupViewModel();

  return (
    <div className="min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* ── Right: Platform story ───────────────────────────────────────── */}
        <PlatformStory freeFee={freeFee} />

        {/* ── Left: Sign Up Form ──────────────────────────────────────────── */}
        <SignupForm
          error={error}
          formData={formData}
          handleSubmit={handleSubmit}
          passwordError={passwordError}
          setFormData={setFormData}
        />

      </div>
    </div>
  );
}
