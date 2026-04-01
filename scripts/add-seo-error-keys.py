#!/usr/bin/env python3
"""Adds seo and errors sections to the 4 native locale files."""
import json, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'locales')

TRANSLATIONS = {
    'en': {
        'seo': {
            'home': {'title': 'Harvics Global Ventures | Premium Global Trading', 'description': 'Leading global trading company delivering premium products across 10+ industries. Operating in 50+ countries since 2019.'},
            'about': {'title': 'About Us | Harvics Global Ventures', 'description': 'Discover how Harvics Global Ventures became a leading force in global trade across 40+ countries and 10 industries.'},
            'contact': {'title': 'Contact Us | Harvics Global Ventures', 'description': 'Get in touch with Harvics offices worldwide across the Middle East, South Asia, Europe, Africa, and the Americas.'},
            'products': {'title': 'Products | Harvics Global Ventures', 'description': 'Explore Harvics premium product range across FMCG, textiles, commodities, and industrial solutions.'},
            'careers': {'title': 'Careers | Harvics Global Ventures', 'description': 'Join Harvics Global Ventures — explore opportunities across 40+ countries in FMCG, textiles, logistics, and technology.'},
            'media': {'title': 'Media Center | Harvics Global Ventures', 'description': 'Harvics media center — press releases, latest news, brand assets, and media contacts.'},
            'strategy': {'title': 'Our Strategy | Harvics Global Ventures', 'description': 'Harvics strategic vision for global expansion, innovation, sustainability, and digital transformation.'},
            'csr': {'title': 'Corporate Social Responsibility | Harvics', 'description': 'Harvics CSR initiatives — environmental stewardship, community programs, and ethical business practices.'},
            'faq': {'title': 'FAQ | Harvics Global Ventures', 'description': 'Frequently asked questions about Harvics products, services, ordering, and global operations.'},
            'locations': {'title': 'Global Locations | Harvics', 'description': 'Harvics offices and operations across the Middle East, South Asia, Europe, Africa, and the Americas.'},
            'leadership': {'title': 'Leadership Team | Harvics', 'description': 'Meet the leadership team driving Harvics Global Ventures across 40+ markets and 10 industry verticals.'},
            'help': {'title': 'Help Center | Harvics', 'description': 'Get help with orders, accounts, shipping, and Harvics services.'},
            'compliance': {'title': 'Compliance and Ethics | Harvics', 'description': 'Harvics commitment to regulatory compliance, ethical business practices, and global standards.'},
            'history': {'title': 'Our History | Harvics', 'description': 'From a Dubai startup in 2019 to a global enterprise spanning 40+ countries — the Harvics story.'},
            'newsletter': {'title': 'Newsletter | Harvics', 'description': 'Subscribe to Harvics newsletter for industry insights and product launches.'},
            'login': {'title': 'Sign In | Harvics', 'description': 'Sign in to your Harvics account to manage orders and access the platform.'},
            'research': {'title': 'Research and Innovation | Harvics', 'description': 'Harvics research initiatives and innovation programs driving our global strategy.'},
            'investorRelations': {'title': 'Investor Relations | Harvics', 'description': 'Investor information, financial reports, and corporate announcements from Harvics Global Ventures.'},
        },
        'errors': {
            'notFound': {'title': 'Page Not Found', 'heading': '404 — Page Not Found', 'description': 'The page you are looking for does not exist or has been moved.', 'goHome': 'Go to Homepage', 'goBack': 'Go Back'},
            'serverError': {'title': 'Something Went Wrong', 'heading': 'Something went wrong', 'description': 'We are sorry, but something unexpected happened. Please try refreshing the page.', 'tryAgain': 'Try Again', 'reload': 'Reload Page', 'contactSupport': 'Contact Support'},
            'globalError': {'title': 'Application Error', 'heading': 'Critical Error', 'description': 'A critical error occurred. Please reload the page.', 'reload': 'Reload Application'},
        }
    },
    'ar': {
        'seo': {
            'home': {'title': '\u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0644\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629 | \u062a\u062c\u0627\u0631\u0629 \u0648\u062a\u0648\u0632\u064a\u0639 \u062f\u0648\u0644\u064a \u0645\u062a\u0645\u064a\u0632', 'description': '\u0634\u0631\u0643\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u0639\u0627\u0644\u0645\u064a\u0629 \u0631\u0627\u0626\u062f\u0629 \u062a\u0648\u0641\u0631 \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062a\u0645\u064a\u0632\u0629 \u0639\u0628\u0631 \u0623\u0643\u062b\u0631 \u0645\u0646 10 \u0635\u0646\u0627\u0639\u0627\u062a \u0641\u064a \u0623\u0643\u062b\u0631 \u0645\u0646 50 \u062f\u0648\u0644\u0629.'},
            'about': {'title': '\u0645\u0646 \u0646\u062d\u0646 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0644\u0644\u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629', 'description': '\u0627\u0643\u062a\u0634\u0641 \u0643\u064a\u0641 \u0623\u0635\u0628\u062d\u062a \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0642\u0648\u0629 \u0631\u0627\u0626\u062f\u0629 \u0641\u064a \u0627\u0644\u062a\u062c\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629 \u0639\u0628\u0631 40+ \u062f\u0648\u0644\u0629.'},
            'contact': {'title': '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0645\u0643\u0627\u062a\u0628 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u062d\u0648\u0644 \u0627\u0644\u0639\u0627\u0644\u0645.'},
            'products': {'title': '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0646\u062a\u062c\u0627\u062a \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0627\u0644\u0645\u062a\u0645\u064a\u0632\u0629 \u0639\u0628\u0631 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062a\u0647\u0644\u0627\u0643\u064a\u0629 \u0648\u0627\u0644\u0645\u0646\u0633\u0648\u062c\u0627\u062a.'},
            'careers': {'title': '\u0648\u0638\u0627\u0626\u0641 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u2014 \u0641\u0631\u0635 \u0639\u0645\u0644 \u0639\u0628\u0631 40+ \u062f\u0648\u0644\u0629.'},
            'media': {'title': '\u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0625\u0639\u0644\u0627\u0645\u064a | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0631\u0643\u0632 \u0625\u0639\u0644\u0627\u0645 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u2014 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0635\u062d\u0641\u064a\u0629 \u0648\u0627\u0644\u0623\u062e\u0628\u0627\u0631.'},
            'strategy': {'title': '\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u062a\u0646\u0627 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0644\u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0644\u0644\u062a\u0648\u0633\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064a \u0648\u0627\u0644\u0627\u0628\u062a\u0643\u0627\u0631.'},
            'csr': {'title': '\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0628\u0627\u062f\u0631\u0627\u062a \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0629 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0648\u0627\u0644\u0628\u064a\u0626\u064a\u0629.'},
            'faq': {'title': '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0623\u0633\u0626\u0644\u0629 \u0645\u062a\u0643\u0631\u0631\u0629 \u062d\u0648\u0644 \u0645\u0646\u062a\u062c\u0627\u062a \u0648\u062e\u062f\u0645\u0627\u062a \u0647\u0627\u0631\u0641\u064a\u0643\u0633.'},
            'locations': {'title': '\u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0643\u0627\u062a\u0628 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0641\u064a \u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637 \u0648\u062c\u0646\u0648\u0628 \u0622\u0633\u064a\u0627 \u0648\u0623\u0648\u0631\u0648\u0628\u0627.'},
            'leadership': {'title': '\u0641\u0631\u064a\u0642 \u0627\u0644\u0642\u064a\u0627\u062f\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0641\u0631\u064a\u0642 \u0627\u0644\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u0630\u064a \u064a\u0642\u0648\u062f \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0639\u0628\u0631 40+ \u0633\u0648\u0642\u0627\u064b.'},
            'help': {'title': '\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0645\u0633\u0627\u0639\u062f\u0629 \u0628\u0634\u0623\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u062e\u062f\u0645\u0627\u062a \u0647\u0627\u0631\u0641\u064a\u0643\u0633.'},
            'compliance': {'title': '\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0648\u0627\u0644\u0623\u062e\u0644\u0627\u0642\u064a\u0627\u062a | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u0644\u062a\u0632\u0627\u0645 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0628\u0627\u0644\u0627\u0645\u062a\u062b\u0627\u0644 \u0627\u0644\u062a\u0646\u0638\u064a\u0645\u064a \u0648\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0627\u0644\u0623\u062e\u0644\u0627\u0642\u064a\u0629.'},
            'history': {'title': '\u062a\u0627\u0631\u064a\u062e\u0646\u0627 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0646 \u0634\u0631\u0643\u0629 \u0646\u0627\u0634\u0626\u0629 \u0641\u064a \u062f\u0628\u064a 2019 \u0625\u0644\u0649 \u0645\u0624\u0633\u0633\u0629 \u0639\u0627\u0644\u0645\u064a\u0629 \u0639\u0628\u0631 40+ \u062f\u0648\u0644\u0629.'},
            'newsletter': {'title': '\u0627\u0644\u0646\u0634\u0631\u0629 \u0627\u0644\u0625\u062e\u0628\u0627\u0631\u064a\u0629 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0627\u0634\u062a\u0631\u0643 \u0641\u064a \u0646\u0634\u0631\u0629 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0631\u0624\u0649 \u0627\u0644\u0635\u0646\u0627\u0639\u0629.'},
            'login': {'title': '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0642\u0645 \u0628\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0647\u0627\u0631\u0641\u064a\u0643\u0633 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643.'},
            'research': {'title': '\u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0627\u0628\u062a\u0643\u0627\u0631 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0628\u0627\u062f\u0631\u0627\u062a \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0627\u0628\u062a\u0643\u0627\u0631 \u0641\u064a \u0647\u0627\u0631\u0641\u064a\u0643\u0633.'},
            'investorRelations': {'title': '\u0639\u0644\u0627\u0642\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 | \u0647\u0627\u0631\u0641\u064a\u0643\u0633', 'description': '\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0648\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0627\u0644\u064a\u0629 \u0645\u0646 \u0647\u0627\u0631\u0641\u064a\u0643\u0633.'},
        },
        'errors': {
            'notFound': {'title': '\u0627\u0644\u0635\u0641\u062d\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629', 'heading': '404 \u2014 \u0627\u0644\u0635\u0641\u062d\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629', 'description': '\u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u064a \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629 \u0623\u0648 \u062a\u0645 \u0646\u0642\u0644\u0647\u0627.', 'goHome': '\u0627\u0644\u0630\u0647\u0627\u0628 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629', 'goBack': '\u0627\u0644\u0639\u0648\u062f\u0629'},
            'serverError': {'title': '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627', 'heading': '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627', 'description': '\u0646\u0639\u062a\u0630\u0631\u060c \u062d\u062f\u062b \u0634\u064a\u0621 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639. \u064a\u0631\u062c\u0649 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0635\u0641\u062d\u0629.', 'tryAgain': '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649', 'reload': '\u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644', 'contactSupport': '\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062f\u0639\u0645'},
            'globalError': {'title': '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062a\u0637\u0628\u064a\u0642', 'heading': '\u062e\u0637\u0623 \u0641\u0627\u062f\u062d', 'description': '\u062d\u062f\u062b \u062e\u0637\u0623 \u0641\u0627\u062f\u062d. \u064a\u0631\u062c\u0649 \u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0641\u062d\u0629.', 'reload': '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644'},
        }
    },
    'es': {
        'seo': {
            'home': {'title': 'Harvics Global Ventures | Comercio Global Premium', 'description': 'Empresa comercial global líder con productos premium en más de 10 industrias, operando en 50+ países desde 2019.'},
            'about': {'title': 'Sobre Nosotros | Harvics Global Ventures', 'description': 'Descubra cómo Harvics se convirtió en líder del comercio global en 40+ países.'},
            'contact': {'title': 'Contacto | Harvics Global Ventures', 'description': 'Contacte con las oficinas de Harvics en todo el mundo.'},
            'products': {'title': 'Productos | Harvics Global Ventures', 'description': 'Explore la gama premium de Harvics en FMCG, textiles, materias primas y soluciones industriales.'},
            'careers': {'title': 'Carreras | Harvics Global Ventures', 'description': 'Únase a Harvics — oportunidades en 40+ países en FMCG, textiles, logística y tecnología.'},
            'media': {'title': 'Centro de Medios | Harvics', 'description': 'Comunicados, noticias, activos de marca y contactos de prensa de Harvics.'},
            'strategy': {'title': 'Nuestra Estrategia | Harvics', 'description': 'Visión estratégica de Harvics para expansión global, innovación y sostenibilidad.'},
            'csr': {'title': 'Responsabilidad Social | Harvics', 'description': 'Iniciativas de responsabilidad social corporativa de Harvics.'},
            'faq': {'title': 'Preguntas Frecuentes | Harvics', 'description': 'Preguntas frecuentes sobre productos y servicios de Harvics.'},
            'locations': {'title': 'Ubicaciones | Harvics', 'description': 'Oficinas de Harvics en Medio Oriente, Asia, Europa y África.'},
            'leadership': {'title': 'Equipo Directivo | Harvics', 'description': 'Conozca al equipo directivo de Harvics en 40+ mercados.'},
            'help': {'title': 'Ayuda | Harvics', 'description': 'Obtenga ayuda con pedidos, cuentas y servicios de Harvics.'},
            'compliance': {'title': 'Cumplimiento | Harvics', 'description': 'Compromiso de Harvics con la ética empresarial y el cumplimiento regulatorio.'},
            'history': {'title': 'Historia | Harvics', 'description': 'De startup en Dubái en 2019 a empresa global en 40+ países.'},
            'newsletter': {'title': 'Newsletter | Harvics', 'description': 'Suscríbase al newsletter de Harvics para insights del sector.'},
            'login': {'title': 'Iniciar Sesión | Harvics', 'description': 'Acceda a su cuenta Harvics.'},
            'research': {'title': 'Investigación | Harvics', 'description': 'Investigación e innovación en Harvics.'},
            'investorRelations': {'title': 'Inversores | Harvics', 'description': 'Información financiera y de gobierno corporativo de Harvics.'},
        },
        'errors': {
            'notFound': {'title': 'Página No Encontrada', 'heading': '404 — Página No Encontrada', 'description': 'La página que busca no existe o fue movida.', 'goHome': 'Ir a Inicio', 'goBack': 'Volver'},
            'serverError': {'title': 'Algo Salió Mal', 'heading': 'Algo salió mal', 'description': 'Lo sentimos, ocurrió algo inesperado. Intente recargar la página.', 'tryAgain': 'Intentar de Nuevo', 'reload': 'Recargar', 'contactSupport': 'Contactar Soporte'},
            'globalError': {'title': 'Error de Aplicación', 'heading': 'Error Crítico', 'description': 'Error crítico. Recargue la página.', 'reload': 'Recargar'},
        }
    },
    'fr': {
        'seo': {
            'home': {'title': 'Harvics Global Ventures | Commerce et Distribution Mondiale', 'description': 'Entreprise commerciale mondiale livrant des produits premium dans 10+ industries, opérant dans 50+ pays depuis 2019.'},
            'about': {'title': 'À Propos | Harvics Global Ventures', 'description': 'Comment Harvics est devenu leader du commerce mondial dans 40+ pays.'},
            'contact': {'title': 'Contact | Harvics Global Ventures', 'description': 'Contactez les bureaux Harvics dans le monde.'},
            'products': {'title': 'Produits | Harvics Global Ventures', 'description': 'Gamme premium Harvics en FMCG, textiles, matières premières et solutions industrielles.'},
            'careers': {'title': 'Carrières | Harvics Global Ventures', 'description': 'Rejoignez Harvics — opportunités dans 40+ pays.'},
            'media': {'title': 'Centre Médias | Harvics', 'description': "Communiqués, actualités et contacts presse d'Harvics."},
            'strategy': {'title': 'Notre Stratégie | Harvics', 'description': "Vision stratégique d'Harvics pour l'expansion mondiale et l'innovation."},
            'csr': {'title': 'RSE | Harvics', 'description': "Initiatives de responsabilité sociale d'Harvics."},
            'faq': {'title': 'FAQ | Harvics', 'description': "Questions fréquentes sur les produits et services Harvics."},
            'locations': {'title': 'Bureaux Mondiaux | Harvics', 'description': "Bureaux Harvics au Moyen-Orient, Asie, Europe et Afrique."},
            'leadership': {'title': 'Direction | Harvics', 'description': "Équipe de direction d'Harvics dans 40+ marchés."},
            'help': {'title': 'Aide | Harvics', 'description': "Aide pour les commandes et services Harvics."},
            'compliance': {'title': 'Conformité | Harvics', 'description': "Engagement d'Harvics envers l'éthique et la conformité."},
            'history': {'title': 'Notre Histoire | Harvics', 'description': "De startup à Dubaï en 2019 à entreprise mondiale dans 40+ pays."},
            'newsletter': {'title': 'Newsletter | Harvics', 'description': "Abonnez-vous à la newsletter Harvics."},
            'login': {'title': 'Connexion | Harvics', 'description': "Connectez-vous à votre compte Harvics."},
            'research': {'title': 'Recherche | Harvics', 'description': "Recherche et innovation chez Harvics."},
            'investorRelations': {'title': 'Investisseurs | Harvics', 'description': "Informations financières et gouvernance d'Harvics."},
        },
        'errors': {
            'notFound': {'title': 'Page Introuvable', 'heading': '404 — Page Introuvable', 'description': "La page que vous recherchez n'existe pas ou a été déplacée.", 'goHome': "Aller à l'Accueil", 'goBack': 'Retour'},
            'serverError': {'title': "Une Erreur s'est Produite", 'heading': "Une erreur s'est produite", 'description': "Désolé, une erreur inattendue s'est produite. Veuillez actualiser la page.", 'tryAgain': 'Réessayer', 'reload': 'Recharger', 'contactSupport': 'Contacter le Support'},
            'globalError': {'title': "Erreur d'Application", 'heading': 'Erreur Critique', 'description': 'Erreur critique. Veuillez recharger la page.', 'reload': 'Recharger'},
        }
    },
}

for lang, data in TRANSLATIONS.items():
    path = os.path.join(BASE, f'{lang}.json')
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    d['seo'] = data['seo']
    d['errors'] = data['errors']
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print(f'Updated {lang}.json')

print('All done!')
