class PomodoroTimer {
    constructor() {
        this.timer = null;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.currentMode = 'pomodoro';
        this.sessionCount = 1;
        this.completedSessions = 0;
        this.totalFocusTime = 0;
        this.completedTasks = 0;
        this.currentTask = null;
        
        this.settings = {
            pomodoro: 60,
            shortBreak: 5,
            longBreak: 60,
            autoStart: false,
            soundEnabled: true
        };
        
        this.todos = [];
        this.todoId = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
        this.updateStats();
    }
    
    initializeElements() {
        // Timer elements
        this.timeDisplay = document.querySelector('.time-display');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.currentTaskDisplay = document.getElementById('currentTask');
        this.sessionCountDisplay = document.getElementById('sessionCount');
        this.timerCircle = document.querySelector('.timer-circle');
        
        // Mode buttons
        this.modeBtns = document.querySelectorAll('.mode-btn');
        
        // Input elements
        this.userNameInput = document.getElementById('userName');
        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.todoList = document.getElementById('todoList');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.closeModal = document.querySelector('.close');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        
        // Settings inputs
        this.pomodoroTimeInput = document.getElementById('pomodoroTime');
        this.shortBreakTimeInput = document.getElementById('shortBreakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.autoStartInput = document.getElementById('autoStart');
        this.soundEnabledInput = document.getElementById('soundEnabled');
        
        // Stats elements
        this.completedSessionsDisplay = document.getElementById('completedSessions');
        this.totalTimeDisplay = document.getElementById('totalTime');
        this.completedTasksDisplay = document.getElementById('completedTasks');
    }
    
    bindEvents() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Mode buttons
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });
        
        // Todo functionality
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Modal events
        this.closeModal.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
        });
        
        // Username greeting
        this.userNameInput.addEventListener('input', () => this.updateGreeting());
    }
    
    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-flex';
            this.timerCircle.classList.add('active');
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }
    }
    
    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.startBtn.style.display = 'inline-flex';
            this.pauseBtn.style.display = 'none';
            this.timerCircle.classList.remove('active');
        }
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.settings[this.currentMode] * 60;
        this.updateDisplay();
    }
    
    completeSession() {
        this.pauseTimer();
        
        if (this.currentMode === 'pomodoro') {
            this.completedSessions++;
            this.totalFocusTime += this.settings.pomodoro;
            
            if (this.currentTask) {
                this.completeCurrentTask();
            }
            
            // Auto-switch to break
            if (this.completedSessions % 4 === 0) {
                this.switchMode('longBreak');
            } else {
                this.switchMode('shortBreak');
            }
        } else {
            // Break completed, switch back to pomodoro
            this.switchMode('pomodoro');
            this.sessionCount++;
        }
        
        this.showNotification(`${this.currentMode} completed!`);
        this.playNotificationSound();
        this.updateStats();
        
        if (this.settings.autoStart) {
            setTimeout(() => this.startTimer(), 3000);
        }
    }
    
    switchMode(mode) {
        this.pauseTimer();
        this.currentMode = mode;
        this.timeLeft = this.settings[mode] * 60;
        
        // Update active mode button
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update progress circle color
        const colors = {
            pomodoro: '#ff6b6b',
            shortBreak: '#4ecdc4',
            longBreak: '#45b7d1'
        };
        this.progressCircle.style.stroke = colors[mode];
        
        this.updateDisplay();
        this.updateSessionInfo();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress circle
        const totalTime = this.settings[this.currentMode] * 60;
        const progress = (totalTime - this.timeLeft) / totalTime;
        const circumference = 2 * Math.PI * 140; // radius = 140
        const offset = circumference - (progress * circumference);
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Update page title
        const userName = this.userNameInput.value || 'User';
        document.title = `Workshop Timer`;
    }
    
    updateSessionInfo() {
        this.sessionCountDisplay.textContent = `Session ${this.sessionCount}`;
        
        if (this.currentTask) {
            this.currentTaskDisplay.textContent = this.currentTask.text;
        } else {
            this.currentTaskDisplay.textContent = 'Select a task';
        }
    }
    
    // Todo functionality
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text) {
            const todo = {
                id: this.todoId++,
                text: text,
                completed: false,
                active: false
            };
            this.todos.push(todo);
            this.renderTodos();
            this.todoInput.value = '';
        }
    }
    
    renderTodos() {
        this.todoList.innerHTML = '';
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.active ? 'active' : ''}`;
            li.innerHTML = `
                <div class="todo-text">${todo.text}</div>
                <div class="todo-actions">
                    ${!todo.completed ? `<button class="select-btn" onclick="app.selectTask(${todo.id})">
                        ${todo.active ? 'Selected' : 'Select'}
                    </button>` : ''}
                    <button class="complete-btn" onclick="app.toggleTodo(${todo.id})">
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            this.todoList.appendChild(li);
        });
    }
    
    selectTask(id) {
        // Deselect all tasks
        this.todos.forEach(todo => todo.active = false);
        
        // Select the chosen task
        const task = this.todos.find(todo => todo.id === id);
        if (task && !task.completed) {
            task.active = true;
            this.currentTask = task;
        }
        
        this.renderTodos();
        this.updateSessionInfo();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            if (todo.completed) {
                todo.active = false;
                if (this.currentTask && this.currentTask.id === id) {
                    this.currentTask = null;
                    this.completedTasks++;
                }
            }
        }
        this.renderTodos();
        this.updateSessionInfo();
        this.updateStats();
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        if (this.currentTask && this.currentTask.id === id) {
            this.currentTask = null;
        }
        this.renderTodos();
        this.updateSessionInfo();
    }
    
    completeCurrentTask() {
        if (this.currentTask) {
            this.toggleTodo(this.currentTask.id);
        }
    }
    
    // Settings
    openSettings() {
        this.settingsModal.style.display = 'flex';
        this.pomodoroTimeInput.value = this.settings.pomodoro;
        this.shortBreakTimeInput.value = this.settings.shortBreak;
        this.longBreakTimeInput.value = this.settings.longBreak;
        this.autoStartInput.checked = this.settings.autoStart;
        this.soundEnabledInput.checked = this.settings.soundEnabled;
    }
    
    closeSettings() {
        this.settingsModal.style.display = 'none';
    }
    
    saveSettings() {
        this.settings.pomodoro = parseInt(this.pomodoroTimeInput.value);
        this.settings.shortBreak = parseInt(this.shortBreakTimeInput.value);
        this.settings.longBreak = parseInt(this.longBreakTimeInput.value);
        this.settings.autoStart = this.autoStartInput.checked;
        this.settings.soundEnabled = this.soundEnabledInput.checked;
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        
        // Reset timer with new settings
        this.timeLeft = this.settings[this.currentMode] * 60;
        this.updateDisplay();
        
        this.closeSettings();
        this.showNotification('Settings saved!');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    // Stats
    updateStats() {
        this.completedSessionsDisplay.textContent = this.completedSessions;
        
        const hours = Math.floor(this.totalFocusTime / 60);
        const minutes = this.totalFocusTime % 60;
        this.totalTimeDisplay.textContent = `${hours}h ${minutes}m`;
        
        this.completedTasksDisplay.textContent = this.completedTasks;
    }
    
    // Utilities
    updateGreeting() {
        const name = this.userNameInput.value;
        if (name) {
            document.title = `${name}'s Pomodoro Timer`;
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    playNotificationSound() {
        if (this.settings.soundEnabled) {
            // Create a more prominent multi-tone notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // First tone - higher pitch
            const oscillator1 = audioContext.createOscillator();
            const gainNode1 = audioContext.createGain();
            
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);
            
            oscillator1.frequency.value = 1000;
            oscillator1.type = 'square';
            
            gainNode1.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator1.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.3);
            
            // Second tone - lower pitch (after a brief pause)
            setTimeout(() => {
                const oscillator2 = audioContext.createOscillator();
                const gainNode2 = audioContext.createGain();
                
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);
                
                oscillator2.frequency.value = 600;
                oscillator2.type = 'square';
                
                gainNode2.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                
                oscillator2.start(audioContext.currentTime);
                oscillator2.stop(audioContext.currentTime + 0.4);
            }, 350);
            
            // Third tone - highest pitch for emphasis
            setTimeout(() => {
                const oscillator3 = audioContext.createOscillator();
                const gainNode3 = audioContext.createGain();
                
                oscillator3.connect(gainNode3);
                gainNode3.connect(audioContext.destination);
                
                oscillator3.frequency.value = 1200;
                oscillator3.type = 'square';
                
                gainNode3.gain.setValueAtTime(0.5, audioContext.currentTime);
                gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator3.start(audioContext.currentTime);
                oscillator3.stop(audioContext.currentTime + 0.3);
            }, 750);
        }
    }
}

// Initialize the app
const app = new PomodoroTimer();
