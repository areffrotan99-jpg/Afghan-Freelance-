import React from 'react';
import { Star, Heart, CheckCircle2, Clock } from 'lucide-react';
import { Service } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const { formatAmount } = useCurrency();
  const { favorites, toggleFavorite } = useMarketplace();
  const isFav = favorites.includes(service.id);

  const startingPriceAFN = service.packages.basic.priceAFN;
  const startingPriceUSD = service.packages.basic.priceUSD;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer text-slate-200"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
        <img
          src={service.coverImage}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(service.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
            isFav
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
              : 'bg-black/40 text-slate-300 hover:text-white hover:bg-black/60'
          }`}
          title="افزودن به علاقه‌مندی‌ها"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Category Pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-slate-700/60">
          {service.categoryName}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Freelancer Header */}
        <div className="flex items-center gap-2.5">
          <img
            src={service.freelancerAvatar}
            alt={service.freelancerName}
            className="w-8 h-8 rounded-full object-cover border border-slate-750"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                {service.freelancerName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 truncate">@{service.freelancerUsername}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">
          {service.title}
        </h4>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-bold text-white">{service.rating.toFixed(1)}</span>
          <span className="text-slate-500 text-[11px]">({service.reviewCount} نظر)</span>
          <span className="text-slate-600 mx-1">•</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            تحویل {service.packages.basic.deliveryDays} روزه
          </span>
        </div>

        {/* Price Baseline */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">شروع قیمت از:</span>
          <div className="text-left font-black text-sm text-emerald-400">
            {formatAmount(startingPriceAFN, startingPriceUSD)}
          </div>
        </div>
      </div>
    </div>
  );
};
