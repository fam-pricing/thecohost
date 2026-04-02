"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function NewJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const preselectedCohost = searchParams.get("cohost") ?? ""
  const preselectedService = searchParams.get("service") ?? ""

  const [cohostId] = useState(preselectedCohost)
  const [cohostName, setCohostName] = useState("")
  const [services, setServices] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [landlordProfileId, setLandlordProfileId] = useState<string | null>(null)
  const [creditBalance, setCreditBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    service_category_id: preselectedService,
    property_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
  })

  const selectedService = services.find(s => s.category_id === form.service_category_id)
  const platformFee = selectedService ? Math.round(selectedService.price * 0.10) : 0
  const total = selectedService ? selectedService.price : 0
  const payout = total - platformFee

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: lp } = await supabase.from("landlord_profiles").select("id, credit_balance").eq("user_id", user.id).single()
      if (!lp) { router.push("/onboarding"); return }
      setLandlordProfileId(lp.id)
      setCreditBalance(lp.credit_balance ?? 0)

      const [{ data: cp }, { data: props }] = await Promise.all([
        supabase.from("cohost_profiles")
          .select("cohost_services(id, price, is_active, category_id, service_categories(id, name, icon, requires_property)), profiles!inner(full_name)")
          .eq("id", cohostId)
          .single(),
        supabase.from("properties").select("id, name, area, status").eq("landlord_id", lp.id),
      ])

      if (cp) {
        setCohostName((cp.profiles as any)?.full_name ?? "Co-Host")
        const active = (cp.cohost_services ?? []).filter((s: any) => s.is_active)
        setServices(active)
        if (preselectedService) {
          const svc = active.find((s: any) => s.category_id === preselectedService)
          if (svc) setForm(prev => ({ ...prev, service_category_id: svc.category_id }))
        }
      }
      setProperties(props ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!landlordProfileId || !selectedService) return
    setSubmitting(true)
    setError("")

    if (creditBalance < total) {
      setError(`Insufficient credits. You need AED ${total} but have AED ${creditBalance}. Top up first.`)
      setSubmitting(false)
      return
    }

    const needsProperty = selectedService.service_categories?.requires_property
    if (needsProperty && !form.property_id) {
      setError("Please select a property for this service.")
      setSubmitting(false)
      return
    }

    const cat = selectedService.service_categories
    const { data: job, error: jobErr } = await supabase.from("jobs").insert({
      landlord_id: landlordProfileId,
      cohost_id: cohostId,
      property_id: form.property_id || null,
      service_category_id: form.service_category_id,
      title: form.title || `${cat?.name} — ${cohostName}`,
      description: form.description,
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      price: total,
      platform_fee: platformFee,
      cohost_payout: payout,
      status: "pending",
    }).select().single()

    if (jobErr || !job) {
      setError(jobErr?.message ?? "Failed to create job.")
      setSubmitting(false)
      return
    }

    // Escrow credits
    await supabase.from("credit_transactions").insert({
      landlord_id: landlordProfileId,
      job_id: job.id,
      transaction_type: "escrow",
      amount: -total,
      balance_after: creditBalance - total,
      description: `Escrow for job: ${job.title}`,
    })
    await supabase.from("landlord_profiles").update({ credit_balance: creditBalance - total }).eq("id", landlordProfileId)

    router.push(`/jobs/${job.id}?created=1`)
  }

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-800">
        Hiring: <strong>{cohostName}</strong> · Your balance: <strong>AED {creditBalance.toLocaleString()}</strong>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select service *</label>
        <div className="space-y-2">
          {services.map(s => {
            const cat = s.service_categories
            const isSelected = form.service_category_id === s.category_id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, service_category_id: s.category_id }))}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                  isSelected ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat?.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{cat?.name}</div>
                    <div className="text-xs text-gray-400">{cat?.requires_property ? "Requires property" : "Pre-listing service"}</div>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">AED {s.price.toLocaleString()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedService?.service_categories?.requires_property && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
          <select required value={form.property_id} onChange={e => setForm(p => ({...p, property_id: e.target.value}))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900">
            <option value="">Select a property</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.area}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={form.scheduled_date} onChange={e => setForm(p => ({...p, scheduled_date: e.target.value}))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input type="time" value={form.scheduled_time} onChange={e => setForm(p => ({...p, scheduled_time: e.target.value}))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes for co-host</label>
        <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
          rows={3} placeholder="Any special instructions or details..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900 resize-none" />
      </div>

      {selectedService && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Service fee</span><span className="text-gray-900">AED {total.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Platform fee (10%)</span><span className="text-gray-900">AED {platformFee.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Co-host receives</span><span className="text-gray-900">AED {payout.toLocaleString()}</span></div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold"><span>Total (from credits)</span><span>AED {total.toLocaleString()}</span></div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button type="submit" disabled={submitting || !selectedService}
        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
        style={{ backgroundColor: "#0F6E56" }}>
        {submitting ? "Sending offer..." : "Send Job Offer"}
      </button>

      <p className="text-xs text-center text-gray-400">
        Credits are held in escrow until the job is completed. You can cancel before the co-host accepts.
      </p>
    </form>
  )
}

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/cohosts" className="text-sm text-gray-500 hover:text-gray-700">← Back</a>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
        <p className="text-gray-500 mb-8">Send a job offer to your selected co-host. Credits are escrowed until completion.</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading...</div>}>
            <NewJobForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
