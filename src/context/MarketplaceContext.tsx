import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Service,
  FreelancerProfile,
  Project,
  Proposal,
  Order,
  Review,
  ChatMessage,
  Wallet,
  Transaction,
  NotificationItem,
  PlatformSettings,
  Currency,
} from '../types';
import { CATEGORIES } from '../data/categories';
import { FREELANCERS } from '../data/freelancers';
import { SERVICES } from '../data/services';
import { PROJECTS, INITIAL_PROPOSALS } from '../data/projects';
import { INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_TRANSACTIONS } from '../data/mockOrders';
import { useAuth } from './AuthContext';

interface MarketplaceContextType {
  // Data
  services: Service[];
  freelancers: FreelancerProfile[];
  projects: Project[];
  proposals: Proposal[];
  orders: Order[];
  reviews: Review[];
  messages: ChatMessage[];
  wallet: Wallet;
  transactions: Transaction[];
  notifications: NotificationItem[];
  favorites: string[]; // service or freelancer IDs
  settings: PlatformSettings;

  // HesabPay Checkout State
  isCheckoutOpen: boolean;
  activeCheckoutOrder: Order | null;
  openCheckout: (order: Order) => void;
  closeCheckout: () => void;
  processHesabPaySuccess: (orderId: string, sessionId?: string) => Promise<void>;

  // Actions
  createService: (service: Partial<Service>) => void;
  createProject: (project: Partial<Project>) => void;
  submitProposal: (proposal: Partial<Proposal>) => void;
  placeOrder: (service: Service, packageType: 'basic' | 'standard' | 'premium', notes?: string) => Order;
  deliverOrder: (orderId: string, notes: string, fileName?: string) => void;
  requestRevision: (orderId: string, reason: string) => void;
  completeOrder: (orderId: string) => void;
  submitReview: (orderId: string, freelancerId: string, rating: number, comment: string) => void;
  sendMessage: (recipientId: string, text: string, fileAttachment?: any) => void;
  requestWithdrawal: (amount: number, currency: Currency, method: string) => boolean;
  depositFunds: (amount: number, currency: Currency) => void;
  toggleFavorite: (id: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  markNotificationAsRead: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('af_services');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  const [freelancers] = useState<FreelancerProfile[]>(FREELANCERS);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('af_projects');
    return saved ? JSON.parse(saved) : PROJECTS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('af_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('af_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('af_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('af_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      conversationId: 'conv-fl1-cldemo',
      senderId: 'fl-1',
      senderName: 'احمد ولی فایز',
      recipientId: 'cl-demo',
      text: 'سلام و احترام! پروژه شما را دریافت کردم و در حال طراحی ساختار اولیه پایگاه داده و اتصال وب‌هوک HesabPay هستم.',
      createdAt: '۱۰ دقیقه قبل',
      isRead: true,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-fl1-cldemo',
      senderId: 'cl-demo',
      senderName: 'سید مسعود هاشمی',
      recipientId: 'fl-1',
      text: 'بسیار عالی، لطفاً مطمئن شوید نسخه PWA و ریسپانسیو موبایل هم تست می‌شود.',
      createdAt: '۵ دقیقه قبل',
      isRead: false,
    },
  ]);

