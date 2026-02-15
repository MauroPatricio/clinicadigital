import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    ArrowLeft, Printer, Mail, Download, CreditCard,
    CheckCircle, XCircle, AlertTriangle, Calendar, Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas'; // Import for PDF logic (needs implementation)
import jsPDF from 'jspdf';

const InvoiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    const loadInvoice = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/owner/finance/premium/invoices/${id}`);
            setInvoice(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar fatura');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvoice = async () => {
        try {
            await api.patch(`/owner/finance/premium/invoices/${id}/send`);
            toast.success('Fatura enviada com sucesso');
            loadInvoice();
        } catch (error) {
            toast.error('Erro ao enviar fatura');
        }
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById('invoice-preview');
        if (!input) return;

        try {
            toast.loading('Gerando PDF...', { id: 'pdf' });
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Fatura-${invoice.invoiceNumber}.pdf`);
            toast.success('PDF baixado!', { id: 'pdf' });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar PDF', { id: 'pdf' });
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
    if (!invoice) return <div className="p-10 text-center">Fatura não encontrada</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between no-print">
                <button
                    onClick={() => navigate('/owner/finance/invoices')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleSendInvoice}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        <Mail className="w-4 h-4" />
                        Enviar por Email
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        <Download className="w-4 h-4" />
                        Baixar PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div id="invoice-preview" className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 max-w-4xl mx-auto">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">FATURA</h1>
                        <p className="text-gray-500 font-medium">{invoice.invoiceNumber}</p>
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 uppercase tracking-wide">
                            {invoice.status}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                            <Building className="w-6 h-6 text-primary-600" />
                            <span className="font-bold text-xl text-gray-900">Clinica Digital</span>
                        </div>
                        <p className="text-gray-500 text-sm">Av. Malhangalene, Rua Malhangalene</p>
                        <p className="text-gray-500 text-sm">Maputo, Moçambique</p>
                        <p className="text-gray-500 text-sm">nhiquelaservicosconsultoria@gmail.com</p>
                    </div>
                </div>

                {/* Bill To / From */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Faturado Para</h3>
                        <p className="text-lg font-bold text-gray-900">
                            {invoice.patient?.profile?.firstName} {invoice.patient?.profile?.lastName}
                        </p>
                        <p className="text-gray-600">{invoice.patient?.user?.email}</p>
                        <p className="text-gray-600">{invoice.patient?.profile?.phone}</p>
                        {invoice.patient?.profile?.address && (
                            <p className="text-gray-600 mt-2">{invoice.patient.profile.address}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="space-y-2">
                            <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-gray-500">Data Emissão:</span>
                                <span className="font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-gray-500">Vencimento:</span>
                                <span className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <table className="w-full">
                        <thead className="border-b border-gray-200">
                            <tr>
                                <th className="py-3 text-left text-sm font-semibold text-gray-600">Descrição</th>
                                <th className="py-3 text-right text-sm font-semibold text-gray-600">Qtd</th>
                                <th className="py-3 text-right text-sm font-semibold text-gray-600">Preço Unit.</th>
                                <th className="py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-gray-900">{item.description}</td>
                                    <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">
                                        {item.unitPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </td>
                                    <td className="py-4 text-right font-medium text-gray-900">
                                        {item.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{invoice.subtotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                        </div>
                        {invoice.tax > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Imposto</span>
                                <span>{invoice.tax.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                            </div>
                        )}
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span>-{invoice.discount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-lg">Total</span>
                            <span className="font-bold text-primary-600 text-xl">
                                {invoice.totalAmount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {(invoice.notes || invoice.insuranceProvider) && (
                    <div className="border-t border-gray-200 pt-8 text-sm text-gray-500">
                        {invoice.notes && <p className="mb-2"><strong>Notas:</strong> {invoice.notes}</p>}
                        {invoice.insuranceProvider && (
                            <p>
                                <strong>Seguradora:</strong> {invoice.insuranceProvider.name}
                                {invoice.insuranceCoverage > 0 && ` (Cobertura: ${invoice.insuranceCoverage.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })})`}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Payment History (if any) */}
            {invoice.payments?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 no-print">
                    <h3 className="font-bold text-gray-900 mb-4">Histórico de Pagamentos</h3>
                    <div className="space-y-3">
                        {invoice.payments.map((payment, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Pagamento Recebido</p>
                                        <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        {payment.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{payment.method}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetailPage;
