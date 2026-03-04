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
    <main className="min-h-screen bg-[#F5F1E8]">
      <div className="pt-20">
        {/* Hero */}
        <section className="relative bg-[#6B1F2B] py-24 px-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-5" style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 70%)' }} />
          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">Get In Touch</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              {t('title')}
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>
        
        <section className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#C3A35E]/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                {/* Contact Information */}
                <div className="order-2 lg:order-1">
                  <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">Contact Details</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-8" style={{ letterSpacing: '-0.02em' }}>{t('getInTouch')}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-5 p-5 bg-[#F5F1E8] border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">📞</span>
                      </div>
                      <div>
                        <h3 className="text-[#6B1F2B] font-bold text-base mb-1">{t('phone')}</h3>
                        <p className="text-[#6B1F2B]/60 text-base">+44 7405 527427</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-5 p-5 bg-[#F5F1E8] border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">📧</span>
                      </div>
                      <div>
                        <h3 className="text-[#6B1F2B] font-bold text-base mb-1">{t('email')}</h3>
                        <p className="text-[#6B1F2B]/60 text-base">sales.uk@harvics.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-5 p-5 bg-[#F5F1E8] border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">💬</span>
                      </div>
                      <div>
                        <h3 className="text-[#6B1F2B] font-bold text-base mb-1">{t('whatsapp')}</h3>
                        <p className="text-[#6B1F2B]/60 text-base">+44 7405 527427</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-5 p-5 bg-[#F5F1E8] border border-[#C3A35E]/20 hover:border-[#C3A35E] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#6B1F2B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">📍</span>
                      </div>
                      <div>
                        <h3 className="text-[#6B1F2B] font-bold text-base mb-1">{t('locations')}</h3>
                        <p className="text-[#6B1F2B]/60 text-base">{t('locationsValue')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Form */}
                <div className="order-1 lg:order-2">
                  <div className="bg-[#F5F1E8] p-8 border border-[#C3A35E]/20">
                    <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">Send a Message</div>
                    <h2 className="text-2xl font-bold text-[#6B1F2B] mb-8" style={{ letterSpacing: '-0.02em' }}>{t('sendMessage')}</h2>
                    
                    <form className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[#6B1F2B] font-bold mb-2 text-xs uppercase tracking-wider">{t('firstName')}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-white border border-[#C3A35E]/30 text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none transition-all"
                            placeholder={t('firstNamePlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-[#6B1F2B] font-bold mb-2 text-xs uppercase tracking-wider">{t('lastName')}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-white border border-[#C3A35E]/30 text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none transition-all"
                            placeholder={t('lastNamePlaceholder')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[#6B1F2B] font-bold mb-2 text-xs uppercase tracking-wider">{t('email')}</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 bg-white border border-[#C3A35E]/30 text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none transition-all"
                          placeholder={t('emailPlaceholder')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[#6B1F2B] font-bold mb-2 text-xs uppercase tracking-wider">{t('subject')}</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-white border border-[#C3A35E]/30 text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none transition-all"
                          placeholder={t('subjectPlaceholder')}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[#6B1F2B] font-bold mb-2 text-xs uppercase tracking-wider">{t('message')}</label>
                        <textarea 
                          rows={4}
                          className="w-full px-4 py-3 bg-white border border-[#C3A35E]/30 text-[#6B1F2B] placeholder-[#6B1F2B]/30 focus:border-[#C3A35E] focus:outline-none transition-all resize-none"
                          placeholder={t('messagePlaceholder')}
                        ></textarea>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full bg-[#6B1F2B] hover:bg-[#5a1a24] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 transition-colors"
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
