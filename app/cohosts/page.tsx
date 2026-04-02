import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function BrowseCohostsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; service?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const filterArea = params.area ?? ""
  const filterService = params.service ?? ""

  // Get all co-hosts with their profiles and active services
  let query = supabase
    .from("cohost_profiles")
    .select(`
      id, bio, languages, areas_covered, years_experience, rating, total_reviews, is_available,
      profiles!inner(full_name, avatar_url),
      cohost_services(
        id, price, is_active,
        service_categories(id, name, icon, slug)
      )
    `)
    .eq("is_available", true)

  const { data: cohosts } = await query.order("rating", { ascending: false })

  // Filter client-side after fetch
  let filtered = cohosts ?? []
  if (filterArea) {
    filtered = filtered.filter(c =>
      c.areas_covered?.some((a: string) => a.toLowerCase().includes(filterArea.toLowerCase()))
    )
  }
  if (filterService) {
    filtered = filtered.filter(c =>
      c.cohost_services?.some((s: any) =>
        s.is_active && s.service_categories?.slug === filterService
      )
    )
  }

  // Get service categories for filter
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, icon")
    .order("sort_order")

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Co-Hosts</h1>
        <p className="text-gray-500 mb-6">{filtered.length} co-host{filtered.length !== 1 ? "s" : ""} available in Dubai</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <form className="flex gap-2">
            <input
              name="area"
              defaultValue={filterArea}
              placeholder="Filter by area (e.g. Marina)"
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none text-gray-900"
            />
            <select
              name="service"
              defaultValue={filterService}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none text-gray-900"
            >
              <option value="">All services</option>
              {categories?.map(c => (
                <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: "#0F6E56" }}
            >
              Filter
            </button>
            {(filterArea || filterService) && (
              <a href="/cohosts" className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-gray-700">
                Clear
              </a>
            )}
          </form>
        </div>

        {/* Co-host cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>No co-hosts found for these filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(cohost => {
              const activeServices = cohost.cohost_services?.filter((s: any) => s.is_active) ?? []
              const profile = cohost.profiles as any
              return (
                <Link
                  key={cohost.id}
                  href={`/cohosts/${cohost.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-teal-100 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-xl flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                      ) : (
                        "🤝"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{profile?.full_name ?? "Co-Host"}</h3>
                        {cohost.rating > 0 && (
                          <span className="text-sm text-amber-500">★ {Number(cohost.rating).toFixed(1)}</span>
                        )}
                        {cohost.total_reviews > 0 && (
                          <span className="text-xs text-gray-400">({cohost.total_reviews})</span>
                        )}
                      </div>
                      {cohost.bio && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{cohost.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(cohost.areas_covered ?? []).slice(0, 3).map((area: string) => (
                          <span key={area} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">{area}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeServices.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                            {s.service_categories?.icon} {s.service_categories?.name}
                          </span>
                        ))}
                        {activeServices.length > 4 && (
                          <span className="text-xs text-gray-400">+{activeServices.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-400">{cohost.years_experience}yr exp</div>
                    </div>
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
