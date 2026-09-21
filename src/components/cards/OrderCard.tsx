import React from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Star,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';

interface OrderCardProps {
  order: Order;
  onPayHesabPay: () => void;
  onDeliverWork?: () => void;
  onAcceptDelivery?: () => void;
  onRequestRevision?: () => void;
  onLeaveReview?: () => void;
  onOpenChat: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPayHesabPay,
  onDeliverWork,
  onAcceptDelivery,
  onRequestRevision,
  onLeaveReview,
  onOpenChat,
}) => {
  const { formatAmount } = useCurrency();
  const { role } = useAuth();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_payment':
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            در انتظار پرداخت HesabPay
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            در حال انجام توسط فریلنسر
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            کار تحویل داده شد (نیازمند تأیید)
          </span>
        );
      case 'revision_requested':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            درخواست بازبینی و اصلاح
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            سفارش تکمیل شد
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            #{order.orderNumber}
          </span>
          <span className="text-xs text-slate-400">تاریخ: {order.createdAt}</span>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Main Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {order.serviceImage && (
            <img
              src={order.serviceImage}
              alt={order.serviceTitle}
              className="w-16 h-14 rounded-xl object-cover border border-slate-750 shrink-0"
            />
          )}
          <div>
            <h4 className="font-bold text-sm text-white line-clamp-1">{order.serviceTitle}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>طرف همکاری: <strong className="text-slate-200">{role === 'freelancer' ? order.clientName : order.freelancerName}</strong></span>
              <span>•</span>
              <span>بسته: <strong className="text-amber-400 uppercase">{order.packageType}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-left font-mono shrink-0">
          <span className="text-[10px] text-slate-400 block">مبلغ سفارش:</span>
          <span className="text-base font-black text-emerald-400">
            {formatAmount(order.amountAFN, order.amountUSD)}
          </span>
        </div>
      </div>

      {/* Delivered File Inspection box (if delivered) */}
      {order.status === 'delivered' && order.deliveredWork && (
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-purple-400" /> فایل‌های پروژه تحویل داده شد:
            </span>
            <span className="text-[10px] text-slate-400">{order.deliveredWork.deliveredAt}</span>
          </div>
          <p className="text-slate-300 italic">{order.deliveredWork.notes}</p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-blue-400">
            <span>فایل ضمیمه: {order.deliveredWork.fileName}</span>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onOpenChat}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
        >
          گفتگو درباره سفارش →
        </button>

        <div className="flex items-center gap-2">
          {/* Client: Pay with HesabPay */}
          {(order.status === 'awaiting_payment' || order.status === 'pending') && (
            <button
              onClick={onPayHesabPay}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>پرداخت امن با حساب‌پی (HesabPay)</span>
            </button>
          )}

          {/* Freelancer: Deliver Work */}
          {role === 'freelancer' && order.status === 'in_progress' && onDeliverWork && (
            <button
              onClick={onDeliverWork}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <FileCheck className="w-4 h-4" />
              <span>تحویل کار نهایی</span>
            </button>
          )}

          {/* Client: Accept or Request Revision */}
          {role === 'client' && order.status === 'delivered' && (
            <>
              {onRequestRevision && (
                <button
                  onClick={onRequestRevision}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  درخواست اصلاح
                </button>
              )}
              {onAcceptDelivery && (
                <button
                  onClick={onAcceptDelivery}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأیید تحویل و آزادسازی وجه به فریلنسر</span>
                </button>
              )}
            </>
          )}

          {/* Completed: Leave Review */}
          {order.status === 'completed' && !order.reviewSubmitted && onLeaveReview && (
            <button
              onClick={onLeaveReview}
              className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>ثبت امتیاز و نظر</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
