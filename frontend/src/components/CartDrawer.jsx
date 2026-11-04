/**
 * WhatsAssist - Storefront Cart Slide-Over Drawer
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onRemoveItem,
  onCheckout,
  getProductImage,
}) {
  if (!isOpen) return null;

  const totalAmount = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 1), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your Shopping Bag ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse our trending electronics, E-Bikes, and inverter appliances to add products to your cart.
                </p>
              </div>
            ) : (
              items.map((item, idx) => {
                const img = getProductImage ? getProductImage(item) : item.image_url;
                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        {item.category || 'Appliance'}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h5>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                        Rs. {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    {onRemoveItem && (
                      <button
                        onClick={() => onRemoveItem(item.id || idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Express Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex items-center justify-between font-extrabold text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onCheckout) onCheckout(items[0]);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to 1-Click Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
