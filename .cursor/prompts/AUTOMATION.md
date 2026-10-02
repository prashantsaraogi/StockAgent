# Morning Run — Automation (Windows)

**What can run automatically vs what cannot**

| Layer | Auto on login? | How |
|-------|----------------|-----|
| **Open HTML + copy prompt** | **Yes** | `Start-MorningRun.ps1` + Task Scheduler |
| **Phase 2 scripts** (CAGR, PARAMETERS) | **Optional** | `-RunNumbers` flag (~2–5 min) |
| **Full agent** (news, write-back, brief) | **No** — needs Cursor chat | Paste clipboard → Enter, or Cursor Automation |

The **HTML file does not run the framework** — it only holds prompts. The **agent** runs when you paste into Cursor (or via Cursor Automations below).

---

## One-time setup (recommended)

Open PowerShell:

```powershell
cd d:\D-Drive\Personal\My-agent\.cursor\prompts
.\Install-MorningRunTask.ps1
```

This creates task **`MyAgent-MorningRun`** — runs at **Windows logon**.

The script then:
1. Runs only **06:00–13:59** (local time — **set PC timezone to IST**)
2. Runs **once per day** (skip if already ran)
3. **Saturday** → copies **Variant C** (weekly); weekdays → **Variant A**
4. Opens **MORNING-RUN-PROMPT.html** in browser
5. **Copies prompt to clipboard** — you paste in Cursor (Ctrl+V)
6. Shows a **toast notification**

### Optional flags at install

```powershell
# Also run CAGR + PARAMETERS scripts each morning (no news)
.\Install-MorningRunTask.ps1 -WithNumbers

# Also open Cursor on My-agent folder
.\Install-MorningRunTask.ps1 -WithCursor

# Also schedule evening Variant B at 21:00 local
.\Install-MorningRunTask.ps1 -WithEvening

# Combine
.\Install-MorningRunTask.ps1 -WithNumbers -WithCursor -WithEvening
```

### Test without waiting for login

```powershell
.\Start-MorningRun.ps1 -Force
```

### Uninstall

```powershell
.\Install-MorningRunTask.ps1 -Uninstall
```

---

## Your morning flow (after automation)

```
Login (6–11 AM IST)
  → Toast: "Variant A copied"
  → Browser opens prompt page
  → Open Cursor → New chat → Ctrl+V → Enter
  → Agent runs full framework (news + brief)
```

**~30 seconds of your time** — no hunting for the prompt file.

---

## Tier 3 — Full agent without paste (Cursor Automations)

For **zero paste**, use **Cursor Automations** (scheduled cloud/local agent):

1. Cursor → **Automations** → **New automation**
2. **Trigger:** Cron — weekdays **08:30** (your IST; cron uses server/UTC — adjust)
3. **Prompt:** paste **Variant A** from `MORNING-RUN-PROMPT.md`
4. **Repo:** this `My-agent` folder (must be committed/pushed if cloud)

Limitations:
- Cloud agent needs repo on Cursor cloud
- News live-search needs network; verify Automations has web/tools enabled
- Review output in Automations run log

Ask in Cursor chat: *"Create a Cursor Automation for morning Variant A at 8:30 AM IST weekdays"* (Agents Window).

---

## Files

| File | Purpose |
|------|---------|
| `Start-MorningRun.ps1` | Launcher (morning) |
| `Start-EveningRun.ps1` | Launcher (Variant B, 20:00–23:59 weekdays) |
| `Install-MorningRunTask.ps1` | Register / remove scheduled tasks |
| `morning-run.log` | Run log (created on first run) |
| `.morning-run-last.txt` | Once-per-day guard |

**Timezone:** Windows should be **(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi** so 06:00–11:59 matches IST.

---

*Last updated: 29 Aug 2026*
