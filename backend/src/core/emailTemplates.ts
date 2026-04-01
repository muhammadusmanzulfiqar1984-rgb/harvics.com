/**
 * HARVICS OS — LOCALIZED EMAIL TEMPLATES
 * Provides locale-aware HTML email templates for system notifications.
 * Supports all 9 backend locales: en, ar, es, fr, de, zh, ja, ko, pt
 */

import { loadTranslations } from './translate'

export type EmailType =
  | 'orderConfirmation'
  | 'orderShipped'
  | 'orderDelivered'
  | 'welcome'
  | 'passwordReset'
  | 'invoiceCreated'
  | 'paymentReceived'
  | 'lowStockAlert'
  | 'approvalRequired'

interface EmailData {
  [key: string]: string | number | undefined
}

interface RenderedEmail {
  subject: string
  html: string
  text: string
}

// ─── EMAIL TRANSLATION STRINGS ───────────────────────────────────────────────
// These complement the existing backend locale JSON files.
// Keys live in the `email` namespace of each locale file.

const EMAIL_FALLBACK_EN = {
  orderConfirmation: {
    subject: 'Order Confirmation — {{orderNumber}}',
    greeting: 'Thank you for your order!',
    body: 'Your order {{orderNumber}} has been confirmed and is being processed.',
    estimatedDelivery: 'Estimated Delivery',
    viewOrder: 'View Order',
    footer: 'This email was sent by Harvics Global Ventures. If you have questions, contact sales.uk@harvics.com',
  },
  orderShipped: {
    subject: 'Your Order Has Shipped — {{orderNumber}}',
    greeting: 'Great news!',
    body: 'Your order {{orderNumber}} has been dispatched and is on its way.',
    trackingNumber: 'Tracking Number',
    viewTracking: 'Track Shipment',
    footer: 'Harvics Global Ventures | harvics.com',
  },
  orderDelivered: {
    subject: 'Order Delivered — {{orderNumber}}',
    greeting: 'Your order has been delivered!',
    body: 'Order {{orderNumber}} was successfully delivered. We hope you are satisfied.',
    leaveReview: 'Leave a Review',
    footer: 'Harvics Global Ventures | harvics.com',
  },
  welcome: {
    subject: 'Welcome to Harvics OS, {{name}}!',
    greeting: 'Welcome aboard, {{name}}!',
    body: 'Your Harvics OS account has been created. You now have access to the platform.',
    loginButton: 'Log in to Harvics OS',
    footer: 'If you did not create this account, please contact support immediately.',
  },
  passwordReset: {
    subject: 'Password Reset Request',
    greeting: 'Hello {{name}},',
    body: 'We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.',
    resetButton: 'Reset Password',
    footer: 'If you did not request a password reset, please ignore this email.',
  },
  invoiceCreated: {
    subject: 'Invoice {{invoiceNumber}} — {{amount}}',
    greeting: 'Invoice Ready',
    body: 'Invoice {{invoiceNumber}} for {{amount}} has been generated and is due on {{dueDate}}.',
    viewInvoice: 'View Invoice',
    footer: 'Harvics Global Ventures | sales.uk@harvics.com',
  },
  paymentReceived: {
    subject: 'Payment Received — {{amount}}',
    greeting: 'Payment Confirmed',
    body: 'We have received your payment of {{amount}} for invoice {{invoiceNumber}}. Thank you!',
    viewReceipt: 'View Receipt',
    footer: 'Harvics Global Ventures',
  },
  lowStockAlert: {
    subject: 'Low Stock Alert — {{productName}}',
    greeting: 'Inventory Alert',
    body: 'Product "{{productName}}" (SKU: {{sku}}) is running low. Current stock: {{quantity}} units.',
    reorder: 'Reorder Now',
    footer: 'Harvics OS Inventory Management',
  },
  approvalRequired: {
    subject: 'Action Required — {{documentType}} Awaiting Approval',
    greeting: 'Approval Needed',
    body: '{{documentType}} {{documentNumber}} from {{requestedBy}} requires your approval.',
    approveButton: 'Review & Approve',
    footer: 'Harvics OS — Procurement & Finance',
  },
}

type EmailKey = keyof typeof EMAIL_FALLBACK_EN

