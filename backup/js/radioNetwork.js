class RadioNode {
    constructor(id, x, y) {
        // Basic properties
        this.id = id;
        this.x = x;
        this.y = y;
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        
        // Radio parameters
        this.frequency = 868.7; // MHz
        this.transmitPower = 14; // dBm (25mW)
        this.sensitivity = -110; // dBm
        
        // Network properties
        this.messageQueue = [];
        this.processedMessages = new Set();
        this.connectedNodes = new Set();
        this.routingTable = new Map();
        
        // Status
        this.active = true;
        this.lastBroadcast = Date.now();
        this.broadcastInterval = 1000; // 1 second
    }

    update(canvasWidth, canvasHeight, allNodes, deltaTime) {
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        // Bounce off canvas boundaries
        if (this.x <= 20 || this.x >= canvasWidth - 20) {
            this.velocity.x *= -1;
            this.x = Math.max(20, Math.min(canvasWidth - 20, this.x));
        }
        if (this.y <= 20 || this.y >= canvasHeight - 20) {
            this.velocity.y *= -1;
            this.y = Math.max(20, Math.min(canvasHeight - 20, this.y));
        }

        // Update connections
        this.updateConnections(allNodes);

        // Process message queue
        this.processMessageQueue();

        // Periodic broadcast
        if (Date.now() - this.lastBroadcast > this.broadcastInterval) {
            this.broadcast();
            this.lastBroadcast = Date.now();
        }
    }

    updateConnections(allNodes) {
        this.connectedNodes.clear();
        for (const node of allNodes) {
            if (node !== this && this.canCommunicateWith(node)) {
                this.connectedNodes.add(node);
            }
        }
        this.updateRoutingTable();
    }

    canCommunicateWith(otherNode) {
        const pixelDistance = this.calculateDistance(otherNode);
        // Get the real-world distance
        const realDistance = window.NetworkVisualizer.prototype.pixelToRealDistance(pixelDistance);
        
        // Only allow connections within 1km range
        if (realDistance > 1000) {
            return false;
        }
        
        const signalStrength = this.calculateSignalStrength(pixelDistance);
        return signalStrength >= this.sensitivity;
    }

    calculateDistance(otherNode) {
        const dx = this.x - otherNode.x;
        const dy = this.y - otherNode.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    calculateSignalStrength(pixelDistance) {
        // Convert pixel distance to real distance (in meters)
        const realDistance = window.NetworkVisualizer.prototype.pixelToRealDistance(pixelDistance);
        
        // Free space path loss formula
        // FSPL (dB) = 20log10(d) + 20log10(f) + 32.44
        // where d is distance in kilometers and f is frequency in MHz
        const distanceKm = realDistance / 1000;
        const pathLoss = 20 * Math.log10(distanceKm) + 20 * Math.log10(this.frequency) + 32.44;
        return this.transmitPower - pathLoss;
    }

    receiveMessage(message, sourceNode) {
        if (this.processedMessages.has(message.id)) {
            return;
        }

        this.processedMessages.add(message.id);
        Logger.log(`Node ${this.id} received message ${message.id} from Node ${sourceNode.id}`);

        if (message.destination === this.id) {
            Logger.log(`Node ${this.id} processed message ${message.id}`);
            return;
        }

        // Add to repeat queue
        this.messageQueue.push({
            message: message,
            source: sourceNode,
            timestamp: Date.now()
        });
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { message, source } = this.messageQueue.shift();
            
            // Repeat to all connected nodes except source
            for (const node of this.connectedNodes) {
                if (node !== source) {
                    node.receiveMessage(message, this);
                }
            }
        }
    }

    broadcast() {
        const message = {
            id: `${this.id}-${Date.now()}`,
            type: 'broadcast',
            source: this.id,
            timestamp: Date.now()
        };

        Logger.log(`Node ${this.id} broadcasting`);
        
        for (const node of this.connectedNodes) {
            node.receiveMessage(message, this);
        }
    }

    updateRoutingTable() {
        this.routingTable.clear();
        
        // Direct connections (1 hop)
        for (const node of this.connectedNodes) {
            this.routingTable.set(node.id, {
                nextHop: node,
                distance: 1
            });
        }
    }
}

// Logger utility for simulation events
const Logger = {
    logs: [],
    maxLogs: 100,

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        this.logs.push(logMessage);
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Update UI
        const logPanel = document.getElementById('logPanel');
        if (logPanel) {
            logPanel.innerHTML = this.logs.join('<br>');
            logPanel.scrollTop = logPanel.scrollHeight;
        }
    }
};

// Export for use in other modules
window.RadioNode = RadioNode;
window.Logger = Logger;
