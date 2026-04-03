import { useState } from 'react';
import { Activity, Thermometer, Heart, Wind, AlertCircle } from 'lucide-react';

const TriageForm = ({ onDataChange, initialData = {} }) => {
    const [triage, setTriage] = useState({
        urgencyLevel: 'non-urgent',
        colorCode: 'blue',
        vitalSigns: {
            bloodPressure: { systolic: '', diastolic: '' },
            heartRate: '',
            temperature: '',
            respiratoryRate: '',
            oxygenSaturation: '',
            painLevel: 0
        },
        symptoms: [{ name: '', severity: 'low', duration: '' }],
        notes: '',
        ...initialData
    });

    const handleVitalChange = (field, value, subfield = null) => {
        setTriage(prev => {
            const newData = { ...prev };
            if (subfield) {
                newData.vitalSigns.bloodPressure[subfield] = value;
            } else {
                newData.vitalSigns[field] = value;
            }
            onDataChange(newData);
            return newData;
        });
    };

    const handleUrgencyChange = (level) => {
        const colorMap = {
            'non-urgent': 'blue',
            'semi-urgent': 'green',
            'urgent': 'yellow',
            'emergency': 'orange',
            'immediate': 'red'
        };
        setTriage(prev => {
            const newData = { ...prev, urgencyLevel: level, colorCode: colorMap[level] };
            onDataChange(newData);
            return newData;
        });
    };

    const addSymptom = () => {
        setTriage(prev => ({
            ...prev,
            symptoms: [...prev.symptoms, { name: '', severity: 'low', duration: '' }]
        }));
    };

    const updateSymptom = (index, field, value) => {
        setTriage(prev => {
            const newSymptoms = [...prev.symptoms];
            newSymptoms[index][field] = value;
            const newData = { ...prev, symptoms: newSymptoms };
            onDataChange(newData);
            return newData;
        });
    };

    return (
        <div className="space-y-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="text-indigo-600 w-5 h-5" />
                <h3 className="font-bold text-gray-800">Dados de Triagem Clínica</h3>
            </div>

            {/* Urgency Level & Color Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nível de Urgência</label>
                    <select 
                        value={triage.urgencyLevel}
                        onChange={(e) => handleUrgencyChange(e.target.value)}
                        className={`input mt-1 border-l-4 ${
                            triage.colorCode === 'red' ? 'border-l-red-500' :
                            triage.colorCode === 'orange' ? 'border-l-orange-500' :
                            triage.colorCode === 'yellow' ? 'border-l-yellow-500' :
                            triage.colorCode === 'green' ? 'border-l-green-500' : 'border-l-blue-500'
                        }`}
                    >
                        <option value="non-urgent">Não Urgente (Azul)</option>
                        <option value="semi-urgent">Pouco Urgente (Verde)</option>
                        <option value="urgent">Urgente (Amarelo)</option>
                        <option value="emergency">Emergência (Laranja)</option>
                        <option value="immediate">Imediato (Vermelho)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dor (0-10)</label>
                    <input 
                        type="range" min="0" max="10" 
                        value={triage.vitalSigns.painLevel}
                        onChange={(e) => handleVitalChange('painLevel', parseInt(e.target.value))}
                        className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Sem dor</span>
                        <span>Dor Máxima</span>
                    </div>
                </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" /> Temp (°C)
                    </label>
                    <input 
                        type="number" step="0.1"
                        value={triage.vitalSigns.temperature}
                        onChange={(e) => handleVitalChange('temperature', e.target.value)}
                        className="input-sm w-full"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> FC (bpm)
                    </label>
                    <input 
                        type="number"
                        value={triage.vitalSigns.heartRate}
                        onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                        className="input-sm w-full"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                        <Wind className="w-3 h-3" /> SpO2 (%)
                    </label>
                    <input 
                        type="number"
                        value={triage.vitalSigns.oxygenSaturation}
                        onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                        className="input-sm w-full"
                    />
                </div>
                <div className="col-span-2 flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Tensão Art. (Sist.)</label>
                        <input 
                            type="number"
                            value={triage.vitalSigns.bloodPressure.systolic}
                            onChange={(e) => handleVitalChange('bloodPressure', e.target.value, 'systolic')}
                            className="input-sm w-full"
                            placeholder="120"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Tensão Art. (Diast.)</label>
                        <input 
                            type="number"
                            value={triage.vitalSigns.bloodPressure.diastolic}
                            onChange={(e) => handleVitalChange('bloodPressure', e.target.value, 'diastolic')}
                            className="input-sm w-full"
                            placeholder="80"
                        />
                    </div>
                </div>
            </div>

            {/* Symptoms Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Queixas e Sintomas</label>
                    <button 
                        type="button" onClick={addSymptom}
                        className="text-xs text-indigo-600 hover:underline"
                    >
                        + Adicionar Sintoma
                    </button>
                </div>
                {triage.symptoms.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                        <input 
                            placeholder="Ex: Febre, Tosse..."
                            value={s.name}
                            onChange={(e) => updateSymptom(idx, 'name', e.target.value)}
                            className="input-sm flex-1"
                        />
                        <select 
                            value={s.severity}
                            onChange={(e) => updateSymptom(idx, 'severity', e.target.value)}
                            className="input-sm w-28"
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Notas de Triagem</label>
                <textarea 
                    rows="2"
                    value={triage.notes}
                    onChange={(e) => {
                        const newNotes = e.target.value;
                        setTriage(prev => {
                            const newData = { ...prev, notes: newNotes };
                            onDataChange(newData);
                            return newData;
                        });
                    }}
                    className="input mt-1 text-sm"
                    placeholder="Observações adicionais..."
                ></textarea>
            </div>
        </div>
    );
};

export default TriageForm;
