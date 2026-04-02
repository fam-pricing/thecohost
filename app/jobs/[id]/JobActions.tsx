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
  otherPartyId: string
}

export default function JobActions({ jobId, status, userType, landlordId, cohostId, cohostPayout, otherPartyId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function updateStatus(newStatus: string, extra?: Record<string, any>) {
    setLoading(newStatus)
    setError("")

    const { error } = await supabase.from("jobs").update({
      status: newStatus,
      ...(newStatus === "completed" ? { completed_at: new Date().toISOString() } : {}),
      ...(newStatus === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
      ...extra,
    }).eq("id", jobId)

    if (error) {
      setError(error.message)
      setLoading(null)
      return
    }

    // On completion: release escrow to cohost (record transaction)
    if (newStatus === "completed" && cohostId) {
      // Get cohost current stripe account or just record the release
      await supabase.from("credit_transactions").insert({
        landlord_id: landlordId,
        job_id: jobId,
        transaction_type: "release",
        amount: -cohostPayout,
        balance_after: 0, // will be calculated properly with Stripe
        description: "Payment released to co-host on job completion",
      })
    }

    // On cancel: refund escrow to landlord
    if (newStatus === "cancelled") {
      const { data: lp } = await supabase.from("landlord_profiles").select("credit_balance").eq("id", landlordId).single()
      if (lp) {
        const refundAmount = cohostPayout + Math.round(cohostPayout * 0.111) // payout + platform fee
        await supabase.from("landlord_profiles").update({ credit_balance: (lp.credit_balance ?? 0) + refundAmount }).eq("id", landlordId)
        await supabase.from("credit_transactions").insert({
          landlord_id: landlordId,
          job_id: jobId,
          transaction_type: "refund",
          amount: refundAmount,
          balance_after: (lp.credit_balance ?? 0) + refundAmount,
          description: "Refund: job cancelled",
        })
      }
    }

    router.refresh()
    setLoading(null)
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
  }

  // Co-host actions
  if (userType === "cohost") {
    if (status === "pending") {
      return (
        <div className="flex gap-3">
          <button onClick={() => updateStatus("accepted")} disabled={loading === "accepted"}
            className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#0F6E56" }}>
            {loading === "accepted" ? "Accepting..." : "✓ Accept Job"}
          </button>
          <button onClick={() => updateStatus("cancelled", { cancellation_reason: "Declined by co-host" })}
            disabled={loading === "cancelled"}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold disabled:opacity-60">
            {loading === "cancelled" ? "..." : "✕ Decline"}
          </button>
        </div>
      )
    }
    if (status === "accepted") {
      return (
        <button onClick={() => updateStatus("in_progress")} disabled={loading === "in_progress"}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}>
          {loading === "in_progress" ? "Updating..." : "▶ Mark as In Progress"}
        </button>
      )
    }
    if (status === "in_progress") {
      return (
        <button onClick={() => updateStatus("completed")} disabled={loading === "completed"}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#0F6E56" }}>
          {loading === "completed" ? "Completing..." : "✓ Mark as Completed"}
        </button>
      )
    }
  }

  // Landlord actions
  if (userType === "landlord") {
    if (status === "pending") {
      return (
        <button onClick={() => updateStatus("cancelled", { cancellation_reason: "Cancelled by landlord" })}
          disabled={loading === "cancelled"}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold disabled:opacity-60">
          {loading === "cancelled" ? "Cancelling..." : "Cancel Job Offer"}
        </button>
      )
    }
    if (status === "completed") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-semibold text-green-800">Job Completed</div>
          <div className="text-sm text-green-600 mt-1">Payment has been released to the co-host.</div>
          <a href={`/reviews/new?job=${jobId}&reviewee=${otherPartyId}`}
            className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#0F6E56" }}>
            Leave a Review
          </a>
        </div>
      )
    }
  }

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
