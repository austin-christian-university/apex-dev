"use client"

import { MicrosoftSyncProgress } from "@/components/auth/microsoft-sync-progress"

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-8 text-center">
          UI Component Test Page
        </h1>
        
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Microsoft Sync Progress Component
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            This is the MicrosoftSyncProgress component for testing UI edits.
          </p>
        </div>
        
        {/* Test the component with different states */}
        <div className="space-y-8">
          {/* Default state */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">Default State</h3>
            <MicrosoftSyncProgress />
          </div>
          
          {/* With onComplete callback */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">With onComplete Callback</h3>
            <MicrosoftSyncProgress 
              onComplete={() => alert('Sync completed!')}
            />
          </div>
          
          {/* Completed state */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">Completed State</h3>
            <MicrosoftSyncProgress 
              syncCompleted={true}
              syncResult={{
                success: true,
                isNewUser: false,
                userEmail: "test@example.com"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
