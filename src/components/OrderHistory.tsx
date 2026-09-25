import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  Store,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { fetchOrdersByPhone } from '../services/dataService';
import { generateWhatsAppUrl } from '../utils/orderUtils';

interface OrderHistoryProps {
  restaurantWhatsapp: string;
  courierWhatsapp: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  restaurantWhatsapp,
  courierWhatsapp,
}) => {
  const [phoneInput, setPhoneInput] = useState(() => {
    return localStorage.getItem('rgesh_last_phone') || '';
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Automatically search if user previously saved a phone in this session/browser
  useEffect(() => {
    const savedPhone = localStorage.getItem('rgesh_last_phone');
    if (savedPhone) {
      handleSearch(savedPhone);
    }
  }, []);

  const handleSearch = async (phoneToSearch?: string) => {
    const target = phoneToSearch || phoneInput;
    if (!target.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      localStorage.setItem('rgesh_last_phone', target.trim());
      const results = await fetchOrdersByPhone(target);
      setOrders(results);
      if (results.length > 0) {
        setExpandedOrderId(results[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="bg-[#EBF5EC] text-[#37683A] border border-[#C3E4C6] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E8C61] animate-pulse"></span>
            طلب جديد
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-[#FFF4E5] text-[#B25E00] border border-[#FFE2B8] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B25E00]"></span>
            قيد التحضير في الفرن
          </span>
        );
      case 'ready':
        return (
          <span className="bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            جاهز للاستلام
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0] px-2.5 py-0.5 rounded-full text-xs font-bold">
            تم التسليم
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF] px-2.5 py-0.5 rounded-full text-xs font-bold">
            ملغي
          </span>
        );
    }
  };

  return (
    <section id="order-history-section" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C98457] mb-1">
              <span className="w-2 h-2 rounded-xs bg-[#E2984C] rotate-45"></span>
              <span>متابعة حالة طلباتك</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3E2A1E]">
              سجل الطلبات السابقة (Order History)
            </h2>
            <p className="text-xs sm:text-sm text-[#8A6F5C] mt-1">
              استرجع تفاصيل طلباتك السابقة من مخبز رقيش المحفوظة في قاعدة البيانات وتابع حالتها مباشرة
            </p>
          </div>
        </div>

        {/* Search by phone input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="tel"
              dir="ltr"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full px-4 py-3 pl-10 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] focus:ring-2 focus:ring-[#E2984C]/20 outline-none text-sm text-[#3E2A1E] text-right font-medium"
            />
            <Search className="w-4 h-4 text-[#8A6F5C] absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneInput.trim()}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-xs hover:bg-[#d68a3f] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري البحث...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>بحث عن طلباتي</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Orders List Results */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#F3D5B8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#E2984C] mx-auto mb-2" />
          <p className="text-sm font-bold text-[#3E2A1E]">
            جاري استرجاع طلباتك من قاعدة البيانات...
          </p>
        </div>
      ) : hasSearched && orders.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-10 text-center shadow-2xs">
          <Package className="w-12 h-12 text-[#C98457] mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-[#3E2A1E] mb-1">
            لم يتم العثور على طلبات سابقة بهذا الرقم
          </h3>
          <p className="text-xs sm:text-sm text-[#8A6F5C] max-w-sm mx-auto">
            تأكد من إدخال نفس رقم الجوال المستخدم أثناء إتمام الطلب، أو ابدأ بطلب مخبوزات طازجة الآن!
          </p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#8A6F5C] px-1">
            <span>تم العثور على ({orders.length}) طلبات</span>
            <span>الطلبات مرتبة من الأحدث إلى الأقدم</span>
          </div>

          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const targetWhatsapp =
              order.fulfillmentType === 'delivery' ? courierWhatsapp : restaurantWhatsapp;
            const whatsappUrl = generateWhatsAppUrl(order, targetWhatsapp);

            return (
              <div
                key={order.id}
                className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() =>
                    setExpandedOrderId(isExpanded ? null : order.id)
                  }
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FDF6EE]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] flex items-center justify-center text-[#C98457] shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#C98457]">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-xs text-[#8A6F5C] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F3D5B8]/40">
                    <div className="text-left">
                      <span className="text-xs text-[#8A6F5C] block">المبلغ الإجمالي</span>
                      <span className="font-bold text-base text-[#3E2A1E]">
                        {order.total} ر.س
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#FDF6EE] border border-[#F3D5B8] flex items-center justify-center text-[#8A6F5C]"
                      aria-label="عرض التفاصيل"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#F3D5B8]/60 bg-[#FDF6EE]/30 space-y-4 text-xs sm:text-sm">
                    {/* Fulfillment & Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#F3D5B8]/60 space-y-1">
                        <span className="text-xs text-[#8A6F5C] block font-bold">
                          نوع وطريقة الاستلام:
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-[#3E2A1E]">
                          {order.fulfillmentType === 'delivery' ? (
                            <>
                              <Truck className="w-4 h-4 text-[#E2984C]" />
                              <span>توصيل سريع إلى عنوانك</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-4 h-4 text-[#E2984C]" />
                              <span>استلام من فرع رقيش الرئيسي</span>
                            </>
                          )}
                        </div>
                        {order.fulfillmentType === 'delivery' && order.deliveryAddress && (
                          <p className="text-xs text-[#8A6F5C] mt-1">
                            العنوان: {order.deliveryAddress}
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#F3D5B8]/60 space-y-1">
                        <span className="text-xs text-[#8A6F5C] block font-bold">
                          وقت التحضير والتسليم المتوقع:
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-[#3E2A1E]">
                          <Clock className="w-4 h-4 text-[#C98457]" />
                          <span>خلال {order.estimatedReadyMinutes || 20} دقيقة تقريباً</span>
                        </div>
                        <p className="text-xs text-[#8A6F5C]">
                          اسم العميل: {order.customerName}
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#F3D5B8]/60">
                      <div className="font-bold text-xs text-[#8A6F5C] mb-2">
                        الأصناف المطلوبة:
                      </div>
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-[#FDF6EE] last:border-0"
                          >
                            <span className="font-medium text-[#3E2A1E]">
                              {it.name} × <strong className="text-[#C98457]">{it.quantity}</strong>
                            </span>
                            <span className="font-bold text-[#3E2A1E]">
                              {it.total} ر.س
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#F3D5B8]/60 mt-3 pt-2 flex justify-between font-bold text-xs text-[#3E2A1E]">
                        <span>المجموع الكلي (شاملاً التوصيل إن وجد):</span>
                        <span className="text-[#C98457] text-sm">{order.total} ر.س</span>
                      </div>
                    </div>

                    {/* Re-open WhatsApp link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-[#FFFFFF] font-bold text-xs shadow-xs hover:bg-[#20ba59] transition-colors cursor-pointer"
                      >
                        <span>إعادة إرسال أو متابعة عبر واتساب</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <span className="text-[11px] text-[#8A6F5C]">
                        * يتم تحديث حالة الطلب لحظياً من قبل إدارة المخبز
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};
