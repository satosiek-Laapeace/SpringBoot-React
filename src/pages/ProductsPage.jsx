import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../features/products/components/ProductCard';

export const ProductsPage = () => {
  const { products, categories } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      product.category_name.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar (Matching media_1790674967645.png) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight">
            Products Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Browse organic fresh produce, seasonal harvests, seeds, and smart farming tools.
          </p>
        </div>

        {/* Date Selector & Export CSV */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>15 Mar, 2026 - 21 Mar 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search products by title, code (#0012)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Products
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.categories_name); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat.categories_name
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{cat.icon_url}</span>
                <span>{cat.categories_name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2-Column Grid (Matching media_1790674967645.png layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom Pagination Controls (Matching media_1790674967645.png bottom bar) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
        
        <div>
          Page {currentPage} of 16
        </div>

        {/* Numeric Pagination Bar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full font-bold transition-all ${
                currentPage === page
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {page}
            </button>
          ))}

          <span className="px-1 text-slate-400 font-bold">-</span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Data Per Row Indicator Dropdown */}
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
          <span>8 data per row</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

      </div>

    </div>
  );
};
