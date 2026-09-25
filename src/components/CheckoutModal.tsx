import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  MapPin,
  Store,
  Truck,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { RestaurantProfile, FulfillmentType, Order } from '../types';
import { saveOrder } from '../services/dataService';
import { generateOrderNumber, generateWhatsAppUrl } from '../utils/orderUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RestaurantProfile;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // States: 'form' | 'submitting' | 'confirmed'
  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');

  if (!isOpen) return null;

  const deliveryFee = fulfillmentType === 'delivery' ? (profile.deliveryFee || 15) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('يرجى إدخال اسم العميل');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage('يرجى إدخال رقم جوال صالح للتواصل');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('يرجى تحديد عنوان التوصيل بالتفصيل');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const orderData: Omit<Order, 'id'> = {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : '',
        pickupBranchInfo:
          fulfillmentType === 'pickup'
            ? `${profile.branchName || 'فرع رقيش الرئيسي'} - ${profile.branchAddress || ''}`
            : '',
        items: items.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          total: ci.item.price * ci.quantity,
        })),
        subtotal,
        deliveryFee,
        total: grandTotal,
        status: 'new',
        createdAt: new Date().toISOString(),
        estimatedReadyMinutes: 20,
        notes: notes.trim(),
      };

      // 1. SAVE ORDER TO FIREBASE FIRST (Guarantee no order is lost)
      const saved = await saveOrder(orderData);
      setCreatedOrder(saved);

      // Save customer phone to local storage for quick access in Order History
      try {
        localStorage.setItem('rgesh_last_phone', customerPhone.trim());
      } catch (e) {
        // ignore
      }

      // 2. Clear cart
      clearCart();

      // 3. Determine WhatsApp recipient (restaurant for pickup, courier for delivery)
      const targetNumber =
        fulfillmentType === 'delivery'
          ? (profile.courierWhatsapp || '+966538490563')
          : (profile.restaurantWhatsapp || '0538548964');

      const url = generateWhatsAppUrl(saved, targetNumber);
      setWhatsAppUrl(url);

      // 4. Open WhatsApp immediately in new tab
      try {
        window.open(url, '_blank');
      } catch (err) {
        console.error('Window open was blocked:', err);
      }

      // 5. Show confirmation screen regardless
      setStep('confirmed');
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ الطلب. بيانات السلة محفوظة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setNotes('');
    setCreatedOrder(null);
    setWhatsAppUrl('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={step === 'confirmed' ? resetAndClose : undefined}
        className="fixed inset-0 bg-[#3E2A1E]/50 backdrop-blur-xs transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#F3D5B8] max-h-[90vh] overflow-y-auto z-10">
        {step === 'form' ? (
          <div>
            {/* Header */}
            <div className="p-5 border-b border-[#F3D5B8] bg-[#FDF6EE] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E2984C]" />
                <h3 className="font-bold text-lg text-[#3E2A1E]">
                  إتمام الطلب من رقيش
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A6F5C] hover:bg-[#F3D5B8]/50 hover:text-[#3E2A1E] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#FBEAE8] border border-[#F4BEB7] text-[#9A3826] text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Items Summary */}
              <div className="bg-[#FDF6EE]/60 border border-[#F3D5B8] rounded-xl p-3">
                <div className="text-xs font-bold text-[#8A6F5C] mb-2">
                  ملخص الأصناف ({items.length})
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {items.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="flex items-center justify-between text-xs text-[#3E2A1E]"
                    >
                      <span className="truncate max-w-[220px]">
                        {ci.item.name} × {ci.quantity}
                      </span>
                      <span className="font-semibold text-[#C98457]">
                        {ci.item.price * ci.quantity} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment Choice */}
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-2">
                  طريقة الاستلام <span className="text-[#C1543F]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3.5 rounded-xl border text-right flex flex-col gap-1 transition-all cursor-pointer ${
                      fulfillmentType === 'pickup'
                        ? 'border-[#E2984C] bg-[#FDF6EE] ring-2 ring-[#E2984C]/20 shadow-xs'
                        : 'border-[#F3D5B8] bg-[#FFFFFF] hover:bg-[#FDF6EE]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#3E2A1E]">
                        استلام من الفرع
                      </span>
                      <Store
                        className={`w-4 h-4 ${
                          fulfillmentType === 'pickup'
                            ? 'text-[#E2984C]'
                            : 'text-[#8A6F5C]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-[#8A6F5C]">
                      مباشرة من مخبز رقيش
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3.5 rounded-xl border text-right flex flex-col gap-1 transition-all cursor-pointer ${
                      fulfillmentType === 'delivery'
                        ? 'border-[#E2984C] bg-[#FDF6EE] ring-2 ring-[#E2984C]/20 shadow-xs'
                        : 'border-[#F3D5B8] bg-[#FFFFFF] hover:bg-[#FDF6EE]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#3E2A1E]">
                        توصيل
                      </span>
                      <Truck
                        className={`w-4 h-4 ${
                          fulfillmentType === 'delivery'
                            ? 'text-[#E2984C]'
                            : 'text-[#8A6F5C]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-[#8A6F5C]">
                      عبر مندوب التوصيل (+{profile.deliveryFee || 15} ر.س)
                    </span>
                  </button>
                </div>
              </div>

              {/* Branch / Delivery details display */}
              {fulfillmentType === 'pickup' ? (
                <div className="p-3.5 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] text-xs space-y-1">
                  <div className="font-bold text-[#3E2A1E] flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#C98457]" />
                    <span>{profile.branchName || 'فرع رقيش الرئيسي'}</span>
                  </div>
                  <p className="text-[#8A6F5C]">
                    {profile.branchAddress || 'المملكة العربية السعودية، فرع رقيش الرئيسي'}
                  </p>
                  <p className="text-[#8A6F5C]">
                    ساعات العمل: {profile.openingHoursText || 'طوال أيام الأسبوع'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1.5">
                    عنوان التوصيل بالتفصيل <span className="text-[#C1543F]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="الحي، اسم الشارع، رقم المبنى أو أقرب معلم..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] focus:ring-2 focus:ring-[#E2984C]/20 outline-none text-sm text-[#3E2A1E] bg-[#FFFFFF]"
                  />
                  <p className="text-[11px] text-[#8A6F5C] mt-1">
                    * سيتم إرسال الطلب لمندوب التوصيل لاستلامه من فرع رقيش وإيصاله إليك.
                  </p>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                    الاسم الكريم <span className="text-[#C1543F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="محمد العتيبي"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] focus:ring-2 focus:ring-[#E2984C]/20 outline-none text-sm text-[#3E2A1E]"
                    />
                    <User className="w-4 h-4 text-[#8A6F5C] absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                    رقم الجوال <span className="text-[#C1543F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] focus:ring-2 focus:ring-[#E2984C]/20 outline-none text-sm text-[#3E2A1E] text-right"
                    />
                    <Phone className="w-4 h-4 text-[#8A6F5C] absolute right-3 top-3" />
                  </div>
                  <span className="text-[10px] text-[#8A6F5C]">
                    مثال: 0538548964
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي تفاصيل خاصة بالطلب أو التغليف..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-xs text-[#3E2A1E]"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] space-y-2 text-xs">
                <div className="flex justify-between text-[#8A6F5C]">
                  <span>قيمة المخبوزات</span>
                  <span>{subtotal} ر.س</span>
                </div>
                {fulfillmentType === 'delivery' && (
                  <div className="flex justify-between text-[#8A6F5C]">
                    <span>رسوم التوصيل</span>
                    <span>{deliveryFee} ر.س</span>
                  </div>
                )}
                <div className="border-t border-[#F3D5B8] pt-2 flex justify-between font-bold text-sm text-[#3E2A1E]">
                  <span>المجموع النهائي</span>
                  <span className="text-[#C98457]">{grandTotal} ر.س</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-sm hover:bg-[#d68a3f] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ حفظ الطلب...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الطلب وإرسال عبر واتساب</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#8A6F5C]">
                * يتم حفظ طلبك مباشرة في نظام مخبز رقيش، وسيتم فتح محادثة الواتساب المجهزة لإرسال التأكيد.
              </p>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#EBF5EC] text-[#5E8C61] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block text-xs font-bold text-[#5E8C61] bg-[#EBF5EC] px-3 py-1 rounded-full mb-2">
                تم حفظ الطلب بنجاح في النظام
              </span>
              <h3 className="text-2xl font-extrabold text-[#3E2A1E]">
                شكراً لك، تم استلام طلبك!
              </h3>
              <p className="text-xs sm:text-sm text-[#8A6F5C] mt-1">
                رقم طلبك في مخبز رقيش:
              </p>
              <div className="text-xl font-mono font-bold text-[#C98457] mt-1">
                #{createdOrder?.orderNumber}
              </div>
            </div>

            {/* Order Details card */}
            <div className="p-4 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] text-right space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8A6F5C]">اسم العميل:</span>
                <span className="font-bold text-[#3E2A1E]">{createdOrder?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A6F5C]">طريقة الاستلام:</span>
                <span className="font-bold text-[#3E2A1E]">
                  {createdOrder?.fulfillmentType === 'delivery'
                    ? 'توصيل إلى الموقع'
                    : 'استلام من الفرع'}
                </span>
              </div>
              {createdOrder?.fulfillmentType === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-[#8A6F5C]">العنوان:</span>
                  <span className="font-medium text-[#3E2A1E] truncate max-w-[200px]">
                    {createdOrder.deliveryAddress}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8A6F5C]">إجمالي المبلغ:</span>
                <span className="font-bold text-[#C98457]">{createdOrder?.total} ر.س</span>
              </div>
              <div className="flex justify-between border-t border-[#F3D5B8] pt-2">
                <span className="text-[#8A6F5C] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C98457]" />
                  وقت التجهيز المتوقع:
                </span>
                <span className="font-bold text-[#3E2A1E]">
                  خلال {createdOrder?.estimatedReadyMinutes || 20} دقيقة
                </span>
              </div>
            </div>

            {/* WhatsApp CTA button */}
            {whatsAppUrl && (
              <div className="space-y-2">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#25D366] text-[#FFFFFF] font-bold text-sm shadow-md hover:bg-[#20ba59] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>إرسال تفاصيل الطلب عبر واتساب</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-[#8A6F5C]">
                  إذا لم تفتح نافذة الواتساب تلقائياً، اضغط على الزر أعلاه لإرسال الرسالة إلى{' '}
                  {createdOrder?.fulfillmentType === 'delivery'
                    ? 'مندوب التوصيل'
                    : 'مخبز رقيش'}
                  .
                </p>
              </div>
            )}

            <button
              onClick={resetAndClose}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-[#F3D5B8] text-[#3E2A1E] font-bold text-sm hover:bg-[#FDF6EE] transition-colors cursor-pointer"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
