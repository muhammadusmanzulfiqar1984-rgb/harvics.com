import { Router, Request, Response } from 'express'
import { navigationMenus, foodMegaMenu, serviceInfo, footerColumns, paymentMethods } from './navigation.data'
import { NavigationMenu, ServiceInfo, FooterColumn, PaymentMethod } from './navigation.types'

const navigationRouter = Router()

// Get main navigation menu by locale
navigationRouter.get('/menu/:locale?', (req: Request, res: Response) => {
  const locale = req.params.locale || 'en'
  const menu = navigationMenus[locale] || navigationMenus['en']
  res.json(menu)
})

// Get mega menu for specific category (e.g., Food)
navigationRouter.get('/mega-menu/:category', (req: Request, res: Response) => {
  const category = req.params.category.toLowerCase()
  
  if (category === 'food') {
    return res.json(foodMegaMenu)
  }
  
  // Return empty menu structure for other categories
  res.json({
    id: `${category}-mega-menu`,
    name: `${category} Mega Menu`,
    sections: []
  })
})

// Get service information (Free Delivery, Collection, Returns)
navigationRouter.get('/services', (_req: Request, res: Response) => {
  res.json(serviceInfo)
})

// Get footer columns
navigationRouter.get('/footer', (_req: Request, res: Response) => {
  res.json(footerColumns)
})

// Get payment methods
navigationRouter.get('/payments', (_req: Request, res: Response) => {
  res.json(paymentMethods)
})

// Get all navigation data (combined endpoint)
navigationRouter.get('/all', (req: Request, res: Response) => {
  const locale = (req.query.locale as string) || 'en'
  const menu = navigationMenus[locale] || navigationMenus['en']
  
  res.json({
    menu,
    foodMegaMenu,
    services: serviceInfo,
    footer: footerColumns,
    payments: paymentMethods
  })
})

export default navigationRouter



