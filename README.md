# 🧪 Desafio Técnico — Cadastro de Agricultor

Monorepo com **NestJS (API)** + **Next.js (Web)** + **MongoDB**, seguindo boas práticas de **MVC, DDD, SOLID e Clean Architecture** (camadas: domain, application, infra, presentation).
Inclui **Docker**, **ESLint**, **Prettier** e **Swagger**.

## 🚀 Stack
- **Backend**: NestJS + Mongoose + class-validator + Swagger
- **Frontend**: Next.js (App Router) + React Hook Form + Zod + Tailwind
- **DB**: MongoDB 6
- **Infra**: Docker Compose
- **Lint/Format**: ESLint + Prettier

## 📦 Como rodar (Docker)
Crie um `.env` na raiz usando o exemplo abaixo.

```bash
MONGO_INITDB_DATABASE=agri_registry

API_PORT=8080
MONGO_URI=mongodb://mongo:27017/agri_registry

NEXT_PUBLIC_API_URL=http://localhost:8080
WEB_PORT=3000
```
Depois

```bash
docker compose up --build
```
OU

## (sem Docker)
### Backend
```bash
cd backend
npm i
npm run start:dev
```
### Frontend
```bash
cd frontend
npm i
npm run dev
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/docs
- Web: http://localhost:3000

## 🧱 Arquitetura (visão geral)
```
agri-registry/
├─ backend/            # NestJS
│  ├─ src/
│  │  └─ farmers/      # Módulo de Agricultores
│  │     ├─ domain/    # Entidades, VOs, contratos
│  │     ├─ application/  # Casos de uso (service)
│  │     ├─ infra/     # Schemas e Repositório Mongo
│  │     └─ presentation/ # Controller + DTOs + Swagger
├─ frontend/           # Next.js (App Router)
│  ├─ app/             # Páginas e rotas
│  ├─ components/      # Tabela e Formulário
│  └─ lib/             # Cliente API
└─ docker-compose.yml
```

## ✅ Regras de Negócio implementadas
- **RN1**: Cadastro com `fullName`, `cpf (único, válido)`, `birthDate?`, `phone?`, `active=true` por default.
- **RN2**: CPF único (índice unique + checagem de conflito).
- **RN3**: Validação oficial de CPF (back + front).
- **RN4**: Edição não permite alterar `cpf`.
- **RN5**: Exclusão só é permitida se `active === false`.
- **RN6**: Listagem com filtros por `nome`, `cpf` e `status` + ações por linha (editar/excluir).

## 📜 API (Swagger)
Acesse **/docs** na API para ver os endpoints.
- `POST /farmers` (criar)
- `GET /farmers` (listar com filtros)
- `GET /farmers/:id`
- `PATCH /farmers/:id` (sem alterar cpf)
- `DELETE /farmers/:id` (exclui somente se `active=false`)

## 🧹 Lint / Format
```bash
# backend
cd backend
npm run lint && npm run format
```
```bash
# frontend
cd frontend
npm run lint && npm run format
```
