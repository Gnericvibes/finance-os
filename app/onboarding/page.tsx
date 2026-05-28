import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <OnboardingForm />
      </div>
    </main>
  );
}