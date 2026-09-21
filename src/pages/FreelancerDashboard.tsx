import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  FileCheck,
  PlusCircle,
  UploadCloud,
  X,
  Wallet,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderCard } from '../components/cards/OrderCard';
import { Order } from '../types';

interface FreelancerDashboardProps {
  onOpenWallet: () => void;
  onOpenChat: (clientId: string, clientName: string) => void;
}

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({
  onOpenWallet,
  onOpenChat,
}) => {
  const { dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { currentUser } = useAuth();
  const { orders, wallet, deliverOrder } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFile, setDeliveryFile] = useState('final_project_bundle_v1.zip');

  // Freelancer's orders
  const myOrders = orders.filter(
    (o) => o.freelancerId === currentUser?.id || o.freelancerName === currentUser?.name
  );

  const activeQueue = myOrders.filter(
    (o) => o.status === 'in_progress' || o.status === 'revision_requested' || o.status === 'delivered'
  );

  const completedHistory = myOrders.filter((o) => o.status === 'completed');

  const pendingEscrowAFN = activeQueue.reduce((acc, curr) => acc + curr.amountAFN, 0);

  const handleConfirmDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrderId || !deliveryNotes.trim()) return;

    deliverOrder(deliveryOrderId, deliveryNotes, deliveryFile);
    setDeliveryOrderId(null);
    setDeliveryNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            میز کار فریلنسر (Freelancer Studio)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            سفارش‌های در حال انجام، تحویل کار نهایی، موجودی امانی و درآمدها
          </p>
        </div>

        <button
          onClick={onOpenWallet}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start sm:self-auto"
        >
          <Wallet className="w-4 h-4" />
          <span>برداشت درآمد از طریق حساب‌پی</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">موجودی آماده برداشت</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatAmount(wallet.balanceAFN, wallet.balanceUSD)}
            </span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">در صندوق امانی (در حال انجام)</span>
            <span className="text-xl font-black text-blue-400 font-mono">
              {formatAmount(pendingEscrowAFN, Math.round(pendingEscrowAFN / 70.5))}
            </span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">سفارشات تحویل شده موفق</span>
            <span className="text-xl font-black text-white font-mono">{completedHistory.length} پروژه</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'queue'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          صف کارهای فعال و در دست اقدام ({activeQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          آرشیو سفارشات موفق ({completedHistory.length})
        </button>
      </div>

      {/* Tab: Active Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {activeQueue.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs text-slate-400">سفارش فعالی در صف ندارید.</p>
            </div>
          ) : (
            activeQueue.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPayHesabPay={() => {}}
                onDeliverWork={() => setDeliveryOrderId(order.id)}
                onOpenChat={() => onOpenChat(order.clientId, order.clientName)}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Completed History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedHistory.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs text-slate-400">هنوز سفارشی تکمیل نشده است.</p>
            </div>
          ) : (
            completedHistory.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPayHesabPay={() => {}}
                onOpenChat={() => onOpenChat(order.clientId, order.clientName)}
              />
            ))
          )}
        </div>
      )}

      {/* Deliver Work Modal */}
      {deliveryOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 sm:p-8 rounded-3xl max-w-lg w-full text-slate-200 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setDeliveryOrderId(null)}
              className="absolute top-4 left-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-white">تحویل کار نهایی به کارفرما</h3>
            <p className="text-xs text-slate-400">
              فایل‌های نهایی پروژه را آپلود کرده و پیام تحویل خود را بنویسید. کارفرما کار را بررسی و وجه را آزاد می‌کند:
            </p>

            <form onSubmit={handleConfirmDeliver} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">ضمیمه فایل خروجی / سورس کد:</label>
                <div className="p-4 border-2 border-dashed border-slate-750 rounded-2xl text-center space-y-2 bg-slate-800/40">
                  <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                  <div className="text-xs text-slate-300 font-semibold">{deliveryFile}</div>
                  <p className="text-[11px] text-slate-500">پشتیبانی از ZIP, PDF, MP4, Figma, GitHub Link</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">یادداشت تحویل (Release Notes):</label>
                <textarea
                  rows={4}
                  required
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="توضیح دهید چه کارهایی انجام شده و کارفرما چگونه نتیجه را تست کند..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryOrderId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>ثبت و تحویل رسمی سفارش</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
