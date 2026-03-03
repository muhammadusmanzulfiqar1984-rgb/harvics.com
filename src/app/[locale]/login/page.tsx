import UnifiedLoginForm from './UnifiedLoginForm'
// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

export default async function LoginPage() {

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="pt-20">
        <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
             <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
             <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
               Secure Login
             </h1>
             <p className="text-white/80 text-lg max-w-2xl font-light">
               Access your personalized dashboard and manage your operations
             </p>
          </div>
        </section>

        <section className="relative px-4 pb-20 -mt-32 z-20">
          <div className="max-w-md mx-auto">
            {/* Login Form */}
            <UnifiedLoginForm />

            {/* Features */}
            <div className="mt-12 space-y-4">
              <div className="flex items-start space-x-4 p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#6B1F2B]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Dashboard Access
                  </h4>
                  <p className="text-sm text-gray-500">
                    Manage your business operations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#6B1F2B]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Analytics & Reports
                  </h4>
                  <p className="text-sm text-gray-500">
                    Track your performance and sales
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#6B1F2B]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔐</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Secure Access
                  </h4>
                  <p className="text-sm text-gray-500">
                    Your data is protected and secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
