import apiClient from '../config/api';
import type { Currency, CurrencyResponse, ConversionRequest, ConversionResponse } from '../types/currency';

export class CurrencyService {
  private static instance: CurrencyService;
  private currencyCache: Currency[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public async getCurrencies(): Promise<Currency[]> {
    const now = Date.now();
    
    if (this.currencyCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.currencyCache;
    }

    try {
      const response = await apiClient.get<CurrencyResponse>('/currencies');
      
      if (response.data.meta.code !== 200) {
        throw new Error('Failed to fetch currencies');
      }

      const sortedCurrencies = response.data.response.sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      this.currencyCache = sortedCurrencies;
      this.cacheTimestamp = now;

      return sortedCurrencies;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  public async convertCurrency(request: ConversionRequest): Promise<number> {
    try {
      const response = await apiClient.get<ConversionResponse>('/convert', {
        params: {
          from: request.from,
          to: request.to,
          amount: request.amount,
        },
      });

      if (response.data.meta.code !== 200) {
        throw new Error('Failed to convert currency');
      }

      return response.data.response.value;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }


  public getPopularCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  }


  public clearCache(): void {
    this.currencyCache = null;
    this.cacheTimestamp = 0;
  }


  public formatCurrencyValue(value: number, currencyCode: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    } catch (error) {
      return `${value.toFixed(2)} ${currencyCode}`;
    }
  }
}

export const currencyService = CurrencyService.getInstance();
