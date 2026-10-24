# Aplikacja kadrowa i obieg dokumentów: założenia techniczne

## Stack

- **Frontend:** Next.js (App Router), Tailwind, shadcn/ui
- **Backend:** NestJS
- **ORM / baza:** Prisma + PostgreSQL
- **Monorepo:** pnpm workspaces lub Turborepo

```
apps/web          # Next.js
apps/api          # NestJS
packages/shared   # wspólne typy, schematy zod, enumy statusów
```

## Backend (NestJS)

- **Prisma:** `PrismaService` w osobnym module, migracje przez `prisma migrate`
- **Auth:** `@nestjs/passport` + JWT (access + refresh w ciasteczkach httpOnly), hasła przez `argon2`
- **Uprawnienia:** guardy NestJS + `CASL` (np. kierownik widzi wnioski swojego zespołu, kadry widzą wszystko)
- **Walidacja:** `zod` współdzielony z frontem (alternatywa: `class-validator`)
- **Workflow akceptacji:** pole `status` + tabela przejść + serwis pilnujący uprawnień; `XState` dopiero przy rozroście
- **Historia zmian:** tabela `AuditLog` (serwisy lub Prisma Client extensions)
- **Zadania w tle i powiadomienia:** `@nestjs/bullmq` (Redis) + `nodemailer`
- **Pliki:** `multer` lokalnie, docelowo S3/MinIO (`@aws-sdk/client-s3`)
- **PDF:** Puppeteer (HTML do PDF) lub `pdf-lib` / `pdfmake`
- **Dokumentacja API:** `@nestjs/swagger` + `orval` lub `openapi-typescript` do generowania klienta

## Frontend (Next.js)

- **TanStack Query:** dane z API
- **React Hook Form + zod:** formularze
- **TanStack Table:** listy pracowników i wniosków
- Logika biznesowa zostaje w NestJS, nie w Server Actions

## Infrastruktura lokalna

Docker Compose: PostgreSQL, Redis, opcjonalnie MinIO, Mailpit (podgląd maili).

## Plan prac

1. Schemat Prisma: `User`, `Employee`, `Department`, `Role`, `Document`, `DocumentVersion`, `Request`, `Approval`, `AuditLog`
2. Logowanie + role + CASL
3. Jeden pełny przepływ end-to-end, np. wniosek urlopowy: złożenie → akceptacja kierownika → zatwierdzenie kadr → PDF → powiadomienie
4. Kolejne typy dokumentów na wzorcu z kroku 3