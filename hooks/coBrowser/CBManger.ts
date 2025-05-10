import { getLocalStorage } from "@/utils/utilities";

class CobrowseManager {
    constructor() {
        this.scriptInjected = false
        this.device_id = null
    }

    injectScript(uuid) {
        console.log(uuid, "-0-0-0-0-0-0-0-000-0-0-");
        if (!uuid) return;
        
        // Create and load the CobrowseIO script
        const script = document.createElement('script');
        script.id = 'CBChildScript';
        script.src = 'https://js.cobrowse.io/CobrowseIO.js';
        script.async = true;
            
        // Set up an onload handler to configure CobrowseIO after script loads
        script.onload = function() {
            console.log("CobrowseIO script loaded successfully");
            
            try {
                // Now manually configure CobrowseIO
                window.CobrowseIO.customData = {
                    device_id: uuid
                };

                window.CobrowseIO.trustedOrigins = [getLocalStorage('origin')]
                // Start CobrowseIO
                window.CobrowseIO.client().then(function() {
                    window.CobrowseIO.start();
                }).catch(function(err) {
                    console.error("CobrowseIO client initialization error:", err);
                });
            } catch (error) {
                console.error("Error configuring CobrowseIO:", error);
            }
        };
        
        script.onerror = function() {
            console.error("Failed to load CobrowseIO script");
        };
        
        // Add the script to the document
        document.head.appendChild(script);
        console.log("CobrowseIO script tag added to IFRAME");
    }

    updateDeviceId(uuid) {
        console.log(uuid,"-=0-0-0-00")
        if (this.device_id !== uuid && this.scriptInjected) {
            window.CobrowseIO.customData = {
                device_id : uuid
            }
        }
        this.device_id = uuid
        if (!this.scriptInjected) {
            this.injectScript(uuid)
        }
    }

}

export const CBManger = new CobrowseManager()