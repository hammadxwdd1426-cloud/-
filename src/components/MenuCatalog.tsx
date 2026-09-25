import React, { useState } from 'react';
import { MenuCategory, MenuItem } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { UtensilsCrossed } from 'lucide-react';

interface MenuCatalogProps {
  categories: MenuCategory[];
  items: MenuItem[];
  onOpenAdmin: () => void;
  onSelectItem: (item: MenuItem) => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  categories,
  items,
  onOpenAdmin,
  onSelectItem,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const activeCategories = categories.filter((c) => c.isActive);

  const filteredItems = items.filter((item) => {
    if (selectedCategoryId === 'all') return true;
    return item.categoryId === selectedCategoryId;
  });

  return (
    <section id="menu-section" className="max-w-6xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C98457] mb-1">
            <span className="w-2 h-2 rounded-xs bg-[#E2984C] rotate-45"></span>
            <span>قائمتنا المختارة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3E2A1E]">
            مخبوزات رقيش الطازجة
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#8A6F5C]">
          اضغط على أي صنف لعرض تفاصيله الكاملة والطلب
        </p>
      </div>

      {/* Category Pills Navigation */}
      {activeCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold shrink-0 transition-all duration-150 cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
                : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
            }`}
          >
            الكل ({items.length})
          </button>

          {activeCategories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-bold shrink-0 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E2984C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#3E2A1E] border border-[#F3D5B8] hover:bg-[#FDF6EE]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Products Grid or Empty State */}
      {items.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-10 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF6EE] border border-[#F3D5B8] text-[#C98457] flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#3E2A1E] mb-2">
            القائمة فارغة حالياً
          </h3>
          <p className="text-xs sm:text-sm text-[#8A6F5C] leading-relaxed mb-6">
            لم يتم إضافة أصناف ومخبوزات للقائمة بعد. يمكن لمدير المتجر إضافة الأصناف وتصنيفاتها وصورها بسهولة عبر لوحة الإدارة.
          </p>
          <button
            onClick={onOpenAdmin}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#E2984C] text-[#FFFFFF] font-bold text-sm shadow-xs hover:bg-[#d68a3f] transition-colors cursor-pointer"
          >
            إضافة أصناف من لوحة الإدارة
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#F3D5B8] rounded-2xl p-8 text-center max-w-md mx-auto">
          <p className="text-sm font-medium text-[#8A6F5C]">
            لا توجد أصناف في هذا التصنيف حالياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onSelectItem={onSelectItem} />
          ))}
        </div>
      )}
    </section>
  );
};
