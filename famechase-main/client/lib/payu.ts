import CryptoJS from 'crypto-js';

const PAYU_CONFIG = {
  merchantKey: 'yourMerchantKey',
  salt: 'yourSalt',
  baseUrl: 'https://test.payu.in',
  mode: 'test',
};

const UPI_APPS = {
  phonepe: {
    name: 'PhonePe',
    appScheme: 'phonepe://',
    webFallback: 'https://www.phonepe.com',
  },
  googlepay: {
    name: 'Google Pay',
    appScheme: 'googlepay://',
    webFallback: 'https://pay.google.com',
  },
  paytm: {
    name: 'Paytm',
    appScheme: 'paytm://',
    webFallback: 'https://paytm.com',
  },
  bhim: {
    name: 'BHIM',
    appScheme: 'bhim://',
    webFallback: 'https://www.bhimupi.org.in',
  },
};

interface PayUPaymentData {
  key: string;
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
}

interface PayUResponse {
  status: string;
  txnid: string;
  amount: number;
  key: string;
  mode: string;
}

function generateTransactionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generatePayUHash(data: PayUPaymentData): string {
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.phone}|${data.surl}|${data.furl}|${PAYU_CONFIG.salt}`;
  return CryptoJS.MD5(hashString).toString();
}

function verifyPayUResponse(response: PayUResponse): boolean {
  // Implementation for verifying PayU response
  return response.status === 'success';
}

function createPayUForm(data: PayUPaymentData): void {
  // Implementation for creating and submitting PayU form
}

function handleUpiAppPayment(appName: string, paymentUrl: string): void {
  const appConfig = UPI_APPS[appName];
  if (appConfig) {
    attemptAppOpen(appConfig.appScheme, paymentUrl);
  }
}

function attemptAppOpen(appScheme: string, paymentUrl: string): void {
  const timeout = setTimeout(() => {
    window.location.href = paymentUrl; // Fallback to web
  }, 2000);
  window.location.href = appScheme;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      clearTimeout(timeout);
    }
  });
}

function initiatePayUPayment(data: PayUPaymentData): void {
  try {
    const txnId = generateTransactionId();
    const hash = generatePayUHash(data);
    // Additional payment initiation logic
  } catch (error) {
    console.error('Error initiating payment:', error);
    // Cleanup logic
  }
}

const paymentHelpers = {
  processPayment: function(data: PayUPaymentData, upiApp?: string) {
    // Updated processPayment function with upiApp parameter support
  },
  // Other existing paymentHelpers functions
};
