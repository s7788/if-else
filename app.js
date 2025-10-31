// Application State
const state = {
    currentGameId: null,
    currentScenario: null,
    storyHistory: [],
    isLoading: false
};

// Mock Scenarios Data
const scenarios = [
    {
        id: "alexandria-library",
        title: "亞歷山大圖書館永存",
        emoji: "📚",
        description: "公元前 48 年，如果凱撒的戰火沒有燒毀亞歷山大圖書館，人類的知識會如何發展？",
        initialText: "公元前 48 年，你是亞歷山大圖書館的首席學者。凱撒的軍隊正在逼近，但你有機會做出關鍵決策來保護這座知識寶庫。館內收藏著數十萬卷珍貴的古代文獻，包含了埃及、希臘、波斯的智慧結晶。你將如何行動？",
        initialChoices: [
            { id: "A", text: "組織學者團隊，將最重要的文獻轉移到城外的秘密地點" },
            { id: "B", text: "與凱撒談判，說服他保護圖書館以換取學者的支持" },
            { id: "C", text: "緊急動員抄寫員，複製最關鍵的文獻以防萬一" }
        ]
    },
    {
        id: "industrial-revolution",
        title: "工業革命的另一條路",
        emoji: "⚙️",
        description: "如果工業革命首先在中國而非英國發生，世界會變成什麼樣子？",
        initialText: "公元 1750 年，你是清朝的一位有遠見的官員。你注意到西方的蒸汽機技術，但同時也看到中國傳統的水利和手工業體系的優勢。你被皇帝召見，詢問你對國家未來發展方向的建議。這將影響整個東方文明的軌跡。",
        initialChoices: [
            { id: "A", text: "大力引進西方蒸汽技術，建立現代化工廠體系" },
            { id: "B", text: "改良傳統水力系統，發展中國特色的機械化道路" },
            { id: "C", text: "優先發展教育和科學研究，培養本土的工程師和科學家" }
        ]
    },
    {
        id: "roman-empire",
        title: "羅馬帝國的電力時代",
        emoji: "⚡",
        description: "如果古羅馬人發現了電力的秘密，歷史將會如何改寫？",
        initialText: "公元 100 年，你是羅馬的一位發明家。在研究琥珀的摩擦現象時，你意外發現了產生電力的方法。元老院對你的發現既好奇又懷疑。你必須決定如何推廣這項革命性的發現，同時避免被視為巫術而遭到迫害。",
        initialChoices: [
            { id: "A", text: "先為皇帝打造奇特的電力裝置，獲得皇室保護和資助" },
            { id: "B", text: "建立秘密的研究社團，慢慢培養理解電力的學者群體" },
            { id: "C", text: "公開演示電力在照明和通訊方面的實用價值" }
        ]
    }
];

