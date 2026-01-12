import { useRouteError, Link } from "react-router-dom";

export default function ErrorBoundary() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                        <i className="fa-solid fa-circle-exclamation text-4xl text-red-600"></i>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Oops! Something went wrong
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        {error?.statusText || error?.message || "An unexpected error occurred."}
                    </p>
                    {error?.data && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-40">
                            <code className="text-sm text-gray-700">{JSON.stringify(error.data)}</code>
                        </div>
                    )}
                </div>
                <div className="mt-8 flex flex-col space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-darkblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkblue transition-all transform hover:scale-[1.02]"
                    >
                        Try Again
                    </button>
                    <Link
                        to="/login"
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkblue transition-all transform hover:scale-[1.02]"
                    >
                        Back to Login
                    </Link>
                </div>
                <p className="mt-6 text-xs text-gray-400">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    );
}
