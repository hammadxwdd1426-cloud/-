import React, { useState } from 'react';
import { Plus, Clock, Check, Eye } from 'lucide-react';
import { MenuItem } from '../types';
import { SafeImage } from './SafeImage';
import { useCart } from '../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  onSelectItem?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelectItem }) => {
  const { addToCart, items } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const cartItem = items.find((ci) => ci.item.id === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    setIsAnimating(true);
    addToCart(item, 1);
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const handleCardClick = () => {
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-[#FFFFFF] rounded-2xl border border-[#F3D5B8]/80 overflow-hidden shadow-[0_2px_10px_rgba(62,42,30,0.04)] hover:shadow-[0_8px_25px_rgba(62,42,30,0.12)] hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
        !item.isAvailable ? 'opacity-65 grayscale-[30%]' : ''
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FDF6EE]">
        <SafeImage
          src={item.imageUrl}
          alt={item.name}
          fallbackText={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-[#3E2A1E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="bg-[#FFFFFF]/90 backdrop-blur-xs text-[#3E2A1E] font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-[#E2984C]" />
            <span>عرض التفاصيل</span>
          </span>
        </div>

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-[#3E2A1E]/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[#FFFFFF] text-[#C1543F] font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
              غير متوفر حالياً
            </span>
          </div>
        )}

        {/* Prep Time Pill */}
        {item.prepTimeMinutes > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#FFFFFF]/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-medium text-[#3E2A1E] border border-[#F3D5B8] flex items-center gap-1 shadow-2xs">
            <Clock className="w-3 h-3 text-[#C98457]" />
            <span>{item.prepTimeMinutes} دقيقة</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-[#3E2A1E] text-base leading-snug group-hover:text-[#E2984C] transition-colors">
              {item.name}
            </h3>
            <div className="shrink-0 text-left font-bold text-[#C98457] text-base">
              <span>{item.price}</span>
              <span className="text-xs mr-1 font-normal text-[#8A6F5C]">ر.س</span>
            </div>
          </div>

          {item.description && (
            <p className="text-xs text-[#8A6F5C] line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 mt-auto border-t border-[#F3D5B8]/40 flex items-center justify-between">
          {currentQty > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E8C61]">
              <span className="w-5 h-5 rounded-full bg-[#EBF5EC] flex items-center justify-center text-[#5E8C61]">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>في السلة ({currentQty})</span>
            </div>
          ) : (
            <span className="text-xs text-[#8A6F5C]">طازج ومعد بعناية</span>
          )}

          <button
            onClick={handleQuickAdd}
            disabled={!item.isAvailable}
            className={`min-h-[44px] px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
              !item.isAvailable
                ? 'bg-[#F3D5B8]/40 text-[#8A6F5C] cursor-not-allowed'
                : isAnimating
                ? 'bg-[#4B8554] text-[#FFFFFF] scale-110 shadow-md'
                : 'bg-[#E2984C] text-[#FFFFFF] hover:bg-[#d68a3f] active:scale-95 shadow-2xs'
            }`}
            aria-label={`إضافة ${item.name} إلى السلة`}
          >
            {isAnimating ? (
              <>
                <Check className="w-4 h-4 animate-spin" />
                <span>تمت!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
