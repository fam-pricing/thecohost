import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"

export default async function CoHostProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params

  const { data: cohost } = await supabase
    .from("cohost_profiles")
    .select(`
      id, bio, languages, areas_covered, years_experience, rating, total_reviews, total_jobs_completed, is_available,
      profiles!inner(full_name, avatar_url, email),
      cohost_services(
        id, price, description, is_active,
        service_categories(id, name, icon, slug, description, min_price, max_price, requires_property)
      )
    `)
    .eq("id", id)
    .single()

  if (!cohost) notFound()

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at, profiles!reviewer_id(full_name)")
    .eq("reviewee_id", (cohost.profiles as any).id ?? "")
    .eq("reviewer_type", "landlord")
    .order("created_at", { ascending: false })
    .limit(5)

  const profile = cohost.profiles as any
  const activeServices = cohost.cohost_services?.filter((s: any) => s.is_active) ?? []
  const preListingServices = activeServices.filter((s: any) => !s.service_categories?.requires_property)
  const activePropertyServices = activeServices.filter((s: any) => s.service_categories?.requires_property)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/cohosts" className="text-sm text-gray-500 hover:text-gray-700">← All Co-Hosts</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Profile */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-3xl mx-auto mb-3">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-20 h-20 rounded-full object-cover" alt="" />
                  ) : ("🤝")}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{profile?.full_name}</h1>
                {cohost.rating > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-semibold">{Number(cohost.rating).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({cohost.total_reviews} reviews)</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="font-medium text-gray-900">{cohost.years_experience} yr{cohost.years_experience !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jobs done</span>
                  <span className="font-medium text-gray-900">{cohost.total_jobs_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium ${cohost.is_available ? "text-green-600" : "text-gray-400"}`}>
                    {cohost.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {cohost.languages && cohost.languages.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {cohost.languages.map((lang: string) => (
                      <span key={lang} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {cohost.areas_covered && cohost.areas_covered.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2">Areas covered</div>
                  <div className="flex flex-wrap gap-1">
                    {cohost.areas_covered.map((area: string) => (
                      <span key={area} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{area}</span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/jobs/new?cohost=${id}`}
                className="mt-6 w-full block text-center py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: "#0F6E56" }}
              >
                Hire This Co-Host
              </Link>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-6">
            {cohost.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{cohost.bio}</p>
              </div>
            )}

            {preListingServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Pre-Listing Services</h2>
                <div className="space-y-3">
                  {preListingServices.map((s: any) => (
                    <ServiceRow key={s.id} service={s} cohostId={id} />
                  ))}
                </div>
              </div>
            )}

            {activePropertyServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Active Property Services</h2>
                <div className="space-y-3">
                  {activePropertyServices.map((s: any) => (
                    <ServiceRow key={s.id} service={s} cohostId={id} />
                  ))}
                </div>
              </div>
            )}

            {reviews && reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((r: any, i) => (
                    <div key={i} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                        <span className="text-sm font-medium text-gray-900">{(r.profiles as any)?.full_name}</span>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceRow({ service, cohostId }: { service: any; cohostId: string }) {
  const cat = service.service_categories
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{cat?.icon}</span>
        <div>
          <div className="font-medium text-gray-900 text-sm">{cat?.name}</div>
          {service.description && <div className="text-xs text-gray-400">{service.description}</div>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900">AED {service.price.toLocaleString()}</span>
        <Link
          href={`/jobs/new?cohost=${cohostId}&service=${cat?.id}`}
          className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
          style={{ backgroundColor: "#0F6E56" }}
        >
          Hire
        </Link>
      </div>
    </div>
  )
}
