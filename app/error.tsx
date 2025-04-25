'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

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
        <div className='h-screen items-center justify-center flex'>
            <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md mx-auto my-8">
                <div className="text-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong!</h2>
                    <span>{error?.message}</span>
                    <p className="text-gray-600 mb-6">We encountered an unexpected error. Please try again or contact support if the issue persists.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => {
                            if (window?.parent) {
                                window.parent.postMessage({ type: "CLOSE_CHATBOT" }, "*")
                            } else {
                                window.location.href = '/'
                            }
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}