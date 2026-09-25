import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuCatalog } from './components/MenuCatalog';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BranchSection } from './components/BranchSection';
import { OrderHistory } from './components/OrderHistory';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartToastNotification } from './components/CartToastNotification';
import {
  RestaurantProfile,
  DEFAULT_RESTAURANT_PROFILE,
  MenuCategory,
  MenuItem
} from './types';
import {
  subscribeRestaurantProfile,
  subscribeCategories,
  subscribeMenuItems
} from './services/dataService';
import { testConnection } from './lib/firebase';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<RestaurantProfile>(DEFAULT_RESTAURANT_PROFILE);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'store' | 'history' | 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'history' | 'admin'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Selected item for Full Product View Modal
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Initialize and subscribe to Firestore
  useEffect(() => {
    testConnection();

    const unsubProfile = subscribeRestaurantProfile((data) => {
      setProfile(data);
      setIsLoading(false);
    });

    const unsubCategories = subscribeCategories((data) => {
      setCategories(data);
    });

    const unsubItems = subscribeMenuItems((data) => {
      setItems(data);
    });

    return () => {
      unsubProfile();
      unsubCategories();
      unsubItems();
    };
  }, []);

  const handleBrowseMenu = () => {
    setCurrentView('store');
    setTimeout(() => {
      const el = document.getElementById('menu-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const selectedCategory = categories.find((c) => c.id === selectedProduct?.categoryId);

  return (
    <AuthProvider>
      <CartProvider>
        <div dir="rtl" className="min-h-screen bg-[#FDF6EE] text-[#3E2A1E] font-sans flex flex-col selection:bg-[#F3D5B8] selection:text-[#3E2A1E]">
          {/* Main Top Header */}
          <Header
            profile={profile}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateHome={() => setCurrentView('store')}
            onNavigateHistory={() => setCurrentView((prev) => (prev === 'history' ? 'store' : 'history'))}
            onNavigateAdmin={() => setCurrentView((prev) => (prev === 'admin' ? 'store' : 'admin'))}
            isAdminView={currentView === 'admin'}
          />

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#F3D5B8] p-2 flex items-center justify-center mb-4 shadow-sm animate-pulse">
                <img src="/rgesh-logo.png" alt="RGESH" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2 text-[#C98457] font-bold text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#E2984C]" />
                <span>مرحباً بك في رقيش... جاري تحميل المتجر</span>
              </div>
            </div>
          ) : currentView === 'admin' ? (
            <main className="flex-1">
              <AdminDashboard
                profile={profile}
                categories={categories}
                items={items}
                onExit={() => setCurrentView('store')}
              />
            </main>
          ) : currentView === 'history' ? (
            <main className="flex-1">
              <div className="max-w-4xl mx-auto px-4 pt-6">
                <button
                  onClick={() => setCurrentView('store')}
                  className="text-xs font-bold text-[#E2984C] hover:text-[#d68a3f] flex items-center gap-1 cursor-pointer mb-2"
                >
                  ← العودة لقائمة المتجر
                </button>
              </div>
              <OrderHistory
                restaurantWhatsapp={profile.restaurantWhatsapp}
                courierWhatsapp={profile.courierWhatsapp}
              />
            </main>
          ) : (
            <main className="flex-1">
              {/* Hero Banner with literal logo */}
              <Hero profile={profile} onBrowseMenu={handleBrowseMenu} />

              {/* Menu Catalog */}
              <MenuCatalog
                categories={categories}
                items={items}
                onOpenAdmin={() => setCurrentView('admin')}
                onSelectItem={(item) => setSelectedProduct(item)}
              />

              {/* In-page Order History Section */}
              <div className="border-t border-[#F3D5B8]/60 mt-12 pt-4">
                <OrderHistory
                  restaurantWhatsapp={profile.restaurantWhatsapp}
                  courierWhatsapp={profile.courierWhatsapp}
                />
              </div>

              {/* Branch and Contact Section */}
              <BranchSection profile={profile} />
            </main>
          )}

          {/* Footer */}
          <footer className="bg-[#FFFFFF] border-t border-[#F3D5B8] py-8 px-4 text-center">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDF6EE] border border-[#F3D5B8] p-1 flex items-center justify-center">
                  <img src="/rgesh-logo.png" alt="RGESH" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-sm text-[#3E2A1E]">
                  {profile.nameArabic} | {profile.nameLatin}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#8A6F5C]">
                <button
                  onClick={() => setCurrentView('history')}
                  className="hover:text-[#E2984C] transition-colors cursor-pointer"
                >
                  سجل طلباتي
                </button>
                <span>•</span>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="hover:text-[#E2984C] transition-colors cursor-pointer"
                >
                  بوابة الإدارة
                </button>
              </div>

              <div className="text-xs text-[#8A6F5C]">
                جميع الحقوق محفوظة لمخبز رقيش © {new Date().getFullYear()}
              </div>
            </div>
          </footer>

          {/* Full Product Detail Modal */}
          <ProductDetailModal
            item={selectedProduct}
            category={selectedCategory}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOpenCart={() => {
              setSelectedProduct(null);
              setIsCartOpen(true);
            }}
          />

          {/* Floating Quick Toast Notification when adding an item */}
          <CartToastNotification
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Sliding Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />

          {/* Checkout & WhatsApp Order Modal */}
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            profile={profile}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
