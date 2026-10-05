import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Banknote, Check, CheckCircle2, CreditCard, Landmark, Loader2,
  LockKeyhole, MapPin, PackageCheck, ShieldCheck, ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { fetchCartAPI } from '../features/cart/services/cartApi';
import {
  createCardCheckoutAPI, createKhqrPaymentAPI, payByBankTransferAPI,
  payCashOnDeliveryAPI, verifyKhqrPaymentAPI
} from '../features/checkout/services/checkoutApi';
import { createOrderAPI } from '../features/orders/services/orderApi';
import { fetchAddressesAPI } from '../features/user-profile/services/profileApi';
import { fetchMarketplaceSettingsAPI } from '../features/settings/services/marketplaceSettingsApi';

const DELIVERY_SLOTS = ['Morning · 8:00–11:00', 'Midday · 11:00–14:00', 'Afternoon · 14:00–18:00'];
const PAYMENT_OPTIONS = [
  { id: 'CARD', settingsKey: 'cardPaymentsEnabled', title: 'Card', detail: 'Secure checkout powered by Stripe', Icon: CreditCard },
  { id: 'KHQR', settingsKey: 'khqrPaymentsEnabled', title: 'Bakong KHQR', detail: 'Scan a secure, order-specific QR code', Icon: Landmark },
  { id: 'BANK', settingsKey: 'bankTransferEnabled', title: 'Bank transfer', detail: 'ABA, ACLEDA, Wing and more', Icon: Landmark },
  { id: 'COD', settingsKey: 'cashOnDeliveryEnabled', title: 'Cash on delivery', detail: 'Pay when your harvest arrives', Icon: Banknote },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, products, clearCart } = useStore();
  const [remoteCart, setRemoteCart] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [bankReference, setBankReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [khqrPayment, setKhqrPayment] = useState(null);
  const [khqrStatus, setKhqrStatus] = useState('PENDING');
  const [orderCreationUncertain, setOrderCreationUncertain] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    Promise.allSettled([fetchCartAPI(), fetchAddressesAPI(), fetchMarketplaceSettingsAPI()]).then(([cartResult, addressResult, settingsResult]) => {
      if (!isCurrent) return;
      if (cartResult.status === 'fulfilled') {
        const items = cartResult.value?.cartItems ?? cartResult.value?.items ?? [];
        setRemoteCart(Array.isArray(items) ? items : []);
        setCartLoaded(true);
      }
      if (addressResult.status === 'fulfilled' && Array.isArray(addressResult.value)) {
        const normalizedAddresses = addressResult.value.map((address) => ({
          ...address,
          street_address: address.street ?? address.streetAddress ?? address.street_address ?? '',
          postal_code: address.zip ?? address.postalCode ?? address.postal_code ?? '',
          formatted_address: address.formattedAddress ?? address.formatted_address ?? '',
          delivery_instructions: address.deliveryInstructions ?? address.delivery_instructions ?? '',
          is_default: Boolean(address.isDefault ?? address.is_default),
        }));
        setAddressList(normalizedAddresses);
        const defaultAddress = normalizedAddresses.find((address) => address.is_default) || normalizedAddresses[0];
        if (defaultAddress) setSelectedAddressId(String(defaultAddress.id));
      } else {
        setAddressError(addressResult.status === 'rejected'
          ? addressResult.reason?.message || 'Saved addresses could not be loaded.'
          : 'The server returned an invalid address list.');
      }
      if (settingsResult.status === 'fulfilled' && settingsResult.value
        && PAYMENT_OPTIONS.every(option => typeof settingsResult.value[option.settingsKey] === 'boolean')) {
        setPaymentSettings(settingsResult.value);
      } else {
        setPaymentSettingsError(settingsResult.status === 'rejected'
          ? settingsResult.reason?.message || 'Payment options could not be loaded.'
          : 'The server returned invalid payment settings.');
      }
      setAddressesLoading(false);
    }).catch((error) => {
      if (isCurrent) {
        setAddressError(error.message || 'Checkout details could not be loaded.');
        setAddressesLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, []);

  const availablePaymentOptions = useMemo(
    () => paymentSettings ? PAYMENT_OPTIONS.filter(option => paymentSettings[option.settingsKey]) : [],
    [paymentSettings],
  );
  const effectivePaymentMethod = availablePaymentOptions.some(option => option.id === paymentMethod)
    ? paymentMethod
    : (availablePaymentOptions[0]?.id || '');

  const cartItems = cartLoaded ? remoteCart : cart;
  const orderLines = useMemo(() => cartItems.map((item) => {
    const productId = item.productId ?? item.product_id ?? item.id;
    const product = products.find((candidate) => String(candidate.id) === String(productId));
    return product ? { ...product, quantity: Number(item.quantity || 1) } : null;
  }).filter(Boolean), [cartItems, products]);
  const subtotal = orderLines.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);

  useEffect(() => {
    const orderId = pendingOrder?.id ?? pendingOrder?.orderId;
    if (!khqrPayment || orderId == null || khqrStatus !== 'PENDING') return undefined;

    let isCurrent = true;
    const checkPayment = async () => {
      try {
        const result = await verifyKhqrPaymentAPI(orderId);
        if (!isCurrent) return;
        const status = result?.status || 'PENDING';
        setKhqrStatus(status);
        if (status === 'PAID') {
          clearCart();
          navigate(`/order-success/${orderId}`, { state: { order: pendingOrder, payment: result } });
        } else if (status !== 'PENDING') {
          setErrorMessage(`Bakong payment is ${status.toLowerCase()}. Start a new order to try again.`);
        }
      } catch (error) {
        if (isCurrent) setErrorMessage(error.message || 'Bakong payment status could not be checked.');
      }
    };

    const intervalId = window.setInterval(checkPayment, 5000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [khqrPayment, khqrStatus, pendingOrder, clearCart, navigate]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!paymentSettings) return setErrorMessage(paymentSettingsError || 'Payment options are not available right now.');
    if (!effectivePaymentMethod) {
      return setErrorMessage('Choose an available payment method to continue.');
    }
    if (!orderLines.length) return setErrorMessage('Your cart is empty. Add a harvest before checkout.');
    if (!selectedAddressId) return setErrorMessage('Choose a delivery address to continue.');
    if (effectivePaymentMethod === 'BANK' && !bankReference.trim()) return setErrorMessage('Enter your bank transfer reference.');

    setIsSubmitting(true);
    let order = pendingOrder;
    try {
      if (!order) {
        try {
          order = await createOrderAPI({
            addressId: Number(selectedAddressId),
            deliverySlot,
            items: orderLines.map((item) => ({ productId: Number(item.id), quantity: item.quantity })),
          });
        } catch (error) {
          setOrderCreationUncertain(true);
          throw error;
        }
        if (order?.id == null && order?.orderId == null) {
          setOrderCreationUncertain(true);
          throw new Error('The server created the order but did not return its order ID. Contact support before retrying to avoid creating a duplicate order.');
        }
        setPendingOrder(order);
      }

      const orderId = order.id ?? order.orderId;
      if (orderId == null) throw new Error('The order was created without an order number. Contact support before retrying.');
      let payment;
      if (effectivePaymentMethod === 'CARD') {
        const checkout = await createCardCheckoutAPI(orderId);
        if (!checkout?.checkoutUrl) throw new Error('Secure card checkout could not be opened. Try another payment option.');
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      if (effectivePaymentMethod === 'KHQR') {
        if (!khqrPayment || khqrStatus !== 'PENDING') {
          const qrPayment = await createKhqrPaymentAPI(orderId);
          if (!qrPayment?.qrString || !qrPayment?.md5 || !qrPayment?.qrSvg) {
            throw new Error('Bakong did not return a complete payment QR. Your order remains pending; contact support before retrying.');
          }
          setKhqrPayment(qrPayment);
          setKhqrStatus('PENDING');
          return;
        }

        payment = await verifyKhqrPaymentAPI(orderId);
        setKhqrStatus(payment?.status || 'PENDING');
        if (payment?.status === 'PAID') {
          clearCart();
          navigate(`/order-success/${orderId}`, { state: { order, payment } });
        } else if (payment?.status !== 'PENDING') {
          setErrorMessage(`Bakong payment is ${String(payment?.status || 'unavailable').toLowerCase()}.`);
        }
        return;
      }
      if (effectivePaymentMethod === 'BANK') payment = await payByBankTransferAPI(orderId, bankReference.trim());
      else payment = await payCashOnDeliveryAPI(orderId);

      clearCart();
      navigate(`/order-success/${orderId}`, { state: { order, payment } });
    } catch (error) {
      if (!order && !pendingOrder) setOrderCreationUncertain(true);
      const orderId = order?.id ?? order?.orderId;
      const prefix = orderId != null ? `Order #${orderId} was created, but payment did not finish. ` : '';
      setErrorMessage(`${prefix}${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-[#f8f7f2] px-4 py-8 text-[#26352a] sm:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1260px]">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-[#718071] hover:text-[#315a36]"><ArrowLeft className="h-4 w-4" /> Back to basket</Link>
        <div className="mb-7 mt-5 border-b border-[#e3e9df] pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7134]">ALMOST AT YOUR DOOR</p>
          <h1 className="mt-2 text-3xl font-bold text-[#24392b] sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-[#687269]">Choose where this week’s harvest should land.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="space-y-8">
            <section aria-labelledby="delivery-heading">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center bg-[#e8eee3] text-sm font-bold text-[#315a36]">1</span><div><h2 id="delivery-heading" className="text-lg font-bold text-[#24392b]">Delivery address</h2><p className="text-xs text-[#7b8679]">Choose a saved drop-off point</p></div></div>
                <Link to="/profile" className="text-xs font-bold text-[#315a36] underline decoration-[#315a36]/40 underline-offset-4">Manage addresses</Link>
              </div>
              {addressError && <p role="alert" className="mb-3 border border-[#e9c5bd] bg-[#fff3ef] px-4 py-3 text-sm text-[#9a4034]">{addressError}</p>}
              {addressesLoading && <p role="status" className="mb-3 text-sm text-[#718071]">Loading saved addresses…</p>}
              {addressList.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addressList.map((address) => {
                    const selected = String(address.id) === selectedAddressId;
                    return <label key={address.id} className={`relative flex min-h-28 cursor-pointer gap-3 border p-4 transition ${selected ? 'border-[#315a36] bg-[#f1f5ed]' : 'border-[#e2e7de] bg-white hover:border-[#aebfa7]'}`}>
                      <input type="radio" name="address" value={address.id} checked={selected} onChange={() => setSelectedAddressId(String(address.id))} className="sr-only" />
                      <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-[#315a36]' : 'text-[#9aa397]'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-bold text-[#344635]">{address.is_default ? 'Default address' : 'Delivery address'}{address.is_default && <span className="bg-[#e2ebdc] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#315a36]">Default</span>}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#718071]">{address.formatted_address || [address.street_address, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(', ')}</span>
                        {address.delivery_instructions && <span className="mt-1 block text-xs leading-5 text-[#718071]">Delivery instructions: {address.delivery_instructions}</span>}
                      </span>
                      {selected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[#315a36]" />}
                    </label>;
                  })}
                </div>
              ) : !addressesLoading && (
                <div className="border border-dashed border-[#cbd7c4] bg-white p-6 text-sm text-[#687269]">No saved addresses yet. Add a delivery address in your profile to continue. <Link to="/profile" className="font-bold text-[#315a36] underline">Add address</Link></div>
              )}
              <label className="mt-5 block max-w-md text-xs font-bold text-[#536453]">Delivery window
                <select value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)} className="mt-2 h-11 w-full border border-[#dfe5db] bg-white px-3 text-sm font-medium text-[#344635] outline-none focus:border-[#557b52]">
                  {DELIVERY_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </label>
            </section>

            <section aria-labelledby="payment-heading" className="border-t border-[#e3e9df] pt-7">
              <div className="mb-4 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center bg-[#f4ead9] text-sm font-bold text-[#916f2f]">2</span><div><h2 id="payment-heading" className="text-lg font-bold text-[#24392b]">Payment method</h2><p className="text-xs text-[#7b8679]">Choose how you’d like to pay</p></div></div>
              {paymentSettingsError && <p role="alert" className="mb-3 border border-[#e9c5bd] bg-[#fff3ef] px-4 py-3 text-sm text-[#9a4034]">{paymentSettingsError}</p>}
              {paymentSettings && !availablePaymentOptions.length && <p role="alert" className="mb-3 border border-[#e9c5bd] bg-[#fff3ef] px-4 py-3 text-sm text-[#9a4034]">The marketplace is not accepting payments right now. Please try again later.</p>}
              <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {availablePaymentOptions.map(({ id, title, detail, Icon }) => {
                  const selected = effectivePaymentMethod === id;
                  return <button key={id} type="button" role="radio" aria-checked={selected} disabled={Boolean(khqrPayment) && khqrStatus === 'PENDING' && !selected} onClick={() => setPaymentMethod(id)} className={`min-h-28 border p-4 text-left transition ${selected ? 'border-[#315a36] bg-[#f1f5ed]' : 'border-[#e2e7de] bg-white hover:border-[#aebfa7]'} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <span className="flex items-start justify-between"><Icon className={`h-5 w-5 ${selected ? 'text-[#315a36]' : 'text-[#8c9789]'}`} />{selected && <Check className="h-4 w-4 text-[#315a36]" />}</span>
                    <span className="mt-3 block text-sm font-bold text-[#344635]">{title}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-[#7b8679]">{detail}</span>
                  </button>;
                })}
              </div>

              {effectivePaymentMethod === 'CARD' && <div className="mt-4 flex items-start gap-3 border-l-2 border-[#557b52] bg-[#f1f5ed] px-4 py-3 text-xs text-[#5d6b5e]"><LockKeyhole className="h-4 w-4 shrink-0 text-[#315a36]" /><p><strong className="text-[#344635]">Secure card payment.</strong> You’ll continue to Stripe’s hosted checkout to enter card details. FarmCraft never stores your card number.</p></div>}
              {effectivePaymentMethod === 'BANK' && <label className="mt-4 block max-w-md text-xs font-bold text-[#536453]">Transfer reference
                <input required maxLength={100} value={bankReference} onChange={(event) => setBankReference(event.target.value)} placeholder="Reference from your bank transfer" className="mt-2 h-11 w-full border border-[#dfe5db] bg-white px-3 text-sm font-medium outline-none placeholder:font-normal focus:border-[#557b52]" />
              </label>}
              {effectivePaymentMethod === 'COD' && <p className="mt-4 flex items-center gap-2 text-xs text-[#5d6b5e]"><PackageCheck className="h-4 w-4 text-[#557b52]" /> Have your payment ready when the grower’s delivery arrives.</p>}
              {effectivePaymentMethod === 'KHQR' && !khqrPayment && <p className="mt-4 flex items-center gap-2 text-xs text-[#5d6b5e]"><ShieldCheck className="h-4 w-4 text-[#557b52]" /> A unique QR will be generated using the saved order total. Payment is confirmed by Bakong, not by the browser.</p>}
              {effectivePaymentMethod === 'KHQR' && khqrPayment && (
                <div className="mt-5 flex flex-col items-center gap-3 border border-[#dfe5db] bg-white p-5 text-center">
                  <p className="text-sm font-bold text-[#344635]">Scan with a Bakong or KHQR-enabled banking app</p>
                  <img
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(khqrPayment.qrSvg)}`}
                    alt="Bakong KHQR payment code"
                    className="h-64 w-64 max-w-full"
                  />
                  <p className="text-sm font-bold text-[#24392b]">{khqrPayment.currency} {Number(khqrPayment.amount).toFixed(2)}</p>
                  <p role="status" className="text-xs text-[#718071]">
                    {khqrStatus === 'PENDING' ? 'Waiting for Bakong to confirm your payment…' : khqrStatus === 'FAILED' ? 'Bakong could not complete this payment. Generate a new QR or choose another payment method.' : `Payment status: ${khqrStatus}. Generate a new QR or choose another payment method.`}
                  </p>
                  <p className="break-all text-[10px] text-[#899286]">Payment reference: {khqrPayment.md5}</p>
                </div>
              )}
            </section>
            {errorMessage && <p role="alert" className="border border-[#e9c5bd] bg-[#fff3ef] px-4 py-3 text-sm text-[#9a4034]">{errorMessage}</p>}
          </div>

          <aside aria-label="Order summary" className="border border-[#e2e7de] bg-white p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-[#edf0ea] pb-4"><h2 className="text-base font-bold text-[#24392b]">Your harvest</h2><span className="text-xs text-[#788477]">{orderLines.length} {orderLines.length === 1 ? 'item' : 'items'}</span></div>
            <div className="max-h-64 space-y-4 overflow-y-auto py-4">
              {orderLines.length ? orderLines.map((item) => <div key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden bg-[#eff2e9]">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="m-3 h-6 w-6 text-[#78936f]" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#344635]">{item.name}</p><p className="mt-1 text-[11px] text-[#7b8679]">{item.quantity} × ${Number(item.price).toFixed(2)} / {item.unit}</p></div>
                <span className="text-xs font-bold text-[#344635]">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>) : <p className="py-5 text-center text-sm text-[#7b8679]">Your basket is empty.</p>}
            </div>
            <div className="space-y-3 border-t border-[#edf0ea] pt-4 text-sm">
              <div className="flex justify-between text-[#687269]"><span>Items subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#687269]"><span>Delivery</span><span className="text-xs">Confirmed by grower</span></div>
              <div className="flex justify-between text-[#687269]"><span>Taxes</span><span>Included</span></div>
              <div className="flex items-baseline justify-between border-t border-[#edf0ea] pt-3 text-base font-bold text-[#24392b]"><span>Estimated total</span><span className="text-xl">${subtotal.toFixed(2)}</span></div>
              <p className="text-[11px] leading-4 text-[#899286]">Delivery charges, if applicable, are confirmed with your farm before dispatch.</p>
            </div>
            <button type="submit" disabled={isSubmitting || orderCreationUncertain || !orderLines.length || !selectedAddressId || !paymentSettings || !availablePaymentOptions.length || khqrStatus === 'PAID'} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#285331] px-4 text-sm font-bold text-white transition hover:bg-[#1c4228] disabled:cursor-not-allowed disabled:bg-[#9aa69a]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing order</> : <>{khqrPayment && khqrStatus === 'PENDING' ? 'Check payment now' : khqrPayment ? 'Generate new QR' : 'Place order'} <ShieldCheck className="h-4 w-4" /></>}
            </button>
            {orderCreationUncertain && <p role="alert" className="mt-3 text-xs text-[#9a4034]">Order creation could not be confirmed. The checkout is locked to prevent a duplicate; check your orders or contact support.</p>}
            <p className="mt-3 text-center text-[11px] text-[#899286]">Your order details are encrypted and protected.</p>
          </aside>
        </form>
      </div>
    </main>
  );
};
