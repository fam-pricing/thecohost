"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userType, setUserType] = useState<"landlord"|"cohost">("landlord")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // Shared
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [userId, setUserId] = useState("")

  // Landlord
  const [nationality, setNationality] = useState("")
  const [landlordProfileId, setLandlordProfileId] = useState("")

  // Cohost
  const [bio, setBio] = useState("")
  const [languages, setLanguages] = useState("")
  const [areas, setAreas] = useState("")
  const [experience, setExperience] = useState("0")
  const [isAvailable, setIsAvailable] = useState(true)
  const [cohostProfileId, setCohostProfileId] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (!profile) return

      setUserType(profile.user_type)
      setFullName(profile.full_name ?? "")
      setPhone(profile.phone ?? "")

      if (profile.user_type === "landlord") {
        const { data: lp } = await supabase.from("landlord_profiles").select("*").eq("user_id", user.id).single()
        if (lp) { setNationality(lp.nationality ?? ""); setLandlordProfileId(lp.id) }
      } else {
        const { data: cp } = await supabase.from("cohost_profiles").select("*").eq("user_id", user.id).single()
        if (cp) {
          setBio(cp.bio ?? "")
          setLanguages((cp.languages ?? []).join(", "))
          setAreas((cp.areas_covered ?? []).join(", "))
          setExperience(String(cp.years_experience ?? 0))
          setIsAvailable(cp.is_available ?? true)
          setCohostProfileId(cp.id)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)

    // Update shared profile
    const { error: e1 } = await supabase.from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", userId)
    if (e1) { setError(e1.message); setSaving(false); return }

    if (userType === "landlord" && landlordProfileId) {
      const { error: e2 } = await supabase.from("landlord_profiles")
        .update({ nationality: nationality || null })
        .eq("id", landlordProfileId)
      if (e2) { setError(e2.message); setSaving(false); return }
    }

    if (userType === "cohost" && cohostProfileId) {
      const { error: e3 } = await supabase.from("cohost_profiles")
        .update({
          bio: bio || null,
          languages: languages.split(",").map(l => l.trim()).filter(Boolean),
          areas_covered: areas.split(",").map(a => a.trim()).filter(Boolean),
          years_experience: parseInt(experience) || 0,
          is_available: isAvailable,
        })
        .eq("id", cohostProfileId)
      if (e3) { setError(e3.message); setSaving(false); return }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-500 mb-8">{userType === "cohost" ? "Your public profile — visible to landlords." : "Your account details."}</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 000 0000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
            </div>
          </div>

          {userType === "landlord" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Landlord Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input value={nationality} onChange={e => setNationality(e.target.value)}
                  placeholder="e.g. UAE, British, Indian"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
              </div>
            </div>
          )}

          {userType === "cohost" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Co-Host Profile</h2>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">Available for jobs</div>
                  <div className="text-xs text-gray-400">Landlords can see and hire you</div>
                </div>
                <button type="button" onClick={() => setIsAvailable(v => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAvailable ? "" : "bg-gray-200"}`}
                  style={isAvailable ? { backgroundColor: "#0F6E56" } : {}}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAvailable ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell landlords about yourself..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                <input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English, Arabic"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas covered (comma separated)</label>
                <input value={areas} onChange={e => setAreas(e.target.value)} placeholder="Dubai Marina, JBR, Downtown"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                <select value={experience} onChange={e => setExperience(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900">
                  <option value="0">Less than 1 year</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n} year{n>1?"s":""}</option>)}
                  <option value="6">6+ years</option>
                </select>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div className="flex gap-3 items-center">
            <button type="submit" disabled={saving}
              className="px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#0F6E56" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-sm text-green-600">✓ Saved</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
