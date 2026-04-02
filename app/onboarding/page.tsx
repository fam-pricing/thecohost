import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LandlordOnboarding, CoHostOnboarding } from "./OnboardingForms"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  // Already onboarded
  if (profile.user_type === "landlord") {
    const { data: lp } = await supabase.from("landlord_profiles").select("id").eq("user_id", user.id).single()
    if (lp) redirect("/dashboard")
  } else {
    const { data: cp } = await supabase.from("cohost_profiles").select("id").eq("user_id", user.id).single()
    if (cp) redirect("/dashboard")
  }

  const firstName = profile.full_name?.split(" ")[0] ?? "there"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg w-full">
        {profile.user_type === "landlord" ? (
          <LandlordOnboarding userId={user.id} name={firstName} />
        ) : (
          <CoHostOnboarding userId={user.id} name={firstName} />
        )}
      </div>
    </div>
  )
}
