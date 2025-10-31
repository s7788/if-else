1.0 專案概述 (Project Overview)
專案名稱： 時空分歧點 (Project Divergence)

專案使命： 打造一個由 AI 驅動的互動式網頁應用。使用者可以選擇一個重大的歷史轉捩點，並透過一系列的決策，探索一個動態生成、合乎邏輯且充滿創意的平行時空。

核心體驗： 輕量級、文字為主、高重玩性的「選擇導向冒險」(Choose-Your-Own-Adventure) 遊戲。

2.0 系統架構 (System Architecture)
我們將採用一個標準的三層式架構：

前端 (Frontend): 一個現代 JavaScript 框架（如 React, Vue, Svelte）建構的單頁應用程式 (SPA)。

職責： 渲染 UI、管理當前遊戲狀態（顯示文字、選項）、處理使用者輸入，並與後端 API 通訊。

後端 (Backend): 一個輕量級 API 伺服器（如 Node.js/Express, Python/FastAPI）。

職責： 擔任「互動式敘事引擎」的核心。它負責接收前端的選擇、管理遊戲會話 (Session)、建構提示 (Prompt)，並與 AI 模型 API 溝通。

AI 服務 (AI Service): 第三方大型語言模型 (LLM) API。

職責： 根據後端傳送的「情境」和「規則」，生成下一階段的故事情節和新的選項。

3.0 核心使用者流程 (Core User Flow)
[Frontend] 進入頁面： 使用者造訪網站，看到可用的「劇本」(Scenarios) 列表。

[Frontend] 選擇劇本： 使用者選擇一個劇本（例如：「如果...亞歷山大圖書館從未被燒毀？」）。

[Frontend] 遊戲開始：

前端向後端發送 POST /api/game/start 請求，附帶 scenario_id。

後端建立一個新的 game_id，從資料庫讀取該劇本的「初始情境」(Initial Prompt) 和「初始選項」。

後端將 game_id、初始情境文字和選項陣列回傳。

前端渲染遊戲畫面，顯示初始情境和選項按鈕。

[Frontend] 使用者做選擇：

使用者點擊一個選項（例如：「選項 B：將所有文獻數位化存檔」）。

前端立即將該按鈕設為「載入中」狀態，並向後端發送 POST /api/game/choice 請求，附帶 game_id 和 choice_id。

[Backend] 敘事引擎處理：

後端根據 game_id 查詢目前的遊戲狀態（包含完整的故事歷史）。

(關鍵步驟) 後端建構一個精確的「提示」(Prompt) 並發送給 LLM API。

後端等待 LLM API 回應。

後端解析 LLM 的回應（新的故事文本和新的選項），將其儲存到遊戲狀態中，然後回傳給前端。

[Frontend] 渲染下一步：

前端收到新的故事文本和選項。

畫面更新，顯示新的故事發展和下一組選項。

重複步驟 4-6，直到 AI 判定故事達到一個（暫時的）結局。

4.0 關鍵組件與技術選型
4.1 前端 (Frontend)
框架： React (Next.js) 或 Vue (Nuxt.js)。

理由： 非常適合處理動態 UI 狀態。Next.js/Nuxt.js 的伺服器端渲染 (SSR) 可用於 SEO（讓劇本介紹頁被搜尋到）和快速的初始載入。

狀態管理： Context API / Redux Toolkit (React) 或 Pinia (Vue)。

理由： 需要一個集中的地方來管理當前的 game_id、故事歷史陣列 (storyLog)、當前選項 (currentChoices) 和載入狀態 (isLoading)。

UI 庫： Tailwind CSS 或 Chakra UI。

理由： 快速打造簡潔、美觀的文字冒險介面。

4.2 後端 (Backend) - 互動式敘事引擎
框架： Python (FastAPI) 或 Node.js (Express/NestJS)。

理由： Python/FastAPI 是首選，因為它在 AI/LLM 生態系中是原生語言，處理提示和與 LLM 互動的函式庫（如 LangChain）非常成熟。

職責：

會話管理 (Session Management): 使用 JWT 或簡單的 Session ID 來追蹤 game_id。

狀態管理 (State Management): 追蹤每個 game_id 的完整對話歷史。

提示工程 (Prompt Engineering): 這是此應用的「靈魂」。

4.3 資料庫 (Database)
主資料庫： PostgreSQL。

理由： 穩定可靠，JSONB 欄位非常適合儲存半結構化的遊戲狀態和劇本。

