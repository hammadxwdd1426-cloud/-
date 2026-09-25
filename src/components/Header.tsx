import React, { useEffect, useState } from 'react';
import { ShoppingBag, History } from 'lucide-react';
import { RestaurantProfile } from '../types';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  profile: RestaurantProfile;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onNavigateHistory: () => void;
  isAdminView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenCart,
  onNavigateHome,
  onNavigateAdmin,
  onNavigateHistory,
  isAdminView = false,
}) => {
  const { totalItems, cartAnimationTrigger } = useCart();
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 700);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#F3D5B8]/60 shadow-[0_2px_12px_rgba(62,42,30,0.04)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-right group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] flex items-center justify-center p-1 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
            <img
              src="/rgesh-logo.png"
              alt="RGESH رقيش"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#3E2A1E] font-sans tracking-tight">
                {profile.nameArabic || 'رقيش'}
              </span>
              <span className="text-xs font-semibold text-[#C98457] tracking-wider uppercase">
                {profile.nameLatin || 'RGESH'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8A6F5C]">
              {profile.isOpen ? (
                <span className="inline-flex items-center gap-1 text-[#5E8C61] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#5E8C61] animate-pulse"></span>
                  مفتوح لاستقبال الطلبات
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#C1543F] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#C1543F]"></span>
                  مغلق حالياً
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Order History Link */}
          {!isAdminView && (
            <button
              onClick={onNavigateHistory}
              title="سجل الطلبات السابقة"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3E2A1E] bg-[#FDF6EE] border border-[#F3D5B8] hover:bg-[#F3D5B8]/40 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-[#C98457]" />
              <span className="hidden sm:inline">سجل الطلبات</span>
            </button>
          )}

          {/* Subtle admin entry point */}
          <button
            onClick={onNavigateAdmin}
            title="لوحة الإدارة"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isAdminView
                ? 'bg-[#E2984C] text-[#FFFFFF]'
                : 'text-[#8A6F5C] hover:text-[#3E2A1E] hover:bg-[#FDF6EE]'
            }`}
          >
            {isAdminView ? 'العودة للمتجر' : 'الإدارة'}
          </button>

          {/* Cart Button with bounce animation */}
          {!isAdminView && (
            <button
              onClick={onOpenCart}
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-[#FFFFFF] shadow-sm transition-all duration-300 cursor-pointer ${
                isBouncing
                  ? 'bg-[#37683A] scale-120 ring-4 ring-[#C3E4C6] shadow-xl animate-bounce'
                  : 'bg-[#E2984C] hover:bg-[#d68a3f] active:scale-95'
              }`}
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className={`w-5 h-5 transition-transform ${isBouncing ? 'scale-110' : ''}`} />
              {totalItems > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-[#FFFFFF] shadow-xs transition-all duration-200 ${
                    isBouncing
                      ? 'bg-[#E2984C] scale-125'
                      : 'bg-[#C1543F]'
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
