"use client"

import { AceWelcome } from "@/components/auth/ace-welcome"

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-8 text-center">
          UI Component Test Page
        </h1>
        
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Ace Welcome Component
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            This is the AceWelcome component for testing UI edits and animations.
          </p>
        </div>
        
        {/* Test the component with different states */}
        <div className="space-y-8">
          {/* Default state */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">Default State (Not Completed)</h3>
            <AceWelcome />
          </div>
          
          {/* With onComplete callback */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">With onComplete Callback</h3>
            <AceWelcome 
              onComplete={() => alert('Welcome completed!')}
            />
          </div>
          
          {/* Completed state - Existing User */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">Completed State - Existing User</h3>
            <AceWelcome 
              syncCompleted={true}
              syncResult={{
                success: true,
                isNewUser: false,
                userEmail: "existing@example.com"
              }}
            />
          </div>
          
          {/* Completed state - New User */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-200 mb-4">Completed State - New User</h3>
            <AceWelcome 
              syncCompleted={true}
              syncResult={{
                success: true,
                isNewUser: true,
                userEmail: "new@example.com"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
