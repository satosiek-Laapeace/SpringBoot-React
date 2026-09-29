import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, ChevronDown, Tag } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useStore();
  const [selectedUnit, setSelectedUnit] = useState(product.unit);
  const [selectedDiscount, setSelectedDiscount] = useState(product.discount || 'Discount');

  const isActive = product.status === 'Published';

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row overflow-hidden p-4 gap-4">
      
      {/* Product Image Thumbnail */}
      <div className="relative w-full sm:w-44 h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.is_organic && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white shadow">
            🌱 Organic
          </span>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          
          <div className="flex items-center justify-between">
            <Link to={`/products/${product.id}`}>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Active / Inactive Badge (Matching media_1790674967645.png) */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-300 dark:border-emerald-800'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 border-purple-300 dark:border-purple-800'
            }`}>
              <CheckCircle className="w-3 h-3" />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            Fresh, seasonal ingredients crafted for a light and refreshing dining experience.
          </p>
        </div>

        {/* Dropdown Selectors & Action Bar */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Price & Discount Dropdown Controls */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2 flex-1">
              <span>Price: ${product.price.toFixed(0)}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2">
              <span>{product.discount || 'Discount'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Rating & Published Menu Action Button (Exact green pill from media_1790674967645.png) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal text-[11px]">
                ({product.reviews_count} Reviews)
              </span>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-95 whitespace-nowrap"
            >
              Published Menu
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
