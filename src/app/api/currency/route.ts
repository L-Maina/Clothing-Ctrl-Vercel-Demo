import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fallback rates if API fails (rates relative to KES)
const FALLBACK_RATES: Record<string, number> = {
  KES: 1,
  USD: 0.0077,    // 1 KES ≈ 0.0077 USD
  EUR: 0.0071,    // 1 KES ≈ 0.0071 EUR
  GBP: 0.0061,    // 1 KES ≈ 0.0061 GBP
  AED: 0.028,     // 1 KES ≈ 0.028 AED
  ZAR: 0.14,      // 1 KES ≈ 0.14 ZAR
  UGX: 28.5,      // 1 KES ≈ 28.5 UGX
  TZS: 19.5,      // 1 KES ≈ 19.5 TZS
  NGN: 11.5,      // 1 KES ≈ 11.5 NGN
  CAD: 0.0105,    // 1 KES ≈ 0.0105 CAD
  AUD: 0.012,     // 1 KES ≈ 0.012 AUD
  JPY: 1.15,      // 1 KES ≈ 1.15 JPY
};

export async function GET() {
  try {
    // Try to get cached rates from database
    const cachedRates = await db.exchangeRate.findMany();
    
    // Check if cache is fresh (less than 1 hour old)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isCacheFresh = cachedRates.length > 0 && 
      cachedRates.every(rate => rate.updatedAt > oneHourAgo);
    
    if (isCacheFresh) {
      const rates: Record<string, number> = { KES: 1 };
      cachedRates.forEach(rate => {
        rates[rate.currency] = rate.rate;
      });
      return NextResponse.json({ success: true, rates, cached: true });
    }
    
    // Try to fetch live rates from free API
    let rates = { ...FALLBACK_RATES };
    
    try {
      // Using exchangerate-api.com free tier (or similar free API)
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );
      
      if (response.ok) {
        const data = await response.json();
        const usdToKes = data.rates?.KES || 129.5; // Fallback USD to KES rate
        
        // Convert all rates to be relative to KES
        rates = {
          KES: 1,
          USD: 1 / usdToKes,
          EUR: (data.rates?.EUR || 0.92) / usdToKes,
          GBP: (data.rates?.GBP || 0.79) / usdToKes,
          AED: (data.rates?.AED || 3.67) / usdToKes,
          ZAR: (data.rates?.ZAR || 18.5) / usdToKes,
          UGX: (data.rates?.UGX || 3700) / usdToKes,
          TZS: (data.rates?.TZS || 2500) / usdToKes,
          NGN: (data.rates?.NGN || 1500) / usdToKes,
          CAD: (data.rates?.CAD || 1.36) / usdToKes,
          AUD: (data.rates?.AUD || 1.53) / usdToKes,
          JPY: (data.rates?.JPY || 149) / usdToKes,
        };
        
        // Update cache in database
        for (const [currency, rate] of Object.entries(rates)) {
          if (currency !== 'KES') {
            await db.exchangeRate.upsert({
              where: { currency },
              update: { rate, updatedAt: new Date() },
              create: { currency, rate },
            });
          }
        }
      }
    } catch (fetchError) {
      console.log('Using fallback exchange rates:', fetchError);
    }
    
    return NextResponse.json({ 
      success: true, 
      rates, 
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json({ 
      success: true, 
      rates: FALLBACK_RATES,
      cached: false,
      error: 'Using fallback rates',
    });
  }
}