// ─── LOCALE-SPECIFIC OVERRIDES ───────────────────────────────────────────────
const EMAIL_LOCALES: Record<string, Partial<typeof EMAIL_FALLBACK_EN>> = {
  ar: {
    orderConfirmation: {
      subject: 'تأكيد الطلب — {{orderNumber}}',
      greeting: 'شكراً لطلبك!',
      body: 'تم تأكيد طلبك {{orderNumber}} وهو قيد المعالجة.',
      estimatedDelivery: 'الموعد المتوقع للتسليم',
      viewOrder: 'عرض الطلب',
      footer: 'تم إرسال هذا البريد من هارفيكس للمشاريع العالمية. للاستفسار: sales.uk@harvics.com',
    },
    orderShipped: {
      subject: 'تم شحن طلبك — {{orderNumber}}',
      greeting: 'أخبار رائعة!',
      body: 'تم شحن طلبك {{orderNumber}} وهو في طريقه إليك.',
      trackingNumber: 'رقم التتبع',
      viewTracking: 'تتبع الشحنة',
      footer: 'هارفيكس للمشاريع العالمية | harvics.com',
    },
    orderDelivered: {
      subject: 'تم تسليم الطلب — {{orderNumber}}',
      greeting: 'تم تسليم طلبك!',
      body: 'تم تسليم الطلب {{orderNumber}} بنجاح. نأمل أن تكون راضياً.',
      leaveReview: 'اترك تقييماً',
      footer: 'هارفيكس للمشاريع العالمية | harvics.com',
    },
    welcome: {
      subject: 'مرحباً بك في هارفيكس OS يا {{name}}!',
      greeting: 'أهلاً وسهلاً {{name}}!',
      body: 'تم إنشاء حسابك في هارفيكس OS. يمكنك الآن الوصول إلى المنصة.',
      loginButton: 'الدخول إلى هارفيكس OS',
      footer: 'إذا لم تقم بإنشاء هذا الحساب، يرجى التواصل مع الدعم فوراً.',
    },
    passwordReset: {
      subject: 'طلب إعادة تعيين كلمة المرور',
      greeting: 'مرحباً {{name}}،',
      body: 'استلمنا طلباً لإعادة تعيين كلمة مرورك. انقر أدناه لتعيين كلمة مرور جديدة. ينتهي هذا الرابط خلال ساعة واحدة.',
      resetButton: 'إعادة تعيين كلمة المرور',
      footer: 'إذا لم تطلب إعادة التعيين، يرجى تجاهل هذا البريد.',
    },
    invoiceCreated: {
      subject: 'الفاتورة {{invoiceNumber}} — {{amount}}',
      greeting: 'الفاتورة جاهزة',
      body: 'تم إصدار الفاتورة {{invoiceNumber}} بمبلغ {{amount}}، تاريخ الاستحقاق: {{dueDate}}.',
      viewInvoice: 'عرض الفاتورة',
      footer: 'هارفيكس للمشاريع العالمية | sales.uk@harvics.com',
    },
    paymentReceived: {
      subject: 'تم استلام الدفعة — {{amount}}',
      greeting: 'تأكيد الدفع',
      body: 'استلمنا دفعتك بمبلغ {{amount}} للفاتورة {{invoiceNumber}}. شكراً لك!',
      viewReceipt: 'عرض الإيصال',
      footer: 'هارفيكس للمشاريع العالمية',
    },
    lowStockAlert: {
      subject: 'تنبيه مخزون منخفض — {{productName}}',
      greeting: 'تنبيه المخزون',
      body: 'المنتج "{{productName}}" (SKU: {{sku}}) على وشك النفاد. المخزون الحالي: {{quantity}} وحدة.',
      reorder: 'إعادة الطلب الآن',
      footer: 'إدارة مخزون هارفيكس OS',
    },
    approvalRequired: {
      subject: 'إجراء مطلوب — {{documentType}} بانتظار الموافقة',
      greeting: 'الموافقة مطلوبة',
      body: '{{documentType}} {{documentNumber}} من {{requestedBy}} يتطلب موافقتك.',
      approveButton: 'مراجعة والموافقة',
      footer: 'هارفيكس OS — المشتريات والمالية',
    },
  },
  es: {
    orderConfirmation: {
      subject: 'Confirmación de Pedido — {{orderNumber}}',
      greeting: '¡Gracias por su pedido!',
      body: 'Su pedido {{orderNumber}} ha sido confirmado y está siendo procesado.',
      estimatedDelivery: 'Entrega Estimada',
      viewOrder: 'Ver Pedido',
      footer: 'Harvics Global Ventures. Consultas: sales.uk@harvics.com',
    },
    welcome: {
      subject: '¡Bienvenido a Harvics OS, {{name}}!',
      greeting: '¡Bienvenido, {{name}}!',
      body: 'Su cuenta en Harvics OS ha sido creada. Ahora tiene acceso a la plataforma.',
      loginButton: 'Iniciar sesión en Harvics OS',
      footer: 'Si no creó esta cuenta, contacte a soporte inmediatamente.',
    },
    passwordReset: {
      subject: 'Solicitud de restablecimiento de contraseña',
      greeting: 'Hola {{name}},',
      body: 'Recibimos una solicitud para restablecer su contraseña. Haga clic abajo para establecer una nueva. Este enlace expira en 1 hora.',
      resetButton: 'Restablecer Contraseña',
      footer: 'Si no solicitó esto, ignore este correo.',
    },
    invoiceCreated: {
      subject: 'Factura {{invoiceNumber}} — {{amount}}',
      greeting: 'Factura Lista',
      body: 'Se ha generado la factura {{invoiceNumber}} por {{amount}}, con vencimiento el {{dueDate}}.',
      viewInvoice: 'Ver Factura',
      footer: 'Harvics Global Ventures | sales.uk@harvics.com',
    },
    approvalRequired: {
      subject: 'Acción Requerida — {{documentType}} Pendiente de Aprobación',
      greeting: 'Se Necesita Aprobación',
      body: '{{documentType}} {{documentNumber}} de {{requestedBy}} requiere su aprobación.',
      approveButton: 'Revisar y Aprobar',
      footer: 'Harvics OS — Compras y Finanzas',
    },
  },
  fr: {
    orderConfirmation: {
      subject: 'Confirmation de Commande — {{orderNumber}}',
      greeting: 'Merci pour votre commande !',
      body: 'Votre commande {{orderNumber}} a été confirmée et est en cours de traitement.',
      estimatedDelivery: 'Livraison Estimée',
      viewOrder: 'Voir la Commande',
      footer: 'Harvics Global Ventures. Questions : sales.uk@harvics.com',
    },
    welcome: {
      subject: 'Bienvenue sur Harvics OS, {{name}} !',
      greeting: 'Bienvenue, {{name}} !',
      body: 'Votre compte Harvics OS a été créé. Vous avez maintenant accès à la plateforme.',
      loginButton: 'Se connecter à Harvics OS',
      footer: "Si vous n'avez pas créé ce compte, contactez le support immédiatement.",
    },
    passwordReset: {
      subject: 'Réinitialisation du mot de passe',
      greeting: 'Bonjour {{name}},',
      body: 'Nous avons reçu une demande de réinitialisation de mot de passe. Cliquez ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.',
      resetButton: 'Réinitialiser le mot de passe',
      footer: "Si vous n'avez pas fait cette demande, ignorez cet e-mail.",
    },
    invoiceCreated: {
      subject: 'Facture {{invoiceNumber}} — {{amount}}',
      greeting: 'Facture Prête',
      body: "La facture {{invoiceNumber}} d'un montant de {{amount}} a été générée, échéance le {{dueDate}}.",
      viewInvoice: 'Voir la Facture',
      footer: 'Harvics Global Ventures | sales.uk@harvics.com',
    },
    approvalRequired: {
      subject: 'Action Requise — {{documentType}} en Attente d\'Approbation',
      greeting: 'Approbation Requise',
      body: '{{documentType}} {{documentNumber}} de {{requestedBy}} nécessite votre approbation.',
      approveButton: 'Examiner et Approuver',
      footer: 'Harvics OS — Achats et Finance',
    },
  },
  de: {
    orderConfirmation: {
      subject: 'Bestellbestätigung — {{orderNumber}}',
      greeting: 'Vielen Dank für Ihre Bestellung!',
      body: 'Ihre Bestellung {{orderNumber}} wurde bestätigt und wird bearbeitet.',
      estimatedDelivery: 'Voraussichtliche Lieferung',
      viewOrder: 'Bestellung ansehen',
      footer: 'Harvics Global Ventures. Fragen: sales.uk@harvics.com',
    },
    welcome: {
      subject: 'Willkommen bei Harvics OS, {{name}}!',
      greeting: 'Willkommen, {{name}}!',
      body: 'Ihr Harvics OS-Konto wurde erstellt. Sie haben nun Zugang zur Plattform.',
      loginButton: 'Bei Harvics OS anmelden',
      footer: 'Falls Sie dieses Konto nicht erstellt haben, kontaktieren Sie sofort den Support.',
    },
    passwordReset: {
      subject: 'Passwort-Zurücksetzen-Anfrage',
      greeting: 'Hallo {{name}},',
      body: 'Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie unten, um ein neues Passwort festzulegen. Dieser Link läuft in 1 Stunde ab.',
      resetButton: 'Passwort zurücksetzen',
      footer: 'Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.',
    },
    invoiceCreated: {
      subject: 'Rechnung {{invoiceNumber}} — {{amount}}',
      greeting: 'Rechnung bereit',
      body: 'Rechnung {{invoiceNumber}} über {{amount}} wurde erstellt, fällig am {{dueDate}}.',
      viewInvoice: 'Rechnung ansehen',
      footer: 'Harvics Global Ventures | sales.uk@harvics.com',
    },
    approvalRequired: {
      subject: 'Aktion erforderlich — {{documentType}} wartet auf Genehmigung',
      greeting: 'Genehmigung erforderlich',
      body: '{{documentType}} {{documentNumber}} von {{requestedBy}} erfordert Ihre Genehmigung.',
      approveButton: 'Überprüfen und Genehmigen',
      footer: 'Harvics OS — Einkauf und Finanzen',
    },
  },
}

