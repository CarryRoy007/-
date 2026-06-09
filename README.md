# 战国策 · 抉择

> **一言之决，裂土封疆。一念之差，国破家亡。**

<p align="center">
  <img src="https://img.shields.io/badge/类型-历史策略-orange" alt="Game Type">
  <img src="https://img.shields.io/badge/回合-40回合-brightgreen" alt="Turns">
  <img src="https://img.shields.io/badge/国家-战国七雄-red" alt="Countries">
  <img src="https://img.shields.io/badge/事件-95+-blue" alt="Events">
</p>

---

## 🇨🇳 中文

### ⚔️ 从三家分晋到秦灭六国，你的每一次选择都将改写历史。

**《战国策·抉择》** 是一款纯前端的回合制历史策略游戏。你扮演战国七雄之一的君主，在 40 回合（约 120 年）的统治中，面对 95+ 个精心设计的历史事件。每个事件没有标准答案——**只有基于现实的妥协**。

**🔥 核心玩点：**
- **6 个纪元**，从前 403 年三家分晋到前 221 年天下一统，自由选择开局
- **7 国可选**，每国独特属性、AI 性格与专属奇遇人物池
- **56 个历史事件 + 39 个随机事件**，半文言叙事，沉浸式决策
- **SVG 大地图**，80+ 城池各有独立多边形，吞并即变色
- **生杀予夺**：选错可能被弑、被掳、被架空——君主也会提前谢幕
- **谥号系统**：游戏结束获谥号 + 太史公评价 + 五星历史定位
- **史书回放**：编年体回顾每一回合的选择与后果

[🎮 立即开始游戏](https://carryroy007.github.io/zhan-guo-strategy-Yao/)

---

## 🇬🇧 English

### ⚔️ One Decision. One Dynasty. One Fate.

**"Annals of the Warring States: The Choice"** is a browser-based turn-strategy game. Step into the sandals of a Warring States monarch and navigate 120 years of intrigue, war, and reform. Every choice is a compromise — **there are no right answers, only consequences**.

**🔥 Highlights:**
- **6 Eras** spanning 403–221 BCE — from the Partition of Jin to Qin's unification
- **7 Playable Kingdoms**, each with unique stats, AI personalities, and exclusive character pools
- **95+ Events** in semi-classical prose, featuring historical figures like Sun Bin, Bai Qi, and Shang Yang
- **Live SVG Map** — 80+ cities with individual polygons that recolor on conquest
- **Permadeath Mechanics**: your ruler can be assassinated, deposed, or die of overwork
- **Posthumous Title System** — earn your epitaph and a Grand Historian's verdict
- **Chronicle Replay** — review your reign as an annal

[🎮 Play Now](https://carryroy007.github.io/zhan-guo-strategy-Yao/)

---

## 🇯🇵 日本語

### ⚔️ 一つの決断が一国の運命を変える。

**『戦国策・決断』** はブラウザで遊べる歴史ターン制戦略ゲーム。紀元前 403 年から 221 年まで、戦国七雄の君主として 40 ターンの統治を体験。95 以上の歴史的事件があなたの決断を待つ——**正解はない、あるのは結果だけ**。

**🔥 見どころ：**
- **6 つの時代** — 三晋分立から秦の統一まで自由に開始時期を選択
- **7 国から選択可能**、各国に固有の能力値と AI 性格
- **95+ のイベント**、半文語体の語りで没入感を演出
- **SVG 動的地図** — 80+ の都市を個別のポリゴンで表示、征服で即時変色
- **君主死亡システム** — 暗殺・廃位・過労死、選択次第で統治が突然終わる
- **諡号（しごう）判定** — ゲーム終了時に諡号と太史公の評価を獲得
- **史書リプレイ** — 編年体ですべての選択を振り返り

[🎮 プレイ開始](https://carryroy007.github.io/zhan-guo-strategy-Yao/)

---

## 🇰🇷 한국어

### ⚔️ 하나의 선택이 왕조의 운명을 바꾼다.

**『전국책 · 결단』** 은 브라우저에서 즐기는 턴제 역사 전략 게임. 기원전 403년부터 221년까지, 전국칠웅의 군주가 되어 40턴 동안 나라를 통치하라. 95개 이상의 사건이 당신의 판단을 기다린다 — **정답은 없다, 오직 결과만이 있을 뿐**.

**🔥 하이라이트:**
- **6개 시대** — 삼진 분립부터 진의 통일까지, 시작 시기를 자유 선택
- **7개 국가** 선택 가능, 국가별 고유 능력치와 AI 성격
- **95+ 이벤트**, 반문어체 서사로 깊은 몰입감
- **SVG 실시간 지도** — 80여 성을 개별 폴리곤으로 표시, 정복 시 즉시 색상 변경
- **군주 사망 시스템** — 암살, 폐위, 과로사 등 선택에 따라 통치가 갑자기 종료
- **시호 시스템** — 게임 종료 후 시호와 태사공의 역사적 평가 획득
- **사서 리플레이** — 편년체로 매 턴의 선택과 결과를 회고

[🎮 게임 시작](https://carryroy007.github.io/zhan-guo-strategy-Yao/)

---

## 🛠️ 技术栈 | Tech Stack

| | |
|---|---|
| 框架 | 纯前端，零依赖 |
| 地图 | SVG 矢量渲染 |
| 存档 | localStorage |
| 部署 | GitHub Pages + Actions |

## 📂 项目结构 | Structure

```
zhan-guo-strategy/
├── index.html          # 单页面入口
├── css/style.css       # 古风竹简美学
├── js/
│   ├── app.js          # 入口逻辑
│   ├── engine.js       # 回合引擎
│   ├── state.js        # 状态管理
│   ├── map.js          # SVG 地图渲染
│   ├── ui.js           # 界面渲染
│   ├── events.js       # 95+ 事件数据
│   ├── characters.js   # 50+ 历史人物
│   ├── countries.js    # 七国 + 纪元配置
│   ├── epitaph.js      # 谥号算法
│   ├── chronicle.js    # 史书回放
│   └── save.js         # 存档读档
└── .github/workflows/  # CI/CD 自动部署
```

## 📜 协议 | License

MIT — 自由使用、修改、分发。Pull Request 欢迎。

---

<p align="center">
  <sub>Made with ❤️ for history lovers</sub>
</p>
