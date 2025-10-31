const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory only

// Initialize Gemini AI (only if API key is available)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// In-memory storage for game sessions
const gameSessions = new Map();

// Scenarios data
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
        ],
        systemPrompt: "你是一個歷史分歧點模擬器，專注於亞歷山大圖書館倖存後的世界發展。你必須基於真實的歷史背景，生成合乎邏輯且引人入勝的故事發展。"
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
        ],
        systemPrompt: "你是一個歷史分歧點模擬器，專注於工業革命在中國發生的平行世界。你必須基於真實的歷史背景，生成合乎邏輯且引人入勝的故事發展。"
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
        ],
        systemPrompt: "你是一個歷史分歧點模擬器，專注於古羅馬發現電力的平行世界。你必須基於真實的歷史背景，生成合乎邏輯且引人入勝的故事發展。"
    }
];

// API Routes

// Get all scenarios
app.get('/api/scenarios', (req, res) => {
    res.json({
        success: true,
        scenarios: scenarios.map(s => ({
            id: s.id,
            title: s.title,
            emoji: s.emoji,
            description: s.description
        }))
    });
});

// Start a new game
app.post('/api/game/start', (req, res) => {
    const { scenario_id } = req.body;
    
    const scenario = scenarios.find(s => s.id === scenario_id);
    if (!scenario) {
        return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    
    const gameId = uuidv4();
    gameSessions.set(gameId, {
        gameId,
        scenarioId: scenario_id,
        storyHistory: [],
        createdAt: new Date(),
        lastUpdated: new Date()
    });
    
    res.json({
        success: true,
        game_id: gameId,
        text: scenario.initialText,
        choices: scenario.initialChoices
    });
});

// Handle user choice and generate next story
app.post('/api/game/choice', async (req, res) => {
    const { game_id, choice_id, choice_text } = req.body;
    
    const session = gameSessions.get(game_id);
    if (!session) {
        return res.status(404).json({ success: false, error: 'Game session not found' });
    }
    
    const scenario = scenarios.find(s => s.id === session.scenarioId);
    if (!scenario) {
        return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    
    // Add user choice to history
    session.storyHistory.push({
        type: 'choice',
        choiceId: choice_id,
        text: choice_text,
        timestamp: new Date()
    });
    
    try {
        // Generate AI response using Gemini
        const response = await generateAIResponse(scenario, session);
        
        // Add AI response to history
        session.storyHistory.push({
            type: 'response',
            text: response.text,
            choices: response.choices,
            timestamp: new Date()
        });
        
        session.lastUpdated = new Date();
        
        res.json({
            success: true,
            game_id: game_id,
            text: response.text,
            choices: response.choices,
            is_end: response.isEnd || false
        });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate story continuation',
            details: error.message 
        });
    }
});

// Generate AI response using Gemini
async function generateAIResponse(scenario, session) {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || !genAI) {
        console.warn('GEMINI_API_KEY not configured, using fallback response');
        return generateFallbackResponse(scenario, session);
    }
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // Updated to use latest model
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });
        
        const prompt = buildPrompt(scenario, session);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Parse JSON response with error handling
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    text: parsed.text || parsed.story || '',
                    choices: parsed.choices || [],
                    isEnd: !parsed.choices || parsed.choices.length === 0
                };
            }
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
        }
        
        // Fallback if JSON parsing fails
        return generateFallbackResponse(scenario, session);
    } catch (error) {
        console.error('Gemini API error:', error);
        return generateFallbackResponse(scenario, session);
    }
}

// Build prompt for AI
function buildPrompt(scenario, session) {
    const historyText = session.storyHistory
        .map(entry => {
            if (entry.type === 'choice') {
                return `玩家選擇: ${entry.text}`;
            } else {
                return `故事發展: ${entry.text}`;
            }
        })
        .join('\n\n');
    
    return `${scenario.systemPrompt}

[規則]
1. 保持敘事風格：文字精簡、生動，像一本互動小說
2. 邏輯一致：所有發展都必須是玩家先前選擇的合乎邏輯的結果
3. 歷史背景：基於真實的歷史人物、地點和技術背景，但允許其產生分歧
4. 關鍵格式：你的回應**必須**是一個 JSON 物件，格式如下：
{
  "text": "（下一段故事，約 150-200 字）",
  "choices": [
    {"id": "A", "text": "（第一個新選項）"},
    {"id": "B", "text": "（第二個新選項）"},
    {"id": "C", "text": "（第三個新選項）"}
  ]
}
5. 如果故事發展到自然的結局（約5-7輪後），請將 "choices" 設為空陣列 []
6. 每個選項都應該有明確的行動方向，讓玩家感受到不同選擇的重要性

[故事歷史]
${historyText}

請根據上述歷史和玩家的最新選擇，生成下一步的 JSON 回應。只回應 JSON，不要有其他文字。`;
}

// Fallback response when AI is not available
function generateFallbackResponse(scenario, session) {
    const turnCount = Math.floor(session.storyHistory.length / 2);
    
    if (turnCount >= 3) {
        return {
            text: "你的一系列決策創造了一個獨特的歷史時間線。這個平行時空因你的選擇而走向了一條前所未有的道路。文明的發展軌跡被永久改變，未來充滿了無限可能。歷史學家們將會永遠記住這個關鍵的轉捩點。",
            choices: [],
            isEnd: true
        };
    }
    
    // Generic continuation
    return {
        text: `你的決定產生了深遠的影響。社會開始發生微妙的變化，人們對未來充滿了期待和不確定。新的機遇和挑戰不斷湧現，考驗著你的智慧和遠見。接下來，你將如何引導這個新世界的發展方向？`,
        choices: [
            { id: "A", text: "採取保守策略，穩步推進變革" },
            { id: "B", text: "大膽創新，加速歷史進程" },
            { id: "C", text: "尋求平衡，整合不同的觀點和方案" }
        ],
        isEnd: false
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No (using fallback mode)'}`);
});
