import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { createAgoraRtcEngine, RtcSurfaceView, ChannelProfileType, ClientRoleType } from 'react-native-agora';

interface VideoCallScreenProps {
    route: any;
    navigation: any;
}

export default function VideoCallScreen({ route, navigation }: VideoCallScreenProps) {
    const { appointmentId, channelName, token } = route.params;
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [remoteUid, setRemoteUid] = useState<number | null>(null);

    const agoraEngineRef = useRef<any>(null);

    useEffect(() => {
        setupVideoSDKEngine();
        return () => {
            leave();
        };
    }, []);

    const setupVideoSDKEngine = async () => {
        try {
            // Note: Replace with your Agora App ID
            const APP_ID = 'YOUR_AGORA_APP_ID';

            // Create Agora engine instance
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;

            // Register event handlers
            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    console.log('Successfully joined channel');
                    setIsJoined(true);
                },
                onUserJoined: (_connection: any, uid: number) => {
                    console.log('Remote user joined:', uid);
                    setRemoteUid(uid);
                },
                onUserOffline: (_connection: any, uid: number) => {
                    console.log('Remote user left:', uid);
                    setRemoteUid(null);
                },
            });

            // Initialize engine
            agoraEngine.initialize({
                appId: APP_ID,
            });

            // Enable video
            agoraEngine.enableVideo();

            // Join channel
            await agoraEngine.joinChannel(token, channelName, 0, {
                clientRoleType: 1, // Broadcaster
            });
        } catch (error) {
            console.error('Error setting up video SDK:', error);
        }
    };

    const leave = async () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            setIsJoined(false);
            setRemoteUid(null);
        } catch (error) {
            console.error('Error leaving channel:', error);
        }
    };

    const toggleMute = () => {
        const newMuteState = !isMuted;
        agoraEngineRef.current?.muteLocalAudioStream(newMuteState);
        setIsMuted(newMuteState);
    };

    const toggleVideo = () => {
        const newVideoState = !isVideoEnabled;
        agoraEngineRef.current?.muteLocalVideoStream(!newVideoState);
        setIsVideoEnabled(newVideoState);
    };

    const handleEndCall = async () => {
        await leave();
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {!isJoined ? (
                <View style={styles.loadingContainer}>
                    <Text variant="titleLarge">Connecting to video call...</Text>
                </View>
            ) : (
                <>
                    {/* Remote video */}
                    <View style={styles.remoteVideo}>
                        {remoteUid ? (
                            <RtcSurfaceView
                                canvas={{ uid: remoteUid }}
                                style={styles.videoPlaceholder}
                            />
                        ) : (
                            <View style={styles.waitingContainer}>
                                <Text variant="titleMedium" style={{ color: '#fff' }}>
                                    Waiting for doctor to join...
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Local video preview */}
                    <View style={styles.localVideo}>
                        <RtcSurfaceView
                            canvas={{ uid: 0 }}
                            style={styles.localVideoPlaceholder}
                            zOrderMediaOverlay={true}
                        />
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <IconButton
                            icon={isMuted ? 'microphone-off' : 'microphone'}
                            size={30}
                            iconColor="#fff"
                            containerColor={isMuted ? '#ef4444' : '#6b7280'}
                            onPress={toggleMute}
                        />
                        <IconButton
                            icon="phone-hangup"
                            size={30}
                            iconColor="#fff"
                            containerColor="#ef4444"
                            onPress={handleEndCall}
                        />
                        <IconButton
                            icon={isVideoEnabled ? 'video' : 'video-off'}
                            size={30}
                            iconColor="#fff"
                            containerColor={isVideoEnabled ? '#6b7280' : '#ef4444'}
                            onPress={toggleVideo}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1f2937',
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#1f2937',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#374151',
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    localVideo: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 120,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
    },
    localVideoPlaceholder: {
        flex: 1,
        backgroundColor: '#4b5563',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
});
