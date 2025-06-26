import io from "socket.io-client";

const urlParams = new URLSearchParams(window.location.search);
const env = urlParams.get('env');

const socketUrl = env !== 'stage' ? process.env.NEXT_PUBLIC_NOTIFICATOIN_SOCKET_URL : 'https://notifications.phone91.com';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.channels = [];
    this.listeners = new Map();
    this.connectionCallbacks = [];
    this.connecting = false;
  }

  /**
   * Initialize socket connection with authentication
   * @param {string} jwtToken - JWT token for authentication
   * @returns {SocketManager} - Instance for chaining
   */
  connect(jwtToken) {
    if (!jwtToken) {
      console.error("JWT token is required to establish socket connection");
      return this;
    }

    // If already connected or connecting, don't reconnect
    if (this.isConnected || this.connecting) {
      return this;
    }

    this.connecting = true;

    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(socketUrl, {
      auth: { token: jwtToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 20000,
      autoConnect: true,
    });

    this._setupBaseListeners();
    return this;
  }

  /**
   * Set up base event listeners for the socket
   * @private
   */
  _setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.isConnected = true;
      this.connecting = false;

      // Re-subscribe to all channels on reconnection
      if (this.channels.length > 0) {
        this.subscribe(this.channels);
      }

      // Execute any pending connection callbacks
      this.connectionCallbacks?.forEach(callback => callback());
      this.connectionCallbacks = [];
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (err) => {
      console.error("Connection Error:", err);
      this.isConnected = false;
      this.connecting = false;
    });
  }

  /**
   * Subscribe to channel or channels, waiting for connection if needed
   * @param {string|string[]} channels - Channel(s) to subscribe to
   * @returns {Promise<any>} - Response from server
   */
  subscribe(channels) {
    // If not connected, queue a callback to run when connected
    if (!this.isConnected) {
      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error("Socket instance does not exist"));
          return;
        }

        // Add to connection callback queue if we're still connecting
        this.connectionCallbacks.push(() => {
          this._doSubscribe(channels)
            .then(resolve)
            .catch(reject);
        });
      });
    }

    // If already connected, subscribe immediately
    return this._doSubscribe(channels);
  }

  /**
   * Internal method to perform subscription after connection is established
   * @private
   * @param {string|string[]} channels - Channel(s) to subscribe to
   * @returns {Promise<any>} - Response from server
   */
  _doSubscribe(channels) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      // Convert single channel to array if needed
      const channelArray = Array.isArray(channels) ? channels : [channels];

      // Filter out duplicates and empty channels
      const uniqueChannels = channelArray.filter(channel =>
        channel && !this.channels.includes(channel)
      );

      if (uniqueChannels.length === 0) {
        resolve({ message: "No new channels to subscribe" });
        return;
      }

      // Add new channels to the tracking array
      // this.channels.push(...uniqueChannels);

      this.socket.emit("subscribe", { channel: uniqueChannels }, (data) => {
        console.log("Subscribed channels data:", data);
        resolve(data);
      });
    });
  }

  /**
   * Check if socket is connected
   * @returns {boolean} - Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Wait for socket to connect
   * @returns {Promise<void>} - Resolves when connected
   */
  waitForConnection() {
    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve();
      } else {
        this.connectionCallbacks.push(() => resolve());
      }
    });
  }

  /**
   * Unsubscribe from channel or channels
   * @param {string|string[]} channels - Channel(s) to unsubscribe from
   * @returns {Promise<any>} - Response from server
   */
  unsubscribe(channels) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket is not connected"));
        return;
      }

      const channelArray = Array.isArray(channels) ? channels : [channels];

      // Remove channels from tracking array
      this.channels = this.channels.filter(ch => !channelArray.includes(ch));

      this.socket.emit("unsubscribe", { channel: channelArray }, (data) => {
        console.log("Unsubscribed channels data:", data);
        resolve(data);
      });
    });
  }

  /**
   * Generic function to emit events
   * @param {string} eventName - Name of the event
   * @param {any} data - Data to send with the event
   * @param {Function} callback - Optional callback function
   * @returns {Promise<any>} - Response from server if no callback provided
   */
  emitEvent(eventName, data, callback) {
    // If not connected, wait for connection
    if (!this.isConnected) {
      return new Promise((resolve, reject) => {
        this.connectionCallbacks.push(() => {
          this._doEmitEvent(eventName, data, callback)
            .then(resolve)
            .catch(reject);
        });
      });
    }

    return this._doEmitEvent(eventName, data, callback);
  }

  /**
   * Internal method to emit events after connection is established
   * @private
   */
  _doEmitEvent(eventName, data, callback) {
    if (!this.socket || !this.isConnected) {
      return Promise.reject(new Error("Socket is not connected"));
    }

    if (typeof callback === 'function') {
      this.socket.emit(eventName, data, callback);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.socket.emit(eventName, data, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Add event listener
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {SocketManager} - Instance for chaining
   */
  on(eventName, callback) {
    if (!this.socket) return this;

    this.socket.on(eventName, callback);

    // Track listeners for cleanup
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);

    return this;
  }

  /**
   * Remove specific event listener
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function to remove
   * @returns {SocketManager} - Instance for chaining
   */
  off(eventName, callback) {
    if (!this.socket) return this;

    this.socket.off(eventName, callback);

    // Remove from tracked listeners
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      this.listeners.set(
        eventName,
        callbacks.filter(cb => cb !== callback)
      );
    }

    return this;
  }

  /**
   * Remove all listeners for an event
   * @param {string} eventName - Name of the event
   * @returns {SocketManager} - Instance for chaining
   */
  removeAllListeners(eventName) {
    if (!this.socket) return this;

    this.socket.removeAllListeners(eventName);

    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }

    return this;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connecting = false;
      this.channels = [];
      this.connectionCallbacks = [];
    }
  }

  /**
   * Get subscribed channels
   * @returns {string[]} - Array of subscribed channels
   */
  getSubscribedChannels() {
    return [...this.channels];
  }
}

// Export singleton instance
const socketManager = new SocketManager();
export default socketManager;