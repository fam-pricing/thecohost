import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
  if (!profile) redirect("/login")

  let jobs: any[] = []

  if (profile.user_type === "landlord") {
    const { data: lp } = await supabase.from("landlord_profiles").select("id").eq("user_id", user.id).single()
    if (lp) {
      const { data } = await supabase
        .from("jobs")
        .select(`id, title, status, price, scheduled_date, created_at,
          service_categories(name, icon),
          cohost_profiles(profiles!inner(full_name))`)
        .eq("landlord_id", lp.id)
        .order("created_at", { ascending: false })
      jobs = data ?? []
    }
  } else {
    const { data: cp } = await supabase.from("cohost_profiles").select("id").eq("user_id", user.id).single()
    if (cp) {
      const { data } = await supabase
        .from("jobs")
        .select(`id, title, status, price, cohost_payout, scheduled_date, created_at,
          service_categories(name, icon),
          landlord_profiles(profiles!inner(full_name))`)
        .eq("cohost_id", cp.id)
        .order("created_at", { ascending: false })
      jobs = data ?? []
    }
  }

  const statusStyle: Record<string, string> = {
    pending:     "bg-amber-50 text-amber-700 border-amber-200",
    accepted:    "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    completed:   "bg-green-50 text-green-700 border-green-200",
    cancelled:   "bg-gray-50 text-gray-400 border-gray-200",
    disputed:    "bg-red-50 text-red-600 border-red-200",
  }

  const statusLabel: Record<string, string> = {
    pending: "Pending", accepted: "Accepted", in_progress: "In Progress",
    completed: "Completed", cancelled: "Cancelled", disputed: "Disputed"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} total</p>
          </div>
          {profile.user_type === "landlord" && (
            <Link href="/cohosts" className="px-4 py-2 rounded-xl text-white font-medium text-sm" style={{ backgroundColor: "#0F6E56" }}>
              + Post a Job
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>{profile.user_type === "landlord" ? "No jobs yet. Browse co-hosts to get started." : "No jobs yet. Make sure your profile is visible."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => {
              const cat = job.service_categories as any
              const otherParty = profile.user_type === "landlord"
                ? (job.cohost_profiles as any)?.profiles?.full_name
                : (job.landlord_profiles as any)?.profiles?.full_name
              const amount = profile.user_type === "landlord" ? job.price : job.cohost_payout
              return (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm hover:border-teal-100 transition-all">
                  <span className="text-2xl">{cat?.icon ?? "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {otherParty ?? "—"} · {cat?.name}
                      {job.scheduled_date && ` · ${new Date(job.scheduled_date).toLocaleDateString("en-AE", { day: "numeric", month: "short" })}`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900 mb-1">AED {amount?.toLocaleString()}</div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyle[job.status] ?? ""}`}>
                      {statusLabel[job.status] ?? job.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
