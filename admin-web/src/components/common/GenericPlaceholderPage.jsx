import { Component } from 'lucide-react';

const GenericPlaceholderPage = ({ title, icon: Icon = Component }) => {
    return (
        <div className="p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-10">
            <div className="p-4 bg-indigo-50 rounded-full mb-6 text-indigo-600">
                <Icon className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500">
                Este módulo está incluído na sua licença e será ativado na próxima atualização.
            </p>
            <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Ver Roadmap
            </button>
        </div>
    );
};

export default GenericPlaceholderPage;
