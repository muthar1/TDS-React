import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { SearchableDropdown, LoadingSpinner, ErrorMessage } from './ui';
import { SwapIcon, CurrencyIcon, InfoIcon } from './icons';
import { currencyService } from '../services/currencyService';
import type { Currency } from '../types/currency';

const CurrencyConverter = memo(() => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    currencies: false,
    conversion: false,
  });
  const [error, setError] = useState<string | null>(null);

  const currencyOptions = useMemo(() => 
    currencies.map(currency => ({
      value: currency.short_code,
      label: `${currency.name} (${currency.short_code})`,
    })), [currencies]
  );

  const formattedConvertedAmount = useMemo(() => {
    if (convertedAmount === null || !toCurrency) return null;
    return currencyService.formatCurrencyValue(convertedAmount, toCurrency);
  }, [convertedAmount, toCurrency]);

  const fetchCurrencies = useCallback(async () => {
    setLoading(prev => ({ ...prev, currencies: true }));
    setError(null);

    try {
      const currencyData = await currencyService.getCurrencies();
      setCurrencies(currencyData);
      
      if (!fromCurrency && !toCurrency) {
        const usd = currencyData.find(c => c.short_code === 'USD');
        const eur = currencyData.find(c => c.short_code === 'EUR');
        
        setFromCurrency(usd?.short_code || currencyData[0]?.short_code || '');
        setToCurrency(eur?.short_code || currencyData[1]?.short_code || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch currencies');
    } finally {
      setLoading(prev => ({ ...prev, currencies: false }));
    }
  }, [fromCurrency, toCurrency]);

  const convertCurrency = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setConvertedAmount(null);
      return;
    }

    if (fromCurrency === toCurrency) {
      setConvertedAmount(parseFloat(amount));
      return;
    }

    setLoading(prev => ({ ...prev, conversion: true }));
    setError(null);

    try {
      const convertedValue = await currencyService.convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
      });

      setConvertedAmount(convertedValue);
    } catch (err: any) {
      setError(err.message || 'Failed to convert currency');
      setConvertedAmount(null);
    } finally {
      setLoading(prev => ({ ...prev, conversion: false }));
    }
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertCurrency();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [convertCurrency]);

  const handleAmountChange = useCallback((value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const swapCurrencies = useCallback(() => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  }, [fromCurrency, toCurrency]);


  const retry = useCallback(() => {
    if (currencies.length === 0) {
      fetchCurrencies();
    } else {
      convertCurrency();
    }
  }, [currencies.length, fetchCurrencies, convertCurrency]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <CurrencyIcon />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Currency Converter
          </h1>
          <p className="text-gray-600">
            Convert currencies with real-time exchange rates
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 animate-fade-in">
          {error && (
            <div className="mb-6">
              <ErrorMessage
                message={error}
                onRetry={retry}
              />
            </div>
          )}

          <div className="space-y-6">
            {/* From Currency Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableDropdown
                  options={currencyOptions}
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  placeholder="Search currencies..."
                  disabled={loading.currencies}
                  data-testid="from-currency-select"
                />
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  disabled={loading.currencies}
                  data-testid="amount-input"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapCurrencies}
                disabled={loading.currencies || !fromCurrency || !toCurrency}
                className="inline-flex items-center justify-center rounded-full p-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                data-testid="swap-button"
                aria-label="Swap currencies"
              >
                <SwapIcon />
              </button>
            </div>

            {/* To Currency Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableDropdown
                  options={currencyOptions}
                  value={toCurrency}
                  onChange={setToCurrency}
                  placeholder="Search currencies..."
                  disabled={loading.currencies}
                  data-testid="to-currency-select"
                />
                <div className="relative">
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg font-medium flex items-center justify-between">
                    {loading.conversion ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner />
                        <span className="text-gray-500">Converting...</span>
                      </div>
                    ) : formattedConvertedAmount ? (
                      <span className="text-gray-900" data-testid="converted-amount">
                        {formattedConvertedAmount}
                      </span>
                    ) : (
                      <span className="text-gray-400">Converted amount</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State for Currencies */}
            {loading.currencies && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <LoadingSpinner />
                  <span className="text-gray-600">Loading currencies...</span>
                </div>
              </div>
            )}

            {/* Exchange Rate Info */}
            {formattedConvertedAmount && amount && parseFloat(amount) > 0 && !loading.conversion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <InfoIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    1 {fromCurrency} = {(parseFloat(formattedConvertedAmount.replace(/[^\d.-]/g, '')) / parseFloat(amount)).toFixed(6)} {toCurrency}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CurrencyConverter.displayName = 'CurrencyConverter';

export default CurrencyConverter;
