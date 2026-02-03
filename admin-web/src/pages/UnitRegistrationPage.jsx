import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, Heart, Microscope, Globe, Activity } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const UnitRegistrationPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [unitType, setUnitType] = useState('clinic'); // 'clinic' or 'laboratory'
    const [formData, setFormData] = useState({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: ''
        },
        contact: {
            email: '',
            phone: '',
            website: ''
        }
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor, selecione apenas ficheiros de imagem');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem não pode exceder 5MB');
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let logoUrl = null;

            // Upload image first if one was selected
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', imageFile);

                const uploadResponse = await api.post('/upload/single', imageFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                logoUrl = uploadResponse.data.data[0].path;
            }

            // Create clinic with uploaded image URL
            const response = await api.post('/clinics', {
                ...formData,
                coordinates: {
                    latitude: -25.9692,
                    longitude: 32.5732
                },
                type: unitType,
                status: 'active',
                branding: logoUrl ? { logo: logoUrl } : undefined
            });

            toast.success(`${unitType === 'clinic' ? 'Clínica' : 'Laboratório'} criada com sucesso!`);

            // Redirect to selection page - it will automatically reload the clinics list
            navigate('/clinic-selection');
        } catch (error) {
            console.error('Error creating unit:', error);
            toast.error(error.response?.data?.error || 'Erro ao criar unidade');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-3xl mx-auto z-10 relative">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white font-display tracking-tight mb-4">
                        Registar Nova <span className="text-primary-500">Unidade</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Configure os detalhes da sua clínica ou laboratório</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setUnitType('clinic')}
                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${unitType === 'clinic'
                                ? 'border-primary-500 bg-primary-500/10 text-white'
                                : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20'
                                }`}
                        >
                            <Heart className="w-8 h-8" />
                            <span className="font-bold uppercase tracking-widest text-xs">Clínica</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUnitType('laboratory')}
                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${unitType === 'laboratory'
                                ? 'border-primary-500 bg-primary-500/10 text-white'
                                : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20'
                                }`}
                        >
                            <Microscope className="w-8 h-8" />
                            <span className="font-bold uppercase tracking-widest text-xs">Laboratório</span>
                        </button>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Logo da {unitType === 'clinic' ? 'Clínica' : 'Laboratório'}
                        </label>

                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-primary-500/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Building2 className="w-12 h-12 mb-3 text-slate-500 group-hover:text-primary-500 transition-colors" />
                                    <p className="mb-2 text-sm text-slate-400 group-hover:text-white transition-colors">
                                        <span className="font-semibold">Clique para fazer upload</span> ou arraste aqui
                                    </p>
                                    <p className="text-xs text-slate-600">PNG, JPG ou JPEG (MAX. 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        ) : (
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-primary-500/30 group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome da Unidade</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 outline-none transition-all font-semibold"
                                    placeholder="Ex: Central Med"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    name="contact.phone"
                                    value={formData.contact.phone}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 outline-none transition-all font-semibold"
                                    placeholder="+258 ..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="contact.email"
                                    value={formData.contact.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 outline-none transition-all font-semibold"
                                    placeholder="contato@unidade.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cidade</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 outline-none transition-all font-semibold"
                                    placeholder="Ex: Maputo"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Endereço</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-primary-500 outline-none transition-all font-semibold"
                                    placeholder="Rua, Bairro, nº"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.3em] text-sm py-5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-4 group"
                    >
                        {loading ? 'A processar...' : 'Finalizar Registo'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UnitRegistrationPage;
