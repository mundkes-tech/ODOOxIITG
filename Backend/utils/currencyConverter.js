// Currency conversion utility
// In a real implementation, you would use a service like Fixer.io, CurrencyLayer, or similar

const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  INR: 75,
  AUD: 1.35,
  CAD: 1.25,
  CHF: 0.92,
  CNY: 6.45,
  SEK: 8.5,
  NZD: 1.4,
  MXN: 20,
  SGD: 1.35,
  HKD: 7.8,
  NOK: 8.7,
  TRY: 8.5,
  RUB: 75,
  ZAR: 15,
  BRL: 5.2,
  KRW: 1180
};

// Convert amount from one currency to another
exports.convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const fromRate = exchangeRates[fromCurrency.toUpperCase()];
  const toRate = exchangeRates[toCurrency.toUpperCase()];
  
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

// Get exchange rate between two currencies
exports.getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const fromRate = exchangeRates[fromCurrency.toUpperCase()];
  const toRate = exchangeRates[toCurrency.toUpperCase()];
  
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
  }
  
  return toRate / fromRate;
};

// Get all supported currencies
exports.getSupportedCurrencies = () => {
  return Object.keys(exchangeRates);
};

// Format currency amount
exports.formatCurrency = (amount, currency) => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    TRY: '₺',
    RUB: '₽',
    ZAR: 'R',
    BRL: 'R$',
    KRW: '₩'
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};
