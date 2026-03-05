"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        // Shell Navigation
        dashboard: "Dashboard",
        inventory: "Inventory",
        orders: "Orders",
        analytics: "Analytics",
        payments: "Payments",
        settings: "Settings",
        browse: "Browse Products",
        cart: "Cart",
        myOrders: "My Orders",
        favorites: "Favorites",
        logout: "Logout",
        welcomeBack: "Welcome back to your dashboard",
        profile: "My Profile",
        accountSettings: "Account Settings",
        signOut: "Sign Out",

        // Dashboard
        todaysSales: "Today's Sales",
        activeOrders: "Active Orders",
        stockRemaining: "Stock Remaining",
        aiPrediction: "AI Demand Prediction",
        aiDemandPrediction: "AI Demand Prediction",
        salesTrends: "Sales Trends",
        aiInsights: "AI Insights",
        sampleInsight1: "Mango demand expected to rise by 35% next week",
        sampleInsight2: "Consider restocking citrus fruits before Friday",
        sampleInsight3: "Peak sales hours: 10 AM - 2 PM",
        recentActivity: "Recent Activity",
        todaysBestPrices: "Today's Best Prices",
        pendingPayments: "Pending Payments",
        recommendedForYou: "Recommended for You",
        quickReorder: "Quick Reorder",
        viewAll: "View All",
        addToCart: "Add to Cart",
        specialOffer: "Special Offer Today!",
        specialOfferDesc: "Get 20% off on bulk orders over ₹500. Limited time offer.",
        shopNow: "Shop Now",
        items: "items",

        // Inventory
        searchInventoryPlaceholder: "Search fruits, stock items, or price...",
        stockLevel: "Stock Level",
        freshness: "Freshness",
        pricePerKg: "Price per kg",
        lowStock: "Low Stock",
        inStock: "In Stock",
        byName: "By Name",
        byStock: "By Stock Level",
        byPrice: "By Price",
        noFruitsFound: "No fruits found matching your search",

        // Payments
        totalOutstanding: "Total Outstanding",
        overduePayments: "Overdue Payments",
        paymentsReceivedToday: "Payments Received Today",
        activeCreditCustomers: "Active Credit Customers",
        pendingFromCustomers: "Pending from customers",
        overdueAccounts: "overdue accounts",
        todaysCollections: "Today's collections",
        totalCreditAccounts: "Total credit accounts",
        searchRetailerPlaceholder: "Search by retailer name...",
        customerCreditTracking: "Customer Credit Tracking",
        monitorOutstanding: "Monitor outstanding payments and credit status",
        retailerName: "Retailer Name",
        totalCredit: "Total Credit",
        lastPayment: "Last Payment",
        daysOverdue: "Days Overdue",
        status: "Status",
        actions: "Actions",
        markPaid: "Mark Paid",
        remind: "Remind",
        paymentHistory: "Payment History",
        recentPaymentsReceived: "Recent payments received from retailers",
        onTime: "On Time",
        overdue: "Overdue",
        byCredit: "By Credit",
        byDate: "By Date",
        byDaysOverdue: "By Days Overdue",
        byStatus: "By Status",

        // Orders
        totalOrders: "Total Orders",
        totalRevenue: "Total Revenue",
        orderId: "Order ID",
        retailer: "Retailer",
        date: "Date",
        amount: "Amount",
        paymentStatus: "Payment Status",
        orderStatus: "Order Status",
        delivered: "Delivered",
        pending: "Pending",
        paid: "Paid",
        viewDetails: "View Details",
        reorder: "Reorder",
        searchOrderPlaceholder: "Search by Order ID or Retailer name...",

        // Analytics
        salesAnalytics: "Sales Analytics",
        topFruitsPerformance: "Top Fruits Performance",
        wastageAnalytics: "Wastage Analytics",
        weeklySalesTrend: "Weekly sales performance trend",
        bestSellingFruits: "Best-selling fruits this month",
        trackSpoilage: "Track spoilage and waste",

        // Browse
        searchBrowsePlaceholder: "Search fruits...",
        filters: "Filters",
        minPrice: "Min Price",
        maxPrice: "Max Price",
        priceRange: "Price Range",
        resetFilters: "Reset Filters",

        // Cart
        yourCartIsEmpty: "Your cart is empty",
        addFruitsToStart: "Add some fruits to get started!",
        browseProducts: "Browse Products",
        orderSummary: "Order Summary",
        subtotal: "Subtotal",
        tax: "Tax",
        total: "Total",
        proceedToCheckout: "Proceed to Checkout",
        continueShopping: "Continue Shopping",
        // Landing & Auth
        whoAreYou: "Who are you?",
        chooseHowToContinue: "Choose how you want to continue",
        wholesalerRoleDesc: "Manage inventory, orders, and distribution",
        retailerRoleDesc: "Browse products and place orders",
        pleaseEnterDetails: "Please enter your details to sign in.",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        login: "Login",
        orContinueWith: "Or continue with",
        dontHaveAccount: "Don't have an account?",
        signUp: "Sign up",
        welcomeToFamily: "Welcome To Family",
        communityDesc: "A community of over hundreds of members to share arts and ideas",
        forSellers: "For Sellers",
        forBuyers: "For Buyers",
        partner: "Partner",
        shopper: "Shopper",

        // Common
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        searchFruits: "Search fruits...",
        tax10: "Tax (10%)",
        noOrdersFound: "No orders found matching your search",
        pendingOrders: "Pending Orders",
        itemsAddedToCart: "Items added to cart",
        invoiceDownloaded: "Invoice downloaded successfully!",
        orderDetails: "Order Details",
        completeOrderInfo: "Complete order information",
        orderDate: "Order Date",
        deliveryStatus: "Delivery Status",
        orderItems: "Order Items",
        reorderItems: "Reorder Items",
        close: "Close",
        orderedOn: "Ordered on",
        role: "Role",
        retailerDetailedDesc: "Connect with top wholesalers and get the best fresh produce for your customers.",
        wholesalerDetailedDesc: "Manage your bulk inventory and reach thousands of retailers seamlessly.",
        welcomeBackUser: "Welcome back, {role}!",
        fullName: "Full Name",
        emailAddress: "Email Address",
        createAccount: "Create Account",
        register: "Register",
        alreadyHaveAccount: "Already have an account?",
        joinAsRole: "Join as a {role} today.",
        google: "Google",

        // Fruits
        "Red Apples": "Red Apples",
        "Bananas": "Bananas",
        "Oranges": "Oranges",
        "Mangoes": "Mangoes",
        "Grapes": "Grapes",
        "Strawberries": "Strawberries",
        "Watermelon": "Watermelon",
        "Pineapple": "Pineapple",
        "Cherries": "Cherries",
        "Sweet Oranges": "Sweet Oranges",
        "Fresh Mangoes": "Fresh Mangoes",
        "Blueberries": "Blueberries",
    },
    hi: {
        // Shell Navigation
        dashboard: "डैशबोर्ड",
        inventory: "इन्वेंटरी",
        orders: "ऑर्डर",
        analytics: "एनालिटिक्स",
        payments: "भुगतान",
        settings: "सेटिंग्स",
        browse: "उत्पाद ब्राउज़ करें",
        cart: "कार्ट",
        myOrders: "मेरे ऑर्डर",
        favorites: "पसंदीदा",
        logout: "लॉग आउट",
        welcomeBack: "वापसी पर स्वागत है",
        profile: "मेरी प्रोफाइल",
        accountSettings: "खाता सेटिंग्स",
        signOut: "साइन आउट",

        // Landing & Auth
        whoAreYou: "आप कौन हैं?",
        chooseHowToContinue: "चुनें कि आप कैसे जारी रखना चाहते हैं",
        wholesalerRoleDesc: "इन्वेंटरी, ऑर्डर और वितरण का प्रबंधन करें",
        retailerRoleDesc: "उत्पाद ब्राउज़ करें और ऑर्डर दें",
        pleaseEnterDetails: "कृपया साइन इन करने के लिए अपना विवरण दर्ज करें",
        email: "ईमेल",
        password: "पासवर्ड",
        rememberMe: "मुझे याद रखें",
        forgotPassword: "पासवर्ड भूल गए?",
        login: "लॉग इन करें",
        orContinueWith: "या इसके साथ जारी रखें",
        dontHaveAccount: "क्या आपके पास खाता नहीं है?",
        signUp: "साइन अप करें",
        welcomeToFamily: "परिवार में आपका स्वागत है",
        communityDesc: "सैकड़ों सदस्यों का समुदाय",
        forSellers: "विक्रेताओं के लिए",
        forBuyers: "खरीदारों के लिए",
        partner: "साझेदार",
        shopper: "खरीदार",

        // Common
        excellent: "उत्कृष्ट",
        good: "अच्छा",
        fair: "ठीक",
        searchFruits: "फल खोजें...",
        tax10: "कर (10%)",
        noOrdersFound: "आपकी खोज से मेल खाने वाले कोई ऑर्डर नहीं मिले",
        pendingOrders: "लंबित ऑर्डर",

        // Dashboard
        todaysSales: "आज की बिक्री",
        activeOrders: "सक्रिय ऑर्डर",
        stockRemaining: "शेष स्टॉक",
        aiPrediction: "AI मांग भविष्यवाणी",
        aiDemandPrediction: "AI मांग भविष्यवाणी",
        salesTrends: "बिक्री रुझान",
        aiInsights: "AI इनसाइट्स",
        sampleInsight1: "आम की मांग अगले सप्ताह 35% बढ़ने की उम्मीद है",
        sampleInsight2: "शुक्रवार से पहले खट्टे फलों का स्टॉक करने पर विचार करें",
        sampleInsight3: "बिक्री का पीक समय: सुबह 10 - दोपहर 2",
        recentActivity: "हाल की गतिविधि",
        todaysBestPrices: "आज की सर्वोत्तम कीमतें",
        pendingPayments: "लंबित भुगतान",
        recommendedForYou: "आपके लिए अनुशंसित",
        quickReorder: "त्वरित पुनः ऑर्डर",
        viewAll: "सभी देखें",
        addToCart: "कार्ट में डालें",
        specialOffer: "आज का विशेष प्रस्ताव!",
        specialOfferDesc: "₹500 से अधिक के थोक ऑर्डर पर 20% की छूट पाएं। सीमित समय के लिए।",
        shopNow: "अभी खरीदें",
        items: " आइटम",

        // Inventory
        searchInventoryPlaceholder: "फल, स्टॉक आइटम या कीमत खोजें...",
        stockLevel: "स्टॉक स्तर",
        freshness: "ताज़गी",
        pricePerKg: "कीमत प्रति किलो",
        lowStock: "कम स्टॉक",
        inStock: "स्टॉक में",
        byName: "नाम से",
        byStock: "स्टॉक स्तर से",
        byPrice: "कीमत से",
        noFruitsFound: "आपकी खोज से मेल खाने वाले कोई फल नहीं मिले",

        // Payments
        totalOutstanding: "कुल बकाया",
        overduePayments: "अतिदेय भुगतान",
        paymentsReceivedToday: "आज प्राप्त भुगतान",
        activeCreditCustomers: "सक्रिय क्रेडिट ग्राहक",
        pendingFromCustomers: "ग्राहकों से लंबित",
        overdueAccounts: "अतिदेय खाते",
        todaysCollections: "आज का संग्रह",
        totalCreditAccounts: "कुल क्रेडिट खाते",
        searchRetailerPlaceholder: "खुदरा विक्रेता के नाम से खोजें...",
        customerCreditTracking: "ग्राहक क्रेडिट ट्रैकिंग",
        monitorOutstanding: "बकाया भुगतान और क्रेडिट स्थिति की निगरानी करें",
        retailerName: "खुदरा विक्रेता का नाम",
        totalCredit: "कुल क्रेडिट",
        lastPayment: "पिछला भुगतान",
        daysOverdue: "अतिदेय दिन",
        status: "स्थिति",
        actions: "कार्रवाई",
        markPaid: "भुगतान किया",
        remind: "याद दिलाएं",
        paymentHistory: "भुगतान इतिहास",
        recentPaymentsReceived: "खुदरा विक्रेताओं से हाल ही में प्राप्त भुगतान",
        onTime: "समय पर",
        overdue: "अतिदेय",
        byCredit: "क्रेडिट से",
        byDate: "तारीख से",
        byDaysOverdue: "अतिदेय दिनों से",
        byStatus: "स्थिति से",

        // Orders
        totalOrders: "कुल ऑर्डर",
        totalRevenue: "कुल राजस्व",
        orderId: "ऑर्डर आईडी",
        retailer: "खुदरा विक्रेता",
        date: "तारीख",
        amount: "राशि",
        paymentStatus: "भुगतान स्थिति",
        orderStatus: "ऑर्डर स्थिति",
        delivered: "वितरित",
        pending: "लंबित",
        paid: "भुगतान किया",
        viewDetails: "विवरण देखें",
        reorder: "पुनः ऑर्डर करें",
        searchOrderPlaceholder: "ऑर्डर आईडी या खुदरा विक्रेता नाम से खोजें...",

        // Analytics
        salesAnalytics: "बिक्री एनालिटिक्स",
        topFruitsPerformance: "शीर्ष फलों का प्रदर्शन",
        wastageAnalytics: "बर्बादी एनालिटिक्स",
        weeklySalesTrend: "साप्ताहिक बिक्री प्रदर्शन रुझान",
        bestSellingFruits: "इस महीने के सबसे ज्यादा बिकने वाले फल",
        trackSpoilage: "खराबी और बर्बादी को ट्रैक करें",

        // Browse
        searchBrowsePlaceholder: "फल खोजें...",
        filters: "फिल्टर",
        minPrice: "न्यूनतम कीमत",
        maxPrice: "अधिकतम कीमत",
        priceRange: "कीमत सीमा",
        resetFilters: "फिल्टर रीसेट करें",

        // Cart
        yourCartIsEmpty: "आपकी कार्ट खाली है",
        addFruitsToStart: "शुरू करने के लिए कुछ फल जोड़ें!",
        browseProducts: "उत्पाद ब्राउज़ करें",
        orderSummary: "ऑर्डर सारांश",
        subtotal: "उपयोग राशि",
        tax: "कर",
        total: "कुल",
        proceedToCheckout: "चेकआउट के लिए आगे बढ़ें",
        continueShopping: "खरीदारी जारी रखें",
        itemsAddedToCart: "आइटम कार्ट में जोड़े गए",
        invoiceDownloaded: "चालान सफलतापूर्वक डाउनलोड हो गया!",
        orderDetails: "ऑर्डर विवरण",
        completeOrderInfo: "पूरी ऑर्डर जानकारी",
        orderDate: "ऑर्डर तिथि",
        deliveryStatus: "वितरण स्थिति",
        orderItems: "ऑर्डर आइटम",
        reorderItems: "पुनः ऑर्डर आइटम",
        close: "बंद करें",
        orderedOn: "पर ऑर्डर किया गया",
        role: "भूमिका",
        retailerDetailedDesc: "शीर्ष थोक विक्रेताओं से जुड़ें और अपने ग्राहकों के लिए सर्वोत्तम ताज़ा उपज प्राप्त करें।",
        wholesalerDetailedDesc: "अपनी थोक इन्वेंट्री प्रबंधित करें और हजारों खुदरा विक्रेताओं तक निर्बाध रूप से पहुंचें।",
        welcomeBackUser: "वापसी पर स्वागत है, {role}!",
        fullName: "पूरा नाम",
        emailAddress: "ईमेल पता",
        createAccount: "खाता बनाएं",
        register: "रजिस्टर करें",
        alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
        joinAsRole: "आज ही {role} के रूप में शामिल हों।",
        google: "Google",

        // Fruits
        "Red Apples": "लाल सेब",
        "Bananas": "केले",
        "Oranges": "संतरे",
        "Mangoes": "आम",
        "Grapes": "अंगूर",
        "Strawberries": "स्ट्रॉबेरी",
        "Watermelon": "तरबूज",
        "Pineapple": "अनानास",
        "Cherries": "चेरी",
        "Sweet Oranges": "मीठे संतरे",
        "Fresh Mangoes": "ताज़े आम",
        "Blueberries": "ब्लूबेरी",
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check local storage for saved preference
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
        setMounted(true);
    }, []);

    const switchLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    if (!mounted) {
        return null; // or a loading spinner
    }

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
