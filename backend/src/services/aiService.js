import OpenAI from 'openai';
import logger from '../config/logger.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const aiService = {
    /**
     * Analyze triage data to provide a clinical summary and recommendation
     * @param {Object} triageData - Data from the Triage model
     */
    async analyzeTriage(triageData) {
        try {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_KEY') {
                logger.warn('OpenAI API Key not configured. Returning mock analysis.');
                return {
                    summary: "Análise simulada: O paciente apresenta sintomas que sugerem uma condição estável, mas requer observação.",
                    recommendation: "Encaminhar para consulta de rotina.",
                    urgencyScore: 2
                };
            }

            const prompt = `
                Como um assistente médico inteligente, analise os seguintes dados de triagem:
                Sintomas: ${JSON.stringify(triageData.symptoms)}
                Sinais Vitais: ${JSON.stringify(triageData.vitalSigns)}
                Nível de Urgência Atribuído: ${triageData.urgencyLevel}
                
                Forneça um breve resumo clínico e uma recomendação de encaminhamento.
                Responda em Português de Moçambique.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });

            return {
                summary: response.choices[0].message.content,
                recommendation: "Baseado na análise de IA, prossiga com o protocolo padrão.",
                urgencyScore: triageData.urgencyLevel === 'emergency' ? 5 : 2
            };
        } catch (error) {
            logger.error(`AI Analysis failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * General health chat assistant
     */
    async getChatResponse(message, context = []) {
        try {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_KEY') {
                return "Estou em modo de demonstração. Em breve poderei responder suas dúvidas de saúde com inteligência artificial!";
            }

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Você é um assistente de saúde virtual para a Clínica Digital em Moçambique. Seja empático, claro e sempre recomende um médico para diagnósticos." },
                    ...context,
                    { role: "user", content: message }
                ],
            });

            return response.choices[0].message.content;
        } catch (error) {
            logger.error(`AI Chat failed: ${error.message}`);
            return "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.";
        }
    }
};

export default aiService;
