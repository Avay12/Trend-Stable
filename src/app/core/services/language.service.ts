import { Injectable, signal, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private authService = inject(AuthService);
  
  // Storage key prefix. Actual key will be 'smm_selected_language_USERID'
  private readonly BASE_STORAGE_KEY = 'smm_selected_language';

  readonly languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  ];

  // Simple translation dictionary
  private translations: Record<string, Record<string, string>> = {
    en: {
      'DASHBOARD': 'Dashboard',
      'SERVICES': 'Services',
      'WALLET': 'Wallet',
      'ORDERS': 'Orders',
      'NEW_ORDER': 'New Order',
      'SELECT_SERVICE': 'Select a service and place your order',
      'REFRESH': 'Refresh',
      'CATEGORY': 'Category',
      'LOADING_SERVICES': 'Loading services...',
      'MIN': 'Min',
      'MAX': 'Max',
      'RATE_PER_1K': 'Rate per 1K',
      'QUANTITY': 'Quantity',
      'ACTION': 'Action',
      'ORDER': 'Order',
      'ADD_TO_CART': 'Add to Cart',
      'ORDER_NOW': 'Order Now',
      'COMPLETE_ORDER': 'Complete Order',
      'PRICE_PER_1000': 'Price per 1000',
      'SUBTOTAL': 'Subtotal',
      'TOTAL': 'Total',
      'PROFILE_URL': 'Profile URL',
      'ENTER_PROFILE_URL': 'Enter the profile link where you want the service delivered',
      'CONFIRM_PAY': 'Confirm & Pay',
      'TOTAL_PRICE': 'Total Price',
      'ADD_BALANCE': 'Add Balance',
      'PAY_WITH_CRYPTO': 'Pay with Crypto',
      'AMOUNT': 'Amount',
      'SELECT_TOKEN': 'Select Token',
      'SECURE': 'Secure',
      'INSTANT': 'Instant',
      'CANCEL': 'Cancel',
      'QR_PAYMENTS': 'QR Code Payments',
      'SCAN_QR': 'Scan the QR codes below to make payments using your preferred payment method',
      'SCAN_QR_INFO': 'Scan any of the QR codes below using your phone camera or a QR code scanner app. Each payment method offers instant and secure transactions. Choose the option that works best for you.',
      'AFTER_PAYMENT_SEND_SCREENSHOT': 'After Payment Send Screenshot',
      'DOWNLOAD_QR': 'Download QR',
      'HOW_TO_USE': 'How to use:',
      'OPEN_APP': 'Open your',
      'TAP_SCAN': 'Tap the scan button or camera icon',
      'POINT_CAMERA': 'Point your camera at the QR code',
      'COMPLETE_PAYMENT': 'Complete the payment',
      'FAQ': 'Frequently Asked Questions',
      'FAQ_SECURE_TITLE': 'Is my payment secure?',
      'FAQ_SECURE_DESC': 'Yes, all payments are processed through secure payment gateways with encryption and fraud protection.',
      'FAQ_PROCESSING_TITLE': 'How long does payment processing take?',
      'FAQ_PROCESSING_DESC': 'Most payments are processed instantly. You will receive a confirmation immediately after completion.',
      'FAQ_MULTIPLE_TITLE': 'Can I use multiple payment methods?',
      'FAQ_MULTIPLE_DESC': 'Yes, you can switch between different payment methods for different transactions based on your preference.',
      'FAQ_QR_ISSUE_TITLE': 'What if the QR code does not work?',
      'FAQ_QR_ISSUE_DESC': 'Make sure your device has a camera and proper lighting. If issues persist, you can download and print the QR code for better readability.',
      'DEPOSIT_HISTORY': 'Deposit History',
      'AVAILABLE_BALANCE': 'Available Balance',
      'LOGOUT': 'Logout',
      'SETTINGS': 'Settings',
      'ADMIN': 'Admin',
      'WELCOME_BACK': 'Welcome back',
      'DASHBOARD_SUBTITLE': "Here's an overview of your account and quick actions.",
      'ADD_FUNDS': 'Add Funds',
      'TOTAL_ORDERS': 'Total Orders',
      'VIEW_HISTORY': 'View History',
      'REFERRAL_BONUS': 'Referral Bonus',
      'INVITE_FRIENDS': 'Invite Friends',
      'GROWTH_ANALYTICS': 'Growth Analytics',
      'LAST_30_DAYS': 'Last 30 days performance',
      'VS_LAST_MONTH': 'vs last month',
      'WEEK_1': 'Week 1',
      'WEEK_2': 'Week 2',
      'WEEK_3': 'Week 3',
      'WEEK_4': 'Week 4',
      'TOTAL_DELIVERED': 'Total Delivered',
      'NO_COMPLETED_ORDERS': 'No completed orders yet',
      'QUICK_ACTIONS': 'Quick Actions',
      'TOP_UP_WALLET': 'Top up your wallet balance',
      'PLACE_ORDER': 'Place an Order',
      'BROWSE_SERVICES': 'Browse all services',
      'ORDER_HISTORY': 'Order History',
      'TRACK_ORDERS': 'Track your orders',
      'EARN_REWARDS': 'Earn bonus rewards',
      'FEEDBACK': 'Feedback',
      'SHARE_EXPERIENCE': 'Share your experience',
      'HOW_TO_GUIDE': 'How-to Guide',
      'WATCH_TUTORIALS': 'Watch tutorial videos',
      'NEED_HELP': 'Need Help?',
      'SUPPORT_TEXT': 'Our support team is available 24/7 to assist you.',
      'ABOUT_US': 'About Us',
      'SHOWING': 'Showing',
      'SERVICES_LOWER': 'services',
      'PRICES_INCLUDE_MARKUP': 'Prices include 1.5x markup'
    },
    ne: {
      'DASHBOARD': 'ड्यासबोर्ड',
      'SERVICES': 'सेवाहरू',
      'WALLET': 'वालेट',
      'ORDERS': 'अर्डरहरू',
      'NEW_ORDER': 'नयाँ अर्डर',
      'SELECT_SERVICE': 'सेवा छान्नुहोस् र अर्डर गर्नुहोस्',
      'REFRESH': 'रिफ्रेस',
      'CATEGORY': 'श्रेणी',
      'LOADING_SERVICES': 'सेवाहरू लोड हुँदैछ...',
      'MIN': 'न्यूनतम',
      'MAX': 'अधिकतम',
      'RATE_PER_1K': 'दर प्रति १ हजार',
      'QUANTITY': 'परिमाण',
      'ACTION': 'कार्य',
      'ORDER': 'अर्डर',
      'ADD_TO_CART': 'कार्टमा थप्नुहोस्',
      'ORDER_NOW': 'अर्डर गर्नुहोस्',
      'COMPLETE_ORDER': 'अर्डर पूरा गर्नुहोस्',
      'PRICE_PER_1000': 'मूल्य प्रति १०००',
      'SUBTOTAL': 'उपयोगकर्ता',
      'TOTAL': 'जम्मा',
      'PROFILE_URL': 'प्रोफाइल लिङ्क',
      'ENTER_PROFILE_URL': 'सेवा डेलिभरीका लागि प्रोफाइल लिङ्क प्रविष्ट गर्नुहोस्',
      'CONFIRM_PAY': 'पुष्टि र भुक्तानी',
      'TOTAL_PRICE': 'जम्मा मूल्य',
      'ADD_BALANCE': 'ब्यालेन्स थप्नुहोस्',
      'PAY_WITH_CRYPTO': 'क्रिप्टो मार्फत भुक्तानी',
      'AMOUNT': 'रकम',
      'SELECT_TOKEN': 'टोकन छान्नुहोस्',
      'SECURE': 'सुरक्षित',
      'INSTANT': 'तुरुन्त',
      'CANCEL': 'रद्द गर्नुहोस्',
      'QR_PAYMENTS': 'QR कोड भुक्तानी',
      'SCAN_QR': 'तपाईंको मनपर्ने भुक्तानी विधि प्रयोग गरेर भुक्तानी गर्न तलका QR कोडहरू स्क्यान गर्नुहोस्',
      'DEPOSIT_HISTORY': 'जम्मा इतिहास',
      'AVAILABLE_BALANCE': 'उपलब्ध ब्यालेन्स',
      'LOGOUT': 'लग आउट',
      'SETTINGS': 'सेटिङहरू',
      'ADMIN': 'प्रशासक',
      'WELCOME_BACK': 'स्वागत छ',
      'DASHBOARD_SUBTITLE': "तपाईंको खाताको अवलोकन र द्रुत कार्यहरू यहाँ छन्।",
      'ADD_FUNDS': 'फन्ड थप्नुहोस्',
      'TOTAL_ORDERS': 'कुल अर्डरहरू',
      'VIEW_HISTORY': 'इतिहास हेर्नुहोस्',
      'REFERRAL_BONUS': 'सिफारिस बोनस',
      'INVITE_FRIENDS': 'साथीहरूलाई आमन्त्रित गर्नुहोस्',
      'GROWTH_ANALYTICS': 'वृद्धि विश्लेषण',
      'LAST_30_DAYS': 'अन्तिम ३० दिनको प्रदर्शन',
      'VS_LAST_MONTH': 'गत महिनाको तुलनामा',
      'WEEK_1': 'हप्ता १',
      'WEEK_2': 'हप्ता २',
      'WEEK_3': 'हप्ता ३',
      'WEEK_4': 'हप्ता ४',
      'TOTAL_DELIVERED': 'कुल डेलिभर गरिएको',
      'NO_COMPLETED_ORDERS': 'अहिलेसम्म कुनै पूरा अर्डर छैन',
      'QUICK_ACTIONS': 'द्रुत कार्यहरू',
      'TOP_UP_WALLET': 'तपाईंको वालेट ब्यालेन्स टप अप गर्नुहोस्',
      'PLACE_ORDER': 'अर्डर गर्नुहोस्',
      'BROWSE_SERVICES': 'सबै सेवाहरू ब्राउज गर्नुहोस्',
      'ORDER_HISTORY': 'अर्डर इतिहास',
      'TRACK_ORDERS': 'तपाईंको अर्डरहरू ट्र्याक गर्नुहोस्',
      'EARN_REWARDS': 'बोनस पुरस्कार कमाउनुहोस्',
      'FEEDBACK': 'प्रतिक्रिया',
      'SHARE_EXPERIENCE': 'तपाईंको अनुभव साझा गर्नुहोस्',
      'HOW_TO_GUIDE': 'कसरी प्रयोग गर्ने गाइड',
      'WATCH_TUTORIALS': 'ट्यूटोरियल भिडियोहरू हेर्नुहोस्',
      'NEED_HELP': 'सहयोग चाहिन्छ?',
      'SUPPORT_TEXT': 'हाम्रो समर्थन टोली तपाईंलाई सहयोग गर्न २४/७ उपलब्ध छ।',
      'ABOUT_US': 'हाम्रोबारे',
      'SHOWING': 'देखाउँदै',
      'SERVICES_LOWER': 'सेवाहरू',
      'PRICES_INCLUDE_MARKUP': 'मूल्यहरूमा १.५ गुणा मार्कअप समावेश छ'
    },
    hi: {
      'DASHBOARD': 'डैशबोर्ड',
      'SERVICES': 'सेवाएं',
      'WALLET': 'वॉलेट',
      'ORDERS': 'ऑर्डर',
      'NEW_ORDER': 'नया ऑर्डर',
      'SELECT_SERVICE': 'सेवा चुनें और ऑर्डर करें',
      'REFRESH': 'रिफ्रेश',
      'CATEGORY': 'श्रेणी',
      'LOADING_SERVICES': 'सेवाएं लोड हो रही हैं...',
      'MIN': 'न्यूनतम',
      'MAX': 'अधिकतम',
      'RATE_PER_1K': 'दर प्रति 1K',
      'QUANTITY': 'मात्रा',
      'ACTION': 'कार्रवाई',
      'ORDER': 'ऑर्डर',
      'ADD_TO_CART': 'कार्ट में जोड़ें',
      'ORDER_NOW': 'अभी ऑर्डर करें',
      'COMPLETE_ORDER': 'ऑर्डर पूरा करें',
      'PRICE_PER_1000': 'मूल्य प्रति 1000',
      'SUBTOTAL': 'उपयोगकर्ता',
      'TOTAL': 'कुल',
      'PROFILE_URL': 'प्रोफाइल लिंक',
      'ENTER_PROFILE_URL': 'सेवा वितरण के लिए प्रोफाइल लिंक दर्ज करें',
      'CONFIRM_PAY': 'पुष्टि और भुगतान',
      'TOTAL_PRICE': 'कुल कीमत',
      'ADD_BALANCE': 'बैलेंस जोड़ें',
      'PAY_WITH_CRYPTO': 'क्रिप्टो के साथ भुगतान करें',
      'AMOUNT': 'राशि',
      'SELECT_TOKEN': 'टोकन चुनें',
      'SECURE': 'सुरक्षित',
      'INSTANT': 'तत्काल',
      'CANCEL': 'रद्द करें',
      'QR_PAYMENTS': 'QR कोड भुगतान',
      'SCAN_QR': 'भुगतान करने के लिए नीचे दिए गए QR कोड स्कैन करें',
      'DEPOSIT_HISTORY': 'जमा इतिहास',
      'AVAILABLE_BALANCE': 'उपलब्ध बैलेंस',
      'LOGOUT': 'लॉग आउट',
      'SETTINGS': 'सेटिंग्स',
      'ADMIN': 'एडमिन',
      'WELCOME_BACK': 'वापसी पर स्वागत है',
      'DASHBOARD_SUBTITLE': "यहाँ आपके खाते का अवलोकन और त्वरित कार्रवाई दी गई है।",
      'ADD_FUNDS': 'फंड जोड़ें',
      'TOTAL_ORDERS': 'कुल ऑर्डर',
      'VIEW_HISTORY': 'इतिहास देखें',
      'REFERRAL_BONUS': 'रेफरल बोनस',
      'INVITE_FRIENDS': 'दोस्तों को आमंत्रित करें',
      'GROWTH_ANALYTICS': 'विकास विश्लेषण',
      'LAST_30_DAYS': 'पिछले 30 दिनों का प्रदर्शन',
      'VS_LAST_MONTH': 'पिछले महीने की तुलना में',
      'WEEK_1': 'सप्ताह 1',
      'WEEK_2': 'सप्ताह 2',
      'WEEK_3': 'सप्ताह 3',
      'WEEK_4': 'सप्ताह 4',
      'TOTAL_DELIVERED': 'कुल वितरित',
      'NO_COMPLETED_ORDERS': 'अभी तक कोई पूरा ऑर्डर नहीं',
      'QUICK_ACTIONS': 'त्वरित कार्रवाई',
      'TOP_UP_WALLET': 'अपना वॉलेट बैलेंस टॉप अप करें',
      'PLACE_ORDER': 'ऑर्डर दें',
      'BROWSE_SERVICES': 'सभी सेवाएं ब्राउज़ करें',
      'ORDER_HISTORY': 'ऑर्डर इतिहास',
      'TRACK_ORDERS': 'अपने ऑर्डर ट्रैक करें',
      'EARN_REWARDS': 'बोनस पुरस्कार अर्जित करें',
      'FEEDBACK': 'प्रतिक्रिया',
      'SHARE_EXPERIENCE': 'अपना अनुभव साझा करें',
      'HOW_TO_GUIDE': 'कैसे उपयोग करें गाइड',
      'WATCH_TUTORIALS': 'ट्यूटोरियल वीडियो देखें',
      'NEED_HELP': 'मदद चाहिए?',
      'SUPPORT_TEXT': 'हमारी सहायता टीम आपकी सहायता के लिए 24/7 उपलब्ध है।',
      'ABOUT_US': 'हमारे बारे में',
      'SHOWING': 'दिखा रहा है',
      'SERVICES_LOWER': 'सेवाएं',
      'PRICES_INCLUDE_MARKUP': 'कीमतों में 1.5x मार्कअप शामिल है'
    },
    ur: {
      'DASHBOARD': 'ڈیش بورڈ',
      'SERVICES': 'خدمات',
      'WALLET': 'بٹوہ',
      'ORDERS': 'آرڈرز',
      'NEW_ORDER': 'نیا آرڈر',
      'SELECT_SERVICE': 'سروس منتخب کریں اور آرڈر دیں',
      'REFRESH': 'تازہ کریں',
      'CATEGORY': 'زمرہ',
      'LOADING_SERVICES': 'خدمات لوڈ ہو رہی ہیں...',
      'MIN': 'کم سے کم',
      'MAX': 'زیادہ سے زیادہ',
      'RATE_PER_1K': 'ریٹ فی 1K',
      'QUANTITY': 'مقدار',
      'ACTION': 'عمل',
      'ORDER': 'آرڈر',
      'ADD_TO_CART': 'کارٹ میں شامل کریں',
      'ORDER_NOW': 'اب آرڈر کریں',
      'COMPLETE_ORDER': 'آرڈر مکمل کریں',
      'PRICE_PER_1000': 'قیمت فی 1000',
      'SUBTOTAL': 'سب ٹوٹل',
      'TOTAL': 'کل',
      'PROFILE_URL': 'پروفائل لنک',
      'ENTER_PROFILE_URL': 'پروفائل لنک درج کریں جہاں آپ سروس چاہتے ہیں',
      'CONFIRM_PAY': 'تصدیق اور ادائیگی',
      'TOTAL_PRICE': 'کل قیمت',
      'ADD_BALANCE': 'بیلنس شامل کریں',
      'PAY_WITH_CRYPTO': 'کرپٹو کے ساتھ ادائیگی کریں',
      'AMOUNT': 'رقم',
      'SELECT_TOKEN': 'ٹوکن منتخب کریں',
      'SECURE': 'محفوظ',
      'INSTANT': 'فوری',
      'CANCEL': 'منسوخ کریں',
      'QR_PAYMENTS': 'QR کوڈ ادائیگی',
      'SCAN_QR': 'ادائیگی کرنے کے لیے نیچے دیے گئے QR کوڈ اسکین کریں',
      'DEPOSIT_HISTORY': 'جمع کرنے کی تاریخ',
      'AVAILABLE_BALANCE': 'دستیاب بیلنس',
      'LOGOUT': 'لاگ آؤٹ',
      'SETTINGS': 'ترتیبات',
      'ADMIN': 'ایڈمن',
      'WELCOME_BACK': 'خوش آمدید',
      'DASHBOARD_SUBTITLE': "یہاں آپ کے اکاؤنٹ کا جائزہ اور فوری کارروائیاں ہیں۔",
      'ADD_FUNDS': 'فنڈز شامل کریں',
      'TOTAL_ORDERS': 'کل آرڈرز',
      'VIEW_HISTORY': 'تاریخ دیکھیں',
      'REFERRAL_BONUS': 'ریفرل بونس',
      'INVITE_FRIENDS': 'دوستوں کو مدعو کریں',
      'GROWTH_ANALYTICS': 'نمو کے تجزیات',
      'LAST_30_DAYS': 'گزشتہ 30 دنوں کی کارکردگی',
      'VS_LAST_MONTH': 'گزشتہ ماہ کے مقابلے میں',
      'WEEK_1': 'ہفتہ 1',
      'WEEK_2': 'ہفتہ 2',
      'WEEK_3': 'ہفتہ 3',
      'WEEK_4': 'ہفتہ 4',
      'TOTAL_DELIVERED': 'کل ڈیلیور شدہ',
      'NO_COMPLETED_ORDERS': 'ابھی تک کوئی مکمل آرڈر نہیں',
      'QUICK_ACTIONS': 'فوری کارروائیاں',
      'TOP_UP_WALLET': 'اپنا والٹ بیلنس ٹاپ اپ کریں',
      'PLACE_ORDER': 'آرڈر دیں',
      'BROWSE_SERVICES': 'تمام خدمات براؤز کریں',
      'ORDER_HISTORY': 'آرڈر کی تاریخ',
      'TRACK_ORDERS': 'اپنے آرڈرز ٹریک کریں',
      'EARN_REWARDS': 'بونس انعامات حاصل کریں',
      'FEEDBACK': 'تاثرات',
      'SHARE_EXPERIENCE': 'اپنا تجربہ شیئر کریں',
      'HOW_TO_GUIDE': 'استعمال کیسے کریں',
      'WATCH_TUTORIALS': 'ٹیوٹوریل ویڈیوز دیکھیں',
      'NEED_HELP': 'مدد چاہیے؟',
      'SUPPORT_TEXT': 'ہماری سپورٹ ٹیم آپ کی مدد کے لیے 24/7 دستیاب ہے۔',
      'ABOUT_US': 'ہمارے بارے میں',
      'SHOWING': 'دکھا رہا ہے',
      'SERVICES_LOWER': 'خدمات',
      'PRICES_INCLUDE_MARKUP': 'قیمتوں میں 1.5x مارک اپ شامل ہے'
    }
  };

  currentLanguageCode = signal<string>('en');

  constructor() {
    // When user changes (login/logout/refresh), reload their language preference
    effect(() => {
        const user = this.authService.currentUser(); // Depend on user signal
        this.loadLanguage();
    }, { allowSignalWrites: true });

    // Save to local storage whenever language changes
    effect(() => {
        const lang = this.currentLanguageCode();
        const userId = this.getUserId();
        if (userId) { // Only save if we have a user (or guest handling if you prefer)
             localStorage.setItem(`${this.BASE_STORAGE_KEY}_${userId}`, lang);
        }
    });
  }

  setLanguage(code: string): void {
    const lang = this.languages.find(l => l.code === code);
    if (lang) {
      this.currentLanguageCode.set(code);
    }
  }
  
  getCurrentLanguage(): Language {
      return this.languages.find(l => l.code === this.currentLanguageCode()) || this.languages[0];
  }

  translate(key: string): string {
    const lang = this.currentLanguageCode();
    // Default to key if translation not found
    return this.translations[lang]?.[key] || key;
  }

  private getUserId(): string {
       const user = this.authService.currentUser();
       return user?.id || 'guest';
  }

  private loadLanguage(): void {
    const userId = this.getUserId();
    const saved = localStorage.getItem(`${this.BASE_STORAGE_KEY}_${userId}`);
    
    // Check if saved language is valid
    if (saved && this.languages.find(l => l.code === saved)) {
      this.currentLanguageCode.set(saved);
    } else {
        // Default to 'en' if nothing saved for this user
        this.currentLanguageCode.set('en');
    }
  }
}
