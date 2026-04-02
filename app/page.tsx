export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="text-2xl font-bold" style={{color: '#0F6E56'}}>The Co-Host</div>
        <div className="flex gap-4">
          <a href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Log in</a>
          <a href="/signup" className="text-white px-4 py-2 rounded-lg text-sm font-medium" style={{backgroundColor: '#0F6E56'}}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block bg-teal-50 text-sm font-medium px-4 py-2 rounded-full mb-8" style={{color: '#0F6E56'}}>
          Built for Dubai landlords
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Hire a co-host.<br />Not a management company.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Connect with verified hospitality freelancers who handle your holiday home operations — for fixed fees, not 20% of your revenue.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/signup?type=landlord" className="text-white px-8 py-4 rounded-xl text-base font-semibold" style={{backgroundColor: '#0F6E56'}}>
            I&apos;m a landlord
          </a>
          <a href="/signup?type=cohost" className="border-2 px-8 py-4 rounded-xl text-base font-semibold text-gray-700" style={{borderColor: '#0F6E56'}}>
            I&apos;m a co-host
          </a>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-8">Why landlords choose The Co-Host</p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2" style={{color: '#0F6E56'}}>100%</div>
              <div className="text-gray-500 text-sm">Revenue stays with you — paid directly by guests</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{color: '#0F6E56'}}>Fixed</div>
              <div className="text-gray-500 text-sm">Fees per service — not a percentage of your income</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{color: '#0F6E56'}}>Verified</div>
              <div className="text-gray-500 text-sm">All co-hosts verified via UAE Pass</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Services on the platform</h2>
        <p className="text-gray-500 text-center mb-12">Hire co-hosts for exactly what you need. Pay only for what you use.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {name: 'Check-in Management', desc: 'Meet guests, hand over keys, walkthrough'},
            {name: 'Check-out Management', desc: 'Inspect property, collect keys, report issues'},
            {name: 'Cleaning Coordination', desc: 'Arrange and supervise cleaning between stays'},
            {name: 'Guest Communication', desc: 'Handle messages and queries during stays'},
            {name: 'Listing Management', desc: 'Update Airbnb and Booking.com listings'},
            {name: 'Maintenance Logging', desc: 'Log issues, coordinate with maintenance teams'},
            {name: 'DTCM Reporting', desc: 'Handle regulatory reporting requirements'},
            {name: 'Portal Access Management', desc: 'Manage OTA platform dashboards'},
          ].map((s) => (
            <div key={s.name} className="border border-gray-100 rounded-xl p-5 hover:border-teal-200 transition-colors">
              <div className="font-semibold text-gray-900 mb-1">{s.name}</div>
              <div className="text-sm text-gray-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-white py-20" style={{backgroundColor: '#0F6E56'}}>
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take back control?</h2>
          <p className="text-teal-100 mb-8">Join landlords who&apos;ve stopped giving away their revenue to management companies.</p>
          <a href="/signup" className="bg-white px-8 py-4 rounded-xl text-base font-semibold inline-block" style={{color: '#0F6E56'}}>
            Get started free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        © 2026 The Co-Host · Dubai, UAE
      </footer>
    </main>
  )
}
