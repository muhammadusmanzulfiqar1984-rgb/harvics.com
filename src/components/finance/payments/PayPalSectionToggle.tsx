'use client'

import { useEffect } from 'react'

interface PayPalSectionToggleProps {
  sectionId: string
  paymentName: string
  buttonSelector?: string
}

export default function PayPalSectionToggle({
  sectionId,
  paymentName,
  buttonSelector = 'button[type="submit"]'
}: PayPalSectionToggleProps) {
  useEffect(() => {
    const paymentRadios = document.querySelectorAll(`input[name="${paymentName}"]`)
    const paypalSection = document.getElementById(sectionId)
    const placeOrderButton = document.querySelector(buttonSelector) as HTMLElement

    if (!paypalSection || !placeOrderButton) return

    const handlePaymentChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.value === 'paypal') {
        paypalSection.classList.remove('hidden')
        placeOrderButton.style.display = 'none'
      } else {
        paypalSection.classList.add('hidden')
        placeOrderButton.style.display = 'block'
      }
    }

    paymentRadios.forEach(radio => {
      radio.addEventListener('change', handlePaymentChange)
    })

    return () => {
      paymentRadios.forEach(radio => {
        radio.removeEventListener('change', handlePaymentChange)
      })
    }
  }, [sectionId, paymentName, buttonSelector])

  return null
}

