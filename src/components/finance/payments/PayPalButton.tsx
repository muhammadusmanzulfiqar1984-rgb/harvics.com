'use client'

import React, { useState } from 'react'

// REAL PAYPAL INTEGRATION CODE (uncomment when @paypal/react-paypal-js is installed):
/*
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const PayPalButtonReal: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  disabled = false
}) => {
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb',
    currency: currency,
    intent: 'capture' as const,
  }

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    })
  }

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      if (onSuccess) {
        onSuccess(details)
      }
    })
  }

  const onErrorHandler = (error: any) => {
    console.error('PayPal error:', error)
    if (onError) {
      onError(error)
    }
  }

  const onCancelHandler = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="w-full">
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          onCancel={onCancelHandler}
          disabled={disabled}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 45,
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
}
*/

interface PayPalButtonProps {
  amount: number
  currency?: string
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
  onCancel?: () => void
  disabled?: boolean
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayPalPayment = async () => {
    if (disabled) return

    setIsProcessing(true)
    
    try {
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful payment
      const mockDetails = {
        id: 'PAY-' + Math.random().toString(36).slice(2, 11),
        status: 'COMPLETED',
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        payer: {
          email_address: 'customer@example.com',
          name: {
            given_name: 'John',
            surname: 'Doe'
          }
        }
      }
      
      if (onSuccess) {
        onSuccess(mockDetails)
      }
    } catch (error) {
      console.error('PayPal payment error:', error)
      if (onError) {
        onError(error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border-2 border-[#C3A35E]/30 p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-lg">
            PayPal
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-black mb-2">
            {currency} {amount.toFixed(2)}
          </div>
          <div className="text-sm text-black/70">
            Click below to pay securely with PayPal
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePayPalPayment}
            disabled={disabled || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>💳</span>
                <span>Pay with PayPal</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={disabled || isProcessing}
            className="w-full bg-white0 hover:bg-gray-600 disabled:bg-white text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-center text-black/60">
          <div className="mb-1">🔒 Secure payment powered by PayPal</div>
          <div>This is a demo version. In production, this will connect to real PayPal services.</div>
        </div>
      </div>
    </div>
  )
}

export default PayPalButton
