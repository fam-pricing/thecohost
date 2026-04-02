import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import JobActions from "./JobActions"

export default async function JobDetailPage({
  params, searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const sp = await searchParams
  const justCreated = sp.created === "1"

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
  if (!profile) redirect("/login")

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, title, description, status, price, platform_fee, cohost_payout,
      scheduled_date, scheduled_time, landlord_notes, cohost_notes,
      created_at, completed_at, cancelled_at, cancellation_reason,
      service_categories(name, icon, description),
      properties(name, area, address, bedrooms, bathrooms),
      landlord_profiles(id, user_id, profiles!inner(full_name, email)),
      cohost_profiles(id, user_id, profiles!inner(full_name, email))
    `)
    .eq("id", id)
    .single()

  if (!job) notFound()

  const isLandlord = profile.user_type === "landlord"
  const landlordProfile = job.landlord_profiles as any
  const cohostProfile = job.cohost_profiles as any

  // Access control
  const userLandlordId = isLandlord
    ? (await supabase.from("landlord_profiles").select("id").eq("user_id", user.id).single()).data?.id
    : null
  const userCohostId = !isLandlord
    ? (await supabase.from("cohost_profiles").select("id").eq("user_id", user.id).single()).data?.id
    : null

  const canView = (isLandlord && landlordProfile?.user_id === user.id) ||
                  (!isLandlord && cohostProfile?.user_id === user.id)
  if (!canView) notFound()

  const cat = job.service_categories as any
  const property = job.properties as any

  const statusStyle: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-gray-50 text-gray-400 border-gray-200",
    disputed: "bg-red-50 text-red-600 border-red-200",
  }
  const statusLabel: Record<string, string> = {
    pending: "Awaiting co-host response",
    accepted: "Accepted — awaiting start",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Under dispute",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/jobs" className="text-sm text-gray-500 hover:text-gray-700">← All Jobs</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {justCreated && (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-semibold text-teal-800">Job offer sent!</div>
              <div className="text-sm text-teal-600">Credits have been escrowed. The co-host will be notified.</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat?.icon}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                <div className="text-sm text-gray-400">{cat?.name}</div>
              </div>
            </div>
            <span className={`text-sm px-3 py-1.5 rounded-full border font-medium ${statusStyle[job.status] ?? ""}`}>
              {statusLabel[job.status] ?? job.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-400 mb-0.5">Landlord</div>
              <div className="font-medium text-gray-900">{landlordProfile?.profiles?.full_name}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-0.5">Co-Host</div>
              <div className="font-medium text-gray-900">{cohostProfile?.profiles?.full_name ?? "TBD"}</div>
            </div>
            {job.scheduled_date && (
              <div>
                <div className="text-gray-400 mb-0.5">Scheduled</div>
                <div className="font-medium text-gray-900">
                  {new Date(job.scheduled_date).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "long" })}
                  {job.scheduled_time && ` at ${job.scheduled_time.slice(0, 5)}`}
                </div>
              </div>
            )}
            {property && (
              <div>
                <div className="text-gray-400 mb-0.5">Property</div>
                <div className="font-medium text-gray-900">{property.name} — {property.area}</div>
              </div>
            )}
          </div>

          {job.description && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-4">
              {job.description}
            </div>
          )}

          <div className="border-t border-gray-50 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Service price</span><span className="text-gray-900">AED {job.price.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Platform fee (10%)</span><span className="text-gray-900">AED {job.platform_fee.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold"><span className="text-gray-700">Co-host payout</span><span className="text-gray-900">AED {job.cohost_payout.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Actions component */}
        <JobActions
          jobId={job.id}
          status={job.status}
          userType={profile.user_type as "landlord" | "cohost"}
          landlordId={userLandlordId ?? ""}
          cohostId={userCohostId ?? ""}
          cohostPayout={job.cohost_payout}
          otherPartyId={isLandlord ? (cohostProfile?.id ?? "") : (landlordProfile?.id ?? "")}
        />
      </div>
    </div>
  )
}
