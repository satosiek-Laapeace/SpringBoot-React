import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export const CartPage = () => {
  const {
    cart,
    activeRole,
    products,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
  } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const cartProducts = cart
    .map((item) => ({
      item,
      product: products.find((product) => product.id === item.product_id),
    }));
  const hasUnavailableItems = cartProducts.some(({ product }) => !product);
  const itemCount = getCartCount();
  const subtotal = getCartTotal();

  if (activeRole !== 'BUYER' || cart.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-[90%] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          {activeRole === 'BUYER' ? t('cartBasket') : t('cartBuyerRequired')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {activeRole === 'BUYER' ? t('cartEmptyTitle') : t('cartNotAuthorizedTitle')}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {activeRole === 'BUYER'
            ? t('cartEmptyDescription')
            : activeRole === 'GUEST'
              ? t('cartGuestDescription')
              : t('cartRoleDescription')}
        </p>
        <Link
          to={activeRole === 'GUEST' ? '/login' : '/products'}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          {activeRole === 'GUEST' ? t('cartSignIn') : t('cartExploreMarketplace')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-[#f7f9f7] py-8 dark:bg-[#0b1220] sm:py-12">
      <div className="mx-auto w-[90%] max-w-7xl px-1 sm:px-2">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/products"
              className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('cartContinueShopping')}
            </Link>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              {t('cartBasket')}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('cartShoppingCart')}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {(itemCount === 1 ? t('cartItemSelected') : t('cartItemsSelected')).replace('{count}', String(itemCount))}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300 sm:self-auto">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
              <Check className="h-3 w-3" />
            </span>
            {t('cartFreshFromFarms')}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <section aria-label={t('cartShoppingCart')} className="space-y-4">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px] items-center px-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
              <span>{t('cartProduct')}</span>
              <span className="text-center">{t('cartQuantity')}</span>
              <span className="text-right">{t('cartSubtotal')}</span>
            </div>

            {cartProducts.map(({ item, product }) => {
              if (!product) {
                return (
                  <article
                    key={item.product_id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <ShoppingBag className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {t('cartUnavailableProduct')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {t('cartRemoveToCheckout')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('cartRemove')}
                    </button>
                  </article>
                );
              }

              return (
                <article
                  key={item.product_id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900 sm:p-5"
                >
                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_120px_110px]">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-24 sm:w-24">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-emerald-700 dark:text-emerald-300">
                            <Leaf className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        {product.category_name && (
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            {product.category_name}
                          </p>
                        )}
                        <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                          {product.name}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          ${product.price.toFixed(2)} / {product.unit}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400 sm:hidden"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('cartRemove')}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-center">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                        {t('cartQuantity')}
                      </span>
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                        <button
                          type="button"
                          aria-label={item.quantity <= 1 ? `${t('cartRemove')} ${product.name}` : `Decrease ${product.name} quantity`}
                          title={item.quantity <= 1 ? t('cartRemove') : t('cartQuantity')}
                          onClick={() => item.quantity <= 1
                            ? removeFromCart(product.id)
                            : updateCartQuantity(product.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${product.name} quantity`}
                          onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 sm:block sm:border-0 sm:pt-0 sm:text-right">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                        {t('cartSubtotal')}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          ${(product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="mt-1 hidden text-xs font-medium text-slate-400 transition hover:text-rose-600 dark:hover:text-rose-400 sm:inline-flex sm:items-center sm:gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {t('cartRemove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs dark:border-emerald-900/70 dark:bg-emerald-950/30">
              <p className="flex items-center gap-2 font-medium text-emerald-900 dark:text-emerald-200">
                <Leaf className="h-4 w-4 shrink-0" />
                {t('cartEveryOrderFresh')}
              </p>
              <span className="shrink-0 font-bold text-emerald-700 dark:text-emerald-300">{t('cartFreeDelivery')}</span>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-28">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('cartOrderSummary')}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {(itemCount === 1 ? t('cartItemSelected') : t('cartItemsSelected')).replace('{count}', String(itemCount))}
              </span>
            </div>

            <div className="space-y-3 border-b border-slate-100 pb-5 text-sm dark:border-slate-800">
              <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
                <span>{t('cartSubtotal')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
                <span>{t('cartDelivery')}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{t('cartFree')}</span>
              </div>
            </div>

            <div className="flex items-end justify-between py-5">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('sellerTotal')}</p>
                <p className="mt-1 text-[11px] text-slate-400">{t('cartTaxesCheckout')}</p>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ${subtotal.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              disabled={hasUnavailableItems}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:focus:ring-offset-slate-900 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {t('cartProceedCheckout')}
              <ArrowRight className="h-4 w-4" />
            </button>
            {hasUnavailableItems && (
              <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-300">
                {t('cartRemoveUnavailable')}
              </p>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('cartClear')}
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400 dark:border-slate-800">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {t('cartSecureCheckout')}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
