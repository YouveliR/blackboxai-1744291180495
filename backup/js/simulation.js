class NetworkSimulation {
    constructor() {
        console.log('NetworkSimulation constructor started');
        
        // Get canvas and initialize visualizer
        this.canvas = document.getElementById('networkCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        console.log('Canvas element found');
        
        this.resizeCanvas();
        this.visualizer = new NetworkVisualizer(this.canvas);
        console.log('Visualizer initialized');
        
        // Simulation state
        this.nodes = [];
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.messageCount = 0;
        
        // Get control elements
        const nodeCountElement = document.getElementById('nodeCount');
        const simSpeedElement = document.getElementById('simSpeed');
        
        if (!nodeCountElement || !simSpeedElement) {
            throw new Error('Control elements not found');
        }
        
        // Simulation parameters
        this.nodeCount = parseInt(nodeCountElement.value);
        this.simulationSpeed = parseInt(simSpeedElement.value);
        console.log(`Initial parameters: ${this.nodeCount} nodes, speed ${this.simulationSpeed}`);
        
        // Initialize controls
        try {
            this.controls = new SimulationControls(this);
            console.log('Controls initialized');
        } catch (error) {
            console.error('Failed to initialize controls:', error);
            throw error;
        }
        
        // Create initial nodes
        this.initializeNodes();
        console.log('Initial nodes created');
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 32; // Adjust for padding
        this.canvas.height = 600;
    }

    initializeNodes() {
        this.nodes = [];
        for (let i = 0; i < this.nodeCount; i++) {
            const x = Math.random() * (this.canvas.width - 40) + 20;
            const y = Math.random() * (this.canvas.height - 40) + 20;
            this.nodes.push(new RadioNode(i + 1, x, y));
        }
        Logger.log(`Initialized ${this.nodeCount} nodes`);
    }

    start() {
        console.log('Start method called');
        if (!this.isRunning) {
            console.log('Simulation was not running, starting now');
            console.log(`Current state: ${this.nodes.length} nodes, speed: ${this.simulationSpeed}`);
            
            // Draw initial state before starting animation
            console.log('Drawing initial state');
            this.visualizer.draw(this.nodes);
            
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            console.log('Starting animation loop');
            requestAnimationFrame(timestamp => {
                console.log('First animation frame requested');
                this.simulationLoop(timestamp);
            });
            Logger.log('Simulation started');
        } else {
            console.log('Simulation was already running');
        }
    }

    pause() {
        this.isRunning = false;
        Logger.log('Simulation paused');
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(timestamp => this.simulationLoop(timestamp));
            Logger.log('Simulation resumed');
        }
    }

    reset() {
        this.isRunning = false;
        this.messageCount = 0;
        this.controls.updateMessageCount(this.messageCount);
        this.initializeNodes();
        this.visualizer.clear();
        Logger.log('Simulation reset');
    }

    simulationLoop(timestamp) {
        console.log('Simulation loop called');
        
        if (!this.isRunning) {
            console.log('Simulation is not running, exiting loop');
            return;
        }

        // Calculate delta time and apply simulation speed
        const deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
        const adjustedDelta = deltaTime * this.simulationSpeed;
        console.log(`Delta time: ${deltaTime.toFixed(3)}s, Adjusted: ${adjustedDelta.toFixed(3)}s`);
        
        try {
            console.log('Updating nodes...');
            // Update all nodes
            for (const node of this.nodes) {
                node.update(this.canvas.width, this.canvas.height, this.nodes, adjustedDelta);
            }

            // Count messages processed this frame
            let newMessages = 0;
            for (const node of this.nodes) {
                newMessages += node.processedMessages.size;
            }
            
            // Update message count if changed
            if (newMessages !== this.messageCount) {
                this.messageCount = newMessages;
                this.controls.updateMessageCount(this.messageCount);
                console.log(`Message count updated: ${this.messageCount}`);
            }

            // Render current state
            console.log('Rendering frame...');
            this.visualizer.draw(this.nodes);

            // Schedule next frame
            this.lastFrameTime = timestamp;
            requestAnimationFrame(timestamp => this.simulationLoop(timestamp));
            console.log('Next frame scheduled');
            
        } catch (error) {
            console.error('Simulation error:', error);
            Logger.log(`Error: ${error.message}`);
            this.pause();
            this.controls.updateControlState('paused');
        }
    }

    setNodeCount(count) {
        this.nodeCount = count;
        if (!this.isRunning) {
            this.initializeNodes();
            this.visualizer.draw(this.nodes);
        }
    }

    setSimulationSpeed(speed) {
        this.simulationSpeed = speed;
        Logger.log(`Simulation speed set to ${speed}`);
    }

    handleResize() {
        this.resizeCanvas();
        if (!this.isRunning) {
            this.visualizer.draw(this.nodes);
        }
    }
}

// Initialize simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM Content Loaded - Initializing simulation');
        // Ensure all required DOM elements exist
        const canvas = document.getElementById('networkCanvas');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const nodeCount = document.getElementById('nodeCount');
        const simSpeed = document.getElementById('simSpeed');
        
        if (!canvas || !startBtn || !pauseBtn || !resetBtn || !nodeCount || !simSpeed) {
            throw new Error('Required DOM elements not found');
        }

        // Add click debug listener
        document.addEventListener('click', (event) => {
            const x = event.clientX;
            const y = event.clientY;
            console.log(`Click detected at: (${x}, ${y})`);
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                const rect = startBtn.getBoundingClientRect();
                // Get button position relative to viewport
                const viewportBounds = {
                    left: Math.round(rect.left),
                    top: Math.round(rect.top),
                    right: Math.round(rect.right),
                    bottom: Math.round(rect.bottom),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                };
                viewportBounds.centerX = Math.round(viewportBounds.left + viewportBounds.width / 2);
                viewportBounds.centerY = Math.round(viewportBounds.top + viewportBounds.height / 2);
                
                console.log('Start button viewport bounds:', viewportBounds);
                console.log(`To click the button center, use coordinates: (${viewportBounds.centerX}, ${viewportBounds.centerY})`);
                
                // Log all coordinates for debugging
                console.log('Click coordinates:', {
                    client: { x, y },
                    viewport: { x: x - window.scrollX, y: y - window.scrollY },
                    button: {
                        left: Math.round(rect.left),
                        top: Math.round(rect.top),
                        right: Math.round(rect.right),
                        bottom: Math.round(rect.bottom),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        centerX: Math.round(rect.left + rect.width/2),
                        centerY: Math.round(rect.top + rect.height/2)
                    }
                });

                // Check if click was inside button using viewport-relative coordinates
                const clickX = x - window.scrollX;
                const clickY = y - window.scrollY;
                
                if (clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom) {
                    console.log('✅ Click was INSIDE the start button!');
                    console.log('Button clicked at relative position:', {
                        x: Math.round(clickX - rect.left),
                        y: Math.round(clickY - rect.top)
                    });
                } else {
                    console.log('❌ Click was OUTSIDE the start button');
                    const centerX = rect.left + rect.width/2;
                    const centerY = rect.top + rect.height/2;
                    console.log(`Try clicking at (${Math.round(centerX)}, ${Math.round(centerY)})`);
                }
            }
        });

        window.simulation = new NetworkSimulation();
        console.log('Simulation object created');
        Logger.log('Simulation initialized and ready');
    } catch (error) {
        console.error('Failed to initialize simulation:', error);
        Logger.log(`Initialization error: ${error.message}`);
    }
});
