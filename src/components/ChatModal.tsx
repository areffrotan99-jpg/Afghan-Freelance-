import React, { useState } from 'react';
import { Send, X, Paperclip, ShieldCheck, CheckCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface ChatModalProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ recipientId, recipientName, onClose }) => {
  const { dir } = useLanguage();
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'other',
      text: `سلام! خوشحالم که در پلتفرم افغان فریلنس با شما در ارتباط هستم. جزئیات دقیق پروژه شما چیست؟`,
      time: '۱۰:۱۴ ق.ظ',
    },
    {
      id: '2',
      sender: 'me',
      text: 'سلام و وقت بخیر. در خصوص سفارش و زمانبندی تحویل سوال داشتم.',
      time: '۱۰:۱۶ ق.ظ',
    },
    {
      id: '3',
      sender: 'other',
      text: 'کاملاً در خدمتم! تمام پرداخت‌ها از طریق درگاه HesabPay و سیستم امانی انجام می‌شود تا کار با بالاترین کیفیت تقدیم گردد.',
      time: '۱۰:۱۷ ق.ظ',
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate auto-reply after 1 second
    setTimeout(() => {
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        text: 'پیام شما دریافت شد. در اسرع وقت پاسخ تکمیلی را ارسال خواهم کرد.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir={dir}>
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-lg w-full h-[580px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
              {recipientName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{recipientName}</h4>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                آنلاین در افغان فریلنس
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert */}
        <div className="p-2.5 bg-blue-950/40 border-b border-blue-900/50 flex items-center gap-2 text-[11px] text-blue-300 px-4">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>تمام پرداخت‌ها باید منحصراً از طریق حساب‌پی در سایت انجام شوند تا تحت پوشش بیمه امانی باشند.</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[80%] ${m.sender === 'me' ? 'mr-auto items-start' : 'ml-auto items-end'}`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'me'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-750 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                <span>{m.time}</span>
                {m.sender === 'me' && <CheckCheck className="w-3 h-3 text-blue-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-slate-800/80 border-t border-slate-750 flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
            title="پیوست فایل"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
