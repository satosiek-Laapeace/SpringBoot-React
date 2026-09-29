import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CheckoutPage = () => {
  const { addresses, cart, products, getCartTotal, createOrder } = useStore();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 101);
  const [selectedSlot, setSelectedSlot] = useState('Morning (8:00 AM - 11:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState('ABA KHQR');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Handle fresh harvest with temperature care.');

  const handlePlaceOrder = () => {
    const order = createOrder({
      address_id: selectedAddressId,
      delivery_slot: selectedSlot,
      payment_method: paymentMethod,
      delivery_instructions: deliveryInstructions
    });
    navigate(`/order-success/${order.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
          Order Checkout & Delivery
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select delivery address, fresh dispatch slot, and complete payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Address Selector (address_tbl) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Delivery Address (`address_tbl`)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {addr.city}, {addr.state}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {addr.street}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Zip: {addr.zip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Delivery Slot Picker (order_tbl.delivery_slot) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Fresh Cold Fleet Delivery Slot
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { slot: 'Morning (8:00 AM - 11:00 AM)', tag: 'Recommended for Produce' },
                { slot: 'Afternoon (1:00 PM - 4:00 PM)', tag: 'Standard Logistics' },
                { slot: 'Evening (5:00 PM - 8:00 PM)', tag: 'Express Delivery' }
              ].map((item) => (
                <button
                  key={item.slot}
                  type="button"
                  onClick={() => setSelectedSlot(item.slot)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedSlot === item.slot
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs block font-bold">{item.slot}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1">
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Method Selector (payment_tbl) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Payment Method (`payment_tbl`)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'ABA KHQR', name: 'ABA PAY / KHQR', icon: '📲', desc: 'Instant QR Scan' },
                { id: 'Credit Card', name: 'Visa / Mastercard', icon: '💳', desc: 'Secure Online Card' },
                { id: 'COD', name: 'Cash on Delivery', icon: '💵', desc: 'Pay Upon Arrival' }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 rounded-2xl border cursor-pointer text-center space-y-2 transition-all ${
                    paymentMethod === pm.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-2xl block">{pm.icon}</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{pm.name}</h4>
                  <p className="text-[10px] text-slate-400">{pm.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Order Summary & Confirm */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Summary</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map(item => {
              const p = products.find(prod => prod.id === item.product_id);
              if (!p) return null;
              return (
                <div key={item.product_id} className="pt-2 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                    <span className="text-slate-400 block">{item.quantity} x ${p.price.toFixed(2)}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ${(p.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-bold">${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cold Fleet Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-base font-extrabold text-slate-900 dark:text-white">
              <span>Total Payable</span>
              <span className="text-emerald-600 dark:text-emerald-400">${getCartTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Confirm & Place Order</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};
