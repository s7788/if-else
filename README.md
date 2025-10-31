# 時空分歧點 (Project Divergence)

一個基於 AI 驅動的互動式歷史分歧點探索網頁應用

## 專案概述

**時空分歧點** 是一個互動式的「選擇導向冒險」(Choose-Your-Own-Adventure) 網頁遊戲，讓使用者可以選擇重大的歷史轉捩點，並透過一系列決策探索動態生成的平行時空。

## 功能特色

- 🌌 三個精心設計的歷史分歧點場景
  - 📚 亞歷山大圖書館永存
  - ⚙️ 工業革命的另一條路
  - ⚡ 羅馬帝國的電力時代
- 🤖 **整合 Google Gemini AI**，動態生成故事情節
- 🎮 流暢的互動式遊戲體驗
- 🎨 美觀的漸層設計和動畫效果
- 📱 響應式設計，支援各種裝置

## 系統需求

- Node.js 14.x 或更高版本
- Google Gemini API Key（可在 [Google AI Studio](https://makersuite.google.com/app/apikey) 取得）

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並設定你的 API Key：

```bash
cp .env.example .env
```

編輯 `.env` 檔案：

```
GEMINI_API_KEY=你的_Gemini_API_Key
PORT=3000
```

**注意**：如果沒有設定 API Key，系統會使用備用模式，提供基本的故事繼續功能。

### 3. 啟動應用

```bash
npm start
```

然後在瀏覽器開啟 [http://localhost:3000](http://localhost:3000)

## 開發模式

```bash
npm run dev
```

## 檔案結構

```
if-else/
├── index.html      # 主要 HTML 結構
├── style.css       # 樣式表
├── app.js          # 前端 JavaScript 邏輯
├── server.js       # 後端 API 伺服器（整合 Gemini AI）
├── package.json    # Node.js 專案配置
├── .env.example    # 環境變數範例
├── spec.md         # 專案規格說明文件
└── README.md       # 本說明文件
```

## 遊戲玩法

1. **選擇劇本**：在首頁選擇一個歷史轉捩點
2. **閱讀情境**：了解當前的歷史背景和情況
3. **做出選擇**：點選你想要的決策選項
4. **探索結果**：觀察你的選擇如何影響歷史走向
5. **繼續冒險**：根據新的情境繼續做出決策
6. **重新體驗**：返回選擇其他劇本或做出不同選擇

## 技術細節

- **前端**：純 HTML5, CSS3, JavaScript (ES6+)
- **後端**：Node.js + Express
- **AI 引擎**：Google Gemini API
- **設計**：響應式設計，支援桌面和行動裝置
- **相容性**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 已實現功能

- ✅ 整合 Google Gemini AI，動態生成故事情節
- ✅ 後端 API 伺服器
- ✅ 會話管理系統

## 未來發展

根據 spec.md 的規劃，未來版本可能包括：

- V1.1：視覺化時間軸，顯示決策樹
- V1.2：AI 圖片生成，為每個情節生成配圖
- V2.0：會員系統、儲存遊戲進度、社群分享功能、資料庫整合

## 授權

本專案基於 spec.md 文件實現，用於展示互動式歷史分歧點探索的概念。

## 貢獻

歡迎提出問題 (Issues) 和拉取請求 (Pull Requests)！

---

**享受探索歷史另一種可能性的旅程！** 🚀
