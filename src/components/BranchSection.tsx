import React from 'react';
import { MapPin, Phone, Clock, Store, ExternalLink } from 'lucide-react';
import { RestaurantProfile } from '../types';

interface BranchSectionProps {
  profile: RestaurantProfile;
}

export const BranchSection: React.FC<BranchSectionProps> = ({ profile }) => {
  return (
    <section className="bg-[#FFFFFF] border-t border-[#F3D5B8]/80 py-12 px-4 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C98457] mb-1">
            <span className="w-2 h-2 rounded-xs bg-[#E2984C] rotate-45"></span>
            <span>زورونا في رقيش</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3E2A1E]">
            معلومات الفرع والاستلام
          </h2>
          <p className="text-xs sm:text-sm text-[#8A6F5C] mt-1">
            نسعد باستقبالكم للاستمتاع برائحة المخبوزات الطازجة الخارجة لتوها من الفرن
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Address */}
          <div className="p-6 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#F3D5B8] flex items-center justify-center text-[#C98457] mb-3 shadow-2xs">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#3E2A1E] mb-1">
              {profile.branchName || 'فرع رقيش الرئيسي'}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A6F5C] leading-relaxed mb-4">
              {profile.branchAddress || 'المملكة العربية السعودية، الفرع الرئيسي لـ رقيش'}
            </p>
            {profile.branchMapUrl && (
              <a
                href={profile.branchMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E2984C] hover:text-[#d68a3f] mt-auto"
              >
                <span>فتح في خرائط Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Card 2: Hours */}
          <div className="p-6 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#F3D5B8] flex items-center justify-center text-[#C98457] mb-3 shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#3E2A1E] mb-1">
              ساعات العمل
            </h3>
            <p className="text-xs sm:text-sm text-[#8A6F5C] leading-relaxed">
              {profile.openingHoursText || 'يومياً من ٧:٠٠ صباحاً حتى ١١:٠٠ مساءً'}
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  profile.isOpen
                    ? 'bg-[#EBF5EC] text-[#37683A] border-[#C3E4C6]'
                    : 'bg-[#FBEAE8] text-[#9A3826] border-[#F4BEB7]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.isOpen ? 'bg-[#5E8C61]' : 'bg-[#C1543F]'
                  }`}
                ></span>
                <span>{profile.isOpen ? 'مفتوح لاستقبال الطلبات' : 'مغلق حالياً'}</span>
              </span>
            </div>
          </div>

          {/* Card 3: Contact */}
          <div className="p-6 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#F3D5B8] flex items-center justify-center text-[#C98457] mb-3 shadow-2xs">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#3E2A1E] mb-1">
              التواصل والاستفسارات
            </h3>
            <p className="text-xs sm:text-sm text-[#8A6F5C] leading-relaxed mb-4">
              خدمة عملاء مخبز رقيش جاهزون للإجابة على استفساراتكم
            </p>
            <a
              href={`tel:${profile.restaurantWhatsapp}`}
              dir="ltr"
              className="font-mono font-bold text-sm text-[#3E2A1E] hover:text-[#E2984C] mt-auto"
            >
              {profile.restaurantWhatsapp || '0538548964'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
