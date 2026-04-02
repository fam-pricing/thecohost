"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const resolvedParams = await params
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)
      setConversationId(resolvedParams.id)

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
      const { data: convo } = await supabase.from("conversations")
        .select(`id, landlord_profiles(profiles!inner(full_name)), cohost_profiles(profiles!inner(full_name))`)
        .eq("id", resolvedParams.id).single()
      if (convo) {
        const isLandlord = profile?.user_type === "landlord"
        setOtherName(isLandlord
          ? (convo.cohost_profiles as any)?.profiles?.full_name
          : (convo.landlord_profiles as any)?.profiles?.full_name)
      }

      const { data: msgs } = await supabase.from("messages")
        .select("id, content, sender_id, created_at")
        .eq("conversation_id", resolvedParams.id)
        .order("created_at", { ascending: true })
      setMessages(msgs ?? [])
      setLoading(false)

      // Mark as read
      await supabase.from("messages").update({ is_read: true })
        .eq("conversation_id", resolvedParams.id)
        .neq("sender_id", user.id)
    }
    init()
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return
    const channel = supabase.channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        payload => setMessages(prev => [...prev, payload.new])
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !userId || !conversationId) return
    setSending(true)
    const { data } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: text.trim(),
    }).select().single()
    if (data) setMessages(prev => [...prev, data])
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId)
    setText("")
    setSending(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <a href="/messages" className="text-gray-400 hover:text-gray-600">←</a>
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">💬</div>
          <span className="font-semibold text-gray-900">{otherName}</span>
        </div>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 flex flex-col">
        <div className="flex-1 space-y-3 mb-4">
          {messages.map(msg => {
            const isMine = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  isMine ? "text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-900 rounded-bl-sm"
                }`} style={isMine ? { backgroundColor: "#0F6E56" } : {}}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? "text-teal-200" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-3 sticky bottom-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-900 bg-white"
          />
          <button type="submit" disabled={sending || !text.trim()}
            className="px-5 py-3 rounded-xl text-white font-medium disabled:opacity-60"
            style={{ backgroundColor: "#0F6E56" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