// Mock AI Response Generator
function generateAIResponse(scenario, choice, history) {
    // This is a mock function that simulates AI responses
    // In a real implementation, this would call the backend API
    
    const responses = {
        "alexandria-library": {
            "A": {
                text: "你的決定救了圖書館最珍貴的藏書。在月黑風高的夜晚，一支由忠誠學者組成的隊伍護送著裝滿經典的馬車悄然離開城市。三個月後，凱撒的火焰吞噬了主建築，但你藏匿的文獻倖存了下來。如今，你面臨著新的選擇：這些知識應該如何傳承？",
                choices: [
                    { id: "A1", text: "在遠離政治中心的修道院重建小型圖書館，專注保存" },
                    { id: "A2", text: "建立流動學院，讓學者們帶著知識周遊列國傳播智慧" },
                    { id: "A3", text: "等待時局穩定後，說服新政權重建更大規模的圖書館" }
                ]
            },
            "B": {
                text: "凱撒被你的學識和圖書館的價值所打動。他不僅同意保護圖書館，還撥款擴建，條件是學者們協助他治理新征服的領土。圖書館因此獲得了前所未有的影響力，但也與政治權力緊密結合。你發現這是一把雙刃劍...",
                choices: [
                    { id: "B1", text: "利用這個機會，將圖書館的知識傳播到羅馬各行省" },
                    { id: "B2", text: "保持學術獨立性，婉拒過多的政治參與" },
                    { id: "B3", text: "建立學者議會，制衡政治權力對知識的控制" }
                ]
            },
            "C": {
                text: "在你的組織下，三百名抄寫員日夜不停地工作。雖然原始圖書館最終被焚毀，但你創造的副本流散到地中海各地。這些副本成為了種子，在羅馬、雅典、甚至遙遠的波斯開花結果。知識不再集中於一處，而是形成了網絡...",
                choices: [
                    { id: "C1", text: "建立抄寫員行會，標準化文獻複製和傳播的流程" },
                    { id: "C2", text: "發明更高效的複製技術，比如早期印刷術的雛形" },
                    { id: "C3", text: "創建圖書館網絡系統，讓知識在多個城市間流通共享" }
                ]
            }
        },
        "industrial-revolution": {
            "A": {
                text: "在你的推動下，清朝開始引進蒸汽技術。第一座蒸汽紡織廠在江南建成，生產效率驚人。但傳統手工業者強烈反對，社會動盪開始出現。同時，西方列強注意到了中國的工業化進程，態度變得更加警惕...",
                choices: [
                    { id: "A1", text: "建立工人培訓系統，幫助手工業者轉型" },
                    { id: "A2", text: "推動軍事工業優先發展，增強國防實力" },
                    { id: "A3", text: "發展本土機械製造能力，減少對西方技術的依賴" }
                ]
            },
            "B": {
                text: "你主導改良了傳統的水力系統，結合中國精密的機械工藝，創造出獨特的自動化生產線。這條道路雖然進展較慢，但完全基於本土技術，避免了對外國的依賴。江南地區的生產力穩步提升，社會變革相對平和...",
                choices: [
                    { id: "B1", text: "將這套系統推廣到全國各地的手工業中心" },
                    { id: "B2", text: "建立技術學院，培養新型工程師人才" },
                    { id: "B3", text: "與西方展開技術交流，融合東西方的優勢" }
                ]
            },
            "C": {
                text: "在你的建議下，朝廷大力投資教育。數十所新式學堂在各地興建，教授數學、物理、化學等現代科學。二十年後，第一代中國本土培養的工程師和科學家開始嶄露頭角，他們帶來的創新讓整個社會驚嘆...",
                choices: [
                    { id: "C1", text: "這些科學家提出自主研發蒸汽動力系統" },
                    { id: "C2", text: "優先發展電力技術，跳過蒸汽時代" },
                    { id: "C3", text: "專注於化學工業和材料科學的突破" }
                ]
            }
        },
        "roman-empire": {
            "A": {
                text: "皇帝對你展示的電光閃爍裝置著迷不已。他封你為帝國首席發明家，並撥給你整個宮殿的一翼作為實驗室。很快，電力照明照亮了皇宮的夜晚，電報系統連接了帝國的主要城市。但貴族們開始嫉妒你的影響力...",
                choices: [
                    { id: "A1", text: "將電力技術向貴族階層開放，換取支持" },
                    { id: "A2", text: "專注於軍事應用，鞏固皇帝的權力" },
                    { id: "A3", text: "建立電力工程師學院，培養技術人才" }
                ]
            },
            "B": {
                text: "你建立了「琥珀學會」，吸引了羅馬最聰明的工匠和哲學家。在秘密中，你們探索電力的本質，發展出基礎的電池和電動機。幾十年後，這個學會已發展成一個強大的知識網絡，在帝國各地都有分會...",
                choices: [
                    { id: "B1", text: "是時候公開學會的成果，推動社會變革" },
                    { id: "B2", text: "繼續保密，但開始實際應用電力技術" },
                    { id: "B3", text: "與其他學術團體合作，形成更大的科學聯盟" }
                ]
            },
            "C": {
                text: "你在羅馬廣場進行了一次震撼的公開演示。電燈照亮黑夜，電動機驅動水泵，電報機傳送訊息。人群從驚恐轉為讚嘆。雖然一些祭司指責這是妖術，但實用價值說服了大多數人。城市開始規劃電力網絡...",
                choices: [
                    { id: "C1", text: "優先為羅馬城市建設照明系統" },
                    { id: "C2", text: "發展工業用電，推動製造業革新" },
                    { id: "C3", text: "建立遠距離通訊網絡，連接整個帝國" }
                ]
            }
        }
    };
    
    // Find matching response
    if (responses[scenario.id] && responses[scenario.id][choice]) {
        return responses[scenario.id][choice];
    }
    
    // Default ending if no more choices defined
    return {
        text: "你的選擇創造了一個獨特的歷史分支。這個平行時空因你的決策而走向了一條全新的道路。文明的火種在不同的軌跡上燃燒，造就了另一種可能的世界。",
        choices: null,
        isEnd: true
    };
}

// Initialize the application
function init() {
    renderScenarios();
    setupEventListeners();
}

// Render scenario cards
function renderScenarios() {
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
function startGame(scenario) {
    state.currentGameId = generateGameId();
    state.currentScenario = scenario;
    state.storyHistory = [];
    
    // Switch to game view
    document.getElementById('scenario-view').classList.remove('active');
    document.getElementById('game-view').classList.add('active');
    
    // Set scenario title
    document.getElementById('scenario-title').textContent = scenario.title;
    
    // Clear previous content
    document.getElementById('story-log').innerHTML = '';
    
    // Display initial story
    displayStory(scenario.initialText);
    displayChoices(scenario.initialChoices);
}

// Generate a simple game ID
function generateGameId() {
    return 'game-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
    
    // Simulate AI processing delay
    await sleep(1500);
    
    // Get AI response
    const response = generateAIResponse(state.currentScenario, choice.id, state.storyHistory);
    
    // Update history
    state.storyHistory.push({
        choice: choice,
        response: response
    });
    
    // Hide loading
    hideLoading();
    
    // Display new story
    displayStory(response.text);
    
    // Display new choices or end game
    if (response.isEnd) {
        displayGameEnd();
    } else {
        displayChoices(response.choices);
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
            <button class="choice-btn" onclick="returnToScenarios()">
                探索其他可能性
            </button>
        </div>
    `;
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

// Utility function for delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
