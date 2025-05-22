import { getLocalStorage } from "@/utils/utilities";

// Define the CobrowseIO interface for TypeScript
interface CobrowseIO {
  customData: Record<string, any>;
  trustedOrigins: string[];
  start: () => void;
}

// Extend Window interface to include CobrowseIO
declare global {
  interface Window {
    CobrowseIO: CobrowseIO;
  }
}

class CobrowseManager {
  private scriptInjected: boolean;
  private device_id: string | null;

  constructor() {
    this.scriptInjected = false;
    this.device_id = null;
  }

  injectScript(origin:string): void {
    const uuid = getLocalStorage('k_clientId') || getLocalStorage('a_clientId');
    
    if (!uuid) {
      console.log("[CoBrowse IFRAME] No device ID found, aborting script injection");
      return;
    }
    
    if(!origin){
        console.log("[CoBrowse IFRAME] No parent origin found, aborting script injection");
        return;
    }

    if (this.scriptInjected && uuid !== this.device_id) {
      console.log("[CoBrowse IFRAME] Script already injected, updating device ID from", this.device_id, "to", uuid);
      window.CobrowseIO.customData = {
        device_id: uuid
      };
      this.device_id = uuid;
      return;
    }

    // Create and load the CobrowseIO script
    const script = document.createElement('script');
    script.id = 'CBChildScript';
    script.src = 'https://js.cobrowse.io/CobrowseIO.js';
    script.async = true;

    // Set up an onload handler to configure CobrowseIO after script loads
    script.onload = (): void => {
      console.log("[CoBrowse IFRAME] Script loaded successfully");
      this.scriptInjected = true;
      this.device_id = uuid;

      try {
        console.log("[CoBrowse IFRAME] Configuring with trusted origin:", origin);
        
        window.CobrowseIO.trustedOrigins = [origin];
        window.CobrowseIO.start();
        console.log("[CoBrowse IFRAME] CoBrowse service started successfully");
      } catch (error) {
        console.error("[CoBrowse IFRAME] Error configuring CobrowseIO:", error);
      }
    };

    script.onerror = (): void => {
      console.error("[CoBrowse IFRAME] Failed to load CobrowseIO script");
      this.scriptInjected = false;
    };

    // Add the script to the document
    document.head.appendChild(script);
  }
}

export const CBManger = new CobrowseManager();