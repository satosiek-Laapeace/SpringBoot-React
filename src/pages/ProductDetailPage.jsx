import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  CheckCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  ArrowLeft,
  Boxes,
  BadgeCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fetchProductAPI, fetchProductImagesAPI } from '../features/products/services/productApi';
import { createReviewAPI, fetchAllProductReviewsAPI } from '../features/reviews/services/reviewApi';
import { normalizeProduct } from '../features/products/utils/normalizeProduct';
import { useLanguage } from '../context/LanguageContext';
import { Pagination } from '../components/common/Pagination';
import { usePagination } from '../hooks/usePagination';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, addToCart, stockMovements, activeRole } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const localProduct = products.find((item) => String(item.id) === String(id));
  const [product, setProduct] = useState(localProduct ? normalizeProduct(localProduct) : null);
  const [gallery, setGallery] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('REVIEWS'); // REVIEWS | MOVEMENTS | SPECS
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const handleAddToCart = () => {
    if (activeRole === 'GUEST') {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (activeRole === 'BUYER') addToCart(product, quantity);
  };

  useEffect(() => {
    let isCurrent = true;
    setQuantity(1);
    setIsLoading(true);
    setLoadError('');

    Promise.allSettled([
      fetchProductAPI(id),
      fetchProductImagesAPI(id),
      fetchAllProductReviewsAPI(id),
    ]).then(([productResult, imageResult, reviewResult]) => {
      if (!isCurrent) return;
      const source = productResult.status === 'fulfilled' ? productResult.value : localProduct;
      if (source) {
        const normalized = normalizeProduct(source);
        setProduct(normalized);
        const imageRecords = imageResult.status === 'fulfilled' && Array.isArray(imageResult.value)
          ? imageResult.value
          : [];
        const nextGallery = [
          ...imageRecords.map((image) => typeof image === 'string' ? image : image.imageUrl || image.image_url),
          ...(Array.isArray(source.images) ? source.images : []),
          normalized.image_url,
        ].filter(Boolean).filter((image, index, all) => all.indexOf(image) === index);
        setGallery(nextGallery);
        setActiveImage(nextGallery[0] || '');
      } else {
        setProduct(null);
        setLoadError(productResult.status === 'rejected' ? productResult.reason.message : 'This product could not be found.');
      }
      if (reviewResult.status === 'fulfilled' && Array.isArray(reviewResult.value)) {
        setProductReviews(reviewResult.value);
      } else {
        setProductReviews([]);
      }
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });

    return () => { isCurrent = false; };
  }, [id, localProduct]);

  const productMovements = useMemo(() => stockMovements.filter((movement) => String(movement.product_id ?? movement.productId) === String(id)), [stockMovements, id]);
  const reviewPage = usePagination(productReviews);
  const movementPage = usePagination(productMovements);
  const averageRating = useMemo(() => productReviews.length
    ? productReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / productReviews.length
    : Number(product?.rating || 0), [productReviews, product?.rating]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewError('');
    try {
      const review = await createReviewAPI({ productId: product.id, rating: newRating, comment: newComment.trim() });
      setProductReviews((current) => [review, ...current]);
      setNewComment('');
    } catch (error) {
      setReviewError(error.message || 'Your review could not be submitted.');
    }
  };

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center bg-[#fbfcf8] text-[#315a36]"><Loader2 className="h-7 w-7 animate-spin" aria-label="Loading product" /></div>;
  }

  if (!product) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-bold text-[#24392b]">Product unavailable</h1><p className="mt-2 text-sm text-[#69736a]">{loadError || 'This product could not be found.'}</p><Link to="/products" className="mt-5 inline-flex items-center gap-2 bg-[#285331] px-4 py-3 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" /> Back to market</Link></div>;
  }

  const seller = product.seller || {};
  const sellerName = seller.displayName || seller.username || product.seller_name || 'Local grower';
  const sellerJoined = seller.createdAt ? new Date(seller.createdAt).getFullYear() : null;

  return (
    <div className="min-h-full bg-[#fbfcf8] px-4 py-8 text-[#26352a] sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1320px] space-y-8">
      
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#718071] hover:text-[#315a36] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to the market</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        
        {/* Product Image Gallery */}
        <div className="space-y-3">
          <div className="group relative aspect-[1.08] overflow-hidden bg-[#eff2e9]">
            {activeImage ? <img src={activeImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#78936f]"><Boxes className="h-14 w-14" /></div>}
            {product.is_organic && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 bg-white/95 px-3 py-2 text-xs font-bold text-[#315a36] shadow-sm">
                <BadgeCheck className="h-4 w-4" /> Organic harvest
              </span>
            )}
            {gallery.length > 1 && <div className="absolute inset-y-0 flex w-full items-center justify-between px-3 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <button type="button" onClick={() => setActiveImage(gallery[(gallery.indexOf(activeImage) - 1 + gallery.length) % gallery.length])} aria-label="Previous product image" className="grid h-10 w-10 place-items-center bg-white/95 text-[#315a36] shadow"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => setActiveImage(gallery[(gallery.indexOf(activeImage) + 1) % gallery.length])} aria-label="Next product image" className="grid h-10 w-10 place-items-center bg-white/95 text-[#315a36] shadow"><ChevronRight className="h-5 w-5" /></button>
            </div>}
          </div>
          {gallery.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
            {gallery.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(image)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === image} className={`h-20 w-20 shrink-0 overflow-hidden border-2 ${activeImage === image ? 'border-[#315a36]' : 'border-transparent'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
          </div>}
        </div>

        {/* Product Specs & Add to Basket Panel */}
        <div className="space-y-5">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#788477]">
              <span className="uppercase tracking-wider">{product.category_name}</span>
              <span className="font-mono">Item {product.code}</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-[#24392b] sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-[#ba8b39]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-[#d5d9cf]'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-[#344635]">
                {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              </span>
              <span className="text-xs text-[#788477] font-medium">
                {productReviews.length} customer {productReviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="flex items-baseline justify-between border-y border-[#e3e9df] bg-[#f1f5ed] px-4 py-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Market Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#315a36]">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-[#69736a]">/ {product.unit}</span>
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

          <p className="text-sm leading-6 text-[#69736a]">
            {product.description}
          </p>

          {/* Stock Status Badge */}
          <div className="flex items-center justify-between gap-3 border-y border-[#e3e9df] py-3 text-sm">
            <span className="font-semibold text-[#69736a]">Availability</span>
            <span className={`inline-flex items-center gap-1.5 font-bold ${product.stock_quantity > 0 ? 'text-[#315a36]' : 'text-[#a34b3f]'}`}>
              <CheckCircle className="h-4 w-4" />
              {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit} available` : 'Currently unavailable'}
            </span>
          </div>

          {/* Quantity Selector & Add Button */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#536453]">
              Quantity ({product.unit})
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#dfe5db] bg-white p-1">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                  className="p-2 text-[#69736a] hover:text-[#24392b]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-10 px-3 text-center text-sm font-bold text-[#24392b]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock_quantity, prev + 1))}
                  aria-label="Increase quantity"
                  className="p-2 text-[#69736a] hover:text-[#24392b]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0 || (activeRole !== 'BUYER' && activeRole !== 'GUEST')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#285331] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c4228] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9aa69a]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{activeRole === 'BUYER' ? `${t('prodAddToCart')} - $${(product.price * quantity).toFixed(2)}` : activeRole === 'GUEST' ? t('prodSignInToAdd') : t('prodBuyerRequired')}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-[#5d6b5e]">
            <div className="flex items-center gap-2 border-r border-[#e3e9df] pr-3">
              <Truck className="h-4 w-4 shrink-0 text-[#557b52]" />
              <span>Cold Fleet Van Delivery Slot</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#557b52]" />
              <span>Farm Direct Fresh Guarantee</span>
            </div>
          </div>

        </div>
      </div>

      <section aria-labelledby="seller-heading" className="grid gap-5 border-y border-[#e3e9df] py-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-4">
          {seller.profilePictureUrl ? (
            <img src={seller.profilePictureUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e8eee3] text-lg font-bold text-[#315a36]">{sellerName.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a7134]">Meet the grower</p>
            <h2 id="seller-heading" className="mt-1 text-lg font-bold text-[#24392b]">{sellerName}</h2>
            <p className="mt-1 text-xs text-[#718071]">{seller.username ? `@${seller.username} · ` : ''}{seller.role === 'SELLER' ? 'FarmCraft seller' : 'Independent farm partner'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#edf0ea] pt-4 text-xs text-[#5d6b5e] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#557b52]" /> Seller account</span>
          {sellerJoined && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#9a7134]" /> Member since {sellerJoined}</span>}
        </div>
      </section>

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
                reviewPage.paginatedItems.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {rev.buyerName || rev.buyer_name || (rev.buyerId ? `Buyer #${rev.buyerId}` : 'FarmCraft buyer')}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{rev.createdAt || rev.created_at ? new Date(rev.createdAt || rev.created_at).toLocaleDateString() : ''}</span>
                  </div>
                ))
              )}
              <Pagination currentPage={reviewPage.currentPage} pageCount={reviewPage.pageCount} totalItems={reviewPage.totalItems} pageSize={reviewPage.pageSize} onPageChange={reviewPage.setCurrentPage} onPageSizeChange={reviewPage.setPageSize} t={t} />
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Write a Product Review</h4>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                {reviewError && <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{reviewError}</p>}
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
                  movementPage.paginatedItems.map(m => (
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
            <Pagination currentPage={movementPage.currentPage} pageCount={movementPage.pageCount} totalItems={movementPage.totalItems} pageSize={movementPage.pageSize} onPageChange={movementPage.setCurrentPage} onPageSizeChange={movementPage.setPageSize} t={t} />
          </div>
        )}

      </div>

    </div>
    </div>
  );
};
