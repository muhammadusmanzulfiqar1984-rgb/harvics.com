export default function HealthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">System Healthy</h1>
        <p className="text-center text-gray-600 mb-6">All services are operational</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Frontend</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              ✓ Online
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Backend API</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              ✓ Connected
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Database</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              ✓ Active
            </span>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Last checked: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}
