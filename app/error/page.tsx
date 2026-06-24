'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SessionExpiredPage() {
    const params = useSearchParams();
    const error = params.get('error');
    const isSessionExpired = error === 'session expired';

    return (
        <div className="h-screen w-screen items-center justify-center flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {isSessionExpired ? 'Session Expired' : 'Something went wrong'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                        {isSessionExpired
                            ? 'Your session has expired. Please reload the page to start a new session.'
                            : 'An unexpected error occurred. Please reload the page to try again.'}
                    </p>
                </div>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => {
                            if (window.parent && window.parent !== window) {
                                window.parent.postMessage({ type: 'SESSION_EXPIRED' }, '*');
                            } else {
                                window.location.reload();
                            }
                        }}
                        className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => {
                            if (window?.parent) {
                                window.parent.postMessage({ type: 'CLOSE_CHATBOT' }, '*');
                            } else {
                                window.location.href = '/';
                            }
                        }}
                        className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense>
            <SessionExpiredPage />
        </Suspense>
    );
}
