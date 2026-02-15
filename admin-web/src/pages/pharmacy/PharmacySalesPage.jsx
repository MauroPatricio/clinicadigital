import { useState, useEffect } from 'react';
import {
    ShoppingCart, Search, Plus, Trash2, CreditCard,
    Printer, User, FileText, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PharmacySalesPage = () => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Mock products
    const mockProducts = [
        { id: 1, name: 'Paracetamol 500mg', price: 50, stock: 1500 },
        { id: 2, name: 'Ibuprofeno 400mg', price: 120, stock: 800 },
        { id: 3, name: 'Amoxicilina 1g', price: 350, stock: 45, prescription: true },
        { id: 4, name: 'Vitamina C 1g', price: 200, stock: 300 },
    ];

    useEffect(() => {
        setProducts(mockProducts);
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
            {/* Product Catalog */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-900 mb-4">Catálogo de Produtos</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar medicamento..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="flex flex-col items-start p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                        >
                            <span className="font-bold text-gray-900 group-hover:text-indigo-700">{product.name}</span>
                            <span className="text-sm text-gray-500 mb-2">Estoque: {product.stock}</span>
                            <div className="mt-auto flex justify-between w-full items-center">
                                <span className="font-bold text-indigo-600">{product.price} MZN</span>
                                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full group-hover:bg-indigo-200">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart / POS */}
            <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-indigo-600 text-white rounded-t-xl">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg">Venda Atual</h2>
                        <span className="bg-indigo-500 px-2 py-0.5 rounded text-xs">POS #01</span>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-700 p-2 rounded-lg cursor-pointer hover:bg-indigo-500 transition-colors">
                        <User className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm font-medium">
                            {selectedPatient ? selectedPatient.name : 'Selecionar Paciente (Opcional)'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Carrinho vazio</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                    <p className="text-indigo-600 font-bold text-sm">{item.price} MZN</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                                        <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between items-center mb-2 text-gray-600">
                        <span>Subtotal</span>
                        <span>{total} MZN</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{total} MZN</span>
                    </div>

                    <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cart.length === 0}
                        onClick={() => toast.success('Venda finalizada com sucesso!')}
                    >
                        <CheckCircle className="w-5 h-5" />
                        Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PharmacySalesPage;
