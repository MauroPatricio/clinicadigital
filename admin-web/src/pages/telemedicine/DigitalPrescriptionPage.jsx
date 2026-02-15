import { FileText, Download, Share2 } from 'lucide-react';

const DigitalPrescriptionPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Prescrições Digitais</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">R-2024-{100 + i}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Amoxicilina + Ibuprofeno</h3>
                        <p className="text-sm text-gray-500 mb-4">Paciente: Ana Silva • 24 Fev 2024</p>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                <Download className="w-4 h-4" /> PDF
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                                <Share2 className="w-4 h-4" /> Enviar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DigitalPrescriptionPage;
