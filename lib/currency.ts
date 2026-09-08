export function getCurrencyByCountry(country: string): string {
  const currencyMap: Record<string, string> = {
    Nigeria: 'NGN',
    'United States': 'USD',
    'United Kingdom': 'GBP',
    India: 'INR',
  }
  return currencyMap[country] || 'USD'
}
