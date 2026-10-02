# Dev tenant — web MVP test user

**Purpose:** Isolated user data for web app development. **Not** your live Cursor portfolio.

| Path | Content |
|------|---------|
| `portfolio/holdings.md` | Sample holdings (3 stocks for API tests) |
| `stockbook/` | Web agent write-back during dev |
| `news/ticker-index.md` | Per-user news links (stub) |

**Do not** point the web app at repo root `StockBook/` or `.cursor/portfolio/holdings.md` until you explicitly enable single-user mode.

Copy a stock folder from `StockBook/` here for richer analyze tests:

```powershell
Copy-Item -Recurse "StockBook\Auto\Maruti Suzuki" "data\users\dev\stockbook\Auto\Maruti Suzuki"
```
