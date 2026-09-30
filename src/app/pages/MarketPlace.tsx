import { useState } from 'react';
import { useApp, Order, OrderItem } from '../context/AppContext';
import { PRODUCTS, ASSURANCE_STEPS } from '../lib/Products';
import {
  ShoppingCart, ShieldCheck, Plus, Minus, Truck, PackageCheck, X, Leaf,
} from 'lucide-react';

/**
 * Marketplace - Stakeholders browse and order Kijani Hub products.
 * Emphasizes the eco-green supply-chain assurance story (source → delivery).
 * (Demo stage: orders are stored per-device; a shared backend enables real
 * fulfilment and cross-user order tracking.)
 */
export default function Marketplace() {
  const { orders, placeOrder, userName } = useApp();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [buyer, setBuyer] = useState({ name: userName || '', contact: '' });
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => {
    const n = (c[id] || 0) - 1;
    const next = { ...c };
    if (n <= 0) delete next[id]; else next[id] = n;
    return next;
  });

  const cartItems: OrderItem[] = Object.entries(cart).map(([productId, qty]) => {
    const p = PRODUCTS.find((x) => x.id === productId)!;
    return { productId, name: p.name, qty, unitPrice: p.price };
  });
  const total = cartItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const submitOrder = () => {
    if (!buyer.name.trim() || !buyer.contact.trim() || cartItems.length === 0) return;
    const order: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      buyerName: buyer.name.trim(),
      buyerContact: buyer.contact.trim(),
      items: cartItems,
      total,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };
    placeOrder(order);
    setConfirmedId(order.id);
    setCart({});
    setCheckout(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Marketplace</h1>
          <p className="text-gray-600 mt-1">Buy Kijani Hub eco-green products — feed, fertilizer and compost</p>
        </div>
        {cartCount > 0 && (
          <button onClick={() => setCheckout(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            <ShoppingCart size={18} /> Checkout ({cartCount}) · {total.toLocaleString()} TZS
          </button>
        )}
      </div>

      {/* Order confirmation */}
      {confirmedId && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <PackageCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-emerald-800">
            <strong>Order {confirmedId} received!</strong> Our team will confirm availability and arrange delivery
            with full handling assurance. You can track it under "Your orders" below.
          </div>
          <button onClick={() => setConfirmedId(null)} className="ml-auto"><X size={16} className="text-emerald-600" /></button>
        </div>
      )}

      {/* Supply-chain assurance strip */}
      <div className="bg-gradient-to-r from-emerald-950 to-blue-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} className="text-emerald-300" />
          <h2 className="font-semibold">Our eco-green supply chain — assured at every step</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ASSURANCE_STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="font-mono text-xs text-emerald-300 mb-1">0{i + 1}</div>
              <div className="font-semibold text-sm">{s.step}</div>
              <p className="text-xs text-emerald-100/70 mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
            <div className="text-4xl mb-3">{p.emoji}</div>
            <h3 className="font-bold text-gray-800 text-sm">{p.name}</h3>
            <p className="text-xs text-gray-500 mt-1 flex-1">{p.tagline}</p>
            <div className="mt-4">
              <span className="font-mono font-semibold text-emerald-700">{p.price.toLocaleString()} TZS</span>
              <span className="text-xs text-gray-400"> / {p.unit}</span>
            </div>
            {cart[p.id] ? (
              <div className="flex items-center justify-between mt-3 bg-emerald-50 rounded-lg p-1">
                <button onClick={() => sub(p.id)} className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center"><Minus size={15} /></button>
                <span className="font-semibold text-emerald-700">{cart[p.id]} {p.unit}</span>
                <button onClick={() => add(p.id)} className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center"><Plus size={15} /></button>
              </div>
            ) : (
              <button onClick={() => add(p.id)}
                className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2">
                <Plus size={15} /> Add to order
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Checkout modal */}
      {checkout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setCheckout(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Complete your order</h3>
              <button onClick={() => setCheckout(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {cartItems.map((i) => (
                <div key={i.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{i.name} × {i.qty}</span>
                  <span className="font-mono">{(i.qty * i.unitPrice).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                <span>Total</span><span className="font-mono text-emerald-700">{total.toLocaleString()} TZS</span>
              </div>
            </div>
            <div className="space-y-3">
              <input placeholder="Your name / organization" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              <input placeholder="Phone or email" value={buyer.contact} onChange={(e) => setBuyer({ ...buyer, contact: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
            <button onClick={submitOrder}
              className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Place order request
            </button>
            <p className="text-xs text-gray-400 mt-3 text-center">
              You'll be contacted to confirm availability and delivery. No payment is taken online at this stage.
            </p>
          </div>
        </div>
      )}

      {/* Your orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your orders</h3>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-semibold text-gray-800">{o.id}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                    <Truck size={13} /> {o.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </p>
                <p className="font-mono text-sm font-semibold text-emerald-700 mt-1">{o.total.toLocaleString()} TZS</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Leaf size={13} /> Prices are indicative pilot pricing. Live fulfilment and payment integration are planned with the platform backend.
      </div>
    </div>
  );
}
