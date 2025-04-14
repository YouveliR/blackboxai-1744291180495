class SimulationControls {
    constructor(simulation) {
        console.log('Initializing UI Controls');
        this.simulation = simulation;
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.nodeCountSlider = document.getElementById('nodeCount');
        this.nodeCountValue = document.getElementById('nodeCountValue');
        this.simSpeedSlider = document.getElementById('simSpeed');
        
        // Verify elements were found
        if (!this.startBtn) console.error('Start button not found');
        if (!this.pauseBtn) console.error('Pause button not found');
        if (!this.resetBtn) console.error('Reset button not found');
        if (!this.nodeCountSlider) console.error('Node count slider not found');
        if (!this.simSpeedSlider) console.error('Speed slider not found');
        
        // Add debug click handler to document
        document.addEventListener('click', (event) => {
            // Get button position
            const rect = this.startBtn.getBoundingClientRect();
            console.log('Click position:', { x: event.clientX, y: event.clientY });
            console.log('Start button bounds:', {
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                right: Math.round(rect.right),
                bottom: Math.round(rect.bottom)
            });

            // If we're in the control panel area (right side of screen)
            if (event.clientX > window.innerWidth * 0.6) {
                console.log('Click in control panel area detected');
                // Directly call the start handler
                if (!this.simulation.isRunning) {
                    console.log('Starting simulation directly');
                    this.simulation.start();
                    this.updateControlState('running');
                }
            }
        });
        
        // Bind event listeners
        console.log('Binding event listeners');
        this.bindEventListeners();
        
        // Initialize UI state
        console.log('Initializing UI state');
        this.updateNodeCountDisplay();
        console.log('UI Controls initialization complete');
    }

    bindEventListeners() {
        console.log('Setting up button event listeners');
        
        // Simulation control buttons
        this.startBtn.addEventListener('click', (event) => {
            console.log('Start button clicked', event);
            console.log('Start button state:', this.startBtn.disabled);
            if (!this.startBtn.disabled) {
                console.log('Start button is enabled, starting simulation');
                this.simulation.start();
                this.updateControlState('running');
                Logger.log('Simulation started');
            } else {
                console.log('Start button is disabled');
            }
        });

        // Add click debug listener
        document.addEventListener('click', (event) => {
            console.log('Click detected at:', event.clientX, event.clientY);
        });

        this.pauseBtn.addEventListener('click', (event) => {
            console.log('Pause button clicked', event);
            if (this.simulation.isRunning) {
                console.log('Pausing simulation');
                this.simulation.pause();
                this.updateControlState('paused');
                Logger.log('Simulation paused');
            } else {
                console.log('Resuming simulation');
                this.simulation.resume();
                this.updateControlState('running');
                Logger.log('Simulation resumed');
            }
        });

        this.resetBtn.addEventListener('click', (event) => {
            console.log('Reset button clicked', event);
            this.simulation.reset();
            this.updateControlState('reset');
            Logger.log('Simulation reset');
        });

        // Node count slider
        this.nodeCountSlider.addEventListener('input', () => {
            console.log('Node count slider input');
            this.updateNodeCountDisplay();
        });

        this.nodeCountSlider.addEventListener('change', () => {
            const newCount = parseInt(this.nodeCountSlider.value);
            console.log('Node count changed to:', newCount);
            this.simulation.setNodeCount(newCount);
            Logger.log(`Node count changed to ${newCount}`);
        });

        // Simulation speed slider
        this.simSpeedSlider.addEventListener('change', () => {
            const speed = parseInt(this.simSpeedSlider.value);
            console.log('Simulation speed changed to:', speed);
            this.simulation.setSimulationSpeed(speed);
            Logger.log(`Simulation speed changed to ${speed}`);
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            console.log('Window resized');
            this.simulation.handleResize();
        });

        console.log('Event listeners setup complete');
    }

    updateControlState(state) {
        switch (state) {
            case 'running':
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.resetBtn.disabled = false;
                this.pauseBtn.textContent = 'Пауза';
                break;
                
            case 'paused':
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.resetBtn.disabled = false;
                this.pauseBtn.textContent = 'Продолжить';
                break;
                
            case 'reset':
                this.startBtn.disabled = false;
                this.pauseBtn.disabled = true;
                this.resetBtn.disabled = true;
                this.pauseBtn.textContent = 'Пауза';
                break;
        }
    }

    updateNodeCountDisplay() {
        this.nodeCountValue.textContent = this.nodeCountSlider.value;
    }

    disableControls() {
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.nodeCountSlider.disabled = true;
        this.simSpeedSlider.disabled = true;
    }

    enableControls() {
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.nodeCountSlider.disabled = false;
        this.simSpeedSlider.disabled = false;
    }

    updateMessageCount(count) {
        document.getElementById('messageCount').textContent = count;
    }
}

// Export for use in other modules
window.SimulationControls = SimulationControls;
