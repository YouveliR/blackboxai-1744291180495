class NetworkVisualizer {
    constructor(canvas) {
        console.log('Initializing NetworkVisualizer');
        this.canvas = canvas;
        console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
        
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Failed to get 2D context');
            return;
        }
        console.log('2D context obtained');
        
        // Visualization settings
        this.nodeRadius = 10;
        this.nodeColor = '#4CAF50';
        this.nodeActiveColor = '#2196F3';
        this.nodeBroadcastColor = '#FFC107';
        this.connectionColor = 'rgba(255, 255, 255, 0.3)';
        this.signalRadius = 50;
        
        // Animation settings
        this.signalWaves = new Map(); // Store active signal animations
        
        console.log('NetworkVisualizer initialized with settings:', {
            nodeRadius: this.nodeRadius,
            colors: {
                node: this.nodeColor,
                active: this.nodeActiveColor,
                broadcast: this.nodeBroadcastColor,
                connection: this.connectionColor
            },
            signalRadius: this.signalRadius
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(nodes) {
        console.log(`Drawing network with ${nodes.length} nodes`);
        this.clear();
        console.log('Canvas cleared');
        
        this.drawConnections(nodes);
        console.log('Connections drawn');
        
        this.drawNodes(nodes);
        console.log('Nodes drawn');
        
        this.drawSignalWaves();
        console.log('Signal waves drawn');
        
        this.updateStatistics(nodes);
        console.log('Statistics updated');
    }

    drawNodes(nodes) {
        console.log(`Drawing ${nodes.length} nodes`);
        for (const node of nodes) {
            console.log(`Drawing node ${node.id} at (${node.x}, ${node.y})`);
            
            // Draw node circle
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
            
            // Color based on node state
            if (node.messageQueue.length > 0) {
                this.ctx.fillStyle = this.nodeActiveColor;
                console.log(`Node ${node.id} is active (has messages)`);
            } else if (Date.now() - node.lastBroadcast < 200) {
                this.ctx.fillStyle = this.nodeBroadcastColor;
                console.log(`Node ${node.id} is broadcasting`);
            } else {
                this.ctx.fillStyle = this.nodeColor;
                console.log(`Node ${node.id} is idle`);
            }
            
            this.ctx.fill();
            
            // Draw node border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw node ID
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.id, node.x, node.y);

            // Draw connection count
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(`${node.connectedNodes.size} links`, node.x, node.y + 20);
            
            console.log(`Node ${node.id} has ${node.connectedNodes.size} connections`);
        }
        console.log('Finished drawing all nodes');
    }

    drawConnections(nodes) {
        for (const node of nodes) {
            for (const connectedNode of node.connectedNodes) {
                // Calculate distance and signal strength
                const pixelDistance = node.calculateDistance(connectedNode);
                const distance = node.pixelToMeters(pixelDistance);
                const signalStrength = node.calculateSignalStrength(pixelDistance);
                
                // Normalize signal strength for opacity
                const normalizedStrength = (signalStrength - node.sensitivity) / (node.transmitPower - node.sensitivity);
                const opacity = Math.max(0.1, Math.min(0.8, normalizedStrength));
                
                // Draw connection line
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y);
                this.ctx.lineTo(connectedNode.x, connectedNode.y);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();

                // Calculate text position
                const midX = (node.x + connectedNode.x) / 2;
                const midY = (node.y + connectedNode.y) / 2;
                
                // Draw signal strength above the line
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${Math.round(signalStrength)} dBm`, midX, midY - 8);
                
                // Draw distance below the line
                this.ctx.fillStyle = 'rgba(144, 238, 144, 0.8)'; // Light green color
                this.ctx.fillText(`${Math.round(distance)}m`, midX, midY + 8);
            }
        }
    }

    addSignalWave(node) {
        const wave = {
            x: node.x,
            y: node.y,
            radius: this.nodeRadius,
            maxRadius: this.signalRadius,
            opacity: 0.8,
            timestamp: Date.now()
        };
        
        if (!this.signalWaves.has(node.id)) {
            this.signalWaves.set(node.id, []);
        }
        
        this.signalWaves.get(node.id).push(wave);
    }

    drawSignalWaves() {
        const now = Date.now();
        
        for (const [nodeId, waves] of this.signalWaves) {
            for (let i = waves.length - 1; i >= 0; i--) {
                const wave = waves[i];
                const age = now - wave.timestamp;
                
                // Update wave properties
                wave.radius = this.nodeRadius + (age / 500) * (wave.maxRadius - this.nodeRadius);
                wave.opacity = Math.max(0, 0.8 - (age / 1000));
                
                // Draw wave
                this.ctx.beginPath();
                this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                
                // Remove old waves
                if (wave.opacity <= 0) {
                    waves.splice(i, 1);
                }
            }
            
            // Remove empty wave arrays
            if (waves.length === 0) {
                this.signalWaves.delete(nodeId);
            }
        }
    }

    updateStatistics(nodes) {
        // Count active connections (divide by 2 as each connection is counted twice)
        let totalConnections = 0;
        for (const node of nodes) {
            totalConnections += node.connectedNodes.size;
        }
        totalConnections = Math.floor(totalConnections / 2);

        // Update statistics in UI
        document.getElementById('activeNodes').textContent = nodes.length;
        document.getElementById('activeConnections').textContent = totalConnections;
    }

    // Utility function to check if a point is inside the canvas
    isInBounds(x, y) {
        return x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height;
    }
}

// Export for use in other modules
window.NetworkVisualizer = NetworkVisualizer;
