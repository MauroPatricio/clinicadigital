import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Avatar, TextInput, IconButton, Card, Button, List } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'clinic';
    timestamp: Date;
    type: 'text' | 'document' | 'image';
    fileName?: string;
}

export default function SecureChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Olá! Como podemos ajudar hoje? Estamos aqui para tirar as suas dúvidas.',
            sender: 'clinic',
            timestamp: new Date(Date.now() - 3600000),
            type: 'text',
        }
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
            type: 'text',
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Simulation of clinic response
        setTimeout(() => {
            const clinicMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Recebemos a sua mensagem. Um dos nossos assistentes irá responder em breve. Obrigado pela paciência.',
                sender: 'clinic',
                timestamp: new Date(),
                type: 'text',
            };
            setMessages(prev => [...prev, clinicMsg]);
        }, 3000);
    };

    const handleFileUpload = () => {
        // Simulation
        const docMsg: ChatMessage = {
            id: Date.now().toString(),
            text: 'Documento enviado',
            sender: 'user',
            timestamp: new Date(),
            type: 'document',
            fileName: 'exame_anterior.pdf'
        };
        setMessages(prev => [...prev, docMsg]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text variant="titleMedium" style={styles.clinicTitle}>Recepção - Clínica Central</Text>
                    <Text variant="bodySmall" style={styles.status}>Tempo médio de resposta: 15 min</Text>
                </View>
                <IconButton icon="phone-outline" onPress={() => console.log('Call Clinic')} />
            </View>

            <ScrollView style={styles.chatArea}>
                {messages.map(msg => (
                    <View key={msg.id} style={[
                        styles.messageWrapper,
                        msg.sender === 'user' ? styles.userWrapper : styles.clinicWrapper
                    ]}>
                        <View style={[
                            styles.bubble,
                            msg.sender === 'user' ? styles.userBubble : styles.clinicBubble
                        ]}>
                            {msg.type === 'document' ? (
                                <View style={styles.docRow}>
                                    <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.docName}>{msg.fileName}</Text>
                                        <Text style={styles.docSize}>1.2 MB</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={msg.sender === 'user' ? styles.userText : styles.clinicText}>
                                    {msg.text}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.timestamp}>
                            {format(msg.timestamp, "HH:mm")}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputBar}>
                <IconButton icon="plus" onPress={handleFileUpload} />
                <TextInput
                    placeholder="Escreva uma mensagem..."
                    value={inputText}
                    onChangeText={setInputText}
                    mode="flat"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                />
                <IconButton
                    icon="send"
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    iconColor={inputText.trim() ? '#0ea5e9' : '#94a3b8'}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const format = (date: Date, fmt: string) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerInfo: {
        flex: 1,
    },
    clinicTitle: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    status: {
        color: '#64748b',
        fontSize: 11,
    },
    chatArea: {
        flex: 1,
        padding: 20,
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
    },
    clinicWrapper: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 12,
        borderRadius: 15,
    },
    userBubble: {
        backgroundColor: '#e0f2fe',
        borderBottomRightRadius: 2,
    },
    clinicBubble: {
        backgroundColor: '#f1f5f9',
        borderBottomLeftRadius: 2,
    },
    userText: {
        color: '#0369a1',
    },
    clinicText: {
        color: '#1e293b',
    },
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 10,
    },
    docName: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    docSize: {
        fontSize: 10,
        color: '#64748b',
    },
    timestamp: {
        fontSize: 9,
        color: '#94a3b8',
        marginTop: 2,
        textAlign: 'right',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 14,
    },
});
