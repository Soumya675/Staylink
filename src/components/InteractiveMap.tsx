import React from 'react';
import { Property } from '../types';
import { MapPin, Navigation, Eye, CheckCircle2 } from 'lucide-react';

interface InteractiveMapProps {
  properties: Property[];
  selectedCity: string;
  onSelectProperty: (id: string) => void;
}

// Coordinate boundaries mapped to SVG viewport
const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Bengaluru': { lat: 12.95, lng: 77.62, zoom: 12 },
  'Mumbai': { lat: 19.05, lng: 72.84, zoom: 12 },
  'Delhi-NCR': { lat: 28.48, lng: 77.08, zoom: 11 },
  'Pune': { lat: 18.53, lng: 73.88, zoom: 12 },
  'Hyderabad': { lat: 17.42, lng: 78.35, zoom: 12 },
  'Chennai': { lat: 12.98, lng: 80.24, zoom: 12 }
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedCity,
  onSelectProperty
}) => {
  const [activePin, setActivePin] = React.useState<Property | null>(properties[0] || null);

  // Compute bounding box or relative coordinate projection
  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col">
      {/* Map Header Controls */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-white text-xs flex items-center gap-2 shadow-md">
        <Navigation className="w-3.5 h-3.5 text-blue-400" />
        <span className="font-semibold">{selectedCity === 'All' ? 'India-Wide Direct Rentals' : `${selectedCity} Area Map`}</span>
        <span className="text-slate-400">· {properties.length} Active Listings</span>
      </div>

      {/* Stylized Modern Interactive SVG Canvas Map */}
      <div className="relative w-full flex-1 bg-[#0b132b] overflow-hidden select-none">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Ambient Geographic Circles representing tech corridor hubs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[500px] h-[500px] rounded-full border border-blue-500/20" />
          <div className="w-[300px] h-[300px] rounded-full border border-blue-500/30" />
          <div className="w-[150px] h-[150px] rounded-full border border-blue-500/40" />
        </div>

        {/* Render Pins */}
        <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
          {properties.map((prop, idx) => {
            const isSelected = activePin?.id === prop.id;
            const formattedRent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(prop.rentMonthly);

            return (
              <div
                key={prop.id}
                onClick={() => setActivePin(prop)}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-110 m-3 group"
              >
                {/* Price Pill Marker */}
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono tabular-nums shadow-lg flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105'
                      : 'bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span>₹{formattedRent}</span>
                </div>

                {/* Pulse Ring for selected */}
                {isSelected && (
                  <span className="absolute -inset-1 rounded-lg bg-blue-500/30 animate-pulse pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Card for Active Pin Selection */}
      {activePin && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-20 bg-white rounded-xl shadow-2xl border border-slate-200 p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex gap-3">
            <img
              src={activePin.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'}
              alt={activePin.title}
              className="w-24 h-24 object-cover rounded-lg shrink-0 bg-slate-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="text-blue-600 font-semibold">{activePin.propertyType}</span>
                <span>·</span>
                <span>{activePin.furnishing}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{activePin.title}</h4>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {activePin.locality}, {activePin.city}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                  ₹{new Intl.NumberFormat('en-IN').format(activePin.rentMonthly)}
                </span>
                <span className="text-[10px] text-slate-500">/ mo</span>
                <span className="text-[10px] text-emerald-600 font-medium ml-2">0% Brokerage</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Owner
            </span>
            <button
              onClick={() => onSelectProperty(activePin.id)}
              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
