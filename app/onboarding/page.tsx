import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <main className="h-full w-full overflow-hidden">
        <OnboardingFlow />
      </main>
    </AuthGuard>
  );
}
