'use client'

import { useEffect } from 'react'
import { Button } from 'antd'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="space-x-4">
          <Button 
            type="primary" 
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            className="border-gray-300 text-gray-700 hover:border-gray-400"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
} 