import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { verifyAbaPaywayPaymentAPI } from '../features/checkout/services/checkoutApi';

export const AbaPaywayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useStore();
  const orderId = searchParams.get('orderId');
  const wasCancelled = searchParams.get('cancelled') === '1';
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'PENDING') return undefined;
    if (!orderId) {
      setError('The PayWay return is missing its order number. Check your orders or contact support.');
      return undefined;
    }

    let isCurrent = true;
    let requestInProgress = false;
    const checkStatus = async () => {
      if (requestInProgress) return;
      requestInProgress = true;
      try {
        const payment = await verifyAbaPaywayPaymentAPI(orderId);
        if (!isCurrent) return;
        setError('');
        setStatus(payment?.status || 'PENDING');
        if (payment?.status === 'PAID') {
          clearCart();
          navigate(`/order-success/${orderId}`, { replace: true, state: { payment } });
        }
      } catch (verificationError) {
        if (isCurrent) setError(verificationError.message || 'ABA PayWay payment status could not be checked.');
      } finally {
        requestInProgress = false;
      }
    };

    checkStatus();
    const intervalId = window.setInterval(checkStatus, 4000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [orderId, status, clearCart, navigate]);

  const isPending = status === 'PENDING';

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        {isPending ? <LoaderCircle className="h-8 w-8 animate-spin" /> : <ShieldCheck className="h-8 w-8" />}
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        {isPending ? 'Confirming your ABA PayWay payment' : `PayWay payment ${status.toLowerCase()}`}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600" role={error ? 'alert' : 'status'}>
        {error || (isPending
          ? wasCancelled
            ? 'Checkout was closed. We are checking with ABA before updating your order; do not retry payment while it is being verified.'
            : 'Your order will be marked paid only after ABA confirms the transaction.'
          : 'The payment was not completed. Your order has not been marked as paid.')}
      </p>
      {isPending && <p className="mt-2 text-xs text-slate-500">Order #{orderId || '—'} · Checking securely with FarmCraft</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/profile" className="rounded-full bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200">
          View my orders
        </Link>
        <Link to="/products" className="rounded-full bg-emerald-700 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-800">
          Continue shopping
        </Link>
      </div>
    </section>
  );
};
