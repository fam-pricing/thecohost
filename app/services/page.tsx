"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface ServiceCategory {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  requires_property: boolean
  min_price: number
  max_price: number
}

interface CoHostService {
  id: string
  category_id: string
  price: number
  description: string
  is_active: boolean
}

export default function ServicesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [myServices, setMyServices] = useState<Record<string, CoHostService>>({})
  const [cohostProfileId, setCohostProfileId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: cp } = await supabase
        .from("cohost_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!cp) { router.push("/onboarding"); return }
      setCohostProfileId(cp.id)

      const [{ data: cats }, { data: services }] = await Promise.all([
        supabase.from("service_categories").select("*").order("sort_order"),
        supabase.from("cohost_services").select("*").eq("cohost_id", cp.id),
      ])

      setCategories(cats ?? [])
      const svcMap: Record<string, CoHostService> = {}
      for (const s of services ?? []) svcMap[s.category_id] = s
      setMyServices(svcMap)
      setLoading(false)
    }
    load()
  }, [])

  async function toggleService(cat: ServiceCategory) {
    if (!cohostProfileId) return
    const existing = myServices[cat.id]
    setSaving(cat.id)

    if (existing) {
      // Toggle active/inactive
      const { data } = await supabase
        .from("cohost_services")
        .update({ is_active: !existing.is_active })
        .eq("id", existing.id)
        .select()
        .single()
      if (data) setMyServices(prev => ({ ...prev, [cat.id]: data }))
    } else {
      // Create new service at mid-range price
      const defaultPrice = Math.round((cat.min_price + cat.max_price) / 2)
      const { data } = await supabase
        .from("cohost_services")
        .insert({ cohost_id: cohostProfileId, category_id: cat.id, price: defaultPrice, is_active: true })
        .select()
        .single()
      if (data) setMyServices(prev => ({ ...prev, [cat.id]: data }))
    }
    setSaving(null)
  }

  async function updatePrice(catId: string, price: number) {
    const existing = myServices[catId]
    if (!existing) return
    const { data } = await supabase
      .from("cohost_services")
      .update({ price })
      .eq("id", existing.id)
      .select()
      .single()
    if (data) setMyServices(prev => ({ ...prev, [catId]: data }))
  }

  const preListingCats = categories.filter(c => !c.requires_property)
  const activeCats = categories.filter(c => c.requires_property)

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Services</h1>
        <p className="text-gray-500 mb-8">Toggle the services you offer and set your prices. Landlords will see exactly what you offer.</p>

        <ServiceGroup
          title="Pre-Listing Services"
          subtitle="For properties not yet on Airbnb — furnishing, photography, DTCM permits"
          categories={preListingCats}
          myServices={myServices}
          saving={saving}
          onToggle={toggleService}
          onPriceChange={updatePrice}
        />

        <div className="mt-8">
          <ServiceGroup
            title="Active Property Services"
            subtitle="For properties already listed — check-in, cleaning, guest comms"
            categories={activeCats}
            myServices={myServices}
            saving={saving}
            onToggle={toggleService}
            onPriceChange={updatePrice}
          />
        </div>

        <div className="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-100">
          <p className="text-sm text-teal-800">
            ✅ Your profile is visible to landlords. {Object.values(myServices).filter(s => s.is_active).length} service{Object.values(myServices).filter(s => s.is_active).length !== 1 ? "s" : ""} active.
          </p>
        </div>
      </div>
    </div>
  )
}

function ServiceGroup({ title, subtitle, categories, myServices, saving, onToggle, onPriceChange }: {
  title: string
  subtitle: string
  categories: ServiceCategory[]
  myServices: Record<string, CoHostService>
  saving: string | null
  onToggle: (cat: ServiceCategory) => void
  onPriceChange: (catId: string, price: number) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
      <div className="space-y-3">
        {categories.map(cat => {
          const svc = myServices[cat.id]
          const isActive = svc?.is_active ?? false
          return (
            <div key={cat.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${isActive ? "border-teal-200 shadow-sm" : "border-gray-100"}`}>
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>
                <div className="text-xs text-gray-400">Range: AED {cat.min_price.toLocaleString()}–{cat.max_price.toLocaleString()}</div>
              </div>
              {isActive && svc && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-400">AED</span>
                  <input
                    type="number"
                    value={svc.price}
                    min={cat.min_price}
                    max={cat.max_price}
                    onChange={e => onPriceChange(cat.id, parseInt(e.target.value) || cat.min_price)}
                    className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-right font-medium text-gray-900 focus:outline-none focus:ring-1"
                    style={{ "--tw-ring-color": "#0F6E56" } as any}
                  />
                </div>
              )}
              <button
                onClick={() => onToggle(cat)}
                disabled={saving === cat.id}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isActive ? "" : "bg-gray-200"}`}
                style={isActive ? { backgroundColor: "#0F6E56" } : {}}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
