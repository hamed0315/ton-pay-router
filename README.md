# TON Pay Router

> ⚠️ **Archived Project** — This project was discontinued after TonKeeper introduced native multi-chain support, which made the original cross-chain routing approach obsolete.

A payment routing and settlement system for the TON blockchain, built in Go. Designed to route payments between multiple currencies (TON, USDT, USDC, BTC), handle merchant gateways, escrow via HTLC, and provide a Telegram Mini App for merchants.

---

## 🏗️ Architecture

cmd/api/              — Application entrypoint
internal/
  adapter/            — External integrations (Postgres, Redis, NATS, Omniston, Webhook)
  domain/             — Core business entities (Invoice, Payment, Merchant, Ledger, ...)
  handler/            — HTTP handlers (REST + WebSocket)
  service/            — Business logic
migrations/           — SQL migrations (Postgres)
proto/                — gRPC / protobuf definitions
web/miniapp/          — Telegram Mini App (React + TypeScript + Vite)
webapp/               — Supporting web assets
deployments/          — Deployment configs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Go 1.22+ |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Message Queue | NATS 2.10 |
| Auth | JWT + bcrypt |
| API | REST + WebSocket |
| Blockchain | TON, EVM (via Omniston) |
| Frontend | React, TypeScript, Vite |
| Containerization | Docker, Docker Compose |
| Escrow | HTLC (Hash Time-Locked Contracts) |

---

## ✨ Features

- 💸 Multi-currency payments — TON, USDT, USDC, BTC
- 🔀 Cross-chain routing via Omniston quote provider
- 🏦 Merchant gateway system with API keys
- 🔐 HTLC escrow for trustless settlement
- 📊 Ledger for accounting and reconciliation
- 🔔 Webhook notifications for payment events
- 🤖 Telegram Mini App for merchants
- 📈 Stats & analytics endpoints
- 🎫 Support ticket system
- 🌐 REST API + WebSocket for real-time updates

---

## 🚀 Quick Start

### Prerequisites

- Go 1.22+
- Docker & Docker Compose

### 1. Clone & Configure

git clone https://github.com/hamed0315/ton-pay-router.git
cd ton-pay-router
cp .env.example .env

### 2. Start Infrastructure

docker compose up -d

This starts PostgreSQL on localhost:5433, Redis on localhost:6380, and NATS on localhost:4222.

### 3. Run Migrations

psql postgres://user:pass@localhost:5433/tonpay -f migrations/001_init.sql

### 4. Run the API

go run ./cmd/api

API will be available at http://localhost:8080.

---

## 📡 API Overview

| Endpoint | Description |
|---|---|
| POST /auth/login | Merchant login |
| POST /invoices | Create invoice |
| GET /invoices | List invoices |
| POST /gateways | Create payment gateway |
| GET /stats | Dashboard stats |
| POST /support/tickets | Create support ticket |
| WS /ws | Real-time updates |
| GET /health | Health check |

---

## 🔐 Security Notes

- API keys are hashed (HMAC-SHA256) before storage
- Passwords hashed with bcrypt
- JWT-based authentication
- HTLC escrow for trustless atomic swaps
- Never commit .env — use .env.example as template
- Change JWT_SECRET in production
- HMAC secret is currently hardcoded — see internal/service/merchant.go (marked with TODO for future refactor)

---

## 🧪 Development

go test ./...
go build -o bin/api ./cmd/api

---

## 📦 Deployment

Docker deployment configs are in deployments/docker/.

docker build -f deployments/docker/Dockerfile -t ton-pay-router .
docker run -p 8080:8080 --env-file .env ton-pay-router

---

## 🤝 Contributing

This project is archived and not actively maintained. Feel free to fork and continue development.

---

## 📄 License

MIT License — see LICENSE for details.

---

## 👤 Author

Hamed Hasouedi
DevOps Engineer & Backend Go Developer
GitHub: @hamed0315
