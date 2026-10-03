import React, { useState, useMemo } from 'react';
import { Property, SearchFilters } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { INDIAN_CITIES } from '../data/seedData';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface SearchPageProps {
  properties: Property[];
  favourites: string[];
  comparedProperties: Property[];
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (property: Property) => void;
  onSelectProperty: (id: string) => void;
  initialFilters?: SearchFilters;
  onOpenCompareModal: () => void;
}

const AMENITY_OPTIONS = [
  'Power Backup',
  'Lift',
  'Air Conditioner',
  'Covered Car Parking',
  '24/7 Security Guard',
  'High-Speed Wi-Fi',
  'Modular Kitchen',
  'Food Included',
  'Terrace Garden'
];

export const SearchPage: React.FC<SearchPageProps> = ({
  properties,
  favourites,
  comparedProperties,
  onToggleFavourite,
  onToggleCompare,
  onSelectProperty,
  initialFilters = {},
  onOpenCompareModal
}) => {
  const [q, setQ] = useState(initialFilters.q || '');
  const [city, setCity] = useState(initialFilters.city || 'All');
  const [locality, setLocality] = useState(initialFilters.locality || '');
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType || 'All');
  const [furnishing, setFurnishing] = useState(initialFilters.furnishing || 'All');
  const [preferredTenant, setPreferredTenant] = useState(initialFilters.preferredTenant || 'All');
  const [availability, setAvailability] = useState(initialFilters.availability || 'All');
  const [minRent, setMinRent] = useState<string>(initialFilters.minRent ? String(initialFilters.minRent) : '');
  const [maxRent, setMaxRent] = useState<string>(initialFilters.maxRent ? String(initialFilters.maxRent) : '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters.amenities || []);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'newest'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Client filtering
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (p.status !== 'published') return false;

      if (city !== 'All' && p.city.toLowerCase() !== city.toLowerCase()) return false;
      if (locality.trim() && !p.locality.toLowerCase().includes(locality.toLowerCase())) return false;
      if (propertyType !== 'All' && p.propertyType !== propertyType) return false;
      if (furnishing !== 'All' && p.furnishing !== furnishing) return false;
      if (preferredTenant !== 'All' && p.preferredTenant !== 'All' && p.preferredTenant !== preferredTenant) return false;
      if (availability !== 'All' && p.availableFrom !== availability) return false;

      if (minRent) {
        const min = Number(minRent);
        if (!isNaN(min) && p.rentMonthly < min) return false;
      }
      if (maxRent) {
        const max = Number(maxRent);
        if (!isNaN(max) && p.rentMonthly > max) return false;
      }

      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(a =>
          p.amenities.some(am => am.toLowerCase().includes(a.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      if (q.trim()) {
        const query = q.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.locality.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.rentMonthly - b.rentMonthly;
      if (sortBy === 'price_high') return b.rentMonthly - a.rentMonthly;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.viewsCount - a.viewsCount;
    });
  }, [
    properties,
    q,
    city,
    locality,
    propertyType,
    furnishing,
    preferredTenant,
    availability,
    minRent,
    maxRent,
    selectedAmenities,
    sortBy
  ]);

  const handleResetFilters = () => {
    setQ('');
    setCity('All');
    setLocality('');
    setPropertyType('All');
    setFurnishing('All');
    setPreferredTenant('All');
    setAvailability('All');
    setMinRent('');
    setMaxRent('');
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  const activeFiltersCount = [
    city !== 'All',
    locality.trim() !== '',
    propertyType !== 'All',
    furnishing !== 'All',
    preferredTenant !== 'All',
    availability !== 'All',
    minRent !== '',
    maxRent !== '',
    selectedAmenities.length > 0,
    q.trim() !== ''
  ].filter(Boolean).length;

  const toggleAmenity = (am: string) => {
    if (selectedAmenities.includes(am)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== am));
    } else {
      setSelectedAmenities([...selectedAmenities, am]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by city, locality, tech park, or building name..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City select */}
          <div className="w-full md:w-48">
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Indian Cities</option>
              {INDIAN_CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Property Type select */}
          <div className="w-full md:w-48">
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Property Types</option>
              <option value="1 RK">1 RK Room</option>
              <option value="1 BHK">1 BHK Flat</option>
              <option value="2 BHK">2 BHK Apartment</option>
              <option value="3 BHK">3 BHK Luxury Flat</option>
              <option value="PG / Co-Living">PG & Co-Living</option>
              <option value="Independent House / Villa">Independent Villa</option>
            </select>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>

        {/* Quick Filter Pill Controls (Interactive Buttons) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold mr-1">Quick:</span>
            {['Immediate', 'Furnished', '2 BHK', 'Family', 'Bachelors'].map(tag => {
              const isActive =
                availability === tag ||
                furnishing === tag ||
                propertyType === tag ||
                preferredTenant === tag;

              return (
                <button
                  key={tag}
                  onClick={() => {
                    if (tag === 'Immediate') setAvailability(availability === 'Immediate' ? 'All' : 'Immediate');
                    if (tag === 'Furnished') setFurnishing(furnishing === 'Furnished' ? 'All' : 'Furnished');
                    if (tag === '2 BHK') setPropertyType(propertyType === '2 BHK' ? 'All' : '2 BHK');
                    if (tag === 'Family') setPreferredTenant(preferredTenant === 'Family' ? 'All' : 'Family');
                    if (tag === 'Bachelors') setPreferredTenant(preferredTenant === 'Bachelors' ? 'All' : 'Bachelors');
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs h-fit`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Refine Search</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-500 hover:text-slate-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Locality Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Locality in {city}</label>
            <input
              type="text"
              value={locality}
              onChange={e => setLocality(e.target.value)}
              placeholder="e.g. HSR, Bandra, Cyber City"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Budget Min / Max */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly Rent Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minRent}
                onChange={e => setMinRent(e.target.value)}
                placeholder="Min ₹"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="number"
                value={maxRent}
                onChange={e => setMaxRent(e.target.value)}
                placeholder="Max ₹"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Furnishing Status</label>
            <div className="space-y-1 text-xs">
              {['All', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="radio"
                    name="furnishing"
                    value={item}
                    checked={furnishing === item}
                    onChange={() => setFurnishing(item)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tenant Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tenant Preference</label>
            <div className="space-y-1 text-xs">
              {['All', 'Family', 'Bachelors', 'Female Only', 'Male Only'].map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="radio"
                    name="tenant"
                    value={item}
                    checked={preferredTenant === item}
                    onChange={() => setPreferredTenant(item)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Availability</label>
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">Any Availability</option>
              <option value="Immediate">Immediate / Ready to Move</option>
              <option value="Within 15 Days">Within 15 Days</option>
              <option value="Within 30 Days">Within 30 Days</option>
            </select>
          </div>

          {/* Key Amenities */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Key Amenities</label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs">
              {AMENITY_OPTIONS.map(am => (
                <label key={am} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(am)}
                    onChange={() => toggleAmenity(am)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{am}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Results Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {filteredProperties.length} Properties Available
                {city !== 'All' ? ` in ${city}` : ' across India'}
              </h2>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                ● 100% Direct Homeowner · Zero Brokerage Guaranteed
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              {/* Compare Button if items are queued */}
              {comparedProperties.length > 0 && (
                <button
                  onClick={onOpenCompareModal}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
                >
                  Compare ({comparedProperties.length}/3)
                </button>
              )}

              {/* View toggle (Grid vs Map) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'map' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Map View"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="recommended">Featured / Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Recently Listed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Render */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No properties matched your criteria</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting the budget range, clearing specific amenities, or switching the city to view available listings.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map(prop => (
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
          ) : (
            <InteractiveMap
              properties={filteredProperties}
              selectedCity={city}
              onSelectProperty={onSelectProperty}
            />
          )}
        </main>
      </div>
    </div>
  );
};
