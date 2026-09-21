import { Service } from '../types';

export const SERVICES: Service[] = [
  {
    id: 'srv-1',
    freelancerId: 'fl-1',
    freelancerName: 'احمد ولی فایز',
    freelancerUsername: 'ahmad_faiz_dev',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated', 'Professional'],
    title: 'توسعه وبسایت حرفه‌ای فول‌استک با React، Next.js و اتصال به حساب‌پی',
    categoryId: 'cat-web',
    categoryName: 'طراحی وبسایت',
    description: 'ساخت وبسایت با بالاترین استانداردهای روز دنیا، کاملاً ریسپانسیو برای موبایل، کد تمیز TypeScript، سرعت بارگذاری خارق‌العاده، سئوی استاندارد و اتصال رسمی به درگاه پرداخت افغانستان (HesabPay) و روش‌های بین‌المللی.',
    coverImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['React', 'Next.js', 'HesabPay', 'Full Stack', 'Tailwind CSS', 'PWA'],
    rating: 4.98,
    reviewCount: 68,
    ordersInQueue: 3,
    isFeatured: true,
    createdAt: '2024-01-10',
    packages: {
      basic: {
        name: 'basic',
        title: 'صفحه فرود تک صفحه‌ای (Landing Page)',
        description: 'طراحی تک‌صفحه واکنش‌گرا و سریع، فرم تماس، معرفی خدمات و اتصال شبکه‌های اجتماعی',
        deliveryDays: 3,
        revisions: 2,
        priceAFN: 5500,
        priceUSD: 78,
        features: ['طراحی ۱ صفحه کامل', 'کاملاً Responsive موبایل', 'سرعت بارگذاری عالی', 'سورس کد کامل']
      },
      standard: {
        name: 'standard',
        title: 'وبسایت شرکتی ۵ صفحه‌ای + وبلاگ',
        description: 'وبسایت چند صفحه‌ای کامل با پنل مدیریت محتوا، سئوی اولیه و فرم تماس پیشرفته',
        deliveryDays: 7,
        revisions: 4,
        priceAFN: 14000,
        priceUSD: 198,
        features: ['تا ۵ صفحه مجزا', 'پنل ادمین اختصاصی', 'پشتیبانی از دو زبانه (دری/انگلیسی)', 'بهینه‌سازی سئو']
      },
      premium: {
        name: 'premium',
        title: 'فروشگاه آنلاین کامل + درگاه HesabPay',
        description: 'فروشگاه پیشرفته با سبد خرید، مدیریت محصولات، درگاه رسمی HesabPay، فاکتور و PWA',
        deliveryDays: 14,
        revisions: 999, // unlimited
        priceAFN: 29500,
        priceUSD: 418,
        features: ['سیستم کامل فروشگاه و سبد خرید', 'اتصال درگاه HesabPay و مسترکارت', 'PWA و قابلیت نصب موبایل', 'پشتیبانی فنی ۳۰ روزه']
      }
    },
    faq: [
      {
        question: 'آیا درگاه پرداخت حساب‌پی (HesabPay) به صورت کامل تست می‌شود؟',
        answer: 'بله، ابتدا در محیط آزمایشی (Sandbox) تمام مراحل تست و اعتبارسنجی وبهوک‌ها انجام شده و سپس با کلید تجاری شما روی حالت واقعی تحویل داده می‌شود.'
      },
      {
        question: 'آیا پشتیبانی پس از تحویل ارائه می‌شود؟',
        answer: 'بله، بسته به پکیج انتخابی بین ۱۴ تا ۳۰ روز پشتیبانی رایگان برای برطرف کردن هرگونه اشکال احتمالی ارائه می‌گردد.'
      }
    ]
  },
  {
    id: 'srv-2',
    freelancerId: 'fl-2',
    freelancerName: 'مریم سادات نیازی',
    freelancerUsername: 'maryam_niazi_design',
    freelancerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated', 'Professional'],
    title: 'طراحی لوگو و هویت بصری لوکس با الهام از اصالت و فرهنگ افغانستان',
    categoryId: 'cat-graphic',
    categoryName: 'طراحی گرافیک',
    description: 'خلق لوگوهای مفهومی، مینیمال و ماندگار با تلفیق هنر و نقوش غنی هندسی افغانستان و متدهای مدرن بین‌المللی. شامل کدهای رنگی پنتون، فایل‌های برداری با کیفیت نامحدود و راهنمای استفاده از لوگو.',
    coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['Logo Design', 'Branding', 'Afghan Art', 'Typography', 'Illustrator', 'Minimalist'],
    rating: 4.96,
    reviewCount: 54,
    ordersInQueue: 2,
    isFeatured: true,
    createdAt: '2024-01-18',
    packages: {
      basic: {
        name: 'basic',
        title: 'لوگو مینیمال (۲ اتود اولیه)',
        description: 'طراحی ۲ کانسپت متمایز، تحویل فایل‌های با کیفیت PNG، JPG و وکتور SVG',
        deliveryDays: 2,
        revisions: 3,
        priceAFN: 3200,
        priceUSD: 45,
        features: ['۲ اتود اختصاصی', 'فایل برداری و شفاف PNG', 'رزولوشن بالا']
      },
      standard: {
        name: 'standard',
        title: 'بسته کامل برندینگ شرکتی',
        description: '۳ اتود لوگو + ست اداری (کارت ویزیت، سربرگ، پاکت نامه) و پالت رنگ',
        deliveryDays: 5,
        revisions: 6,
        priceAFN: 8400,
        priceUSD: 119,
        features: ['۳ اتود لوگو', 'کارت ویزیت و سربرگ رسمی', 'فایل‌های منبع AI و EPS', 'پالت رنگ و تایپوگرافی']
      },
      premium: {
        name: 'premium',
        title: 'کتابچه هویت برند (Brand Book VIP)',
        description: 'هویت بصری کامل، بسته‌بندی، شبکه‌های اجتماعی، دفترچه جامع هویت سازمانی',
        deliveryDays: 8,
        revisions: 999,
        priceAFN: 18500,
        priceUSD: 262,
        features: ['طراحی لوگوی اصلی و ثانویه', 'دفترچه راهنمای برند ۳۰ صفحه‌ای', 'قالب‌های اینستاگرام و فیسبوک', 'حق مالکیت ۱۰۰٪ انحصاری']
      }
    },
    faq: [
      {
        question: 'آیا فایل‌های اصلی و قابل ویرایش تحویل داده می‌شود؟',
        answer: 'بله، تمامی فایل‌های لایه‌باز و برداری شامل AI, EPS, SVG, PDF و تصاویر باکیفیت بدون افت کیفیت تقدیم می‌شود.'
      }
    ]
  },
  {
    id: 'srv-3',
    freelancerId: 'fl-3',
    freelancerName: 'عبدالرحمان شینواری',
    freelancerUsername: 'shinwari_translator',
    freelancerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated', 'Fast Responder'],
    title: 'ترجمه رسمی و تخصصی پشتو، دری و انگلیسی با رعایت امانت و نگارش اصیل',
    categoryId: 'cat-translation',
    categoryName: 'ترجمه تخصصی',
    description: 'ترجمه دستی و حرفه‌ای (بدون گوگل ترنسلیت) برای اسناد حقوقی، قراردادهای تجاری، وبسایت‌ها، کتابچه‌های آموزشی و گزارش‌های رسمی بین زبان‌های پشتو، دری و انگلیسی.',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['Pashto', 'Dari', 'English', 'Translation', 'Official', 'Proofreading'],
    rating: 5.0,
    reviewCount: 88,
    ordersInQueue: 4,
    isFeatured: true,
    createdAt: '2023-12-05',
    packages: {
      basic: {
        name: 'basic',
        title: 'ترجمه تا ۵۰۰ کلمه',
        description: 'ترجمه سریع و روان ۵۰۰ کلمه متن عمومی یا تخصصی با بازخوانی نگارشی',
        deliveryDays: 1,
        revisions: 2,
        priceAFN: 1000,
        priceUSD: 14,
        features: ['ترجمه تا ۵۰۰ کلمه', 'ویرایش و اصلاح گرامری', 'تحویل در فرمت Word و PDF']
      },
      standard: {
        name: 'standard',
        title: 'ترجمه تا ۲,۰۰۰ کلمه',
        description: 'مناسب مقالات، قراردادها و صفحات وبسایت با اصطلاح‌شناسی دقیق',
        deliveryDays: 3,
        revisions: 4,
        priceAFN: 3500,
        priceUSD: 50,
        features: ['ترجمه تا ۲,۰۰۰ کلمه', 'ترجمه تخصصی متون فنی یا حقوقی', 'بازبینی توسط ویراستار دوم']
      },
      premium: {
        name: 'premium',
        title: 'ترجمه جامع تا ۵,۰۰۰ کلمه',
        description: 'پروژه‌های بزرگ، بومی‌سازی کامل نرم‌افزار، کاتالوگ یا گزارش‌های رسمی',
        deliveryDays: 6,
        revisions: 999,
        priceAFN: 8000,
        priceUSD: 114,
        features: ['ترجمه تا ۵,۰۰۰ کلمه', 'جدول واژه‌نامه تخصصی (Glossary)', 'تحویل فوری و بازبینی نامحدود']
      }
    },
    faq: [
      {
        question: 'آیا ترجمه اسناد کاملاً محرمانه می‌ماند؟',
        answer: 'صد در صد. اسناد مشتریان به صورت کاملاً امن نگهداری شده و پس از پایان کار پاکسازی می‌گردد.'
      }
    ]
  },
  {
    id: 'srv-4',
    freelancerId: 'fl-4',
    freelancerName: 'جمشید حیدری',
    freelancerUsername: 'jamshid_motion',
    freelancerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated'],
    title: 'تدوین حرفه‌ای ویدیو، موشن گرافیک تبلیغاتی و ریلزهای جذاب',
    categoryId: 'cat-video',
    categoryName: 'تدوین ویدیو و انیمیشن',
    description: 'ساخت تیزرهای تبلیغاتی، ریلز اینستاگرام، ویدیوهای یوتیوب و موشن‌گرافیک با کیفیت Full HD و 4K همراه با صداگذاری و زیرنویس اختصاصی.',
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['Video Editing', 'Motion Graphics', 'Premiere', 'Reels', 'Animation'],
    rating: 4.93,
    reviewCount: 39,
    ordersInQueue: 1,
    isFeatured: false,
    createdAt: '2024-02-01',
    packages: {
      basic: {
        name: 'basic',
        title: 'تدوین ویدیو تا ۱ دقیقه (Reels / TikTok)',
        description: 'تدوین ریتمیک، زیرنویس پویا، ترنزیشن‌های ترند و انتخاب موزیک بدون کپی‌رایت',
        deliveryDays: 2,
        revisions: 2,
        priceAFN: 2500,
        priceUSD: 35,
        features: ['ویدیو عمودی ۹:۱۶', 'اصلاح رنگ و نور', 'موزیک و افکت صوتی']
      },
      standard: {
        name: 'standard',
        title: 'ویدیو یوتیوب یا شرکتی تا ۵ دقیقه',
        description: 'تدوین چند دوربینه، کات‌های حرفه‌ای، موشن تایتل و نویزگیری صدا',
        deliveryDays: 4,
        revisions: 3,
        priceAFN: 6500,
        priceUSD: 92,
        features: ['تدوین تا ۵ دقیقه', 'موشن گرافیک لوگو و زیرنویس', 'کیفیت 1080p یا 4K']
      },
      premium: {
        name: 'premium',
        title: 'تیزر موشن گرافیک اختصاصی ۶۰ ثانیه‌ای',
        description: 'سناریونویسی، تصویرسازی وکتور، انیمیشن ۲ بعدی کامل و نریشن حرفه‌ای',
        deliveryDays: 7,
        revisions: 999,
        priceAFN: 15000,
        priceUSD: 212,
        features: ['موشن گرافیک کامل', 'گویندگی نریشن به دری یا پشتو', 'موزیک اختصاصی']
      }
    },
    faq: []
  },
  {
    id: 'srv-5',
    freelancerId: 'fl-5',
    freelancerName: 'فاطمه رضایی',
    freelancerUsername: 'fatima_ai_engineer',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated', 'Fast Responder'],
    title: 'توسعه چت‌بات‌های هوش مصنوعی و ادغام Gemini برای کسب‌وکارها',
    categoryId: 'cat-ai',
    categoryName: 'هوش مصنوعی و دیتا',
    description: 'ساخت چت‌بات‌های پاسخگوی مشتریان با هوش مصنوعی مولد گوگل (Gemini)، اتصال به اسناد سازمان، پشتیبانی به زبان‌های دری و پشتو و استقرار روی سرور ابری.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['AI', 'Gemini', 'Python', 'Chatbot', 'NLP Pashto', 'FastAPI'],
    rating: 4.97,
    reviewCount: 31,
    ordersInQueue: 2,
    isFeatured: true,
    createdAt: '2024-02-14',
    packages: {
      basic: {
        name: 'basic',
        title: 'اتصال Gemini به وبسایت با پرسش و پاسخ ساده',
        description: 'تنظیم کلید API، ساخت رابط چت مینیمال و پرامپت اختصاصی',
        deliveryDays: 2,
        revisions: 2,
        priceAFN: 4800,
        priceUSD: 68,
        features: ['رابط کاربری مدرن چت', 'سیستم مدیریت پرامپت', 'راهنمای نصب']
      },
      standard: {
        name: 'standard',
        title: 'چت‌بات هوشمند متصل به اسناد (RAG)',
        description: 'سیستم بازیابی اطلاعات از PDFها، کاتالوگ محصولات و پاسخگویی به دری/پشتو',
        deliveryDays: 5,
        revisions: 4,
        priceAFN: 13500,
        priceUSD: 191,
        features: ['پشتیبانی از ۱۰۰ سند سازمانی', 'حافظه مکالمه کاربر', 'داشبورد آنالیز سؤالات']
      },
      premium: {
        name: 'premium',
        title: 'سامانه کامل اتوماسیون سازمانی مبتنی بر AI',
        description: 'ربات چندکاناله (وب، تلگرام، واتساپ)، پایگاه داده برداری و بهینه‌سازی مدل',
        deliveryDays: 10,
        revisions: 999,
        priceAFN: 28000,
        priceUSD: 397,
        features: ['اتصال به سامانه‌های داخلی', 'تحلیل رضایت مشتری', 'پشتیبانی و مانیتورینگ']
      }
    },
    faq: []
  },
  {
    id: 'srv-6',
    freelancerId: 'fl-1',
    freelancerName: 'احمد ولی فایز',
    freelancerUsername: 'ahmad_faiz_dev',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    freelancerBadges: ['Verified', 'Top Rated'],
    title: 'توسعه اپلیکیشن موبایل با فلاتر (Flutter) برای اندروید و iOS',
    categoryId: 'cat-mobile',
    categoryName: 'اپلیکیشن موبایل',
    description: 'ساخت اپلیکیشن‌های سریع و کارآمد با کدنویسی یکپارچه Flutter، طراحی مدرن، قابلیت کار آفلاین و اتصال مستقیم به APIها و دیتابیس.',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['Flutter', 'Android', 'iOS', 'Mobile App', 'Dart'],
    rating: 4.95,
    reviewCount: 42,
    ordersInQueue: 1,
    isFeatured: false,
    createdAt: '2024-02-20',
    packages: {
      basic: {
        name: 'basic',
        title: 'طراحی ۳ صفحه UI اپلیکیشن',
        description: 'کدنویسی صفحات در فلاتر مطابق طرح فیگما با انیمیشن‌های روان',
        deliveryDays: 4,
        revisions: 2,
        priceAFN: 7000,
        priceUSD: 99,
        features: ['۳ صفحه کدنویسی شده', 'پشتیبانی دارک مود و لایت مود', 'خروجی APK تست']
      },
      standard: {
        name: 'standard',
        title: 'اپلیکیشن کامل خدماتی یا خبری',
        description: 'اپلیکیشن متصل به سرور، نوتیفیکیشن، ذخیره آفلاین و احراز هویت',
        deliveryDays: 10,
        revisions: 5,
        priceAFN: 22000,
        priceUSD: 312,
        features: ['تا ۸ صفحه کاربردی', 'اتصال به REST API', 'پوش نوتیفیکیشن']
      },
      premium: {
        name: 'premium',
        title: 'اپلیکیشن تجاری کامل با پرداخت درون‌برنامه‌ای',
        description: 'سیستم کامل فروشگاهی یا تاکسی آنلاین، نقشه، کیف پول و انتشار در گوگل پلی',
        deliveryDays: 18,
        revisions: 999,
        priceAFN: 45000,
        priceUSD: 638,
        features: ['معماری کامل کلین کد', 'پشتیبانی از پرداخت HesabPay', 'راهنمای انتشار در استورها']
      }
    },
    faq: []
  }
];
