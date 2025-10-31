// Application State
const state = {
    currentGameId: null,
    currentScenario: null,
    storyHistory: [],
    isLoading: false
};

// API Configuration
const API_BASE_URL = window.location.origin; // Use same origin as the page

// Initialize the application
function init() {
    loadScenarios();
    setupEventListeners();
}

// Load scenarios from API
async function loadScenarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scenarios`);
        const data = await response.json();
        
        if (data.success) {
            renderScenarios(data.scenarios);
        } else {
            showError('無法載入劇本列表');
        }
    } catch (error) {
        console.error('Error loading scenarios:', error);
        showError('無法連接到伺服器');
    }
}

// Render scenario cards
function renderScenarios(scenarios) {
    const scenarioList = document.getElementById('scenario-list');
    scenarioList.innerHTML = '';
    
    scenarios.forEach(scenario => {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.innerHTML = `
            <span class="emoji">${scenario.emoji}</span>
            <h3>${scenario.title}</h3>
            <p>${scenario.description}</p>
        `;
        card.addEventListener('click', () => startGame(scenario));
        scenarioList.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('back-btn').addEventListener('click', returnToScenarios);
}

// Start a new game
async function startGame(scenario) {
    state.currentScenario = scenario;
    
    // Switch to game view
    document.getElementById('scenario-view').classList.remove('active');
    document.getElementById('game-view').classList.add('active');
    
    // Set scenario title
    document.getElementById('scenario-title').textContent = scenario.title;
    
    // Clear previous content
    document.getElementById('story-log').innerHTML = '';
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scenario_id: scenario.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            state.currentGameId = data.game_id;
            state.storyHistory = [];
            
            hideLoading();
            
            // Display initial story
            displayStory(data.text);
            displayChoices(data.choices);
        } else {
            hideLoading();
            showError('無法開始遊戲: ' + data.error);
        }
    } catch (error) {
        console.error('Error starting game:', error);
        hideLoading();
        showError('無法連接到伺服器');
    }
}

// Display story text
function displayStory(text, isUserChoice = false) {
    const storyLog = document.getElementById('story-log');
    const entry = document.createElement('div');
    entry.className = 'story-entry';
    
    if (isUserChoice) {
        entry.innerHTML = `<div class="user-choice">➤ ${text}</div>`;
    } else {
        entry.innerHTML = `<div class="story-text">${text}</div>`;
    }
    
    storyLog.appendChild(entry);
    
    // Scroll to bottom
    storyLog.scrollTop = storyLog.scrollHeight;
}

// Display choice buttons
function displayChoices(choices) {
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = '';
    
    if (!choices || choices.length === 0) {
        // Game ended
        displayGameEnd();
        return;
    }
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.innerHTML = `<span class="choice-id">${choice.id}.</span> ${choice.text}`;
        button.addEventListener('click', () => makeChoice(choice));
        choicesContainer.appendChild(button);
    });
}

// Handle user choice
async function makeChoice(choice) {
    if (state.isLoading) return;
    
    // Disable all buttons
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    // Show user's choice in story log
    displayStory(choice.text, true);
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                game_id: state.currentGameId,
                choice_id: choice.id,
                choice_text: choice.text
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update history
            state.storyHistory.push({
                choice: choice,
                response: data
            });
            
            // Hide loading
            hideLoading();
            
            // Display new story
            displayStory(data.text);
            
            // Display new choices or end game
            if (data.is_end || !data.choices || data.choices.length === 0) {
                displayGameEnd();
            } else {
                displayChoices(data.choices);
            }
        } else {
            hideLoading();
            showError('處理選擇時發生錯誤: ' + data.error);
            // Re-enable buttons
            buttons.forEach(btn => btn.disabled = false);
        }
    } catch (error) {
        console.error('Error making choice:', error);
        hideLoading();
        showError('無法連接到伺服器');
        // Re-enable buttons
        buttons.forEach(btn => btn.disabled = false);
    }
}

// Show loading indicator
function showLoading() {
    state.isLoading = true;
    document.getElementById('choices-container').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
}

// Hide loading indicator
function hideLoading() {
    state.isLoading = false;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('choices-container').style.display = 'block';
}

// Display game end message
function displayGameEnd() {
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = `
        <div class="end-message">
            <h3>🌟 故事結束</h3>
            <p>你創造了一個獨特的歷史時間線！</p>
            <button class="choice-btn" id="replay-btn">
                探索其他可能性
            </button>
        </div>
    `;
    document.getElementById('replay-btn').addEventListener('click', returnToScenarios);
}

// Return to scenario selection
function returnToScenarios() {
    document.getElementById('game-view').classList.remove('active');
    document.getElementById('scenario-view').classList.add('active');
    
    // Reset state
    state.currentGameId = null;
    state.currentScenario = null;
    state.storyHistory = [];
}

// Show error message
function showError(message) {
    const choicesContainer = document.getElementById('choices-container');
    choicesContainer.innerHTML = `
        <div class="end-message" style="border-color: #e74c3c;">
            <h3>❌ 錯誤</h3>
            <p>${message}</p>
            <button class="choice-btn" id="retry-btn">
                返回
            </button>
        </div>
    `;
    document.getElementById('retry-btn').addEventListener('click', returnToScenarios);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