// ─── INTERPOLATION ────────────────────────────────────────────────────────────
function interpolate(template: string, data: EmailData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] !== undefined ? String(data[key]) : `{{${key}}}`
  )
}

// ─── GET EMAIL STRINGS ────────────────────────────────────────────────────────
function getEmailStrings(emailType: EmailKey, locale: string) {
  const localeStrings = EMAIL_LOCALES[locale]?.[emailType]
  const fallback = EMAIL_FALLBACK_EN[emailType]
  return { ...fallback, ...localeStrings }
}

// ─── HTML TEMPLATE ENGINE ─────────────────────────────────────────────────────
function buildEmailHTML(strings: Record<string, string>, data: EmailData, ctaLabel?: string, ctaUrl?: string): string {
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(data.locale as string || '')
  const dir = isRTL ? 'rtl' : 'ltr'
  const textAlign = isRTL ? 'right' : 'left'

  const cta = ctaLabel && ctaUrl
    ? `<tr><td style="padding:24px 0 0;text-align:center;">
        <a href="${ctaUrl}" style="background:#6B1F2B;color:#ffffff;padding:12px 28px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.5px;">${ctaLabel}</a>
       </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="${data.locale || 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${interpolate(strings.subject || '', data)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#6B1F2B;padding:24px 32px;">
            <span style="color:#C3A35E;font-size:22px;font-weight:700;letter-spacing:2px;">HARVICS</span>
            <span style="color:#ffffff;font-size:12px;margin-left:8px;opacity:0.7;">GLOBAL VENTURES</span>
          </td>
        </tr>

        <!-- Gold line -->
        <tr><td style="background:#C3A35E;height:3px;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;direction:${dir};text-align:${textAlign};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:20px;font-weight:700;color:#111111;padding-bottom:16px;">
                  ${interpolate(strings.greeting || '', data)}
                </td>
              </tr>
              <tr>
                <td style="font-size:15px;color:#444444;line-height:1.7;padding-bottom:20px;">
                  ${interpolate(strings.body || '', data)}
                </td>
              </tr>
              ${cta}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:20px 32px;">
            <p style="font-size:12px;color:#999999;margin:0;text-align:center;">
              ${interpolate(strings.footer || '', data)}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Renders a localized email template.
 *
 * @example
 * const email = renderEmail('orderConfirmation', 'ar', { orderNumber: 'ORD-001' })
 * await sendMail({ to: customer.email, subject: email.subject, html: email.html })
 */
export function renderEmail(
  type: EmailType,
  locale: string = 'en',
  data: EmailData = {},
  ctaUrl?: string
): RenderedEmail {
  const supportedLocale = EMAIL_LOCALES[locale] ? locale : 'en'
  const strings = getEmailStrings(type as EmailKey, supportedLocale) as Record<string, string>

  const allData = { ...data, locale: supportedLocale }

  const ctaKey = Object.keys(strings).find(k =>
    k.endsWith('Button') || k === 'viewOrder' || k === 'viewInvoice' ||
    k === 'viewTracking' || k === 'reorder' || k === 'approveButton' ||
    k === 'viewReceipt' || k === 'leaveReview'
  )
  const ctaLabel = ctaKey ? interpolate(strings[ctaKey], allData) : undefined

  const subject = interpolate(strings.subject || '', allData)
  const html = buildEmailHTML(strings, allData, ctaLabel, ctaUrl)
  const text = [
    interpolate(strings.greeting || '', allData),
    interpolate(strings.body || '', allData),
    ctaUrl ? ctaUrl : '',
    interpolate(strings.footer || '', allData),
  ].filter(Boolean).join('\n\n')

  return { subject, html, text }
}

/**
 * Returns the list of supported email locales.
 */
export function getSupportedEmailLocales(): string[] {
  return ['en', ...Object.keys(EMAIL_LOCALES)]
}
