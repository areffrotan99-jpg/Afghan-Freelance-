import React from 'react';
import { Star, MapPin, CheckCircle2, MessageSquare, Award, Zap } from 'lucide-react';
import { FreelancerProfile } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
  onSelect: () => void;
  onMessage: () => void;
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer, onSelect, onMessage }) => {
  const { formatAmount } = useCurrency();

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-slate-200">
      <div>
        {/* Top: Avatar, Name, Location */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative shrink-0">
            <img
              src={freelancer.avatar}
              alt={freelancer.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                freelancer.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={freelancer.availability === 'available' ? 'آماده همکاری' : 'مشغول'}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-white hover:text-blue-400 transition cursor-pointer" onClick={onSelect}>
                {freelancer.name}
              </h4>
              {freelancer.badges.includes('Verified') && (
                <span title="هویت تأیید شده" className="inline-flex">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{freelancer.headline}</p>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {freelancer.location?.city}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                پاسخ: {freelancer.responseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Bio preview */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {freelancer.bio}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {freelancer.skills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-750"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/50 text-slate-500">
              +{freelancer.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white">{freelancer.rating.toFixed(2)}</span>
            <span className="text-slate-500 text-[11px]">({freelancer.completedOrders} سفارش)</span>
          </div>

          <div className="text-left font-mono font-bold text-emerald-400">
            {formatAmount(freelancer.hourlyRateAFN, freelancer.hourlyRateUSD)}/ساعت
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onMessage}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>گفتگو</span>
          </button>

          <button
            onClick={onSelect}
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <span>مشاهده پروفایل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
