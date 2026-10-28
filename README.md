# custompc

**Português** · [English](#english)

Monte seu PC com **preços em reais**, links para **lojas brasileiras** e
**verificação de compatibilidade** entre as peças.

> 🚧 Em construção — Fase 1 (MVP) em andamento.

## Por que o foco no Brasil

Os montadores de PC mais conhecidos mostram preços em dólar e lojas dos EUA.
Quem monta um PC no Brasil precisa comparar preços em reais entre Amazon,
Mercado Livre, KaBuM!, Pichau, Terabyte e outras lojas — e ainda conferir se
as peças funcionam juntas. O custompc junta as duas coisas.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · PostgreSQL ·
Prisma · Zod · Auth.js · Vitest · Playwright · GitHub Actions · Vercel

## Como rodar localmente

Requisitos: Node.js 24 e npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Abra http://localhost:3000.

## Scripts

| Comando             | O que faz                       |
| ------------------- | ------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento     |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | Checagem de tipos do TypeScript |
| `npm test`          | Testes unitários (Vitest)       |
| `npm run format`    | Formata o código com Prettier   |

## Roadmap

- **Fase 1 — MVP:** catálogo de peças, montador de build, verificação de
  compatibilidade e ofertas por loja (dados de exemplo).
- **Fase 2:** cadastro e login, builds e peças favoritas salvas, compartilhar
  build por link.
- **Fase 3:** sugestões por custo, performance e popularidade; histórico de
  preços.
- **Futuro:** monetização com links de afiliados e outras fontes de receita.

## Licença

[MIT](LICENSE)

---

## English

Build your PC with **prices in Brazilian reais (R$)**, links to **Brazilian
stores** and **compatibility checks** between parts.

> 🚧 Work in progress — Phase 1 (MVP) under way.

### Why Brazil

Well-known PC builders show prices in US dollars and US stores. People building
a PC in Brazil need to compare prices in reais across Amazon, Mercado Livre,
KaBuM!, Pichau, Terabyte and other stores, and still check that the parts work
together. custompc does both.

### Running locally

Requirements: Node.js 24 and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. See the scripts table above.

### License

[MIT](LICENSE)
