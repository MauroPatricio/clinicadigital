import AgoraRTC from 'agora-rtc-sdk-ng';

class AgoraService {
    constructor() {
        this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        this.localAudioTrack = null;
        this.localVideoTrack = null;
        this.remoteUsers = {};
    }

    async join(appId, channel, token, uid = null) {
        // Add event listeners
        this.client.on('user-published', this.handleUserPublished.bind(this));
        this.client.on('user-unpublished', this.handleUserUnpublished.bind(this));

        // Join the channel
        await this.client.join(appId, channel, token, uid);

        // Create local tracks
        [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        // Publish local tracks
        await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

        return {
            uid: this.client.uid,
            localVideoTrack: this.localVideoTrack,
            localAudioTrack: this.localAudioTrack
        };
    }

    async handleUserPublished(user, mediaType) {
        await this.client.subscribe(user, mediaType);
        if (mediaType === 'video') {
            this.remoteUsers[user.uid] = user;
            if (this.onRemoteUserJoined) {
                this.onRemoteUserJoined(user);
            }
        }
        if (mediaType === 'audio') {
            user.audioTrack.play();
        }
    }

    handleUserUnpublished(user) {
        delete this.remoteUsers[user.uid];
        if (this.onRemoteUserLeft) {
            this.onRemoteUserLeft(user);
        }
    }

    async leave() {
        if (this.localAudioTrack) {
            this.localAudioTrack.stop();
            this.localAudioTrack.close();
        }
        if (this.localVideoTrack) {
            this.localVideoTrack.stop();
            this.localVideoTrack.close();
        }
        await this.client.leave();
        this.remoteUsers = {};
    }

    async toggleVideo(enabled) {
        if (this.localVideoTrack) {
            await this.localVideoTrack.setEnabled(enabled);
        }
    }

    async toggleAudio(enabled) {
        if (this.localAudioTrack) {
            await this.localAudioTrack.setEnabled(enabled);
        }
    }

    // Set callbacks
    setCallbacks(onJoined, onLeft) {
        this.onRemoteUserJoined = onJoined;
        this.onRemoteUserLeft = onLeft;
    }
}

const agoraService = new AgoraService();
export default agoraService;
