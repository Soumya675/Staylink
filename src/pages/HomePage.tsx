import React, { useState } from 'react';
import { Property, SearchFilters } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { INDIAN_CITIES } from '../data/seedData';
import { Search, ShieldCheck, CheckCircle2, ArrowRight, Building, Sparkles, Home, Users, KeyRound, MapPin } from 'lucide-react';

interface HomePageProps {
  properties: Property[];
  favourites: string[];
  comparedProperties: Property[];
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (id: string) => void;
  onSearch: (filters: SearchFilters) => void;
  onNavigate: (view: string) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  properties,
  favourites,
  comparedProperties,
  onToggleFavourite,
  onToggleCompare,
  onSelectProperty,
  onSearch,
  onNavigate,
  onOpenAuth
}) => {
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [maxRent, setMaxRent] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: city === 'All' ? undefined : city,
      locality: locality.trim() ? locality.trim() : undefined,
      propertyType: propertyType === 'All' ? undefined : propertyType,
      maxRent: maxRent ? Number(maxRent) : undefined
    });
  };

  const featuredListings = properties.slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Image with carefully calibrated contrast scrim */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg"
            alt="Modern Indian rental apartment"
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl space-y-4">
            {/* Quiet tag */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-400 bg-blue-950/70 border border-blue-800/60 px-3 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>India's Dedicated Direct-From-Owner Rental Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans text-balance">
              Find Your Perfect Home Anywhere in India.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Direct from verified owners. Zero unnecessary middlemen. Completely transparent pricing with itemized rent, deposits, and utility terms.
            </p>
          </div>

          {/* Integrated Search Console Card */}
          <div className="mt-8 bg-white/98 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 text-slate-900 max-w-4xl">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="All">All Indian Cities</option>
                    {INDIAN_CITIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>

                {/* Locality */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Locality / Landmark
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      placeholder="e.g. Koramangala, Bandra, HSR"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <MapPin className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="All">All Types</option>
                    <option value="1 RK">1 RK Room</option>
                    <option value="1 BHK">1 BHK Flat</option>
                    <option value="2 BHK">2 BHK Apartment</option>
                    <option value="3 BHK">3 BHK Luxury Flat</option>
                    <option value="PG / Co-Living">PG & Co-Living</option>
                    <option value="Independent House / Villa">Independent Villa</option>
                  </select>
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Max Monthly Rent
                  </label>
                  <select
                    value={maxRent}
                    onChange={e => setMaxRent(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Any Budget</option>
                    <option value="15000">Up to ₹15,000</option>
                    <option value="25000">Up to ₹25,000</option>
                    <option value="40000">Up to ₹40,000</option>
                    <option value="60000">Up to ₹60,000</option>
                    <option value="100000">Up to ₹1,00,000</option>
                  </select>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Quick Picks:</span>
                  <button
                    type="button"
                    onClick={() => { setCity('Bengaluru'); setLocality('Koramangala'); }}
                    className="hover:text-blue-600 underline"
                  >
                    Koramangala
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => { setCity('Mumbai'); setLocality('Bandra West'); }}
                    className="hover:text-blue-600 underline"
                  >
                    Bandra West
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => { setCity('Delhi-NCR'); setLocality('Gurgaon'); }}
                    className="hover:text-blue-600 underline"
                  >
                    Cyber City
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => { setPropertyType('PG / Co-Living'); }}
                    className="hover:text-blue-600 underline"
                  >
                    Co-Living / PG
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Verified Properties</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="border-l-2 border-blue-500 pl-3">
              <p className="text-xl font-bold font-mono tabular-nums text-white">₹0</p>
              <p className="text-xs text-slate-400">Brokerage fees paid</p>
            </div>
            <div className="border-l-2 border-emerald-500 pl-3">
              <p className="text-xl font-bold font-mono tabular-nums text-white">100%</p>
              <p className="text-xs text-slate-400">Direct homeowner listings</p>
            </div>
            <div className="border-l-2 border-purple-500 pl-3">
              <p className="text-xl font-bold font-mono tabular-nums text-white">8 Cities</p>
              <p className="text-xs text-slate-400">Major Indian employment hubs</p>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <p className="text-xl font-bold font-mono tabular-nums text-white">&lt; 2 hrs</p>
              <p className="text-xs text-slate-400">Average owner response time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Metro Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Browse Indian Rental Hubs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Direct homeowner accommodation near primary tech corridors, colleges, and metro networks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>View all cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INDIAN_CITIES.slice(0, 6).map(item => (
            <button
              key={item.name}
              onClick={() => onSearch({ city: item.name })}
              className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:shadow-xs transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                {item.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {item.popularLocalities[0]}, {item.popularLocalities[1]}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-2 font-mono tabular-nums">
                {item.count}+ Verified
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Curated Direct Listings
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Featured Verified Homes Across India
            </h2>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Explore all {properties.length} properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              isFavourite={favourites.includes(prop.id)}
              isCompared={comparedProperties.some(c => c.id === prop.id)}
              onToggleFavourite={onToggleFavourite}
              onToggleCompare={onToggleCompare}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      </section>

      {/* Why StayLink Direct vs Middleman Brokerage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-10 border border-slate-200">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Direct Owner Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why Tenants & Landlords Trust StayLink
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              In Indian metros, brokers routinely extract 1 to 2 months of non-refundable rent while pushing duplicate photos. StayLink replaces this with digital transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Middleman / Broker Card */}
            <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-2xs">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">
                Traditional Broker Route
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>15 to 30 days rent commission</strong> lost forever before moving in.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Misleading or recycled photos</strong> that do not reflect actual flat conditions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Hidden charges</strong>: sudden association entry fee, unexpected painting deductions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Middleman controls communication and delays repair coordination.</span>
                </li>
              </ul>
            </div>

            {/* StayLink Direct Card */}
            <div className="bg-white p-6 rounded-xl border border-emerald-300 shadow-sm relative overflow-hidden">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>StayLink Direct Model</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>₹0 Brokerage guaranteed</strong>: Keep 100% of your salary for deposits and furnishing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Direct homeowner conversation</strong>: Speak with the real owner before scheduling a visit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Itemized transparent terms</strong>: Maintenance, electricity tariff, and deposit upfront.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Standard state rental agreement templates aligned with Model Tenancy guidelines.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How StayLink Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Simplified Journey</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">How It Works in 3 Easy Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Explore & Filter Genuine Listings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter by your preferred metro, tech park proximity, BHK size, furnishing, and deposit budget without seeing broker spam.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Chat & Schedule In-Person Visit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send an enquiry directly to the property owner's inbox and choose a convenient morning or evening visit slot.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sign Fair Agreement & Move In</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finalize standard 11-month lease terms directly with the owner and save up to ₹50,000+ in broker commissions.
            </p>
          </div>
        </div>
      </section>

      {/* Property Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              For Property Owners & Landlords
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have an Apartment, Flat, or PG in India?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              List your property on StayLink in 4 minutes for free. Connect with verified IT professionals, students, and families without receiving calls from middleman agents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigate('owner-dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors text-center"
            >
              Post Free Listing
            </button>
            <button
              onClick={() => onNavigate('guidelines')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors text-center border border-slate-700"
            >
              Owner Guidelines
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
