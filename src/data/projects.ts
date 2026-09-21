import { Project, Proposal } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'prj-1',
    clientId: 'cl-1',
    clientName: 'شرکت صادرات میوه خشک کابل (Kabul Dry Fruits)',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    title: 'طراحی و توسعه وبسایت چندزبانه برای صادرات قالین و صنایع دستی افغانستان',
    description: 'به دنبال یک توسعه‌دهنده باتجربه فول‌استک هستیم تا وبسایت مدرنی برای معرفی و فروش محصولات صنایع دستی و قالین دستباف به بازارهای اروپا و خاورمیانه بسازد. سیستم باید چندزبانه (دری، پشتو، انگلیسی، آلمانی) باشد و از درگاه HesabPay و کارت‌های بین‌المللی پشتیبانی کند.',
    categoryId: 'cat-web',
    categoryName: 'طراحی وبسایت',
    budgetMinAFN: 25000,
    budgetMaxAFN: 45000,
    budgetMinUSD: 350,
    budgetMaxUSD: 640,
    deadline: '۲۰ روز کاری',
    skillsRequired: ['Next.js', 'React', 'HesabPay', 'Multilingual', 'Tailwind CSS'],
    proposalsCount: 8,
    status: 'open',
    createdAt: '۲۰۲۴-۰۲-۲۲'
  },
  {
    id: 'prj-2',
    clientId: 'cl-2',
    clientName: 'نهاد آموزشی ارتقای جوانان هرات',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    title: 'ترجمه رسمی ۳ جلد کتابچه راهنمای کارآفرینی از انگلیسی به دری و پشتو',
    description: 'نیاز به مترجم مسلط به ادبیات کسب‌وکار و روان‌نویسی داریم تا متون آموزشی کارآفرینی جوانان (در مجموع حدود ۲۵,۰۰۰ کلمه) را به دو زبان ملی کشور با رعایت کامل اصول نگارشی و اصطلاحات روز ترجمه کند.',
    categoryId: 'cat-translation',
    categoryName: 'ترجمه تخصصی',
    budgetMinAFN: 18000,
    budgetMaxAFN: 30000,
    budgetMinUSD: 250,
    budgetMaxUSD: 420,
    deadline: '۱۵ روز کاری',
    skillsRequired: ['Pashto Translation', 'Dari Translation', 'Proofreading', 'Academic Editing'],
    proposalsCount: 12,
    status: 'open',
    createdAt: '۲۰۲۴-۰۲-۲۴'
  },
  {
    id: 'prj-3',
    clientId: 'cl-3',
    clientName: 'استارتاپ لجستیک آریا بلخ',
    clientAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    title: 'طراحی هویت بصری کامل و نشان تجاری شرکت حمل‌ونقل هوایی بار',
    description: 'ما یک شرکت نوپا در حوزه حمل‌ونقل هوایی کالا از مزارشریف به دبی و استانبول هستیم. به لوگویی مدرن با المان‌های شاهین/پرواز، سرعت و امنیت نیاز داریم به همراه رنگ‌بندی سازمانی، طراحی بدنه موترها و کارت ویزیت.',
    categoryId: 'cat-graphic',
    categoryName: 'طراحی گرافیک',
    budgetMinAFN: 12000,
    budgetMaxAFN: 20000,
    budgetMinUSD: 170,
    budgetMaxUSD: 280,
    deadline: '۱۰ روز کاری',
    skillsRequired: ['Logo Design', 'Branding', 'Vector Art', 'Color Palette'],
    proposalsCount: 6,
    status: 'open',
    createdAt: '۲۰۲۴-۰۲-۲۵'
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    projectId: 'prj-1',
    freelancerId: 'fl-1',
    freelancerName: 'احمد ولی فایز',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    freelancerRating: 4.98,
    bidAmountAFN: 35000,
    bidAmountUSD: 495,
    deliveryDays: 14,
    coverLetter: 'سلام و احترام. من تجربه پیاده‌سازی فروشگاه‌های صادراتی با درگاه HesabPay و سیستم چندزبانه Next.js را دارم. نمونه کار مشابه برای زعفران هرات را می‌توانید در پروفایلم مشاهده بفرمایید. پروژه با بالاترین سرعت و استانداردهای سئو تحویل خواهد شد.',
    createdAt: '۲۰۲۴-۰۲-۲۳',
    status: 'pending'
  },
  {
    id: 'prop-2',
    projectId: 'prj-2',
    freelancerId: 'fl-3',
    freelancerName: 'عبدالرحمان شینواری',
    freelancerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    freelancerRating: 5.0,
    bidAmountAFN: 22000,
    bidAmountUSD: 310,
    deliveryDays: 12,
    coverLetter: 'سلام. به عنوان مترجم رسمی با سابقه ترجمه بیش از ۱۰ عنوان کتاب مدیریتی، تضمین می‌کنم متون به زبانی بسیار سلیس، علمی و جذاب به هر دو زبان دری و پشتو برگردانده شوند.',
    createdAt: '۲۰۲۴-۰۲-۲۴',
    status: 'pending'
  }
];