  const [wallet, setWallet] = useState<Wallet>(() => {
    const saved = localStorage.getItem('af_wallet');
    return saved
      ? JSON.parse(saved)
      : {
          userId: 'current-user',
          balanceAFN: 24500,
          balanceUSD: 350,
          pendingEscrowAFN: 14000,
          pendingEscrowUSD: 198,
          totalWithdrawnAFN: 45000,
          totalWithdrawnUSD: 600,
        };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'current-user',
      title: 'پرداخت امن HesabPay تأیید شد',
      message: 'سفارش AF-892101 با موفقیت پرداخت شد و در صف اجرای فریلنسر قرار گرفت.',
      type: 'payment',
      link: '/orders',
      isRead: false,
      createdAt: '۱ ساعت پیش',
    },
    {
      id: 'notif-2',
      userId: 'current-user',
      title: 'تحویل کار انجام شد',
      message: 'طراح مریم سادات نیازی کار سفارش AF-892102 را برای شما ارسال کرد.',
      type: 'order',
      link: '/orders',
      isRead: false,
      createdAt: '۳ ساعت پیش',
    },
  ]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('af_favorites');
    return saved ? JSON.parse(saved) : ['srv-1', 'fl-2'];
  });

  const [settings, setSettings] = useState<PlatformSettings>({
    commissionPercent: 10,
    exchangeRateAfnPerUsd: 70.5,
    demoMode: true,
    maintenanceMode: false,
  });

  // HesabPay Checkout Modal Trigger
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem('af_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('af_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('af_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('af_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('af_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const openCheckout = (order: Order) => {
    setActiveCheckoutOrder(order);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setActiveCheckoutOrder(null);
  };

  /**
   * Process and verify HesabPay payment success
   */
  const processHesabPaySuccess = async (orderId: string, sessionId?: string) => {
    try {
      // Call backend simulation or check status
      await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sessionId }),
      }).catch(() => {});

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? { ...ord, status: 'in_progress' as const, updatedAt: new Date().toLocaleDateString('fa-AF') }
            : ord
        )
      );

      // Record transaction
      const targetOrder = orders.find((o) => o.id === orderId) || activeCheckoutOrder;
      if (targetOrder) {
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          userId: currentUser?.id || 'usr-current',
          orderId: targetOrder.id,
          orderNumber: targetOrder.orderNumber,
          type: 'payment',
          amount: targetOrder.amountAFN,
          currency: targetOrder.currency,
          status: 'completed',
          paymentMethod: 'HesabPay',
          referenceId: sessionId || `HP_LIVE_${Date.now()}`,
          createdAt: new Date().toLocaleDateString('fa-AF'),
          description: `پرداخت امن سفارش ${targetOrder.serviceTitle} با درگاه رسمی حساب‌پی`,
        };
        setTransactions((prev) => [newTx, ...prev]);

        // Add Notification
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            userId: currentUser?.id || 'usr-current',
            title: 'تأییدیه پرداخت حساب‌پی (HesabPay)',
            message: `مبلغ ${targetOrder.amountAFN.toLocaleString()} افغانی برای سفارش ${targetOrder.orderNumber} با موفقیت در صندوق امانی (Escrow) سپرده شد.`,
            type: 'payment',
            isRead: false,
            createdAt: 'لحظاتی پیش',
          },
          ...prev,
        ]);
      }

      closeCheckout();
    } catch (e) {
      console.error('Payment processing error:', e);
    }
  };

  const placeOrder = (
    service: Service,
    packageType: 'basic' | 'standard' | 'premium',
    notes?: string
  ): Order => {
    const pkg = service.packages[packageType];
    const commPercent = settings.commissionPercent / 100;
    const commAFN = Math.round(pkg.priceAFN * commPercent);
    const earningsAFN = pkg.priceAFN - commAFN;
    const commUSD = Math.round(pkg.priceUSD * commPercent);
    const earningsUSD = pkg.priceUSD - commUSD;

    const orderNumber = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      serviceId: service.id,
      serviceTitle: service.title,
      serviceImage: service.coverImage,
      packageType,
      clientId: currentUser?.id || 'cl-demo',
      clientName: currentUser?.name || 'کارفرمای افغان',
      clientEmail: currentUser?.email || 'client@example.af',
      freelancerId: service.freelancerId,
      freelancerName: service.freelancerName,
      freelancerAvatar: service.freelancerAvatar,
      amountAFN: pkg.priceAFN,
      amountUSD: pkg.priceUSD,
      currency: 'AFN',
      status: 'awaiting_payment',
      platformCommissionAFN: commAFN,
      freelancerEarningsAFN: earningsAFN,
      platformCommissionUSD: commUSD,
      freelancerEarningsUSD: earningsUSD,
      deliveryDeadline: `در ${pkg.deliveryDays} روز کاری`,
      createdAt: new Date().toLocaleDateString('fa-AF'),
      updatedAt: new Date().toLocaleDateString('fa-AF'),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Open checkout immediately
    openCheckout(newOrder);
    return newOrder;
  };

  const deliverOrder = (orderId: string, notes: string, fileName?: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'delivered' as const,
              updatedAt: new Date().toLocaleDateString('fa-AF'),
              deliveredWork: {
                notes,
                fileName: fileName || 'Completed_Work_Deliverable.zip',
                deliveredAt: new Date().toLocaleDateString('fa-AF'),
              },
            }
          : ord
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: 'cl-demo',
        title: 'تحویل کار فریلنسر',
        message: `فریلنسر کار نهایی سفارش را ارسال نمود. لطفاً بررسی و تأیید فرمایید.`,
        type: 'order',
        link: '/orders',
        isRead: false,
        createdAt: 'لحظاتی پیش',
      },
      ...prev,
    ]);
  };

  const requestRevision = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'revision_requested' as const, updatedAt: new Date().toLocaleDateString('fa-AF') }
          : ord
      )
    );
  };

  const completeOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'completed' as const, updatedAt: new Date().toLocaleDateString('fa-AF') }
          : ord
      )
    );

    // Release Escrow into Freelancer Wallet
    setWallet((prev) => ({
      ...prev,
      balanceAFN: prev.balanceAFN + target.freelancerEarningsAFN,
      balanceUSD: prev.balanceUSD + target.freelancerEarningsUSD,
      pendingEscrowAFN: Math.max(0, prev.pendingEscrowAFN - target.amountAFN),
      pendingEscrowUSD: Math.max(0, prev.pendingEscrowUSD - target.amountUSD),
    }));

    // Record transaction
    const releaseTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: target.freelancerId,
      orderId: target.id,
      orderNumber: target.orderNumber,
      type: 'freelancer_earnings',
      amount: target.freelancerEarningsAFN,
      currency: target.currency,
      status: 'completed',
      paymentMethod: 'Wallet',
      referenceId: `AF_RELEASE_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-AF'),
      description: `آزادسازی و واریز درآمد سفارش ${target.orderNumber} به کیف پول فریلنسر`,
    };
    setTransactions((prev) => [releaseTx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: target.freelancerId,
        title: 'پروژه با موفقیت تکمیل شد',
        message: `مبلغ ${target.freelancerEarningsAFN.toLocaleString()} افغانی به کیف پول شما واریز گردید.`,
        type: 'payment',
        isRead: false,
        createdAt: 'هم‌اکنون',
      },
      ...prev,
    ]);
  };

  const submitReview = (orderId: string, freelancerId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId,
      freelancerId,
      clientId: currentUser?.id || 'cl-demo',
      clientName: currentUser?.name || 'کارفرما',
      clientAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      rating,
      comment,
      createdAt: new Date().toLocaleDateString('fa-AF'),
    };
    setReviews((prev) => [newRev, ...prev]);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, reviewSubmitted: true } : o))
    );
  };

  const sendMessage = (recipientId: string, text: string, fileAttachment?: any) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${recipientId}-${currentUser?.id}`,
      senderId: currentUser?.id || 'usr-current',
      senderName: currentUser?.name || 'کاربر افغان فریلنس',
      recipientId,
      text,
      fileAttachment,
      createdAt: 'همین الان',
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const requestWithdrawal = (amount: number, currency: Currency, method: string): boolean => {
    if (currency === 'AFN' && amount > wallet.balanceAFN) return false;
    if (currency === 'USD' && amount > wallet.balanceUSD) return false;

    setWallet((prev) => ({
      ...prev,
      balanceAFN: currency === 'AFN' ? prev.balanceAFN - amount : prev.balanceAFN,
      balanceUSD: currency === 'USD' ? prev.balanceUSD - amount : prev.balanceUSD,
      totalWithdrawnAFN: currency === 'AFN' ? prev.totalWithdrawnAFN + amount : prev.totalWithdrawnAFN,
      totalWithdrawnUSD: currency === 'USD' ? prev.totalWithdrawnUSD + amount : prev.totalWithdrawnUSD,
    }));

    const wTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser?.id || 'usr-current',
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending',
      paymentMethod: method === 'hesabpay' ? 'HesabPay' : 'Bank Transfer',
      referenceId: `WTH_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('fa-AF'),
      description: `درخواست تسویه حساب از طریق ${method === 'hesabpay' ? 'کیف پول حساب‌پی' : 'حساب بانکی افغانستان'}`,
    };
    setTransactions((prev) => [wTx, ...prev]);
    return true;
  };

  const depositFunds = (amount: number, currency: Currency) => {
    setWallet((prev) => ({
      ...prev,
      balanceAFN: currency === 'AFN' ? prev.balanceAFN + amount : prev.balanceAFN,
      balanceUSD: currency === 'USD' ? prev.balanceUSD + amount : prev.balanceUSD,
    }));
  };

  const createService = (newService: Partial<Service>) => {
    const fullService: Service = {
      id: `srv-${Date.now()}`,
      freelancerId: currentUser?.id || 'fl-1',
      freelancerName: currentUser?.name || 'فریلنسر',
      freelancerUsername: 'expert_af',
      freelancerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      freelancerBadges: ['Verified', 'Professional'],
      title: newService.title || 'خدمت تخصصی جدید',
      categoryId: newService.categoryId || 'cat-web',
      categoryName: newService.categoryName || 'طراحی وبسایت',
      description: newService.description || '',
      coverImage: newService.coverImage || 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
      gallery: [newService.coverImage || 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80'],
      tags: newService.tags || ['AfghanTalent'],
      rating: 5.0,
      reviewCount: 0,
      ordersInQueue: 0,
      createdAt: new Date().toLocaleDateString('fa-AF'),
      packages: newService.packages || {
        basic: {
          name: 'basic',
          title: 'بسته پایه',
          description: 'انجام کار با کیفیت اولیه',
          deliveryDays: 3,
          revisions: 2,
          priceAFN: 3000,
          priceUSD: 42,
          features: ['تحویل سریع', 'پشتیبانی اولیه'],
        },
        standard: {
          name: 'standard',
          title: 'بسته استاندارد',
          description: 'کیفیت بالا و امکانات بیشتر',
          deliveryDays: 6,
          revisions: 4,
          priceAFN: 8000,
          priceUSD: 112,
          features: ['فایل منبع', 'اصلاحات چندگانه', 'پشتیبانی ۱۴ روزه'],
        },
        premium: {
          name: 'premium',
          title: 'بسته VIP حرفه‌ای',
          description: 'کامل‌ترین بسته تجاری با پشتیبانی نامحدود',
          deliveryDays: 10,
          revisions: 999,
          priceAFN: 18000,
          priceUSD: 255,
          features: ['ویرایش نامحدود', 'اولویت تحویل', 'مشاوره اختصاصی'],
        },
      },
      faq: [],
    };

    setServices((prev) => [fullService, ...prev]);
  };

  const createProject = (newProj: Partial<Project>) => {
    const fullProj: Project = {
      id: `prj-${Date.now()}`,
      clientId: currentUser?.id || 'cl-demo',
      clientName: currentUser?.name || 'کارفرمای افغان',
      clientAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      title: newProj.title || 'پروژه جدید',
      description: newProj.description || '',
      categoryId: newProj.categoryId || 'cat-web',
      categoryName: newProj.categoryName || 'طراحی وبسایت',
      budgetMinAFN: newProj.budgetMinAFN || 10000,
      budgetMaxAFN: newProj.budgetMaxAFN || 25000,
      budgetMinUSD: newProj.budgetMinUSD || 140,
      budgetMaxUSD: newProj.budgetMaxUSD || 350,
      deadline: newProj.deadline || '۱۴ روز کاری',
      skillsRequired: newProj.skillsRequired || ['General'],
      proposalsCount: 0,
      status: 'open',
      createdAt: new Date().toLocaleDateString('fa-AF'),
    };
    setProjects((prev) => [fullProj, ...prev]);
  };

  const submitProposal = (prop: Partial<Proposal>) => {
    const fullProp: Proposal = {
      id: `prop-${Date.now()}`,
      projectId: prop.projectId || '',
      freelancerId: currentUser?.id || 'fl-1',
      freelancerName: currentUser?.name || 'احمد ولی فایز',
      freelancerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      freelancerRating: 4.98,
      bidAmountAFN: prop.bidAmountAFN || 15000,
      bidAmountUSD: prop.bidAmountUSD || 210,
      deliveryDays: prop.deliveryDays || 7,
      coverLetter: prop.coverLetter || '',
      createdAt: new Date().toLocaleDateString('fa-AF'),
      status: 'pending',
    };
    setProposals((prev) => [fullProp, ...prev]);

    // increment project proposal count
    if (prop.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === prop.projectId ? { ...p, proposalsCount: p.proposalsCount + 1 } : p
        )
      );
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    // Also sync to backend
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    }).catch(() => {});
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        services,
        freelancers,
        projects,
        proposals,
        orders,
        reviews,
        messages,
        wallet,
        transactions,
        notifications,
        favorites,
        settings,
        isCheckoutOpen,
        activeCheckoutOrder,
        openCheckout,
        closeCheckout,
        processHesabPaySuccess,
        createService,
        createProject,
        submitProposal,
        placeOrder,
        deliverOrder,
        requestRevision,
        completeOrder,
        submitReview,
        sendMessage,
        requestWithdrawal,
        depositFunds,
        toggleFavorite,
        updateSettings,
        markNotificationAsRead,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
