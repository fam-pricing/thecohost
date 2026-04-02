import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get profile with user type
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, landlord_profiles(*), cohost_profiles(*)")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  // If no type-specific profile yet, send to onboarding
  const hasLandlordProfile = profile.user_type === "landlord" && profile.landlord_profiles?.length > 0
  const hasCoHostProfile = profile.user_type === "cohost" && profile.cohost_profiles?.length > 0

  if (!hasLandlordProfile && !hasCoHostProfile) {
    redirect("/onboarding")
  }

  const name = profile.full_name?.split(" ")[0] ?? "there"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{profile.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning, {name} 👋
        </h1>
        <p className="text-gray-500 mb-8">
          {profile.user_type === "landlord" ? "Find co-hosts and manage your properties." : "Browse available jobs and manage your services."}
        </p>

        {profile.user_type === "landlord" ? (
          <LandlordDashboard />
        ) : (
          <CoHostDashboard />
        )}
      </div>
    </div>
  )
}

function LandlordDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DashCard title="My Properties" emoji="🏠" description="Add and manage your properties" href="/properties" />
      <DashCard title="Browse Co-Hosts" emoji="🔍" description="Find and hire co-hosts for your needs" href="/cohosts" />
      <DashCard title="My Jobs" emoji="📋" description="Track your active and past jobs" href="/jobs" />
      <DashCard title="Credits" emoji="💳" description="Top up and manage your balance" href="/credits" />
      <DashCard title="Messages" emoji="💬" description="Chat with your co-hosts" href="/messages" />
      <DashCard title="Profile" emoji="👤" description="Update your landlord profile" href="/profile" />
    </div>
  )
}

function CoHostDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DashCard title="My Services" emoji="⚙️" description="Set your services and pricing" href="/services" />
      <DashCard title="Available Jobs" emoji="🔍" description="Browse jobs from landlords" href="/jobs" />
      <DashCard title="My Jobs" emoji="📋" description="Track your active and past jobs" href="/jobs/mine" />
      <DashCard title="Earnings" emoji="💰" description="View your payouts and history" href="/earnings" />
      <DashCard title="Messages" emoji="💬" description="Chat with landlords" href="/messages" />
      <DashCard title="Profile" emoji="👤" description="Update your co-host profile" href="/profile" />
    </div>
  )
}

function DashCard({ title, emoji, description, href }: { title: string; emoji: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-teal-100 transition-all group"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </a>
  )
}
