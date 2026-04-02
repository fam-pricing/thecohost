"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Step = "welcome" | "details" | "done"

interface Props {
  userType: "landlord" | "cohost"
  userId: string
  name: string
}

export function LandlordOnboarding({ userId, name }: { userId: string; name: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>("welcome")
  const [nationality, setNationality] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Create landlord profile
    const { error } = await supabase.from("landlord_profiles").insert({
      user_id: userId,
      nationality,
      credit_balance: 0,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep("done")
    }
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You are all set!</h2>
        <p className="text-gray-500 mb-8">Your landlord account is ready. Start by browsing co-hosts or adding your first property.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-8 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "#0F6E56" }}
        >
          Go to Dashboard →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏠</div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {name}!</h2>
        <p className="text-gray-500 mt-1">Quick setup — takes 30 seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your nationality</label>
          <input
            type="text"
            value={nationality}
            onChange={e => setNationality(e.target.value)}
            placeholder="e.g. UAE, British, Indian"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
          />
        </div>

        <p className="text-xs text-gray-400">
          You can upload your title deed and property details after setup.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}
        >
          {loading ? "Saving..." : "Complete Setup →"}
        </button>
      </form>
    </div>
  )
}

export function CoHostOnboarding({ userId, name }: { userId: string; name: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>("welcome")
  const [bio, setBio] = useState("")
  const [languages, setLanguages] = useState("English")
  const [areas, setAreas] = useState("")
  const [experience, setExperience] = useState("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.from("cohost_profiles").insert({
      user_id: userId,
      bio,
      languages: languages.split(",").map(l => l.trim()).filter(Boolean),
      areas_covered: areas.split(",").map(a => a.trim()).filter(Boolean),
      years_experience: parseInt(experience) || 0,
      is_available: true,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep("done")
    }
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile created!</h2>
        <p className="text-gray-500 mb-8">Now add your services and pricing so landlords can find you.</p>
        <button
          onClick={() => router.push("/services")}
          className="px-8 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "#0F6E56" }}
        >
          Set Up My Services →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🤝</div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {name}!</h2>
        <p className="text-gray-500 mt-1">Tell landlords about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="e.g. Experienced co-host based in Dubai Marina with 3 years managing short-term rentals..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
          <input
            type="text"
            value={languages}
            onChange={e => setLanguages(e.target.value)}
            placeholder="English, Arabic, Hindi"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Areas you cover (comma separated)</label>
          <input
            type="text"
            value={areas}
            onChange={e => setAreas(e.target.value)}
            placeholder="Dubai Marina, JBR, Downtown"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
          <select
            value={experience}
            onChange={e => setExperience(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900"
          >
            <option value="0">Less than 1 year</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5">5+ years</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}
        >
          {loading ? "Saving..." : "Create Profile →"}
        </button>
      </form>
    </div>
  )
}
