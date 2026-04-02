"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Props {
  jobId: string
  status: string
  userType: "landlord" | "cohost"
  landlordId: string
  cohostId: string
  cohostPayout: number
  servicePrice: number
  otherPartyId: string
}

export default function JobActions({
  jobId, status, userType, landlordId, cohostId, cohostPayout, servicePrice, otherPartyId
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function updateStatus(newStatus: string, extra?: Record<string, any>) {
    setLoading(newStatus)
    setError("")

    const { error: updateErr } = await supabase.from("jobs").update({
      status: newStatus,
      ...(newStatus === "completed" ? { completed_at: new Date().toISOString() } : {}),
      ...(newStatus === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
      ...extra,
    }).eq("id", jobId)

    if (updateErr) {
      setError(updateErr.message)
      setLoading(null)
      return
    }

    // On completion: record escrow release to co-host
    if (newStatus === "completed") {
      await supabase.from("credit_transactions").insert({
        landlord_id: landlordId,
        job_id: jobId,
        transaction_type: "release",
        amount: cohostPayout,
        description: "Payment released to co-host on job completion",
      })
    }

    // On cancellation: record refund (payment gateway will process actual refund)
    if (newStatus === "cancelled") {
      await supabase.from("credit_transactions").insert({
        landlord_id: landlordId,
        job_id: jobId,
        transaction_type: "refund",
        amount: servicePrice,
        description: "Refund: job cancelled",
      })
    }

    router.refresh()
    setLoading(null)
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
        {error}
      </div>
    )
  }

  // ── Co-host actions ──────────────────────────────────────────────
  if (userType === "cohost") {
    if (status === "pending") {
      return (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus("accepted")}
            disabled={loading === "accepted"}
            className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#0F6E56" }}
          >
            {loading === "accepted" ? "Accepting..." : "✓ Accept Job"}
          </button>
          <button
            onClick={() => updateStatus("cancelled", { cancellation_reason: "Declined by co-host" })}
            disabled={loading === "cancelled"}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold disabled:opacity-60"
          >
            {loading === "cancelled" ? "..." : "✕ Decline"}
          </button>
        </div>
      )
    }

    if (status === "accepted") {
      return (
        <button
          onClick={() => updateStatus("in_progress")}
          disabled={loading === "in_progress"}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}
        >
          {loading === "in_progress" ? "Updating..." : "▶ Mark as In Progress"}
        </button>
      )
    }

    if (status === "in_progress") {
      return (
        <button
          onClick={() => updateStatus("completed")}
          disabled={loading === "completed"}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}
        >
          {loading === "completed" ? "Completing..." : "✓ Mark as Completed"}
        </button>
      )
    }
  }

  // ── Landlord actions ─────────────────────────────────────────────
  if (userType === "landlord") {
    if (status === "pending") {
      return (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
            🔒 Your payment is held in escrow. Waiting for the co-host to accept.
          </div>
          <button
            onClick={() => updateStatus("cancelled", { cancellation_reason: "Cancelled by landlord" })}
            disabled={loading === "cancelled"}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold disabled:opacity-60"
          >
            {loading === "cancelled" ? "Cancelling..." : "Cancel Job Offer"}
          </button>
          <p className="text-xs text-center text-gray-400">Cancelling now will trigger a full refund.</p>
        </div>
      )
    }

    if (status === "accepted" || status === "in_progress") {
      return (
        <div className="space-y-3">
          <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm text-teal-700">
            🔒 Payment is escrowed. It will be released to the co-host when the job is marked complete.
          </div>
          <button
            onClick={() => updateStatus("cancelled", { cancellation_reason: "Cancelled by landlord after acceptance" })}
            disabled={loading === "cancelled"}
            className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium disabled:opacity-60"
          >
            {loading === "cancelled" ? "Cancelling..." : "Cancel job (refund policy applies)"}
          </button>
        </div>
      )
    }

    if (status === "completed") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-semibold text-green-800">Job Completed</div>
          <div className="text-sm text-green-600 mt-1">Payment has been released to the co-host.</div>
          <a
            href={`/reviews/new?job=${jobId}&reviewee=${otherPartyId}`}
            className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#0F6E56" }}
          >
            Leave a Review
          </a>
        </div>
      )
    }
  }

  // Terminal states
  if (status === "completed" || status === "cancelled") {
    return (
      <div className={`rounded-xl px-5 py-4 text-center text-sm font-medium ${
        status === "completed" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
      }`}>
        {status === "completed" ? "✓ Job completed" : "Job cancelled"}
      </div>
    )
  }

  return null
}