快取 (Cache): Redis。

理由： 用於快取活躍的 game_id 及其對話歷史。這至關重要，因為我們必須在每次呼叫 LLM 時都傳送完整的上下文，從 Redis 讀取比從 PG 讀取快得多。

4.4 AI 模型 (LLM API)
服務： Google Gemini API (Gemini 1.5 Pro) 或 OpenAI API (GPT-4o)。

理由： 兩者都具有強大的邏輯推理、歷史知識和結構化輸出 (JSON 模式) 的能力。結構化輸出是必要的，以確保 AI 總是回傳我們需要的 {"text": "...", "choices": [...]} 格式。

5.0 資料庫結構 (Data Schema)
scenarios (劇本表)

scenario_id (PK, text, e.g., "alexandria-library")

title (text, "如果亞歷山大圖書館從未被燒毀？")

description (text, "公元前 48 年，凱撒的戰火威脅著...")

initial_prompt (text, "你現在是圖書館的首席學者...")

initial_choices (JSONB, [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}])

image_url (text, 可選的封面圖)

game_sessions (遊戲會話表)

game_id (PK, UUID)

user_id (FK, 可選，如果未來加入會員系統)

scenario_id (FK, 關聯到 scenarios)

story_history (JSONB, 儲存完整的對話歷史，包含使用者選擇和 AI 回應)

created_at (timestamp)

last_updated (timestamp)

is_finished (boolean)

6.0 API 設計 (API Endpoints)
GET /api/scenarios

回應： 傳回所有可用劇本的列表 (ID, Title, Description, Image)。

POST /api/game/start

請求 Body： { "scenario_id": "alexandria-library" }

回應： { "game_id": "...", "text": "...", "choices": [...] } (劇本的初始內容)

POST /api/game/choice

請求 Body： { "game_id": "...", "choice_id": "B" }

回應：

(成功) { "game_id": "...", "text": "...", "choices": [...] } (下一步的內容)

(遊戲結束) { "game_id": "...", "text": "...", "choices": null, "is_end": true } (結局)

後端邏輯：

從 Redis (或 PG) 讀取 game_id 的 story_history。

將使用者的新選擇 choice_id 添加到歷史中。

建構 LLM 提示 (見 7.0)。

呼叫 LLM API (使用 JSON 模式)。

解析回應，將 AI 的新回應添加到 story_history。

更新 Redis/PG 中的 story_history。

回傳新的 text 和 choices 給前端。

7.0 核心挑戰：提示工程 (The Prompt Engineering)
這是「互動式敘事引擎」的核心邏輯。每次呼叫 LLM 時，後端都必須動態建構一個類似這樣的提示：

[SYSTEM PROMPT]
你是一個「時空分歧點」的歷史模擬器。你是一位結合了歷史學家和敘事大師的 AI。
你的任務是根據使用者的選擇，生成一個合乎邏輯、有創意、且引人入勝的平行時空發展。

[RULES]
1.  保持敘事風格：文字精簡、生動，像一本互動小說。
2.  邏輯一致：所有發展都必須是使用者先前選擇的合乎邏輯的「結果」。
3.  歷史背景：基於真實的歷史人物、地點和技術背景，但允許其產生分歧。
4.  關鍵格式：你的回應**必須**是一個 JSON 物件，格式如下：
    {
      "text": "（你生成的下一段故事，約 100-150 字）",
      "choices": [
        {"id": "A", "text": "（第一個新選項）"},
        {"id": "B", "text": "（第二個新選項）"},
        {"id": "C", "text": "（第三個新選項）"}
      ]
    }
5.  如果故事發展到一個自然的結局，請將 "choices" 設為 null 或空陣列。

[STORY HISTORY SO FAR]
(這裡插入 `story_history` JSONB 的內容)

[USER'S LATEST CHOICE]
(這裡插入使用者剛剛選擇的選項文字)

[YOUR TASK]
請根據上述歷史和使用者的最新選擇，生成下一步的 JSON 回應。
8.0 未來迭代 (Future Iterations)
V1.1： 視覺化時間軸（使用 react-flow 之類的庫，顯示使用者走過的決策樹）。

V1.2： AI 圖片生成（在每一步，非同步呼叫 DALL-E 或 Imagen，為該情節生成一張配圖）。

V2.0： 會員系統（儲存使用者的所有「世界線」）、分享功能（將自己獨特的結局分享到社群媒體）。
