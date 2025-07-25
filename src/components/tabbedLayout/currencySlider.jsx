import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CurrencySlider = ({ overViewData, onCurrencyChange }) => {
  // Extract currencies from the overview data
  const getCurrencies = () => {
    if (!overViewData) return [];
    
    const currencies = new Set();
    Object.keys(overViewData).forEach(key => {
      const parts = key.split('_');
      const currency = parts[parts.length - 1];
      if (['gbp', 'usd', 'eur', 'aed'].includes(currency)) {
        currencies.add(currency);
      }
    });
    
    return Array.from(currencies);
  };

  const currencies = getCurrencies();
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(0);
  const currentCurrency = currencies[currentCurrencyIndex];

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      gbp: '£',
      usd: '$',
      eur: '€',
      aed: 'د.إ'
    };
    return symbols[currency] || currency.toUpperCase();
  };

  // Extract data for current currency
  const getCurrentCurrencyData = () => {
    if (!overViewData || !currentCurrency) return [];
    
    const data = [];
    const prefix = `total_sales_${currentCurrency}`;
    const revenuePrefix = `total_revenue_${currentCurrency}`;
    const payoutsPrefix = `total_payouts_${currentCurrency}`;
    const ticketsPrefix = `tickets_sold_${currentCurrency}`;

    if (overViewData[prefix] !== undefined) {
      data.push({
        name: 'Total Sales',
        value: overViewData[prefix],
        key: `sales_${currentCurrency}`
      });
    }

    if (overViewData[revenuePrefix] !== undefined) {
      data.push({
        name: 'Total Revenue',
        value: overViewData[revenuePrefix],
        key: `revenue_${currentCurrency}`
      });
    }

    if (overViewData[payoutsPrefix] !== undefined) {
      data.push({
        name: 'Total Payouts',
        value: overViewData[payoutsPrefix],
        key: `payouts_${currentCurrency}`
      });
    }

    if (overViewData[ticketsPrefix] !== undefined) {
      data.push({
        name: 'Tickets Sold',
        value: overViewData[ticketsPrefix],
        key: `tickets_${currentCurrency}`
      });
    }

    return data;
  };

  const handlePrevious = () => {
    const newIndex = currentCurrencyIndex === 0 ? currencies.length - 1 : currentCurrencyIndex - 1;
    setCurrentCurrencyIndex(newIndex);
    onCurrencyChange?.(currencies[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentCurrencyIndex === currencies.length - 1 ? 0 : currentCurrencyIndex + 1;
    setCurrentCurrencyIndex(newIndex);
    onCurrencyChange?.(currencies[newIndex]);
  };

  const currentData = getCurrentCurrencyData();

  if (currencies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Currency Indicator */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-700">
            {getCurrencySymbol(currentCurrency)} {currentCurrency.toUpperCase()}
          </span>
          {currencies.length > 1 && (
            <div className="flex gap-1">
              {currencies.map((currency, index) => (
                <div
                  key={currency}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCurrencyIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {currencies.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={currencies.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={currencies.length <= 1}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Currency Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentData.map((item, index) => (
          <div
            key={item.key}
            className="border border-gray-200 rounded-md bg-white py-3 px-3 flex flex-col gap-2 hover:shadow-sm transition-shadow"
          >
            <p className="text-lg font-medium text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 font-normal">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencySlider;