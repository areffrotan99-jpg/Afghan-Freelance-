import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  QrCode,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

export const HesabPayModal: React.FC = () => {
  const { isCheckoutOpen, activeCheckoutOrder, closeCheckout, processHesabPaySuccess } = useMarketplace();
  const { currency, exchangeRate } = useCurrency();
  const { t, dir } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'qr'>('wallet');
  const [phoneNumber, setPhoneNumber] = useState('0791234567');
  const [pinCode, setPinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCheckoutOpen || !activeCheckoutOrder) return null;

  const amountAFN = activeCheckoutOrder.amountAFN;
  const amountUSD = activeCheckoutOrder.amountUSD || Math.round(amountAFN / exchangeRate);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Send session creation / validation request to backend
      const res = await fetch('/api/payments/hesabpay/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeCheckoutOrder.id,
          orderNumber: activeCheckoutOrder.orderNumber,
          amount: currency === 'USD' ? amountUSD : amountAFN,
          currency,
          serviceTitle: activeCheckoutOrder.serviceTitle,
          clientEmail: activeCheckoutOrder.clientEmail,
          clientName: activeCheckoutOrder.clientName,
        }),
      });

      const data = await res.json();

      // Simulate network verification with HesabPay secure gateway
      setTimeout(async () => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(async () => {
          await processHesabPaySuccess(activeCheckoutOrder.id, data.sessionId);
          setIsSuccess(false);
        }, 1500);
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('خطا در برقراری ارتباط با سرور حساب‌پی. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
          dir={dir}
        >
          {/* Top Header with HesabPay Official Branding */}
          <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950/90 p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* HesabPay Authentic Emblem */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
                  H
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">درگاه رسمی حساب‌پی</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      HesabPay Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">تضمین ۱۰۰٪ پرداخت امن در صندوق امانت (Escrow)</p>
                </div>
              </div>
              <button
                onClick={closeCheckout}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h4 className="text-xl font-bold text-white">تراکنش حساب‌پی با موفقیت انجام شد!</h4>
              <p className="text-sm text-slate-300">
                مبلغ در صندوق امانی (Escrow) افغان فریلنس محفوظ ماند و پروژه به وضعیت «در حال انجام» تغییر یافت.
              </p>
              <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-400 font-mono">
                شماره پیگیری سفارش: {activeCheckoutOrder.orderNumber}
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handlePay} className="p-6 space-y-5">
              {/* Order Summary Box */}
              <div className="bg-slate-800/60 border border-slate-750 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">خدمت انتخابی:</span>
                  <span className="font-semibold text-white truncate max-w-[240px]">
                    {activeCheckoutOrder.serviceTitle}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">فریلنسر مجری:</span>
                  <span className="text-blue-400 font-medium">{activeCheckoutOrder.freelancerName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">بسته سفارش:</span>
                  <span className="text-amber-400 uppercase text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10">
                    {activeCheckoutOrder.packageType}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center">
                  <span className="font-bold text-slate-200">مبلغ نهایی قابل پرداخت:</span>
                  <div className="text-left font-black text-xl text-emerald-400">
                    {currency === 'USD' ? `$${amountUSD.toLocaleString()} USD` : `${amountAFN.toLocaleString()} افغانی`}
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">روش پرداخت در درگاه حساب‌پی:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'wallet'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs font-medium">کیف پول HesabPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-medium">کارت بانکی / AfPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'qr'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-medium">اسکن QR حساب‌پی</span>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">شماره تلفن حساب‌پی (افغانستان):</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07X XXX XXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">کد یکبار مصرف یا رمز HesabPay:</label>
                    <input
                      type="password"
                      dir="ltr"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="••••"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 tracking-widest text-center"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      برای تست آزمایشی، هر ۴ رقم یا رمز خالی مورد تأیید است.
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">شماره کارت (AfPay / کارت بانکی):</label>
                    <input
                      type="text"
                      dir="ltr"
                      defaultValue="6037 9918 2039 4410"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">تاریخ انقضا:</label>
                      <input
                        type="text"
                        dir="ltr"
                        defaultValue="08/28"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">CVV2:</label>
                      <input
                        type="password"
                        dir="ltr"
                        defaultValue="982"
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-center space-y-3">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                    {/* Visual QR representation */}
                    <div className="w-full h-full border-4 border-slate-900 border-dashed rounded flex flex-col items-center justify-center p-2 text-slate-900 font-mono text-[10px] text-center font-bold">
                      <QrCode className="w-16 h-16 text-slate-900 mb-1" />
                      HESABPAY PAY
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    با اپلیکیشن موبایل HesabPay کیوآرکد فوق را اسکن نمایید تا تأیید فوری دریافت شود.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Escrow Guarantee Statement */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>سیستم امانی (Escrow):</strong> مبلغ پرداختی تا زمان تحویل کامل کار و رضایت شما نزد افغان فریلنس باقی می‌ماند و تنها پس از تأیید نهایی به فریلنسر پرداخت خواهد شد.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>در حال برقراری ارتباط امن با حساب‌پی...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        تأیید و پرداخت {currency === 'USD' ? `$${amountUSD.toLocaleString()} USD` : `${amountAFN.toLocaleString()} افغانی`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer security badges */}
          <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 px-6">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> رمزنگاری پیشرفته ۲۵۶ بیتی SSL
            </span>
            <span className="text-slate-400">شبکه رسمی پرداخت بانکی افغانستان</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
