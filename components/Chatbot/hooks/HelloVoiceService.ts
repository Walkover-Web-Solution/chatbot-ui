// HelloVoiceService.ts
import WebRTC from "msg91-webrtc-call";
import { EventEmitter } from "events";

class HelloVoiceService {
    private static instance: HelloVoiceService | null = null;
    private webrtc: any = null;
    private eventEmitter: EventEmitter;
    private currentCall: any = null;
    private callState: string = "idle"; // idle, ringing, connected, ended
    private isMuted: boolean = false;

    private constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public static getInstance(): HelloVoiceService {
        if (!HelloVoiceService.instance) {
            HelloVoiceService.instance = new HelloVoiceService();
        }
        return HelloVoiceService.instance;
    }

    public initialize(): void {
        // Only initialize if not already done
        if (this.webrtc) return;

        const clientToken = localStorage.getItem('HelloClientToken');
        if (!clientToken) return;

        this.webrtc = WebRTC(clientToken);

        this.webrtc.on("call", this.handleOutgoingCall);
    }

    private handleOutgoingCall = (call: any) => {
        if (call.type !== "outgoing-call") return;
        this.currentCall = call;
        this.callState = "ringing";
        this.eventEmitter.emit("callStateChanged", { state: this.callState });

        // Set up event listeners for this call
        call.on("answered", (data: any) => {
            this.callState = "connected";
            this.eventEmitter.emit("callStateChanged", { state: this.callState, data });
        });

        call.on("connected", (mediaStream: any) => {
            this.callState = "connected";
            this.eventEmitter.emit("callStateChanged", {
                state: this.callState,
                mediaStream
            });
        });

        call.on("ended", (data: any) => {
            this.callState = "idle";
            this.eventEmitter.emit("callStateChanged", { state: this.callState, data });
            this.currentCall = null;
        });

        call.on("mute", ({ uid }: { uid: string }) => {
            this.isMuted = true;
            this.eventEmitter.emit("muteStatusChanged", { muted: true, uid });
        });

        call.on("unmute", ({ uid }: { uid: string }) => {
            this.isMuted = false;
            this.eventEmitter.emit("muteStatusChanged", { muted: false, uid });
        });
    }

    public initiateCall(): void {
        if (!this.webrtc) {
            console.warn("WebRTC not initialized. Call initialize() first.");
            return;
        }

        const callToken = localStorage.getItem('HelloCallToken');
        if (!callToken) {
            console.warn("No call token found in localStorage.");
            return;
        }

        this.webrtc.call(callToken);
        this.callState = "ringing";
        this.eventEmitter.emit("callStateChanged", { state: this.callState });
    }

    public answerCall(): void {
        if (this.currentCall && this.callState === "ringing") {
            this.currentCall.accept();
        }
    }

    public endCall(): void {
        if (this.currentCall) {
            this.currentCall.hang();
        }
    }

    public toggleMute(): void {
        if (!this.currentCall) return;

        if (this.isMuted) {
            this.currentCall.unmute();
        } else {
            this.currentCall.mute();
        }
    }

    public getCallState(): string {
        return this.callState;
    }

    public getMuteStatus(): boolean {
        return this.isMuted;
    }

    public getMediaStream(): any {
        return this.currentCall ? this.currentCall.getMedia() : null;
    }

    public addEventListener(event: string, callback: (...args: any[]) => void): void {
        this.eventEmitter.on(event, callback);
    }

    public removeEventListener(event: string, callback: (...args: any[]) => void): void {
        this.eventEmitter.off(event, callback);
    }

    public isInitialized(): boolean {
        return !!this.webrtc;
    }

    public cleanUp(): void {
        if (this.webrtc && typeof this.webrtc.off === 'function') {
            this.webrtc.off("call");
            this.webrtc = null;
        }
        this.eventEmitter.removeAllListeners();
    }
}

const helloVoiceService = HelloVoiceService.getInstance();
export default helloVoiceService;