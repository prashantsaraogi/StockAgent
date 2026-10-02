# Setup — India Stock Investment Agent

Use this guide when opening this project on a **new Cursor account** (e.g. personal key) or a **new machine**.

The framework is **project-based** — no separate prompt upload required. Copy this folder, open it in Cursor, and start chatting.

---

## Quick start (new Cursor key)

1. **Copy the project** to the new machine or account:
   - Copy the entire `My-agent` folder, **or**
   - Clone from git if you have pushed it (`git clone …`)
2. In Cursor: **File → Open Folder** → select `My-agent`
3. Open **Cursor Settings → Rules** and confirm project rule **`stock-agent.mdc`** is active (`alwaysApply: true`)
4. Start a **new chat** (do not rely on old chat history)
5. Run the **smoke test** below

---

## Smoke test (confirm framework works)

Paste this in a new chat:

```
Read .cursor/portfolio/holdings.md first.
Summarize my Max Healthcare position (qty, avg cost) and give the framework action from holdings notes.
Use the India stock investment framework — PCCL dual lens for existing holders.
```

**Pass:** Agent reads `holdings.md`, cites your qty/cost, respects notes (e.g. Max = salary DCA, no trim).

**Fail:** Agent invents holdings or ignores rules → check that you opened the **correct folder** and `stock-agent.mdc` is enabled.

---

## What lives where

| Path | Purpose |
|------|---------|
| `.cursor/rules/stock-agent.mdc` | **Master framework** (22 sections) — auto-applied every chat |
| `.cursor/skills/` | Sub-skills: PCCL, portfolio, legal, fraud, valuation, etc. |
| `.cursor/skills/README.md` | Skill index and typical workflow |
| `.cursor/skills/SKILL-CATEGORIES.md` | Category map |
| `.cursor/portfolio/holdings.md` | **Your portfolio** — qty, avg cost, framework notes |
| `.cursor/portfolio/README.md` | How to update holdings after trades |
| `.cursor/prompts/MORNING-RUN-PROMPT.html` | **Daily prompts in browser** — tabs + Copy (open this, not markdown preview) |
| `.cursor/prompts/MORNING-RUN-PROMPT.md` | Markdown source for prompts |
| `.cursor/prompts/MORNING-FRAMEWORK-SEQUENCE.md` | Ordered phases + component registry (maintain when framework grows) |
| `StockBook/` | **Stock reports** — summary, detail, approach, FAQ, HTML (persistent) |
| `StockBook/AGENT-RULES.md` | Agent must read StockBook before re-analyzing a stock |

You do **not** need one combined mega-prompt file. Rules + skills **are** the prompt system.

---

## What transfers vs what does not

| Transfers with folder | Does **not** transfer |
|----------------------|------------------------|
| All rules and skills | Old chat history |
| `holdings.md` and portfolio notes | Agent memory from previous account |
| Skill templates and checklists | Global **User Rules** in Cursor Settings (copy manually if you use them) |
| This `SETUP.md` | MCP plugins (re-enable if needed) |

After migration, **re-state personal preferences once** in chat if they are not in `holdings.md`, for example:

- **Long-term wealth builder** — no trim/sell/replace except existential business threat (see `long-term-investor-mandate.md`)
- Wealth creation vs profit-booking (e.g. Max Healthcare: add via salary DCA, no trim)
- Monthly investable surplus for DCA plans
- Names you want excluded or capped

Then ask the agent to **update `holdings.md` framework notes** so future chats pick them up.

---

## Daily usage

### Morning framework (recommended — 08:00 IST)

Double-click [`.cursor/prompts/MORNING-RUN-PROMPT.html`](.cursor/prompts/MORNING-RUN-PROMPT.html) — or **auto on login:** [`.cursor/prompts/AUTOMATION.md`](.cursor/prompts/AUTOMATION.md).  
Post-close trading days: **Variant B** (~21:00). Saturday: **Variant C** (weekly deep).

### Stock analysis

```
Analyze [TICKER] using my India stock framework — full report with PCCL and action.
```

### Portfolio review

```
Read holdings.md and quadrant-map.md; run a portfolio review with current CMP.
```

### Refresh quadrant map

```
Refresh portfolio quadrant map — read holdings.md, live CMP today.
```

### After a trade

Tell the agent:

```
Update portfolio: bought [TICKER] [qty] @ [price]
```

Or edit `.cursor/portfolio/holdings.md` directly and add a line to the change log.

### Compare two stocks

```
Compare [TICKER A] vs [TICKER B] for fresh capital — comparative scorecard and rank.
```

---

## Recommended: back up with git

```bash
cd path/to/My-agent
git init
git add .
git commit -m "India stock agent framework + portfolio"
```

Push to GitHub, GitLab, or a private remote. On the new machine:

```bash
git clone <your-repo-url>
```

Then open the cloned folder in Cursor.

**Do not commit** secrets (`.env`, API keys, broker passwords).

---

## Optional: global User Rules on personal account

If you had **account-level** User Rules on your old Cursor key, copy anything investment-related into either:

1. A short note in `holdings.md` (portfolio-specific), or  
2. An additional project rule under `.cursor/rules/` (framework-wide)

Project rules travel with the folder; global User Rules do not.

---

## Framework highlights (reminder)

The agent should always:

- Run **exclusion guards** before any fresh BUY (penny, heavy debt, persistent loss)
- Separate **MoS vs IV** from **Premium to PCCL**
- Use **dual lens** for existing holders (scale-in + size caps vs fresh capital)
- Run **price-decline analysis** when a stock is down ≥15% from peak before averaging
- **Live-search** fraud/governance for banks and flagged names
- Read **`holdings.md` first** for portfolio questions — never invent qty/cost
- Label conclusions: **FACT** | **MANAGEMENT CLAIM** | **HYPOTHESIS** | **OUR ASSUMPTION** | **UNVERIFIED**

Full detail: `.cursor/rules/stock-agent.mdc`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent ignores PCCL / portfolio rules | Confirm folder opened is `My-agent` root (contains `.cursor/`) |
| Agent does not know holdings | Say explicitly: *"Read .cursor/portfolio/holdings.md first"* |
| Skills not used | Name the task: *"Use stock-analysis skill"* or *"Run PCCL analysis"* |
| Stale portfolio | Update `holdings.md` after every confirmed trade |
| Wrong quantities | User message / broker statement wins; update file + change log |

---

## Key links (inside this repo)

- [Master rule](.cursor/rules/stock-agent.mdc)
- [Skills index](.cursor/skills/README.md)
- [Holdings](.cursor/portfolio/holdings.md)
- [Quadrant map](.cursor/portfolio/quadrant-map.md) — capital vs gain; refresh after trades
- [Portfolio README](.cursor/portfolio/README.md)
- [Salary DCA](.cursor/skills/portfolio-analysis/salary-systematic-accumulation.md)
- [Long-term investor mandate](.cursor/skills/portfolio-analysis/long-term-investor-mandate.md)
- [Premium add sizing](.cursor/skills/pccl-analysis/premium-add-sizing.md)

---

*Last updated: 2026-08-22 — for migration to personal Cursor key.*
