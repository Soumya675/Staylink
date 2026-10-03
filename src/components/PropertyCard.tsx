import React from 'react';
import { Property } from '../types';
import { Heart, MapPin, CheckCircle, ShieldCheck, ArrowRightLeft, Sparkles } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isFavourite?: boolean;
  isCompared?: boolean;
  onToggleFavourite: (id: string) => void;
  onToggleCompare?: (property: Property) => void;
  onSelect: (id: string) => void;
  onQuickEnquire?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavourite = false,
  isCompared = false,
  onToggleFavourite,
  onToggleCompare,
  onSelect,
  onQuickEnquire
}) => {
  const [imgSrc, setImgSrc] = React.useState(property.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg');
  const [imgError, setImgError] = React.useState(false);

  // Format currency in Indian standard
  const formattedRent = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(property.rentMonthly);

  const formattedDeposit = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(property.securityDeposit);

  return (
    <div
      onClick={() => onSelect(property.id)}
      className="group relative bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Visual Asset Container (65% presence) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => {
              setImgError(true);
              setImgSrc('/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg');
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-center">
            <span className="text-xs font-semibold text-slate-700">{property.title}</span>
            <span className="text-[11px] text-slate-500 mt-1">{property.locality}, {property.city}</span>
          </div>
        )}

        {/* Quiet Top Overlay Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Zero Brokerage direct tag */}
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>0% Brokerage</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Compare Toggle */}
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(property);
                }}
                title={isCompared ? 'Remove from compare' : 'Add to compare'}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                  isCompared
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/85 text-slate-700 hover:bg-white hover:text-blue-600'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Favourite Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(property.id);
              }}
              title={isFavourite ? 'Saved in favourites' : 'Save to favourites'}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isFavourite
                  ? 'bg-rose-50 text-rose-600 shadow-xs'
                  : 'bg-white/85 text-slate-700 hover:bg-white hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subtle Bottom Image Scrim for City & Locality */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-3 pt-6 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-medium truncate">{property.locality}, {property.city}</span>
          </div>
          <span className="text-[11px] text-slate-300 shrink-0 font-medium">{property.availableFrom === 'Immediate' ? 'Ready to move' : property.availableFrom}</span>
        </div>
      </div>

      {/* Content & Metadata Section (Zero-Pill Discipline) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <span className="text-slate-800 font-semibold">{property.propertyType}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{property.furnishing}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{property.superBuiltUpArea} sq ft</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>

          {/* Verified Owner Line */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="text-slate-700">Owner: {property.ownerName}</span>
              {property.ownerVerified && (
                <span title="Verified Homeowner">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{property.ownerResponseTime}</span>
          </div>
        </div>

        {/* Pricing Baseline with Tabular Figures */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                ₹{formattedRent}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Deposit: <span className="font-mono tabular-nums">₹{formattedDeposit}</span>
              {property.maintenanceCharges > 0 ? (
                <> · Maint: ₹{property.maintenanceCharges}</>
              ) : (
                <> · Maint Included</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onQuickEnquire && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickEnquire(property);
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
              >
                Enquire
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
