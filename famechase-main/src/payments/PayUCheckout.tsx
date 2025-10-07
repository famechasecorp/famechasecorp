import React, { useEffect, useState, useRef } from 'react';

type Props = {
  defaultAmount?: number;
  defaultEmail?: string;
};

export default function PayUCheckout({ defaultAmount = 100, defaultEmail = '' }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [amount, setAmount] = useState(defaultAmount);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const popupRef = useRef<Window | null>(null);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    listenerRef.current = (ev: MessageEvent) => {
      try {
        const data = ev.data || {};
        if (data && data.status === 'success' && data.txnId) {
          setStatus('success');
          // record final purchase event (optional duplicate-safe)
          sendEvent('purchase', { txnId: data.txnId, amount, email, status: 'success' });
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', listenerRef.current);
    return () => {
      if (listenerRef.current) window.removeEventListener('message', listenerRef.current);
    };
  }, [amount, email]);

  async function createPayment() {
    setStatus('pending');
    try {
      const origin = process.env.REACT_APP_PAYMENT_SERVER_ORIGIN || 'http://localhost:4000';
      const res = await fetch(origin + '/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, email })
      });
      if (!res.ok) throw new Error('Create payment failed');
      const data = await res.json();
      const url = data.paymentUrl;
      const features = 'width=520,height=700,top=100,left=100';
      popupRef.current = window.open(url, 'payu_popup', features);
      if (!popupRef.current) {
        // fallback to same-tab navigation
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label>
          Email
          <input style={{ marginLeft: 8 }} value={email} onChange={e => setEmail(e.target.value)} />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          Amount
          <input
            style={{ marginLeft: 8 }}
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <button onClick={createPayment} disabled={status === 'pending'}>
          {status === 'pending' ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {status === 'success' && <div style={{ color: 'green' }}>Payment successful — thank you.</div>}
        {status === 'failed' && <div style={{ color: 'red' }}>Payment failed — try again.</div>}
      </div>
    </div>
  );
}

// helper to send events (quiz attempt / download / purchase)
export async function sendEvent(type: 'quiz_attempt' | 'purchase' | 'download' | string, payload: any) {
  try {
    const origin = process.env.REACT_APP_PAYMENT_SERVER_ORIGIN || 'http://localhost:4000';
    await fetch(origin + '/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
  } catch (err) {
    console.warn('sendEvent failed', err);
  }
}