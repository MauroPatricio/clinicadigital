import React from 'react';
import { useLoading } from '../../context/LoadingContext';

const GlobalLoader = () => {
    const { loading, loadingMessage } = useLoading();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Spinner */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    </div>

                    {/* Loading Message */}
                    <div className="text-center">
                        <p className="text-gray-800 font-medium text-lg">
                            {loadingMessage || 'Carregando...'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Por favor, aguarde
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalLoader;
