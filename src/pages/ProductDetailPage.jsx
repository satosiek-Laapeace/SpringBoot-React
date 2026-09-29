import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  CheckCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  MessageSquare,
  ArrowLeft,
  Boxes,
  Tag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, addToCart, reviews, addReview, stockMovements } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('REVIEWS'); // REVIEWS | MOVEMENTS | SPECS
  
  // New Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const product = products.find(p => p.id === Number(id)) || products[0];
  const productReviews = reviews.filter(r => r.product_id === product.id);
  const productMovements = stockMovements.filter(m => m.product_id === product.id);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(product.id, newRating, newComment);
    setNewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products Marketplace</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 h-96 sm:h-[450px]">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_organic && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow">
                🌱 100% Organic Certified
              </span>
            )}
          </div>
        </div>

        {/* Product Specs & Add to Basket Panel */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">{product.category_name}</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Item Code: {product.code}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {product.rating}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({productReviews.length} Verified Reviews)
              </span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Market Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ {product.unit}</span>
                {product.original_price && (
                  <span className="text-xs text-slate-400 line-through">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {product.discount && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
                {product.discount}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Status Badge */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Availability:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              In Stock ({product.stock_quantity} {product.unit} available)
            </span>
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Quantity ({product.unit})
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock_quantity, prev + 1))}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Basket - ${(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Cold Fleet Van Delivery Slot</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Farm Direct Fresh Guarantee</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section: Reviews & Stock Movement Logs */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('REVIEWS')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'REVIEWS'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Customer Reviews ({productReviews.length})
          </button>
          
          <button
            onClick={() => setActiveTab('MOVEMENTS')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'MOVEMENTS'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stock Movement History Log
          </button>
        </div>

        {/* Tab Content: Reviews */}
        {activeTab === 'REVIEWS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Review List */}
            <div className="lg:col-span-7 space-y-4">
              {productReviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reviews yet for this harvest product.</p>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {rev.buyer_name}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Write a Product Review</h4>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent Harvest</option>
                    <option value={4}>⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value={3}>⭐⭐⭐ 3 - Average</option>
                    <option value={2}>⭐⭐ 2 - Below Expectations</option>
                    <option value={1}>⭐ 1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Your Review Comment
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share details about freshness, taste, or packaging..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow"
                >
                  Submit Review
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab Content: Stock Movements */}
        {activeTab === 'MOVEMENTS' && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Qty Change</th>
                  <th className="p-3">Remaining Stock</th>
                  <th className="p-3">Supplier / Ref</th>
                  <th className="p-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {productMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No stock movements logged for this product.</td>
                  </tr>
                ) : (
                  productMovements.map(m => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold">{m.type}</td>
                      <td className={`p-3 font-extrabold ${m.quantity_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </td>
                      <td className="p-3 font-semibold">{m.quantity_after} {product.unit}</td>
                      <td className="p-3 text-slate-400">{m.supplier_name || `Order #${m.reference_order_id}`}</td>
                      <td className="p-3 text-slate-500">{m.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
