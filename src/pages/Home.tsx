import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

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

export default function Home() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)

  useEffect(() => {
    client.get('/public/business-profile').then((res) => setProfile(res.data)).catch(() => {})
  }, [])

  const businessName = profile?.name || 'Poultry Farm'

  return (
    <div className="bg-white text-black">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <span className="text-lg font-bold tracking-tight">{businessName}</span>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#products" className="hover:underline">Products</a>
            <a href="#customers" className="hover:underline">Who We Serve</a>
            <a href="#contact" className="hover:underline">Contact</a>
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 border border-black rounded-none hover:bg-black hover:text-white transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 border border-black rounded-none hover:bg-black hover:text-white transition-colors">
                Staff Login
              </Link>
            )}
          </nav>
        </div>
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
            {!profile?.phone && !profile?.email && !profile?.address && (
              <p className="text-gray-500">Contact details will appear here once added in the farm's configuration.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-black">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-between items-center text-sm text-gray-500">
          <span>© {new Date().getFullYear()} {businessName}</span>
          <Link to="/login" className="hover:underline">Staff Login</Link>
        </div>
      </footer>
    </div>
  )
}
