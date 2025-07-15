import Link from 'next/link'
import { Button } from 'antd'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button 
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              className="border-gray-300 text-gray-700 hover:border-gray-400"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 