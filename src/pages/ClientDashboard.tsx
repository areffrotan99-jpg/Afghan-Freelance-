import React, { useState } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Star,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderCard } from '../components/cards/OrderCard';
import { Order } from '../types';

interface ClientDashboardProps {
  onOpenChat: (freelancerId: string, freelancerName: string) => void;
  onPostNewProject: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onOpenChat, onPostNewProject }) => {
  const { dir } = useLanguage();
  const { formatAmount } = useCurrency();
  const { currentUser } = useAuth();
  const { orders, projects, openCheckout, completeOrder, requestRevision } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'projects'>('orders');
  const [revisionOrderId, setRevisionOrderId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Review modal
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Client's orders
  const clientOrders = orders.filter((o) => o.clientId === currentUser?.id || o.clientName === currentUser?.name);
  const clientProjects = projects.filter((p) => p.clientId === currentUser?.id || p.clientName === currentUser?.name);

  const totalSpentAFN = clientOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.amountAFN, 0);

  const activeOrdersCount = clientOrders.filter(
    (o) => o.status === 'in_progress' || o.status === 'delivered' || o.status === 'awaiting_payment'
  ).length;

  const handleConfirmRevision = () => {
    if (revisionOrderId && revisionNotes.trim()) {
      requestRevision(revisionOrderId, revisionNotes);
      setRevisionOrderId(null);
      setRevisionNotes('');
    }
  };

  const handleConfirmReview = () => {
    if (reviewOrderId) {
      // In real scenario this updates freelancer reviews
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setReviewOrderId(null);
      }, 1200);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            داشبورد کارفرما (مدیریت سفارش‌ها و پروژه‌ها)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            پیگیری وضعیت سفارشات، پرداخت‌های امن حساب‌پی، تأیید کارهای تحویلی و آگهی‌های شما
          </p>
        </div>

        <button
          onClick={onPostNewProject}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ثبت پروژه جدید</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">سفارشات فعال</span>
            <span className="text-xl font-black text-white font-mono">{activeOrdersCount} سفارش</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">مجموع پرداخت‌ها در HesabPay</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatAmount(totalSpentAFN, Math.round(totalSpentAFN / 70.5))}
            </span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">پروژه‌های من</span>
            <span className="text-xl font-black text-white font-mono">{clientProjects.length} پروژه</span>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          سفارشات خدمات ({clientOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'projects'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          پروژه‌ها و آگهی‌های من ({clientProjects.length})
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {clientOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs text-slate-400">هنوز سفارشی ثبت نکرده‌اید.</p>
              <button
                onClick={() => {}}
                className="text-xs text-blue-400 font-bold"
              >
                کاتالوگ خدمات را مرور کنید
              </button>
            </div>
          ) : (
            clientOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPayHesabPay={() => openCheckout(order)}
                onAcceptDelivery={() => completeOrder(order.id)}
                onRequestRevision={() => setRevisionOrderId(order.id)}
                onLeaveReview={() => setReviewOrderId(order.id)}
                onOpenChat={() => onOpenChat(order.freelancerId, order.freelancerName)}
              />
            ))
          )}
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {clientProjects.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs text-slate-400">هیچ پروژه‌ای منتشر نکرده‌اید.</p>
              <button onClick={onPostNewProject} className="text-xs text-blue-400 font-bold">
                ثبت اولین پروژه
              </button>
            </div>
          ) : (
            clientProjects.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span>مهلت: {p.deadline}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{p.proposalsCount} پیشنهاد دریافت شده</span>
                  </div>
                </div>

                <div className="text-left font-mono shrink-0">
                  <span className="text-xs text-emerald-400 font-bold">
                    {formatAmount(p.budgetMinAFN, p.budgetMinUSD)} - {formatAmount(p.budgetMaxAFN, p.budgetMaxUSD)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Revision Modal */}
      {revisionOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-white">درخواست اصلاح کار تحویلی</h3>
            <p className="text-xs text-slate-400">
              توضیحات اصلاحیه را بنویسید تا فریلنسر مطابق خواست شما تغییرات را اعمال نماید:
            </p>
            <textarea
              rows={4}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="نکات ویرایشی..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRevisionOrderId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmRevision}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                ارسال درخواست اصلاح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl max-w-md w-full space-y-4 text-center">
            <h3 className="font-bold text-base text-white">ثبت امتیاز و نظر برای فریلنسر</h3>
            {reviewSuccess ? (
              <div className="p-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-200 font-bold">نظر ارزشمند شما با موفقیت ثبت شد!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="تجربه همکاری خود با این متخصص را شرح دهید..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setReviewOrderId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    بستن
                  </button>
                  <button
                    onClick={handleConfirmReview}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    ثبت نهایی نظر
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
