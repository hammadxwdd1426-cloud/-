import React from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#3E2A1E]/40 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F3D5B8] flex items-center justify-between bg-[#FDF6EE]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E2984C]" />
            <h2 className="font-bold text-lg text-[#3E2A1E]">
              سلة المشتريات ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8A6F5C] hover:bg-[#F3D5B8]/50 hover:text-[#3E2A1E] transition-colors cursor-pointer"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] flex items-center justify-center text-[#C98457] mb-4">
                <ShoppingBag className="w-10 h-10 opacity-70" />
              </div>
              <h3 className="font-bold text-lg text-[#3E2A1E] mb-1">
                سلتك فارغة حالياً
              </h3>
              <p className="text-xs sm:text-sm text-[#8A6F5C] max-w-xs mb-6">
                استمتع باختيار أشهى أنواع المخبوزات والحلويات الطازجة من قائمة رقيش.
              </p>
              <button
                onClick={onClose}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-xs hover:bg-[#d68a3f] transition-all cursor-pointer"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-[#FDF6EE]/60 border border-[#F3D5B8]/70 relative"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#FFFFFF]">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackText={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-[#3E2A1E] truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8A6F5C] hover:text-[#C1543F] p-1 cursor-pointer"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-[#C98457]">
                        {item.price * quantity} ر.س
                      </span>

                      {/* Quantity Stepper (min 44px touch target) */}
                      <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#F3D5B8] rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#8A6F5C] hover:text-[#3E2A1E] rounded hover:bg-[#FDF6EE] transition-colors cursor-pointer"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#3E2A1E]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#8A6F5C] hover:text-[#3E2A1E] rounded hover:bg-[#FDF6EE] transition-colors cursor-pointer"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-left">
                <button
                  onClick={clearCart}
                  className="text-xs text-[#8A6F5C] hover:text-[#C1543F] underline cursor-pointer"
                >
                  إفراغ السلة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with totals & proceed button */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#F3D5B8] bg-[#FDF6EE] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#8A6F5C]">المجموع الفرعي</span>
              <span className="font-bold text-base text-[#3E2A1E]">
                {subtotal} ر.س
              </span>
            </div>
            <p className="text-[11px] text-[#8A6F5C]">
              * رسوم التوصيل إن وجدت تحسب في خطوة تأكيد الطلب.
            </p>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-base shadow-sm hover:bg-[#d68a3f] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
