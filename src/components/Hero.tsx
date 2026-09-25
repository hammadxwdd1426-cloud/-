import React from 'react';
import { Clock, MapPin, Store, ChevronLeft } from 'lucide-react';
import { RestaurantProfile } from '../types';

interface HeroProps {
  profile: RestaurantProfile;
  onBrowseMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ profile, onBrowseMenu }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF6EE] to-[#F7E7D7]/40 border-b border-[#F3D5B8]/40 py-10 px-4">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#F3D5B8]/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#E2984C]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Literal RGESH Logo Display */}
        <div className="relative mb-4 group">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#FFFFFF] shadow-md border border-[#F3D5B8] p-3 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-102">
            <img
              src="/rgesh-logo.png"
              alt="RGESH Bakery رقيش"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Logo Diamond Accent Motif */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#E2984C] rotate-45 border-2 border-[#FFFFFF] shadow-xs"></div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3E2A1E] tracking-tight mb-1">
          {profile.nameArabic || 'رقيش'}
          <span className="inline-block mx-2 text-[#C98457] font-semibold text-2xl sm:text-3xl tracking-wide uppercase">
            {profile.nameLatin || 'RGESH'}
          </span>
        </h1>

        {/* Bakery Description */}
        <p className="max-w-xl text-[#8A6F5C] text-sm sm:text-base leading-relaxed mb-6 font-normal">
          {profile.description || 'مخبوزات طازجة يومياً بحب وشغف بأجود المكونات'}
        </p>

        {/* Badges / Hours / Branch info pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-7 text-xs sm:text-sm">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-2xs ${
              profile.isOpen
                ? 'bg-[#EBF5EC] text-[#37683A] border-[#C3E4C6]'
                : 'bg-[#FBEAE8] text-[#9A3826] border-[#F4BEB7]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                profile.isOpen ? 'bg-[#5E8C61] animate-pulse' : 'bg-[#C1543F]'
              }`}
            ></span>
            <span className="font-medium">
              {profile.isOpen ? 'مفتوح لاستقبال الطلبات' : 'مغلق حالياً'}
            </span>
          </div>

          {/* Hours Info */}
          {profile.openingHoursText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#F3D5B8] text-[#3E2A1E] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#C98457]" />
              <span>{profile.openingHoursText}</span>
            </div>
          )}

          {/* Branch Pill */}
          {profile.branchAddress && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#F3D5B8] text-[#3E2A1E] shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#C98457]" />
              <span className="truncate max-w-[200px]">{profile.branchName || 'الفرع الرئيسي'}</span>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <button
          onClick={onBrowseMenu}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-base shadow-sm hover:bg-[#d68a3f] active:scale-98 transition-all duration-200 cursor-pointer"
        >
          <span>تصفح قائمة المخبوزات</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
