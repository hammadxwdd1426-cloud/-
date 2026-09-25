import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { MenuItem, MenuCategory } from '../types';
import { SafeImage } from './SafeImage';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  item: MenuItem | null;
  category?: MenuCategory;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  category,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showAddedEffect, setShowAddedEffect] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  const cartItem = items.find((ci) => ci.item.id === item.id);
  const currentQtyInCart = cartItem ? cartItem.quantity : 0;
  const totalPrice = (item.price * quantity).toFixed(2);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!item.isAvailable) return;
    addToCart(item, quantity);
    setShowAddedEffect(true);
    setTimeout(() => {
      setShowAddedEffect(false);
    }, 1800);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${item.name} - مخبز رقيش`,
        text: `جرب ${item.name} من مخبز رقيش الطازج!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#3E2A1E]/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Main Product Card Modal */}
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#F3D5B8] overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#3E2A1E] shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          aria-label="إغلاق تفاصيل الصنف"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="relative md:w-1/2 aspect-square md:aspect-auto bg-[#FDF6EE] flex items-center justify-center overflow-hidden">
          <SafeImage
            src={item.imageUrl}
            alt={item.name}
            fallbackText={item.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {category && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFFFFF]/95 text-[#C98457] border border-[#F3D5B8] shadow-xs">
                {category.name}
              </span>
            )}
            {item.prepTimeMinutes > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#3E2A1E]/80 backdrop-blur-xs text-[#FFFFFF] flex items-center gap-1 shadow-xs">
                <Clock className="w-3 h-3 text-[#E2984C]" />
                <span>تحضير {item.prepTimeMinutes} دقيقة</span>
              </span>
            )}
          </div>

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-[#3E2A1E]/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-[#FFFFFF] text-[#C1543F] font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                غير متوفر حالياً
              </span>
            </div>
          )}
        </div>

        {/* Product Info & Action Section */}
        <div className="p-5 sm:p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E2984C] mb-1">
                  <Sparkles className="w-3 h-3" />
                  مخبوزات طازجة يومياً
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#3E2A1E] leading-snug">
                  {item.name}
                </h1>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-[#FDF6EE] hover:bg-[#F3D5B8]/50 text-[#8A6F5C] hover:text-[#3E2A1E] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="مشاركة الصنف"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#5E8C61]" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-[#F3D5B8]/60">
              <span className="text-2xl sm:text-3xl font-black text-[#C98457]">
                {item.price}
              </span>
              <span className="text-sm font-bold text-[#8A6F5C]">ريال سعودي</span>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#8A6F5C] mb-1">تفاصيل ومكونات الصنف:</h4>
              <p className="text-xs sm:text-sm text-[#3E2A1E] leading-relaxed">
                {item.description ||
                  'مخبوز بعناية يومياً من أجود المكونات الطبيعية والزبدة الفاخرة لضمان أشهى مذاق وقرمشة.'}
              </p>
            </div>

            {/* Features pills */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8]/60">
                <Flame className="w-4 h-4 text-[#E2984C] shrink-0" />
                <span className="text-[11px] text-[#3E2A1E] font-medium">طازج من الفرن</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8]/60">
                <ShieldCheck className="w-4 h-4 text-[#5E8C61] shrink-0" />
                <span className="text-[11px] text-[#3E2A1E] font-medium">مكونات نقية 100%</span>
              </div>
            </div>

            {currentQtyInCart > 0 && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#EBF5EC] border border-[#C3E4C6] flex items-center justify-between text-xs text-[#37683A]">
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  موجود في سلتك حالياً:
                </span>
                <span className="font-extrabold">{currentQtyInCart} قطعة</span>
              </div>
            )}
          </div>

          {/* Action: Quantity selector + Add To Cart Button */}
          <div className="pt-3 border-t border-[#F3D5B8] space-y-3">
            {/* Quantity Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3E2A1E]">الكمية المطلوبة:</span>
              <div className="flex items-center gap-3 bg-[#FDF6EE] border border-[#F3D5B8] px-2 py-1 rounded-xl">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || !item.isAvailable}
                  className="w-7 h-7 rounded-lg bg-[#FFFFFF] text-[#3E2A1E] hover:bg-[#F3D5B8]/40 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-extrabold text-[#3E2A1E] min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={!item.isAvailable}
                  className="w-7 h-7 rounded-lg bg-[#FFFFFF] text-[#3E2A1E] hover:bg-[#F3D5B8]/40 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total and Add Button */}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`w-full min-h-[50px] py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all duration-200 cursor-pointer shadow-md ${
                !item.isAvailable
                  ? 'bg-[#F3D5B8]/50 text-[#8A6F5C] cursor-not-allowed'
                  : showAddedEffect
                  ? 'bg-[#4B8554] text-[#FFFFFF] scale-[0.98]'
                  : 'bg-[#E2984C] text-[#FFFFFF] hover:bg-[#d68a3f] active:scale-[0.98]'
              }`}
            >
              {showAddedEffect ? (
                <div className="w-full flex items-center justify-center gap-2 animate-bounce">
                  <Check className="w-5 h-5 text-[#FFFFFF]" />
                  <span>تمت الإضافة للسلة بنجاح! ✨</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>إضافة إلى السلة</span>
                  </div>
                  <span className="bg-[#FFFFFF]/20 px-2.5 py-1 rounded-xl text-xs font-black">
                    {totalPrice} ر.س
                  </span>
                </>
              )}
            </button>

            {/* Quick checkout helper button */}
            {currentQtyInCart > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="w-full py-2 text-xs font-bold text-[#E2984C] hover:text-[#d68a3f] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>الانتقال لمشاهدة السلة ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
