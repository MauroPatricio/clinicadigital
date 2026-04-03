import twilio from 'twilio';
import logger from '../config/logger.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

export const whatsappService = {
    /**
     * Send a WhatsApp message
     * @param {string} to - Recipient phone number (e.g. "+258840000000")
     * @param {string} body - Message body
     */
    async sendMessage(to, body) {
        try {
            if (!client) {
                logger.warn(`WhatsApp service not configured. Mocking message to ${to}: ${body}`);
                return { sid: 'MOCK_SID_' + Date.now(), status: 'sent' };
            }

            const message = await client.messages.create({
                from: fromWhatsApp,
                to: `whatsapp:${to}`,
                body: body
            });

            logger.info(`WhatsApp message sent to ${to}: ${message.sid}`);
            return message;
        } catch (error) {
            logger.error(`Failed to send WhatsApp message to ${to}: ${error.message}`);
            throw error;
        }
    },

    /**
     * Send appointment confirmation
     */
    async sendAppointmentConfirmation(appointment) {
        const patientName = appointment.patient.user.profile.firstName;
        const doctorName = appointment.doctor.user.profile.lastName;
        const date = new Date(appointment.dateTime).toLocaleDateString('pt-MZ');
        const time = new Date(appointment.dateTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
        
        const body = `Olá ${patientName}, seu agendamento na Clínica Digital com Dr(a). ${doctorName} foi CONFIRMADO para o dia ${date} às ${time}. `;
        
        if (appointment.type === 'online') {
            const videoUrl = `${process.env.FRONTEND_WEB_URL}/telemedicine/${appointment._id}`;
            body += `Sua consulta será online. Link de acesso: ${videoUrl}`;
        }

        return this.sendMessage(appointment.patient.user.phone, body);
    },

    /**
     * Send 24h reminder
     */
    async sendReminder(appointment) {
        const patientName = appointment.patient.user.profile.firstName;
        const date = new Date(appointment.dateTime).toLocaleDateString('pt-MZ');
        const time = new Date(appointment.dateTime).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

        const body = `Lembrete: Você tem uma consulta amanhã, ${date}, às ${time} na Clínica Digital. Por favor, confirme sua presença.`;
        
        return this.sendMessage(appointment.patient.user.phone, body);
    }
};

export default whatsappService;
