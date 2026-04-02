export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="text-xl font-bold text-[#0F6E56]">The Co-Host</div>
        <div className="flex gap-4">
          <a href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Log in</a>
          <a href="/signup" className="bg-[#0F6E56] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d5f49]">Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-block bg-[#0F6E56]/10 text-[#0F6E56] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          Built for Dubai landlords
        </div>
        <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
          Hire a co-host.<br />
          <span className="text-[#0F6E56]">Not a management company.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Connect with verified hospitality freelancers who handle your holiday home operations — for fixed fees, not a cut of your revenue.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/signup?type=landlord" className="bg-[#0F6E56] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#0d5f49] transition">
            I am a Landlord
          </a>
          <a href="/signup?type=cohost" className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-400 transition">
            I am a Co-Host
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">The old model is broken.</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-16">Management companies take 20% of your revenue. The work is done by freelancers anyway. The Co-Host cuts out the middleman.</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="text-3xl mb-4">💸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Keep 100% of your revenue</h3>
              <p className="text-gray-500 text-sm">Guests pay you directly. No management company taking a cut of every booking.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="text-3xl mb-4">🔑</div>
              <h3 className="font-semibold text-gray-900 mb-2">Keep access to your property</h3>
              <p className="text-gray-500 text-sm">Your property stays yours. No handing over keys and losing control.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pay fixed fees per service</h3>
              <p className="text-gray-500 text-sm">Know exactly what you pay. Hire co-hosts for check-ins, cleaning, guest comms — nothing more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Everything your property needs.</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-16">Co-hosts offer à la carte services. You pick what you need, when you need it.</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: '🚪', label: 'Check-in Management' },
              { icon: '🧹', label: 'Cleaning Coordination' },
              { icon: '💬', label: 'Guest Communication' },
              { icon: '📋', label: 'Listing Management' },
              { icon: '🔧', label: 'Maintenance Logging' },
              { icon: '📊', label: 'DTCM Reporting' },
              { icon: '🏠', label: 'Check-out Management' },
              { icon: '💻', label: 'Portal Access Management' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-sm font-medium text-gray-700">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0F6E56] py-20">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to take back control?</h2>
          <p className="text-white/70 mb-8">Join landlords and co-hosts already on the waitlist.</p>
          <a href="/signup" className="bg-white text-[#0F6E56] px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition inline-block">
            Join the waitlist
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        © 2026 The Co-Host. Dubai, UAE.
      </footer>
    </main>
  )
}
