const axios = require('axios');

class CurrencyService {
  constructor() {
    this.exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY;
    this.baseUrl = 'https://api.exchangerate-api.com/v4/latest';
    this.fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      INR: 74,
      CNY: 6.45
    };
    this.countryToCurrency = {
      'United States': { code: 'USD', name: 'US Dollar', symbol: '$' },
      'India': { code: 'INR', name: 'Indian Rupee', symbol: 'â‚¹' },
      'United Kingdom': { code: 'GBP', name: 'British Pound', symbol: 'Â£' },
      'Canada': { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      'Australia': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      'Germany': { code: 'EUR', name: 'Euro', symbol: 'â‚¬' },
      'France': { code: 'EUR', name: 'Euro', symbol: 'â‚¬' },
      'Japan': { code: 'JPY', name: 'Japanese Yen', symbol: 'Â¥' },
      'Singapore': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
      'Netherlands': { code: 'EUR', name: 'Euro', symbol: 'â‚¬' },
      'Sweden': { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
      'Norway': { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
      'Denmark': { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
      'Switzerland': { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      'New Zealand': { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
    };
  }

  async getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    try {
      // Try to get real-time rates
      const response = await axios.get(`${this.baseUrl}/${fromCurrency}`, {
        timeout: 5000
      });

      const rate = response.data.rates[toCurrency];
      if (rate) {
        return rate;
      }
    } catch (error) {
      console.warn(`Failed to fetch exchange rate from API: ${error.message}`);
    }

    // Fallback to static rates
    return this.getFallbackRate(fromCurrency, toCurrency);
  }

  getFallbackRate(fromCurrency, toCurrency) {
    const fromRate = this.fallbackRates[fromCurrency];
    const toRate = this.fallbackRates[toCurrency];

    if (fromRate && toRate) {
      return toRate / fromRate;
    }

    // Default fallback
    console.warn(`No fallback rate available for ${fromCurrency} to ${toCurrency}, using 1:1`);
    return 1;
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  getCurrencyByCountry(country) {
    const currency = this.countryToCurrency[country];
    if (!currency) {
      throw new Error(`Currency not found for country: ${country}`);
    }
    return currency;
  }

  getSupportedCountries() {
    return Object.keys(this.countryToCurrency);
  }

  getSupportedCurrencies() {
    return Object.keys(this.fallbackRates);
  }

  formatCurrency(amount, currencyCode, locale = 'en-US') {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const currency = Object.values(this.countryToCurrency)
        .find(c => c.code === currencyCode);
      const symbol = currency?.symbol || currencyCode;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  async getBatchExchangeRates(baseCurrency, targetCurrencies) {
    const rates = {};

    for (const currency of targetCurrencies) {
      try {
        rates[currency] = await this.getExchangeRate(baseCurrency, currency);
      } catch (error) {
        console.warn(`Failed to get rate for ${baseCurrency} to ${currency}:`, error.message);
        rates[currency] = 1;
      }
    }

    return rates;
  }
}

module.exports = {
  currencyService: new CurrencyService(),
  CurrencyService
};