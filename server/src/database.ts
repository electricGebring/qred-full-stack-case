import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DashboardResponse, Transaction, TransactionsPage } from "./dashboard.js";

const transactionPageSize = 2;

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const databasePath = join(serverDirectory, "..", "data", "qred.db");

mkdirSync(dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma("journal_mode = WAL");

database.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    spending_limit INTEGER NOT NULL,
    remaining_transaction_count INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    invoice_due TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
`);

const companySeeds = [
  { id: "company-ab", name: "Company AB", spendingLimit: 10000 },
  { id: "company-nordic", name: "Nordic AB", spendingLimit: 15000 }
];

for (const companySeed of companySeeds) {
  const company = database
    .prepare("SELECT id FROM companies WHERE id = ?")
    .get(companySeed.id);

  if (!company) {
    database.prepare(`
      INSERT INTO companies (id, name, spending_limit, remaining_transaction_count)
      VALUES (?, ?, ?, ?)
    `).run(companySeed.id, companySeed.name, companySeed.spendingLimit, 0);
  }
}

const cardSeeds = [
  { id: "card-ab", companyId: "company-ab", status: "active", invoiceDue: "2026-09-30" },
  { id: "card-nordic", companyId: "company-nordic", status: "inactive", invoiceDue: "2026-10-05" }
];

for (const cardSeed of cardSeeds) {
  const card = database
    .prepare("SELECT id FROM cards WHERE id = ?")
    .get(cardSeed.id);

  if (!card) {
    database.prepare(`
      INSERT INTO cards (id, company_id, status, invoice_due)
      VALUES (?, ?, ?, ?)
    `).run(cardSeed.id, cardSeed.companyId, cardSeed.status, cardSeed.invoiceDue);
  }
}

const transactionSeeds = {
  "company-ab": [
    { id: "transaction-1", description: "Office supplies", amount: 1250, occurredAt: "2026-09-17" },
    { id: "transaction-2", description: "Travel booking", amount: 2300, occurredAt: "2026-09-15" },
    { id: "transaction-3", description: "Software subscription", amount: 1850, occurredAt: "2026-09-12" },
    { id: "transaction-4", description: "Marketing campaign", amount: 3100, occurredAt: "2026-09-10" },
    { id: "transaction-5", description: "Hardware refresh", amount: 4200, occurredAt: "2026-09-08" }
  ],
  "company-nordic": [
    { id: "transaction-6", description: "Client dinner", amount: 3200, occurredAt: "2026-09-18" },
    { id: "transaction-7", description: "Equipment rental", amount: 2500, occurredAt: "2026-09-16" },
    { id: "transaction-8", description: "Staff onboarding", amount: 1950, occurredAt: "2026-09-14" },
    { id: "transaction-9", description: "Cloud hosting", amount: 1350, occurredAt: "2026-09-11" },
    { id: "transaction-10", description: "Insurance premium", amount: 3700, occurredAt: "2026-09-09" },
    { id: "transaction-11", description: "Taxi to client meeting", amount: 180, occurredAt: "2026-09-08" },
    { id: "transaction-12", description: "Office supplies", amount: 250, occurredAt: "2026-09-07" },
    { id: "transaction-13", description: "Parking", amount: 120, occurredAt: "2026-09-06" },
    { id: "transaction-14", description: "Software add-on", amount: 300, occurredAt: "2026-09-05" },
    { id: "transaction-15", description: "Team lunch", amount: 150, occurredAt: "2026-09-04" }
  ]
};

const addTransaction = database.prepare(`
  INSERT INTO transactions (id, company_id, description, amount, currency, occurred_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

database.prepare("DELETE FROM transactions").run();

for (const [companyId, seeds] of Object.entries(transactionSeeds)) {
  for (const seed of seeds) {
    addTransaction.run(seed.id, companyId, seed.description, seed.amount, "SEK", seed.occurredAt);
  }
}

const updateRemainingTransactionCount = database.prepare(`
  UPDATE companies
  SET remaining_transaction_count = MAX(
    (SELECT COUNT(*) FROM transactions WHERE company_id = companies.id) - ?,
    0
  )
`);

updateRemainingTransactionCount.run(transactionPageSize);

type CompanyRow = {
  id: string;
  name: string;
  spending_limit: number;
  remaining_transaction_count: number;
};

export type CompanySummary = {
  id: string;
  name: string;
};

type CardRow = {
  status: "active" | "inactive";
  invoice_due: string;
};

type TransactionRow = {
  id: string;
  description: string;
  amount: number;
  currency: "SEK";
  occurred_at: string;
};

function readTransactionPage(companyId: string, offset: number): TransactionsPage {
  const rows = database.prepare(`
    SELECT id, description, amount, currency, occurred_at
    FROM transactions WHERE company_id = ?
    ORDER BY occurred_at DESC
    LIMIT ? OFFSET ?
  `).all(companyId, transactionPageSize, offset) as TransactionRow[];
  const result = database.prepare(`
    SELECT COUNT(*) AS total
    FROM transactions WHERE company_id = ?
  `).get(companyId) as { total: number };

  const transactions: Transaction[] = rows.map((transaction) => ({
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    currency: transaction.currency,
    occurredAt: transaction.occurred_at
  }));

  return {
    transactions,
    remainingTransactionCount: Math.max(result.total - offset - transactions.length, 0)
  };
}

export function getCompanies(): CompanySummary[] {
  return database
    .prepare("SELECT id, name FROM companies ORDER BY name")
    .all() as CompanySummary[];
}

export function getDashboard(companyId: string): DashboardResponse {
  const company = database.prepare(`
    SELECT id, name, spending_limit, remaining_transaction_count
    FROM companies WHERE id = ?
  `).get(companyId) as CompanyRow | undefined;

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  const card = database.prepare(`
    SELECT status, invoice_due FROM cards WHERE company_id = ?
  `).get(company.id) as CardRow;

  const transactionPage = readTransactionPage(company.id, 0);
  const spending = database.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS used
    FROM transactions WHERE company_id = ?
  `).get(company.id) as { used: number };

  return {
    company: { id: company.id, name: company.name },
    card: { status: card.status, invoiceDue: card.invoice_due },
    spending: {
      used: spending.used,
      limit: company.spending_limit,
      currency: "SEK"
    },
    transactions: transactionPage.transactions,
    remainingTransactionCount: transactionPage.remainingTransactionCount
  };
}

export function getTransactions(companyId: string, offset: number): TransactionsPage {
  const company = database
    .prepare("SELECT id FROM companies WHERE id = ?")
    .get(companyId);

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  return readTransactionPage(companyId, offset);
}

export function activateCard(companyId: string): void {
  const result = database.prepare(`
    UPDATE cards
    SET status = 'active'
    WHERE company_id = ?
  `).run(companyId);

  if (result.changes === 0) {
    throw new Error(`Card not found for company: ${companyId}`);
  }
}

export function deactivateCard(companyId: string): void {
  const result = database.prepare(`
    UPDATE cards
    SET status = 'inactive'
    WHERE company_id = ?
  `).run(companyId);

  if (result.changes === 0) {
    throw new Error(`Card not found for company: ${companyId}`);
  }
}