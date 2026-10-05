import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Leaf, ShoppingCart, Star } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useLanguage } from '../../../context/LanguageContext';

export const ProductCard = ({ product }) => {
  const { addToCart, activeRole } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const stockQuantity = Number(product.stock_quantity ?? product.stockQuantity ?? 0);
  const categoryName = product.category_name || product.categoryName || product.category?.name || 'Farm goods';
  const price = Number(product.price || 0);
  const sellerName = product.seller_name || product.seller?.displayName || product.seller?.username || 'Local farm';
  const rating = Number(product.rating || 0);
  const handleAddToCart = () => {
    if (activeRole === 'GUEST') {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (activeRole === 'BUYER') addToCart(product);
  };
  const addLabel = activeRole === 'GUEST'
    ? t('prodSignInToAdd')
    : activeRole === 'BUYER'
      ? t('prodAddToCart')
      : t('prodBuyerRequired');

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#e6e9e1] bg-white transition duration-200 hover:border-[#98ad8e] hover:shadow-[0_18px_42px_-28px_rgba(35,60,41,0.42)]">
      <Link to={`/products/${product.id}`} className="relative block aspect-[1.18] overflow-hidden bg-[#eff2e9]">
        {product.image_url || product.imageUrl ? (
          <img src={product.image_url || product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#78936f]"><Leaf className="h-10 w-10" /></div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-[#315a36] shadow-sm"><Leaf className="h-3.5 w-3.5" /> {product.is_organic ? t('prodOrganic') : t('prodFarmFresh')}</span>
        <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-white text-[#315a36] shadow-sm transition group-hover:bg-[#285331] group-hover:text-white" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#74806f]">
          <span className="truncate">{categoryName}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[#916f2f]"><Star className={`h-3.5 w-3.5 ${rating > 0 ? 'fill-current' : 'text-[#cbd1c6]'}`} /> {rating > 0 ? `${rating.toFixed(1)}${product.reviews_count ? ` (${product.reviews_count})` : ''}` : t('prodNew')}</span>
        </div>
        <Link to={`/products/${product.id}`} className="mt-1 block">
          <h2 className="line-clamp-1 text-[17px] font-bold text-[#24392b] transition hover:text-[#416441]">{product.name}</h2>
        </Link>
        <p className="mt-1.5 line-clamp-1 text-xs text-[#778176]">{t('prodGrownBy')} {sellerName}</p>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#69736a]">{product.description || 'Fresh from local farms and ready for your table.'}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-[#edf0ea] pt-3.5">
            <div>
              <p className="text-xl font-bold leading-none text-[#24392b]">${price.toFixed(2)}<span className="ml-1 text-xs font-medium text-[#778176]">/ {product.unit || 'item'}</span></p>
              <p className="mt-2 text-[11px] text-[#778176]">{stockQuantity > 0 ? t('prodAvailableCount').replace('{count}', String(stockQuantity)).replace('{unit}', product.unit || t('prodUnitItem')) : t('prodUnavailable')}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stockQuantity <= 0 || (activeRole !== 'BUYER' && activeRole !== 'GUEST')}
              aria-label={`${addLabel}: ${product.name}`}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#285331] px-3.5 text-xs font-bold text-white transition hover:bg-[#1c4228] disabled:cursor-not-allowed disabled:bg-[#9aa69a]"
              title={stockQuantity > 0 ? addLabel : t('prodUnavailable')}
            >
              <ShoppingCart className="h-4 w-4" /><span>{addLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
