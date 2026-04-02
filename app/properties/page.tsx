"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PropertiesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<any[]>([])
  const [landlordProfileId, setLandlordProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", property_type: "apartment", area: "", address: "",
    bedrooms: "1", bathrooms: "1", floor_area_sqft: "",
    airbnb_url: "", booking_url: ""
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: lp } = await supabase.from("landlord_profiles").select("id").eq("user_id", user.id).single()
      if (!lp) { router.push("/onboarding"); return }
      setLandlordProfileId(lp.id)
      const { data } = await supabase.from("properties").select("*").eq("landlord_id", lp.id).order("created_at", { ascending: false })
      setProperties(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault()
    if (!landlordProfileId) return
    setSaving(true)
    const { data, error } = await supabase.from("properties").insert({
      landlord_id: landlordProfileId,
      name: form.name,
      property_type: form.property_type,
      area: form.area,
      address: form.address,
      bedrooms: parseInt(form.bedrooms) || 1,
      bathrooms: parseInt(form.bathrooms) || 1,
      floor_area_sqft: form.floor_area_sqft ? parseInt(form.floor_area_sqft) : null,
      airbnb_url: form.airbnb_url || null,
      booking_url: form.booking_url || null,
      status: "pre_listing",
    }).select().single()
    if (data) {
      setProperties(prev => [data, ...prev])
      setShowForm(false)
      setForm({ name: "", property_type: "apartment", area: "", address: "", bedrooms: "1", bathrooms: "1", floor_area_sqft: "", airbnb_url: "", booking_url: "" })
    }
    setSaving(false)
  }

  const statusColor: Record<string, string> = {
    pre_listing: "bg-amber-50 text-amber-700",
    active: "bg-green-50 text-green-700",
    paused: "bg-gray-50 text-gray-500",
    inactive: "bg-red-50 text-red-600",
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

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
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-500 mt-1">{properties.length} propert{properties.length !== 1 ? "ies" : "y"}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-white font-medium"
            style={{ backgroundColor: "#0F6E56" }}
          >
            + Add Property
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add New Property</h2>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    placeholder="e.g. Marina Heights Studio" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.property_type} onChange={e => setForm(p => ({...p, property_type: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input value={form.area} onChange={e => setForm(p => ({...p, area: e.target.value}))}
                    placeholder="e.g. Dubai Marina" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))}
                    placeholder="Building, unit number, street" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" min="0" value={form.bedrooms} onChange={e => setForm(p => ({...p, bedrooms: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" min="0" value={form.bathrooms} onChange={e => setForm(p => ({...p, bathrooms: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor area (sqft)</label>
                  <input type="number" value={form.floor_area_sqft} onChange={e => setForm(p => ({...p, floor_area_sqft: e.target.value}))}
                    placeholder="Optional" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb URL (if listed)</label>
                  <input type="url" value={form.airbnb_url} onChange={e => setForm(p => ({...p, airbnb_url: e.target.value}))}
                    placeholder="https://airbnb.com/rooms/..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-white font-medium disabled:opacity-60"
                  style={{ backgroundColor: "#0F6E56" }}>
                  {saving ? "Saving..." : "Add Property"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {properties.length === 0 && !showForm ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🏠</div>
            <p className="mb-4">No properties yet. Add your first one!</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ backgroundColor: "#0F6E56" }}>
              Add Property
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {p.property_type} · {p.area} · {p.bedrooms}BR/{p.bathrooms}BA
                    {p.floor_area_sqft && ` · ${p.floor_area_sqft} sqft`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[p.status] ?? ""}`}>
                    {p.status.replace("_", " ")}
                  </span>
                  <a href={`/cohosts?property=${p.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                    style={{ backgroundColor: "#0F6E56" }}>
                    Hire Co-Host
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
