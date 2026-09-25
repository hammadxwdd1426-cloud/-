import React, { useState } from 'react';
import {
  RestaurantProfile,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  updateRestaurantProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateOrderStatus,
  subscribeOrders
} from '../services/dataService';
import { SafeImage } from './SafeImage';
import {
  Settings,
  Utensils,
  ClipboardList,
  MessageCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Store,
  Phone,
  Truck,
  LogIn,
  LogOut,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { compressImageFile, normalizeImageUrl, resolveDirectImageUrl } from '../utils/imageHelper';

interface AdminDashboardProps {
  profile: RestaurantProfile;
  categories: MenuCategory[];
  items: MenuItem[];
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  categories,
  items,
  onExit,
}) => {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'settings'>('orders');

  // Subscribe to orders ONLY when admin user is authenticated
  React.useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const unsub = subscribeOrders((data) => {
      setOrders(data);
    });
    return () => unsub();
  }, [user]);

  // Restaurant Settings Form State
  const [settingsForm, setSettingsForm] = useState<RestaurantProfile>(profile);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Category Edit / Add State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  // Menu Item Modal / State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: '',
    prepTimeMinutes: 15,
    isAvailable: true,
  });

  // Quick Seed with Sample Bakery Data if completely empty
  const handleQuickSeedBakery = async () => {
    if (!confirm('هل تريد ملء المتجر بأصناف مخبوزات أولية تجريبية تناسب رقيش؟')) return;

    try {
      const cat1Id = await addCategory({ name: 'كرواسون ومعجنات', order: 1, isActive: true });
      const cat2Id = await addCategory({ name: 'كيك وحلويات', order: 2, isActive: true });
      const cat3Id = await addCategory({ name: 'خبز طازج ومخبوزات تقليدية', order: 3, isActive: true });

      await addMenuItem({
        name: 'كرواسون بالزبدة الفرنسية',
        description: 'طبقات هشة ومقرمشة محضرة بالزبدة النقية عالية الجودة يومياً.',
        price: 14,
        categoryId: cat1Id,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        prepTimeMinutes: 10,
        isAvailable: true,
        order: 1,
      });

      await addMenuItem({
        name: 'دانيش التوت والكريمة',
        description: 'عجينة مورقة فاخرة محشوة بكريمة الفانيليا وتوت بري طازج.',
        price: 18,
        categoryId: cat1Id,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        prepTimeMinutes: 12,
        isAvailable: true,
        order: 2,
      });

      await addMenuItem({
        name: 'تارت الفواكه الطازجة',
        description: 'قاعدة بسكويت مقرمشة مع كريمة باتيسيير وفواكه موسمية.',
        price: 24,
        categoryId: cat2Id,
        imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
        prepTimeMinutes: 15,
        isAvailable: true,
        order: 1,
      });

      await addMenuItem({
        name: 'ساوردو كلاسيكي مخمر طبيعياً',
        description: 'خبز الساوردو الريفي المحضر من خميرة طبيعية وقشرة ذهبية مقرمشة.',
        price: 22,
        categoryId: cat3Id,
        imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
        prepTimeMinutes: 5,
        isAvailable: true,
        order: 1,
      });

      alert('تمت إضافة الأصناف التجريبية بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة البيانات الأولية');
    }
  };

  // If not logged in, show authentication wall (Zero bypass)
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#F3D5B8] p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] flex items-center justify-center mx-auto mb-4 p-2">
            <img src="/rgesh-logo.png" alt="RGESH" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-xl font-bold text-[#3E2A1E] mb-2">
            لوحة إدارة مخبز رقيش | RGESH
          </h2>
          <p className="text-xs sm:text-sm text-[#8A6F5C] leading-relaxed mb-6">
            هذه المنطقة مخصصة لمدير ومتجر رقيش لإدارة الطلبات والأسعار وقائمة المخبوزات. يرجى تسجيل الدخول عبر Google.
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-sm hover:bg-[#d68a3f] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mb-3"
          >
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول بحساب Google</span>
          </button>

          <button
            onClick={onExit}
            className="text-xs text-[#8A6F5C] hover:text-[#3E2A1E] underline cursor-pointer"
          >
            العودة إلى متجر رقيش
          </button>
        </div>
      </div>
    );
  }

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsFeedback('');
    try {
      await updateRestaurantProfile(settingsForm);
      setSettingsFeedback('تم حفظ الإعدادات بنجاح!');
      setTimeout(() => setSettingsFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setSettingsFeedback('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({
        name: newCategoryName.trim(),
        order: categories.length + 1,
        isActive: true,
      });
      setNewCategoryName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.categoryId) return;

    try {
      // Automatically resolve URL in case user pasted ibb.co page link or bbcode
      let finalImageUrl = itemForm.imageUrl;
      if (finalImageUrl) {
        finalImageUrl = await resolveDirectImageUrl(finalImageUrl);
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: itemForm.name,
          description: itemForm.description,
          price: Number(itemForm.price),
          categoryId: itemForm.categoryId,
          imageUrl: finalImageUrl,
          prepTimeMinutes: Number(itemForm.prepTimeMinutes),
          isAvailable: itemForm.isAvailable,
        });
      } else {
        await addMenuItem({
          name: itemForm.name,
          description: itemForm.description,
          price: Number(itemForm.price),
          categoryId: itemForm.categoryId,
          imageUrl: finalImageUrl,
          prepTimeMinutes: Number(itemForm.prepTimeMinutes),
          isAvailable: itemForm.isAvailable,
          order: items.length + 1,
        });
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    try {
      setIsUploadingImage(true);
      setImageUploadError('');
      // Compress to max 800px width/height and quality 0.8
      const base64Data = await compressImageFile(file, 800, 0.82);
      setItemForm((prev) => ({ ...prev, imageUrl: base64Data }));
    } catch (err) {
      console.error(err);
      setImageUploadError('حدث خطأ أثناء معالجة الصورة. يرجى تجربة صورة أخرى.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setImageUploadError('');
    setIsUploadingImage(false);
    setItemForm({
      name: '',
      description: '',
      price: 15,
      categoryId: categories[0]?.id || '',
      imageUrl: '',
      prepTimeMinutes: 15,
      isAvailable: true,
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setImageUploadError('');
    setIsUploadingImage(false);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      prepTimeMinutes: item.prepTimeMinutes || 15,
      isAvailable: item.isAvailable,
    });
    setIsItemModalOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-[#EBF5EC] text-[#37683A] px-2.5 py-1 rounded-full text-xs font-bold">طلب جديد</span>;
      case 'preparing':
        return <span className="bg-[#FFF4E5] text-[#B25E00] px-2.5 py-1 rounded-full text-xs font-bold">قيد التحضير</span>;
      case 'ready':
        return <span className="bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-full text-xs font-bold">جاهز للاستلام</span>;
      case 'delivered':
        return <span className="bg-[#F1F3F4] text-[#5F6368] px-2.5 py-1 rounded-full text-xs font-bold">تم التسليم</span>;
      case 'cancelled':
        return <span className="bg-[#FCE8E6] text-[#C5221F] px-2.5 py-1 rounded-full text-xs font-bold">ملغي</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#FDF6EE] border border-[#F3D5B8] p-1 flex items-center justify-center overflow-hidden">
            <img src="/rgesh-logo.png" alt="RGESH" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#3E2A1E]">
              لوحة الإدارة | مخبز رقيش
            </h1>
            <p className="text-xs text-[#8A6F5C]">
              المستخدم المسجل: {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl border border-[#F3D5B8] text-xs font-bold text-[#3E2A1E] hover:bg-[#FDF6EE] transition-colors cursor-pointer"
          >
            مشاهدة المتجر
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#FBEAE8] text-[#9A3826] border border-[#F4BEB7] text-xs font-bold hover:bg-[#f7d7d2] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
              : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>الطلبات المستلمة ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
              : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>قائمة المخبوزات ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
              : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>التصنيفات ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
              : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات المتجر والواتساب</span>
        </button>
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-12 text-center shadow-2xs">
              <ClipboardList className="w-12 h-12 text-[#C98457] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-lg text-[#3E2A1E] mb-1">
                لا توجد طلبات واردة حتى الآن
              </h3>
              <p className="text-xs sm:text-sm text-[#8A6F5C]">
                عندما يقوم العملاء بالطلب من المتجر ستظهر جميع التفاصيل هنا لحظياً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F3D5B8]/60 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-[#C98457]">
                        #{order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-[#8A6F5C]">
                        {new Date(order.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>

                    {/* Status update controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8A6F5C]">تغيير الحالة:</span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-[#F3D5B8] bg-[#FDF6EE] text-xs font-bold text-[#3E2A1E] outline-none cursor-pointer"
                      >
                        <option value="new">طلب جديد</option>
                        <option value="preparing">قيد التحضير</option>
                        <option value="ready">جاهز للاستلام</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer and fulfillment details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-[#FDF6EE]/60 rounded-xl space-y-1">
                      <span className="font-bold text-[#3E2A1E] block">بيانات العميل:</span>
                      <p className="text-[#3E2A1E] font-medium">{order.customerName}</p>
                      <p className="text-[#8A6F5C] font-mono" dir="ltr">{order.customerPhone}</p>
                    </div>

                    <div className="p-3 bg-[#FDF6EE]/60 rounded-xl space-y-1">
                      <span className="font-bold text-[#3E2A1E] block">نوع الاستلام:</span>
                      <p className="font-medium text-[#3E2A1E]">
                        {order.fulfillmentType === 'delivery' ? 'توصيل إلى الموقع' : 'استلام من الفرع'}
                      </p>
                      {order.fulfillmentType === 'delivery' && (
                        <p className="text-[#8A6F5C] truncate">{order.deliveryAddress}</p>
                      )}
                    </div>

                    <div className="p-3 bg-[#FDF6EE]/60 rounded-xl space-y-1">
                      <span className="font-bold text-[#3E2A1E] block">المبلغ:</span>
                      <p className="font-bold text-sm text-[#C98457]">{order.total} ر.س</p>
                      {order.deliveryFee > 0 && (
                        <p className="text-[11px] text-[#8A6F5C]">
                          (يشمل توصيل: {order.deliveryFee} ر.س)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="pt-2 border-t border-[#F3D5B8]/40">
                    <div className="text-xs font-bold text-[#8A6F5C] mb-2">الأصناف المطلوبة:</div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((i, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF6EE] border border-[#F3D5B8] rounded-lg text-xs text-[#3E2A1E]"
                        >
                          <span className="font-bold text-[#C98457]">{i.quantity}×</span>
                          <span>{i.name}</span>
                          <span className="text-[#8A6F5C]">({i.total} ر.س)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MENU ITEMS ================= */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#3E2A1E]">أصناف المخبوزات</h2>
              <p className="text-xs text-[#8A6F5C]">
                إضافة وتعديل وحذف أصناف القائمة وتحديد الأسعار وأوقات التحضير
              </p>
            </div>

            <div className="flex items-center gap-2">
              {items.length === 0 && (
                <button
                  onClick={handleQuickSeedBakery}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FDF6EE] border border-[#E2984C] text-[#C98457] text-xs font-bold hover:bg-[#F3D5B8]/40 transition-colors cursor-pointer"
                >
                  إضافة أصناف تجريبية لرقيش
                </button>
              )}
              <button
                onClick={openAddItemModal}
                disabled={categories.length === 0}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E2984C] text-[#FFFFFF] text-xs font-bold hover:bg-[#d68a3f] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف جديد</span>
              </button>
            </div>
          </div>

          {categories.length === 0 && (
            <div className="p-4 rounded-xl bg-[#FFF4E5] border border-[#FFE2B8] text-[#B25E00] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>يجب أولاً إضافة تصنيف واحد على الأقل من تبويب "التصنيفات" لتتمكن من إضافة أصناف.</span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-10 text-center">
              <Utensils className="w-10 h-10 text-[#C98457] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#3E2A1E] mb-1">لا توجد أصناف في القائمة</p>
              <p className="text-xs text-[#8A6F5C] mb-4">
                ابدأ بإضافة الأصناف أو اضغط على الزر أعلاه لتعبئة أصناف أولية جاهزة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.categoryId);
                return (
                  <div
                    key={item.id}
                    className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-4 flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-[#FDF6EE]">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.name}
                          fallbackText={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-bold text-sm text-[#3E2A1E]">{item.name}</h4>
                        <span className="font-bold text-sm text-[#C98457] shrink-0">
                          {item.price} ر.س
                        </span>
                      </div>
                      <p className="text-xs text-[#8A6F5C] line-clamp-2 mb-2">
                        {item.description || 'بدون وصف'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#8A6F5C] mb-3">
                        <span className="bg-[#FDF6EE] px-2 py-0.5 rounded border border-[#F3D5B8]">
                          {category?.name || 'تصنيف غير معروف'}
                        </span>
                        <span>{item.prepTimeMinutes} دقيقة تحضير</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F3D5B8]/60 flex items-center justify-between">
                      {/* Availability toggle */}
                      <button
                        onClick={() =>
                          updateMenuItem(item.id, { isAvailable: !item.isAvailable })
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-[#EBF5EC] text-[#37683A] border-[#C3E4C6]'
                            : 'bg-[#FBEAE8] text-[#9A3826] border-[#F4BEB7]'
                        }`}
                      >
                        {item.isAvailable ? 'متوفر' : 'غير متوفر'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1.5 rounded-lg text-[#8A6F5C] hover:text-[#3E2A1E] hover:bg-[#FDF6EE] cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الصنف "${item.name}"؟`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#8A6F5C] hover:text-[#C1543F] hover:bg-[#FBEAE8] cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: CATEGORIES ================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-5 shadow-2xs">
            <h3 className="font-bold text-base text-[#3E2A1E] mb-3">إضافة تصنيف جديد</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="مثال: مخبوزات فرنسية، كيك، قهوة ومشروبات..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-xs hover:bg-[#d68a3f] transition-colors cursor-pointer shrink-0"
              >
                إضافة تصنيف
              </button>
            </form>
          </div>

          <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-5 shadow-2xs">
            <h3 className="font-bold text-base text-[#3E2A1E] mb-4">التصنيفات الحالية</h3>
            {categories.length === 0 ? (
              <p className="text-xs text-[#8A6F5C]">لا توجد تصنيفات مضافة بعد.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FDF6EE]/60 border border-[#F3D5B8]"
                  >
                    {editingCategory?.id === cat.id ? (
                      <div className="flex items-center gap-2 flex-1 ml-3">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          className="px-2 py-1 border rounded-lg text-xs"
                        />
                        <button
                          onClick={async () => {
                            await updateCategory(cat.id, { name: editingCategory.name });
                            setEditingCategory(null);
                          }}
                          className="p-1 text-[#5E8C61]"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 text-[#C1543F]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-sm text-[#3E2A1E]">{cat.name}</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCategory(cat.id, { isActive: !cat.isActive })
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${
                          cat.isActive
                            ? 'bg-[#EBF5EC] text-[#37683A] border-[#C3E4C6]'
                            : 'bg-[#FBEAE8] text-[#9A3826] border-[#F4BEB7]'
                        }`}
                      >
                        {cat.isActive ? 'مفعل' : 'معطل'}
                      </button>

                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-1 text-[#8A6F5C] hover:text-[#3E2A1E] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف تصنيف "${cat.name}"؟`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1 text-[#8A6F5C] hover:text-[#C1543F] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: RESTAURANT & WHATSAPP SETTINGS ================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {settingsFeedback && (
            <div className="p-3 rounded-xl bg-[#EBF5EC] border border-[#C3E4C6] text-[#37683A] text-sm font-bold">
              {settingsFeedback}
            </div>
          )}

          {/* WhatsApp Settings */}
          <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-[#3E2A1E] pb-2 border-b border-[#F3D5B8]/60">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>إعدادات أرقام الواتساب للطلبات</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  رقم واتساب مخبز رقيش (لطلبات الاستلام من الفرع)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={settingsForm.restaurantWhatsapp}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantWhatsapp: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                  placeholder="0538548964"
                />
                <span className="text-[11px] text-[#8A6F5C]">
                  الرقم الافتراضي: 0538548964
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  رقم واتساب مندوب التوصيل (لطلبات التوصيل)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={settingsForm.courierWhatsapp}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, courierWhatsapp: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                  placeholder="+966538490563"
                />
                <span className="text-[11px] text-[#8A6F5C]">
                  الرقم الافتراضي: +966538490563
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                رسوم التوصيل (بالريال السعودي SAR)
              </label>
              <input
                type="number"
                min="0"
                value={settingsForm.deliveryFee}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })
                }
                className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                placeholder="15"
              />
              <span className="text-[11px] text-[#8A6F5C] block mt-1">
                الافتراضي: 15 ر.س
              </span>
            </div>
          </div>

          {/* Restaurant Profile & Branch Info */}
          <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-[#3E2A1E] pb-2 border-b border-[#F3D5B8]/60">
              <Store className="w-5 h-5 text-[#C98457]" />
              <span>بيانات مخبز رقيش والفرع</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  اسم المخبز بالعربي
                </label>
                <input
                  type="text"
                  value={settingsForm.nameArabic}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, nameArabic: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  اسم المخبز باللاتيني
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={settingsForm.nameLatin}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, nameLatin: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                الوصف التعريفي بالمخبز
              </label>
              <textarea
                rows={2}
                value={settingsForm.description}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  ساعات العمل (نص العرض للعملاء)
                </label>
                <input
                  type="text"
                  value={settingsForm.openingHoursText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, openingHoursText: e.target.value })
                  }
                  placeholder="يومياً من ٧:٠٠ ص حتى ١١:٠٠ م"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  حالة استقبال الطلبات
                </label>
                <select
                  value={settingsForm.isOpen ? 'open' : 'closed'}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, isOpen: e.target.value === 'open' })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E] bg-[#FFFFFF]"
                >
                  <option value="open">مفتوح لاستقبال الطلبات</option>
                  <option value="closed">مغلق حالياً</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  اسم الفرع
                </label>
                <input
                  type="text"
                  value={settingsForm.branchName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, branchName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  عنوان الفرع
                </label>
                <input
                  type="text"
                  value={settingsForm.branchAddress}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, branchAddress: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>
            </div>

            {/* Logo Rule Note */}
            <div className="p-3 bg-[#FDF6EE] border border-[#F3D5B8] rounded-xl text-xs text-[#8A6F5C]">
              * شعار رقيش المعتمد مستخرج بدقة من الملف المرفق ويُستخدم بشكل ثابت في كافة أجزاء الموقع والتطبيق وفقاً لهوية العلامة التجارية.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="min-h-[44px] px-8 py-3 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-sm hover:bg-[#d68a3f] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? 'جارٍ حفظ الإعدادات...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      )}

      {/* ================= MODAL: ADD / EDIT ITEM ================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsItemModalOpen(false)}
            className="fixed inset-0 bg-[#3E2A1E]/50 backdrop-blur-xs"
          ></div>

          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#F3D5B8] p-6 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3D5B8]">
              <h3 className="font-bold text-base text-[#3E2A1E]">
                {editingItem ? 'تعديل صنف' : 'إضافة صنف جديد للقائمة'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-[#8A6F5C] hover:text-[#3E2A1E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  اسم الصنف <span className="text-[#C1543F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="مثال: بريوش الزعفران، خبز باجيت..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  التصنيف <span className="text-[#C1543F]">*</span>
                </label>
                <select
                  required
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E] bg-[#FFFFFF]"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                    السعر (ر.س) <span className="text-[#C1543F]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                    وقت التحضير (دقيقة)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.prepTimeMinutes}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        prepTimeMinutes: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-sm text-[#3E2A1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3E2A1E] mb-1">
                  وصف الصنف والمكونات
                </label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  placeholder="وصف مختصر لمذاق ومكونات المخبوز..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-xs text-[#3E2A1E]"
                />
              </div>

              {/* Image Input: Direct File Upload + URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#3E2A1E]">
                  صورة الصنف
                </label>

                {/* Direct File Upload button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#F3D5B8] hover:border-[#E2984C] bg-[#FDF6EE]/60 hover:bg-[#FDF6EE] text-[#C98457] hover:text-[#3E2A1E] font-bold text-xs transition-colors cursor-pointer">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E2984C]" />
                        <span>جاري معالجة الصورة...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#E2984C]" />
                        <span>رفع صورة من جهازك مباشرة (موصى به)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={isUploadingImage}
                      className="sr-only"
                    />
                  </label>
                </div>

                {imageUploadError && (
                  <p className="text-[11px] text-[#C1543F] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{imageUploadError}</span>
                  </p>
                )}

                {/* Or paste link */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8A6F5C] mb-1">
                    <span>أو إدخال رابط الصورة يدوياً (URL):</span>
                    {itemForm.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setItemForm((prev) => ({ ...prev, imageUrl: '' }))}
                        className="text-[#C1543F] hover:underline cursor-pointer"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={itemForm.imageUrl}
                    onChange={async (e) => {
                      const raw = e.target.value;
                      const extracted = normalizeImageUrl(raw);
                      setItemForm((prev) => ({ ...prev, imageUrl: extracted }));

                      // If user pasted an ibb.co page link or similar, automatically resolve in background
                      if (extracted.includes('ibb.co/') && !extracted.includes('i.ibb.co/')) {
                        try {
                          const direct = await resolveDirectImageUrl(extracted);
                          if (direct && direct !== extracted) {
                            setItemForm((prev) => ({ ...prev, imageUrl: direct }));
                          }
                        } catch (err) {
                          // ignore
                        }
                      }
                    }}
                    placeholder="الصق الرابط أو الكود مباشرة هنا"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F3D5B8] focus:border-[#E2984C] outline-none text-xs text-[#3E2A1E]"
                  />
                  {itemForm.imageUrl?.includes('i.ibb.co/') && (
                    <p className="text-[11px] text-[#2F6B38] bg-[#EBF5EC] p-1.5 rounded-lg mt-1 border border-[#C5E5C9] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم استخراج وتجهيز رابط الصورة المباشر بنجاح!</span>
                    </p>
                  )}
                </div>

                {/* Live Image Preview */}
                {itemForm.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2.5 bg-[#FDF6EE] rounded-xl border border-[#F3D5B8]">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#F3D5B8] shrink-0">
                      <SafeImage
                        src={itemForm.imageUrl}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] text-[#8A6F5C] space-y-0.5">
                      <span className="font-bold text-[#3E2A1E] block">معاينة حية لصورة الصنف</span>
                      <span>تأكد من وضوح الصورة وتناسقها مع المخبوزات</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability check */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={itemForm.isAvailable}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#E2984C] cursor-pointer"
                />
                <label htmlFor="availCheck" className="text-xs font-bold text-[#3E2A1E] cursor-pointer">
                  متوفر للطلب في المتجر
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F3D5B8]">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#F3D5B8] text-xs font-bold text-[#8A6F5C] hover:bg-[#FDF6EE] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-xs hover:bg-[#d68a3f] cursor-pointer"
                >
                  {editingItem ? 'حفظ التعديلات' : 'إضافة إلى القائمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
