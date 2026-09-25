import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';

interface CartToastNotificationProps {
  onOpenCart: () => void;
}

export const CartToastNotification: React.FC<CartToastNotificationProps> = ({ onOpenCart }) => {
  const { lastAddedItem, clearLastAddedItem, totalItems, subtotal } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastAddedItem) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(clearLastAddedItem, 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, clearLastAddedItem]);

  if (!lastAddedItem || !isVisible) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#FFFFFF] border-2 border-[#E2984C] rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-right">
        {/* Product miniature */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FDF6EE] border border-[#F3D5B8] shrink-0">
          <SafeImage
            src={lastAddedItem.item.imageUrl}
            alt={lastAddedItem.item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#5E8C61] mb-0.5">
            <Check className="w-3.5 h-3.5" />
            <span>تمت الإضافة للسلة!</span>
          </div>
          <h4 className="text-xs font-bold text-[#3E2A1E] truncate">
            {lastAddedItem.item.name}
          </h4>
          <span className="text-[11px] text-[#8A6F5C]">
            {lastAddedItem.quantity} × {lastAddedItem.item.price} ر.س
          </span>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            onOpenCart();
          }}
          className="px-3.5 py-2 rounded-xl bg-[#E2984C] hover:bg-[#d68a3f] text-[#FFFFFF] text-xs font-bold flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer"
        >
          <span>عرض السلة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
