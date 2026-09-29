import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartPage = () => {
  const { cart, products, updateCartQuantity, removeFromCart, getCartTotal, clearCart } = useStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-500 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Shopping Basket is Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore CraftFarm marketplace to add farm fresh vegetables, fruits, seeds, and smart irrigation tools.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
        >
          <span>Browse Marketplace Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
            Shopping Cart ({cart.length} Items)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review your harvest selections before proceeding to delivery slot selection.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const product = products.find(p => p.id === item.product_id);
            if (!product) return null;
            return (
              <div
                key={item.product_id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                />

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">{product.category_name}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">${product.price.toFixed(2)} per {product.unit}</p>
                </div>

                {/* Quantity Switcher */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right min-w-[100px]">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                    ${(product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-[11px] text-red-500 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h3>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery Fee</span>
              <span className="font-bold text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">${getCartTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Delivery & Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
