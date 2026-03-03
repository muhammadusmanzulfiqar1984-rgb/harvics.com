// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import { getFolderBasedCategories } from '@/data/folderBasedProducts'

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

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  const t = await getTranslations('contact')
  const categories = getFolderBasedCategories()
  
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>
        
        <section className="relative px-4 pb-20 -mt-20 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                {/* Contact Information */}
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-8">{t('getInTouch')}</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#6B1F2B] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B]/5 flex items-center justify-center rounded-xl flex-shrink-0">
                        <span className="text-[#6B1F2B] text-2xl">📞</span>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-lg mb-1">{t('phone')}</h3>
                        <p className="text-gray-600 font-light text-lg">+44 7405 527427</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#6B1F2B] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B]/5 flex items-center justify-center rounded-xl flex-shrink-0">
                        <span className="text-[#6B1F2B] text-2xl">📧</span>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-lg mb-1">{t('email')}</h3>
                        <p className="text-gray-600 font-light text-lg">sales.uk@harvics.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#6B1F2B] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B]/5 flex items-center justify-center rounded-xl flex-shrink-0">
                        <span className="text-[#6B1F2B] text-2xl">💬</span>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-lg mb-1">{t('whatsapp')}</h3>
                        <p className="text-gray-600 font-light text-lg">+44 7405 527427</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#6B1F2B] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B]/5 flex items-center justify-center rounded-xl flex-shrink-0">
                        <span className="text-[#6B1F2B] text-2xl">📍</span>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-lg mb-1">{t('locations')}</h3>
                        <p className="text-gray-600 font-light text-lg">{t('locationsValue')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Form */}
                <div className="order-1 lg:order-2">
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-8">{t('sendMessage')}</h2>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2 text-sm">{t('firstName')}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none transition-all"
                            placeholder={t('firstNamePlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2 text-sm">{t('lastName')}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none transition-all"
                            placeholder={t('lastNamePlaceholder')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">{t('email')}</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none transition-all"
                          placeholder={t('emailPlaceholder')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">{t('subject')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none transition-all"
                          placeholder={t('subjectPlaceholder')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm">{t('message')}</label>
                        <textarea 
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none transition-all resize-none"
                          placeholder={t('messagePlaceholder')}
                        ></textarea>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full bg-[#6B1F2B] hover:bg-[#50000b] text-white text-lg px-8 py-4 rounded-xl font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {t('send')}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
