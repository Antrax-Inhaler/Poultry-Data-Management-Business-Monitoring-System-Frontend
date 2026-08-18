import { useEffect, useState } from 'react'
import client from '../api/client'
import logo from '../assets/logo.jpg'
import ownerBeedz from '../assets/owner-beedz.jpg'
import ownerJovenal from '../assets/owner-jovenal.jpg'

interface BusinessProfile {
  name: string
  address: string
  phone: string
  email: string
  tagline: string
}

const CUSTOMER_SEGMENTS = [
  { title: 'School Canteens', desc: 'Regular supply for institutional kitchens.' },
  { title: 'Meat Shops & Resellers', desc: 'Wholesale live and dressed chicken.' },
  { title: 'Restaurants & Carinderias', desc: 'Fresh stock for daily service.' },
  { title: 'Households', desc: 'Live or dressed, by the kilo.' },
  { title: 'Events', desc: 'Weddings, baptisms, fiestas — bulk orders on request.' },
]

const NAV_LINKS = [
  { href: '#products', label: 'Products' },
  { href: '#customers', label: 'Who We Serve' },
  { href: '#team', label: 'Our Team' },
  { href: '#contact', label: 'Contact' },
]

const TEAM = [
  {
    name: 'Beedz Reynido Lagahit',
    role: 'Co-Owner',
    verified: true,
    photo: ownerBeedz,
    facebook: 'https://web.facebook.com/beedz.lagahit',
    phones: ['0935 773 1224'],
  },
  {
    name: 'Jovenal Lagahit',
    role: 'Co-Owner',
    verified: false,
    photo: ownerJovenal,
    facebook: 'https://web.facebook.com/jovenal.lagahit.1',
    phones: ['0935 003 6321'],
  },
]

export default function Home() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    client.get('/public/business-profile').then((res) => setProfile(res.data)).catch(() => {})
  }, [])

  const businessName = profile?.name || 'Lagahit Poultry Farm'

  return (
    <div className="bg-white text-black">
      {/* Header */}
      <header className="border-b border-black sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 min-w-0">
            <img src={logo} alt={`${businessName} logo`} className="h-10 w-10 rounded-full object-cover shrink-0" />
            <span className="text-base sm:text-lg font-bold tracking-tight truncate">{businessName}</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative py-1 text-gray-700 hover:text-black transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-black after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex flex-col justify-center items-center gap-1.5 w-9 h-9"
          >
            <span className={`block h-0.5 w-6 bg-black transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-black transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-black transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile nav panel */}
        {menuOpen && (
          <nav className="md:hidden border-t border-black px-4 sm:px-6 py-3 flex flex-col gap-1 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 border-b border-gray-100 last:border-0 text-gray-700 hover:text-black"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative">
        <div
          className="h-[70vh] min-h-[420px] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('https://images.pexels.com/photos/35877061/pexels-photo-35877061.jpeg?cs=srgb&fm=jpg')",
            filter: 'grayscale(100%)',
          }}
        >
          <div className="max-w-6xl mx-auto h-full px-6 flex flex-col justify-end pb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
              {profile?.tagline || 'Broiler chicken, raised and delivered from our farm to yours.'}
            </h1>
            <p className="text-white/80 mt-4 max-w-xl text-lg">
              Live and dressed chicken for households, resellers, and institutions — every batch traceable back to the farm.
            </p>
            <div className="mt-8">
              <a href="#contact" className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors">
                Inquire About an Order
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">What We Raise</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We raise broiler chickens on our own farm and sell them live by the kilo, or dressed on request.
              Every batch is recorded from the day the chicks arrive to the day they're delivered — mortality,
              feed, weight, and health checks included.
            </p>
            <ul className="space-y-2 text-gray-800">
              <li className="border-t border-gray-300 py-3 flex justify-between">
                <span className="font-medium">Live Chicken</span>
                <span className="text-gray-500">Sold by live weight</span>
              </li>
              <li className="border-t border-gray-300 py-3 flex justify-between">
                <span className="font-medium">Dressed Chicken</span>
                <span className="text-gray-500">Prepared on request</span>
              </li>
              <li className="border-t border-b border-gray-300 py-3 flex justify-between">
                <span className="font-medium">Bulk / Event Orders</span>
                <span className="text-gray-500">Contact us ahead of time</span>
              </li>
            </ul>
          </div>
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/17064389/pexels-photo-17064389.jpeg?cs=srgb&fm=jpg"
              alt="Broiler chickens feeding on the farm"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section id="customers" className="bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">Who We Serve</h2>
          <p className="text-white/60 mb-10">From single-household orders to standing supply arrangements.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/20">
            {CUSTOMER_SEGMENTS.map((s) => (
              <div key={s.title} className="bg-black p-6">
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-white/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo break + traceability */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] overflow-hidden order-2 md:order-1">
            <img
              src="https://images.pexels.com/photos/7790123/pexels-photo-7790123.jpeg?cs=srgb&fm=jpg"
              alt="Chickens in a farm coop"
              className="w-full h-full object-cover grayscale"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4">Records, Not Guesswork</h2>
            <p className="text-gray-700 leading-relaxed">
              We track every batch from day one — mortality, feed consumption, and weight samples are logged
              as they happen, not estimated after the fact. If you need documentation for a bulk order or a
              standing supply arrangement, we can show you exactly where your order came from.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="border-t border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-2">Our Team</h2>
          <p className="text-gray-600 mb-10">The people behind {businessName}.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
            {TEAM.map((person) => (
              <div key={person.name} className="flex items-start gap-4">
                <img
                  src={person.photo}
                  alt={person.name}
                  className="h-20 w-20 rounded-full object-cover shrink-0 border border-black"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-lg">{person.name}</h3>
                    {person.verified && (
                      <span
                        title="Verified by Meta"
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] shrink-0"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{person.role}</p>
                  {person.phones.length > 0 && (
                    <div className="text-sm text-gray-700 space-y-0.5 mb-2">
                      {person.phones.map((p) => (
                        <a key={p} href={`tel:${p.replace(/\s+/g, '')}`} className="block hover:underline">
                          {p}
                        </a>
                      ))}
                    </div>
                  )}
                  <a
                    href={person.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    Facebook →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-800">
            {profile?.phone && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone</div>
                <a href={`tel:${profile.phone}`} className="text-lg hover:underline">{profile.phone}</a>
              </div>
            )}
            {profile?.email && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</div>
                <a href={`mailto:${profile.email}`} className="text-lg hover:underline">{profile.email}</a>
              </div>
            )}
            {profile?.address && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Farm Address</div>
                <div className="text-lg">{profile.address}</div>
              </div>
            )}
            {TEAM.map((person) =>
              person.phones.map((p) => (
                <div key={p}>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{person.name}</div>
                  <a href={`tel:${p.replace(/\s+/g, '')}`} className="text-lg hover:underline">{p}</a>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-black">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} LAGAHIT INTEGRATED AGRI ENTERPRISE</span>
        </div>
      </footer>
    </div>
  )
}
