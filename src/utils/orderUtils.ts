import { Order } from '../types';

export function formatSaudiPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('05')) {
    cleaned = '966' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `RG-${dateStr}-${randomPart}`;
}

export function generateWhatsAppUrl(order: Order, whatsappNumber: string): string {
  const cleanNumber = formatSaudiPhone(whatsappNumber);

  let message = `*طلب جديد من رقيش | RGESH* 🥐✨\n\n`;
  message += `*رقم الطلب:* #${order.orderNumber}\n`;
  message += `*اسم العميل:* ${order.customerName}\n`;
  message += `*رقم الجوال:* ${order.customerPhone}\n\n`;

  message += `*تفاصيل الطلب:*\n`;
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} × ${item.quantity} = ${item.total} ر.س\n`;
  });

  message += `\n*المجموع الفرعي:* ${order.subtotal} ر.س\n`;

  if (order.fulfillmentType === 'delivery') {
    message += `*رسوم التوصيل:* ${order.deliveryFee} ر.س\n`;
    message += `*المجموع الكلي:* ${order.total} ر.س\n\n`;
    message += `*نوع الاستلام:* توصيل إلى الموقع\n`;
    message += `*عنوان التوصيل:* ${order.deliveryAddress || 'غير محدد'}\n`;
    message += `*نقطة الاستلام للمندوب:* استلام الطلب من فرع مخبز رقيش الرئيسي\n`;
  } else {
    message += `*المجموع الكلي:* ${order.total} ر.س\n\n`;
    message += `*نوع الاستلام:* استلام من الفرع\n`;
    message += `*الفرع:* ${order.pickupBranchInfo || 'فرع رقيش الرئيسي'}\n`;
  }

  message += `*وقت التجهيز المتوقع:* خلال ${order.estimatedReadyMinutes || 20} دقيقة تقريباً\n`;
  message += `*تاريخ الطلب:* ${new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}\n\n`;
  message += `شكراً لاختياركم رقيش! 🤍`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
