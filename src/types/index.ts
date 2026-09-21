export type Language = 'fa' | 'ps' | 'en';
export type Currency = 'AFN' | 'USD';

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'client' | 'freelancer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  phone?: string;
  location?: {
    city: string;
    country: string;
  };
}

export interface FreelancerProfile extends User {
  username: string;
  headline: string;
  bio: string;
  hourlyRateAFN: number;
  hourlyRateUSD: number;
  skills: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  completedOrders: number;
  responseTime: string; // e.g. "کمتر از ۲ ساعت" / "< 2 hours"
  availability: 'available' | 'busy' | 'away';
  badges: ('Verified' | 'Top Rated' | 'Fast Responder' | 'Professional' | 'New Freelancer')[];
  portfolio: {
    id: string;
    title: string;
    image: string;
    category: string;
    description: string;
    link?: string;
  }[];
}

export interface ServicePackage {
  name: 'basic' | 'standard' | 'premium';
  title: string;
  description: string;
  deliveryDays: number;
  revisions: number;
  priceAFN: number;
  priceUSD: number;
  features: string[];
}

export interface Service {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerUsername: string;
  freelancerAvatar: string;
  freelancerBadges: string[];
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  ordersInQueue: number;
  packages: {
    basic: ServicePackage;
    standard: ServicePackage;
    premium: ServicePackage;
  };
  faq: { question: string; answer: string }[];
  isFeatured?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameFa: string;
  namePs: string;
  nameEn: string;
  iconName: string;
  image: string;
  serviceCount: number;
  descriptionFa: string;
  descriptionEn: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  budgetMinAFN: number;
  budgetMaxAFN: number;
  budgetMinUSD: number;
  budgetMaxUSD: number;
  deadline: string;
  skillsRequired: string[];
  proposalsCount: number;
  status: 'open' | 'awarded' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  bidAmountAFN: number;
  bidAmountUSD: number;
  deliveryDays: number;
  coverLetter: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Order {
  id: string;
  orderNumber: string;
  serviceId?: string;
  serviceTitle: string;
  serviceImage?: string;
  packageType: 'basic' | 'standard' | 'premium';
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  amountAFN: number;
  amountUSD: number;
  currency: Currency;
  status: OrderStatus;
  platformCommissionAFN: number;
  freelancerEarningsAFN: number;
  platformCommissionUSD: number;
  freelancerEarningsUSD: number;
  deliveryDeadline: string;
  createdAt: string;
  updatedAt: string;
  hesabPaySessionId?: string;
  deliveredWork?: {
    notes: string;
    fileUrl?: string;
    fileName?: string;
    deliveredAt: string;
  };
  reviewSubmitted?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  serviceId?: string;
  freelancerId: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  sellerResponse?: {
    text: string;
    createdAt: string;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
  createdAt: string;
  isRead: boolean;
}

export interface Wallet {
  userId: string;
  balanceAFN: number;
  balanceUSD: number;
  pendingEscrowAFN: number;
  pendingEscrowUSD: number;
  totalWithdrawnAFN: number;
  totalWithdrawnUSD: number;
}

export interface Transaction {
  id: string;
  userId: string;
  orderId?: string;
  orderNumber?: string;
  type: 'deposit' | 'payment' | 'refund' | 'withdrawal' | 'freelancer_earnings' | 'platform_fee';
  amount: number;
  currency: Currency;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'HesabPay' | 'AfPay' | 'Wallet' | 'Bank Transfer';
  referenceId: string;
  createdAt: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'payment' | 'proposal' | 'system' | 'review';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  result: 'success' | 'failure';
}

export interface PlatformSettings {
  commissionPercent: number;
  exchangeRateAfnPerUsd: number;
  demoMode: boolean;
  maintenanceMode: boolean;
}
