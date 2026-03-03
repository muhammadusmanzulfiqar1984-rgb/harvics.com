'use client'

import { useCountry } from '@/contexts/CountryContext'

export default function SupplierAnalytics() {
  const { countryData } = useCountry()
  const currency = countryData?.currency || { symbol: '$', code: 'USD' }
  // Dummy data for analytics
  const revenueData = [
    { month: 'Jan', revenue: 1800000 },
    { month: 'Feb', revenue: 2200000 },
    { month: 'Mar', revenue: 2500000 },
    { month: 'Apr', revenue: 2100000 },
    { month: 'May', revenue: 2800000 },
    { month: 'Jun', revenue: 3200000 }
  ]

  const productCategories = [
    { name: 'Chocolates', value: 40, color: '#ffffff' },
    { name: 'Beverages', value: 25, color: '#ffffff' },
    { name: 'Biscuits', value: 20, color: '#ffffff' },
    { name: 'Candies', value: 10, color: '#6B1F2B' },
    { name: 'Others', value: 5, color: '#666' }
  ]

  // Top distributors
  const topDistributors = [
    { name: 'Distributor A', orders: 78, revenue: 1200000 },
    { name: 'Distributor B', orders: 65, revenue: 980000 },
    { name: 'Distributor C', orders: 52, revenue: 850000 },
    { name: 'Distributor D', orders: 48, revenue: 750000 },
    { name: 'Distributor E', orders: 42, revenue: 680000 }
  ]

  // Helper functions for currency formatting (country-driven)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code || 'USD'
    }).format(amount)
  }

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000000) {
      return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${currency.symbol}${(amount / 1000).toFixed(1)}K`
    }
    return formatCurrency(amount)
  }

  const regionPerformance = [
    { region: 'Lahore', revenue: 4200000, growth: 22 },
    { region: 'Karachi', revenue: 3800000, growth: 18 },
    { region: 'Islamabad', revenue: 2900000, growth: 25 },
    { region: 'Faisalabad', revenue: 2400000, growth: 15 },
    { region: 'Rawalpindi', revenue: 2100000, growth: 28 }
  ]

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-[#6B1F2B]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 md:mb-6">
                Supplier Analytics
              </h1>
              <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto px-4">
                Track your supply chain performance and business insights
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 md:px-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-2">
                    {formatCurrencyShort(15400000)}
                  </div>
                  <div className="text-sm md:text-base text-gray-500">Total Revenue</div>
                  <div className="text-xs text-green-600 mt-1">↗ +25% from last month</div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-2">285</div>
                  <div className="text-sm md:text-base text-gray-500">Total Orders</div>
                  <div className="text-xs text-green-600 mt-1">↗ +18% from last month</div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-2">
                    {formatCurrency(54035)}
                  </div>
                  <div className="text-sm md:text-base text-gray-500">Avg Order Value</div>
                  <div className="text-xs text-green-600 mt-1">↗ +12% from last month</div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-2">96%</div>
                  <div className="text-sm md:text-base text-gray-500">Order Fulfillment</div>
                  <div className="text-xs text-green-600 mt-1">↗ +2% from last month</div>
                </div>
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                Revenue Trend (Last 6 Months)
              </h2>
              <div className="space-y-4">
                {revenueData.map((item, index) => (
                  <div key={item.month} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{item.month}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="bg-[#6B1F2B] h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${(item.revenue / 3200000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-sm font-bold text-gray-900">
                      {formatCurrencyShort(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories Pie Chart */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                Revenue by Product Category
              </h2>
              <div className="flex flex-col space-y-4">
                {productCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: index === 0 ? '#6B1F2B' : index === 1 ? '#5c000c' : index === 2 ? '#7c0010' : '#9c0014' }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">{category.name}</span>
                        <span className="text-sm font-bold text-gray-900">{category.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{ 
                            backgroundColor: index === 0 ? '#6B1F2B' : index === 1 ? '#5c000c' : index === 2 ? '#7c0010' : '#9c0014',
                            width: `${category.value}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Distributors */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                Top Distributors
              </h2>
              <div className="space-y-4">
                {topDistributors.map((distributor, index) => (
                  <div key={distributor.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 text-white bg-[#6B1F2B] rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{distributor.name}</div>
                        <div className="text-sm text-gray-500">{distributor.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#6B1F2B]">
                        {formatCurrencyShort(distributor.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Performance */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#6B1F2B] mb-6">
                Regional Performance
              </h2>
              <div className="space-y-4">
                {regionPerformance.map((region, index) => (
                  <div key={region.region} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{region.region}</span>
                      <span className="text-sm text-green-600 font-medium">+{region.growth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {formatCurrencyShort(region.revenue)}
                      </span>
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-[#6B1F2B] h-2 rounded-full"
                          style={{ width: `${(region.revenue / 4200000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}






