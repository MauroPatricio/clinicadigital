import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Avatar, TextInput, IconButton, Card, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function HealthAssistantScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou o seu Assistente de Saúde Inteligente. Como posso ajudar hoje?',
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Simulate AI response
        setTimeout(() => {
            let aiResponse = "Estou a processar a sua pergunta. Recomendo que consulte o seu histórico clínico ou agende uma consulta para uma avaliação detalhada.";

            if (inputText.toLowerCase().includes('dor')) {
                aiResponse = "Lamento que sinta dor. Se for uma emergência, por favor dirija-se à clínica mais próxima ou ligue 112. Posso ajudar a agendar uma consulta com um especialista?";
            } else if (inputText.toLowerCase().includes('medicação') || inputText.toLowerCase().includes('remédio')) {
                aiResponse = "Lembre-se de seguir rigorosamente as prescrições do seu médico. Pode visualizar as suas receitas atuais no menu 'Histórico'.";
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.assistantHeader}>
                <Avatar.Icon size={50} icon="robot" style={{ backgroundColor: '#0ea5e9' }} />
                <View style={styles.headerInfo}>
                    <Text variant="titleMedium" style={styles.assistantName}>Antigravity AI</Text>
                    <Text variant="bodySmall" style={styles.status}>Online • Sempre disponível</Text>
                </View>
            </View>

            <ScrollView
                style={styles.chatArea}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map(msg => (
                    <View key={msg.id} style={[
                        styles.messageContainer,
                        msg.sender === 'user' ? styles.userMsg : styles.aiMsg
                    ]}>
                        <View style={[
                            styles.bubble,
                            msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}>
                            <Text style={msg.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText}>
                                {msg.text}
                            </Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    placeholder="Faça uma pergunta..."
                    value={inputText}
                    onChangeText={setInputText}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    right={<TextInput.Icon icon="send" onPress={handleSend} color="#0ea5e9" />}
                    onSubmitEditing={handleSend}
                />
            </View>

            {/* Quick Suggestions */}
            <View style={styles.suggestions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionContent}>
                    <Button mode="outlined" compact style={styles.suggestionBtn} labelStyle={{ fontSize: 10 }}>Dores de Cabeça</Button>
                    <Button mode="outlined" compact style={styles.suggestionBtn} labelStyle={{ fontSize: 10 }}>Minha Próxima Consulta</Button>
                    <Button mode="outlined" compact style={styles.suggestionBtn} labelStyle={{ fontSize: 10 }}>Medicação Diária</Button>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    assistantHeader: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerInfo: {
        marginLeft: 15,
    },
    assistantName: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    status: {
        color: '#22c55e',
    },
    chatArea: {
        flex: 1,
        padding: 20,
    },
    messageContainer: {
        marginBottom: 20,
        maxWidth: '80%',
    },
    userMsg: {
        alignSelf: 'flex-end',
    },
    aiMsg: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#0ea5e9',
        borderBottomRightRadius: 2,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        elevation: 1,
    },
    userBubbleText: {
        color: '#fff',
    },
    aiBubbleText: {
        color: '#1e293b',
    },
    timestamp: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputArea: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    input: {
        backgroundColor: '#fff',
    },
    inputOutline: {
        borderRadius: 25,
    },
    suggestions: {
        backgroundColor: '#fff',
        paddingBottom: 20,
    },
    suggestionContent: {
        paddingHorizontal: 15,
    },
    suggestionBtn: {
        marginRight: 10,
        borderRadius: 20,
    },
});
