import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const CurrencyTest = () => {
  const testCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD',
    'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'BRL',
    'MXN', 'ZAR', 'KRW', 'THB', 'MYR', 'PHP', 'IDR', 'VND', 'TRY', 'ILS',
    'AED', 'SAR', 'EGP', 'NGN', 'KES', 'GHS', 'ZMW', 'BWP', 'TZS', 'UGX'
  ];

  const testAmount = 1234.56;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Currency Symbol Test</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {testCurrencies.map((currency) => (
          <div key={currency} className="p-3 border rounded-lg">
            <div className="font-mono text-sm text-gray-600">{currency}</div>
            <div className="font-bold text-lg">
              {formatCurrency(testAmount, currency)}
            </div>
            <div className="text-xs text-gray-500">
              Symbol: {getCurrencySymbol(currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencyTest;
