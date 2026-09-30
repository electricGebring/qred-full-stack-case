# Qred Full-Stack Case

A small full-stack dashboard demo based on the mobile view in the case study.

## Stack

- React and Vite for the frontend
- Node.js, Express, and TypeScript for the API
- SQLite via `better-sqlite3` for local persistence

## Run locally

From the project root, install dependencies once:

```bash
npm install
```

Start the API in one terminal:

```bash
npm run dev --workspace server
```

Start the frontend in a second terminal:

```bash
npm run dev --workspace client
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Run the backend API tests from the project root:

```bash
npm test --workspace server
```

The tests cover the company list, dashboard validation, paginated transactions, and card status actions.

## API

### `GET /api/health`

Returns a simple service health response.

### `GET /api/companies`

Returns the companies available to the current user/demo session.

### `GET /api/dashboard?companyId=company-ab`

Returns the company, card, spending, and first page of transaction data needed by the dashboard.

The API returns `400` when `companyId` is missing and `404` when the company does not exist.

### `GET /api/companies/:companyId/transactions?offset=2`

Returns the next page of transactions and the number still available. Pages contain two transactions; `offset` must be a non-negative integer.

### Card status actions

```text
POST /api/cards/:companyId/activate
POST /api/cards/:companyId/deactivate
```

## Data model

- `companies` stores company identity, spending limit, and remaining transaction count.
- `cards` belongs to a company and stores status and invoice due date.
- `transactions` belongs to a company and stores amount, currency, description, and date.

The local SQLite database is created automatically at `server/data/qred.db`. It is ignored by Git. Demo company and card records are inserted only when missing. Transaction rows are cleared and reseeded each time the API starts, and the remaining transaction counts are recalculated then.

## Design decisions

The frontend and backend communicate through an explicit API contract. The frontend first loads the company list, then requests the dashboard for the selected `companyId`. This lets both workstreams proceed independently and avoids coupling the UI to a single hardcoded company at runtime.

The seed values are demo fixtures, not production configuration. In a real system, company and transaction data would come from an authenticated data source or an admin workflow.

## Further work

With more time, I would add authentication and authorization, schema validation, database migrations, pagination for transactions, and a production deployment configuration. The support action would connect to a real support workflow.
