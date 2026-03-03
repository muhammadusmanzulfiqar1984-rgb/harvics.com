'use client'

import React from 'react'
import PayPalButton from './PayPalButton'

interface PayPalWrapperProps {
  amount: number
  currency?: string
}

const PayPalWrapper: React.FC<PayPalWrapperProps> = ({
  amount,
  currency = 'USD'
}) => {
  const handleSuccess = (details: any) => {
    console.log('PayPal payment successful:', details)
    alert('Payment successful! Your order has been placed.')
  }

  const handleError = (error: any) => {
    console.error('PayPal payment error:', error)
    alert('Payment failed. Please try again.')
  }

  const handleCancel = () => {
    console.log('PayPal payment cancelled')
    alert('Payment cancelled.')
  }

  return (
    <PayPalButton
      amount={amount}
      currency={currency}
      onSuccess={handleSuccess}
      onError={handleError}
      onCancel={handleCancel}
    />
  )
}

export default PayPalWrapper
