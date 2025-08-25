// HelloVoiceService.ts
import { errorToast } from "@/components/customToast";
import { getLocalStorage } from "@/utils/utilities";
import { EventEmitter } from "events";
import WebRTC from "msg91-webrtc-call";

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
        // if (this.webrtc) return;
        if (this.webrtc) this.webrtc.close(); this.cleanUp();

        const clientToken = getLocalStorage('HelloClientToken');
        if (!clientToken) return;

        this.webrtc = WebRTC(clientToken, 'dev');

        this.webrtc.on("call", this.handleOutgoingCall);
    }

    private handleOutgoingCall = (call: any) => {
        if (call.type === "incoming-call") return;

        const isBotCall = call.type === "bot-call";
        console.log('visibility changed', document.visibilityState)
        if (this.currentCall && isBotCall) {
            console.log('existing call ended, hanging call')
            this.endCall();
            this.resetCall();
        }

        if (document.visibilityState === "hidden" && isBotCall) {
            console.log('Not in focus end call ending call')
            call.on("answered", (data: any) => {
                console.log('answered while hidden, hanging call')
                call.hang();
                this.resetCall();
            });
            return;
        }
        // Only persist the call if this tab is currently active
        this.currentCall = call;
        this.callState = "ringing";
        this.eventEmitter.emit("callStateChanged", { state: this.callState });

        call.on("error", (error: any) => {
            console.log("call error", error);
            errorToast(error?.message || "Something went wrong");
            this.callState = "idle";
            this.isMuted = false;
            this.eventEmitter.emit("callStateChanged", { state: this.callState });
            this.eventEmitter.emit("muteStatusChanged", { muted: false });
            this.currentCall = null;
        });
        // Set up event listeners for this call
        call.on("answered", (data: any) => {
            console.log('call answered', data);
            this.callState = "connected";
            this.eventEmitter.emit("callStateChanged", { state: this.callState, data });
        });

        call.on("connected", (mediaStream: any) => {
            console.log('call connected');
            this.callState = "connected";
            this.eventEmitter.emit("callStateChanged", {
                state: this.callState,
                mediaStream
            });
        });

        call.on("ended", (data: any) => {
            console.log('call ended', data);
            this.resetCall();
        });

        call.on("mute", ({ uid }: { uid: string }) => {
            console.log('call mute', uid);
            this.isMuted = true;
            this.eventEmitter.emit("muteStatusChanged", { muted: true, uid });
        });

        call.on("unmute", ({ uid }: { uid: string }) => {
            console.log('call unmute', uid);
            this.isMuted = false;
            this.eventEmitter.emit("muteStatusChanged", { muted: false, uid });
        });

        call.on("rejoined", (data: any) => {
            console.log('call rejoin', data)
            const summary = data?.summary;
            this.callState = "rejoined";
            this.eventEmitter.emit("callStateChanged", { state: this.callState, data });
        });
    }

    public initiateCall(channelCallToken?: string): void {
        if (!this.webrtc) {
            console.warn("WebRTC not initialized. Call initialize() first.");
            return;
        }
        const callToken = channelCallToken || getLocalStorage('HelloCallToken');
        if (!callToken) {
            console.warn("No call token found in localStorage.");
            return;
        }

        this.webrtc.call(callToken);
        this.callState = "ringing";
        this.eventEmitter.emit("callStateChanged", { state: this.callState });
    }

    public rejoinCall(callId: string): void {
        if (!this.webrtc) {
            console.warn("WebRTC not initialized. Call initialize() first.");
            return;
        }
        this.callState = "ringing";
        this.eventEmitter.emit("callStateChanged", { state: this.callState });

        this.webrtc.rejoinCall(callId).catch((error: any) => {
            console.log('rejoin call error', error)
            this.resetCall();
        });
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

    public resetCall(): void {
        this.callState = "idle";
        this.isMuted = false;
        this.eventEmitter.emit("callStateChanged", { state: this.callState });
        this.eventEmitter.emit("muteStatusChanged", { muted: false });
        this.currentCall = null;
    }

    public cleanUp(): void {
        if (this.webrtc) {
            // this.webrtc.off("call");
            this.webrtc = null;
        }
        // this.eventEmitter.removeAllListeners();
    }
}

const helloVoiceService = HelloVoiceService.getInstance();
export default helloVoiceService;