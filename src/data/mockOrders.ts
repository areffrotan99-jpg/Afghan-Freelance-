import { Order, Review, Transaction } from '../types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'AF-892101',
    serviceId: 'srv-1',
    serviceTitle: 'توسعه وبسایت حرفه‌ای فول‌استک با React و Next.js',
    serviceImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=400&q=80',
    packageType: 'standard',
    clientId: 'cl-demo',
    clientName: 'استودیو نرم‌افزار کابل (Kabul Tech Studio)',
    clientEmail: 'kabul.tech@example.af',
    freelancerId: 'fl-1',
    freelancerName: 'احمد ولی فایز',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    amountAFN: 14000,
    amountUSD: 198,
    currency: 'AFN',
    status: 'in_progress',
    platformCommissionAFN: 1400,
    freelancerEarningsAFN: 12600,
    platformCommissionUSD: 19.8,
    freelancerEarningsUSD: 178.2,
    deliveryDeadline: '۲۰۲۴-۰۳-۰۵',
    createdAt: '۲۰۲۴-۰۲-۲۶',
    updatedAt: '۲۰۲۴-۰۲-۲۶',
    hesabPaySessionId: 'hesab_sess_live_9921'
  },
  {
    id: 'ord-102',
    orderNumber: 'AF-892102',
    serviceId: 'srv-2',
    serviceTitle: 'طراحی لوگو و هویت بصری لوکس با الهام از اصالت افغان',
    serviceImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80',
    packageType: 'basic',
    clientId: 'cl-demo',
    clientName: 'استودیو نرم‌افزار کابل (Kabul Tech Studio)',
    clientEmail: 'kabul.tech@example.af',
    freelancerId: 'fl-2',
    freelancerName: 'مریم سادات نیازی',
    freelancerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    amountAFN: 3200,
    amountUSD: 45,
    currency: 'AFN',
    status: 'delivered',
    platformCommissionAFN: 320,
    freelancerEarningsAFN: 2880,
    platformCommissionUSD: 4.5,
    freelancerEarningsUSD: 40.5,
    deliveryDeadline: '۲۰۲۴-۰۲-۲۸',
    createdAt: '۲۰۲۴-۰۲-۲۴',
    updatedAt: '۲۰۲۴-۰۲-۲۷',
    deliveredWork: {
      notes: 'سلام جناب محترم، طرح‌های اتود لوگو همراه با فایل‌های لایه‌باز و کدهای رنگی پنتون پیوست گردید.',
      fileName: 'Kabul_Brand_Logo_Files_v1.zip',
      deliveredAt: '۲۰۲۴-۰۲-۲۷'
    }
  },
  {
    id: 'ord-103',
    orderNumber: 'AF-892095',
    serviceId: 'srv-3',
    serviceTitle: 'ترجمه رسمی و تخصصی پشتو، دری و انگلیسی',
    serviceImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80',
    packageType: 'standard',
    clientId: 'cl-demo',
    clientName: 'استودیو نرم‌افزار کابل (Kabul Tech Studio)',
    clientEmail: 'kabul.tech@example.af',
    freelancerId: 'fl-3',
    freelancerName: 'عبدالرحمان شینواری',
    freelancerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    amountAFN: 3500,
    amountUSD: 50,
    currency: 'USD',
    status: 'completed',
    platformCommissionAFN: 350,
    freelancerEarningsAFN: 3150,
    platformCommissionUSD: 5,
    freelancerEarningsUSD: 45,
    deliveryDeadline: '۲۰۲۴-۰۲-۲۰',
    createdAt: '۲۰۲۴-۰۲-۱۷',
    updatedAt: '۲۰۲۴-۰۲-۱۹',
    reviewSubmitted: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ord-103',
    serviceId: 'srv-3',
    freelancerId: 'fl-3',
    clientId: 'cl-demo',
    clientName: 'استودیو نرم‌افزار کابل',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    comment: 'ترجمه‌ای بسیار دقیق، سریع و با اصطلاحات کاملاً اصیل و حرفه‌ای. تحویل حتی زودتر از موعد مقرر انجام شد. حتماً پروژه‌های بعدی را هم با ایشان کار خواهیم کرد.',
    createdAt: '۲۰۲۴-۰۲-۱۹',
    sellerResponse: {
      text: 'بسیار سپاسگزارم از اعتماد شما کارفرمای محترم. مایه افتخار بنده بود.',
      createdAt: '۲۰۲۴-۰۲-۲۰'
    }
  },
  {
    id: 'rev-2',
    orderId: 'ord-100',
    serviceId: 'srv-1',
    freelancerId: 'fl-1',
    clientId: 'cl-other',
    clientName: 'بنیاد امید هرات',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    comment: 'احمد ولی فایز از برترین توسعه‌دهندگان افغانستان هستند. سیستم اتصال درگاه HesabPay را در کمتر از ۴۸ ساعت با امنیت کامل تحویل دادند.',
    createdAt: '۲۰۲۴-۰۲-۱۰'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-501',
    userId: 'usr-current',
    orderId: 'ord-103',
    orderNumber: 'AF-892095',
    type: 'payment',
    amount: 50,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'HesabPay',
    referenceId: 'HP_TX_89201948',
    createdAt: '۲۰۲۴-۰۲-۱۷ ۱۰:۳۰',
    description: 'پرداخت امن سفارش ترجمه اسناد تجاری با درگاه حساب‌پی'
  },
  {
    id: 'tx-502',
    userId: 'usr-current',
    orderId: 'ord-101',
    orderNumber: 'AF-892101',
    type: 'payment',
    amount: 14000,
    currency: 'AFN',
    status: 'completed',
    paymentMethod: 'HesabPay',
    referenceId: 'HP_TX_99382103',
    createdAt: '۲۰۲۴-۰۲-۲۶ ۱۵:۱۴',
    description: 'امانت‌گذاری وجه سفارش وبسایت فول‌استک در صندوق امن (Escrow)'
  },
  {
    id: 'tx-503',
    userId: 'fl-1',
    orderId: 'ord-99',
    orderNumber: 'AF-891950',
    type: 'freelancer_earnings',
    amount: 22500,
    currency: 'AFN',
    status: 'completed',
    paymentMethod: 'Wallet',
    referenceId: 'AF_W_88193',
    createdAt: '۲۰۲۴-۰۲-۱۵ ۱۱:۰۰',
    description: 'آزادسازی دستمزد پس از تأیید نهایی پروژه توسط کارفرما'
  }
];
