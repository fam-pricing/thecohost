"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function ReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const jobId = searchParams.get("job") ?? ""
  const revieweeId = searchParams.get("reviewee") ?? ""

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hovered, setHovered] = useState(0)
  const [userType, setUserType] = useState<"landlord"|"cohost">("landlord")
  const [userId, setUserId] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [revieweeName, setRevieweeName] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from("profiles").select("user_type, full_name").eq("id", user.id).single()
      setUserType(profile?.user_type as "landlord"|"cohost" ?? "landlord")

      const { data: job } = await supabase.from("jobs").select("title").eq("id", jobId).single()
      setJobTitle(job?.title ?? "this job")

      const { data: reviewee } = await supabase.from("profiles").select("full_name").eq("id", revieweeId).single()
      setRevieweeName(reviewee?.full_name ?? "them")

      // Check if already reviewed
      const { data: existing } = await supabase.from("reviews")
        .select("id").eq("job_id", jobId).eq("reviewer_id", user.id).maybeSingle()
      if (existing) setDone(true)

      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const { error } = await supabase.from("reviews").insert({
      job_id: jobId,
      reviewer_id: userId,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim() || null,
      reviewer_type: userType,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setDone(true)
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">⭐</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review submitted!</h2>
        <p className="text-gray-500 mb-6">Thanks for your feedback.</p>
        <a href="/jobs" className="px-6 py-2.5 rounded-xl text-white font-medium inline-block" style={{ backgroundColor: "#0F6E56" }}>
          Back to Jobs
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <p className="text-gray-500 text-sm">How was your experience with <strong>{revieweeName}</strong> on <strong>{jobTitle}</strong>?</p>
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-4xl transition-transform hover:scale-110"
          >
            <span className={(hovered || rating) >= star ? "text-amber-400" : "text-gray-200"}>★</span>
          </button>
        ))}
      </div>
      <div className="text-center text-sm text-gray-400">
        {["" ,"Poor","Fair","Good","Great","Excellent"][rating]}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="Share details about your experience..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-900 resize-none"
        />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
        style={{ backgroundColor: "#0F6E56" }}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default function NewReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold" style={{ color: "#0F6E56" }}>The Co-Host</a>
          <a href="/jobs" className="text-sm text-gray-500 hover:text-gray-700">← Jobs</a>
        </div>
      </nav>
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Leave a Review</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading...</div>}>
            <ReviewForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
