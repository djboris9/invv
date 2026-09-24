# Invv — Electronic Parts Inventory

> This is a personal quick-and-dirty application. Use at your own risk.

A web/mobile inventory application for managing electronic component parts with QR code scanning, using [PocketBase](https://pocketbase.io/) as the backend.

## Quickstart

### Prerequisites

- Node.js 18+
- [PocketBase](https://pocketbase.io/docs/) binary available in the PATH

### Run

```bash
cd frontend && npm install && cd ..
./dev.sh
```

This starts:
- **PocketBase** at http://127.0.0.1:8090 (API + Admin Dashboard)
- **Vite dev server** at http://127.0.0.1:5173 (frontend, proxies `/api` to PB)

### Login

Open http://127.0.0.1:5173 and log in with a user's email and password.

### Admin dashboard

Open http://127.0.0.1:8090/_/ and log in with the superuser credentials (`admin@example.com` / `changethis` by default).

Use the dashboard to create users under **Collections → users → New record**. Each user needs an email and password, which you use to log into the frontend.

## Printing labels

Container labels can be printed directly to a ZPL-compatible label printer (e.g. Zebra) over TCP port 9100.

### Configuration

Set these environment variables when starting PocketBase:

| Variable | Required | Default | Description |
|---|---|---|---|
| `INVV_PRINTER_HOST` | Yes | — | Printer IP or hostname |
| `INVV_PRINTER_PORT` | No | `9100` | Printer TCP port |
| `INVV_SOCKS_PROXY` | No | — | SOCKS5 proxy in `host:port` format |

### System dependencies

The print endpoint relies on system tools installed on the PocketBase host:

| Tool | Required for | Install |
|---|---|---|
| `nc` (netcat) | Direct printing | Built-in on Linux/macOS (`netcat-openbsd` on Alpine/Debian) |
| `socat` | SOCKS proxy printing | `apt install socat` / `apk add socat` / `brew install socat` |

### How it works

1. Open a container's label dialog and click **Print**
2. The frontend sends the ZPL to `POST /api/invv/print`
3. If `INVV_SOCKS_PROXY` is set, the ZPL is sent through the SOCKS5 proxy via `socat`
4. Otherwise, the ZPL is sent directly via `nc -N <host> 9100`
