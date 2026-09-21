import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DashboardResponse } from "./dashboard.js";

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

const company = database
  .prepare("SELECT id FROM companies WHERE id = ?")
  .get("company-ab");

if (!company) {
  database.prepare(`
    INSERT INTO companies (id, name, spending_limit, remaining_transaction_count)
    VALUES (?, ?, ?, ?)
  `).run("company-ab", "Company AB", 10000, 54);

  database.prepare(`
    INSERT INTO cards (id, company_id, status, invoice_due)
    VALUES (?, ?, ?, ?)
  `).run("card-ab", "company-ab", "active", "2026-09-30");

  const addTransaction = database.prepare(`
    INSERT INTO transactions (id, company_id, description, amount, currency, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seedTransactions = database.transaction(() => {
    addTransaction.run("transaction-1", "company-ab", "Office supplies", 1250, "SEK", "2026-09-17");
    addTransaction.run("transaction-2", "company-ab", "Travel booking", 2300, "SEK", "2026-09-15");
    addTransaction.run("transaction-3", "company-ab", "Software subscription", 1850, "SEK", "2026-09-12");
  });

  seedTransactions();
}

const secondCompany = database
  .prepare("SELECT id FROM companies WHERE id = ?")
  .get("company-nordic");

if (!secondCompany) {
  database.prepare(`
    INSERT INTO companies (id, name, spending_limit, remaining_transaction_count)
    VALUES (?, ?, ?, ?)
  `).run("company-nordic", "Nordic AB", 15000, 27);

  database.prepare(`
    INSERT INTO cards (id, company_id, status, invoice_due)
    VALUES (?, ?, ?, ?)
  `).run("card-nordic", "company-nordic", "inactive", "2026-10-05");

  const addSecondCompanyTransaction = database.prepare(`
    INSERT INTO transactions (id, company_id, description, amount, currency, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seedSecondCompanyTransactions = database.transaction(() => {
    addSecondCompanyTransaction.run("transaction-4", "company-nordic", "Client dinner", 3200, "SEK", "2026-09-18");
    addSecondCompanyTransaction.run("transaction-5", "company-nordic", "Equipment rental", 2500, "SEK", "2026-09-16");
  });

  seedSecondCompanyTransactions();
}

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

  const transactions = database.prepare(`
    SELECT id, description, amount, currency, occurred_at
    FROM transactions WHERE company_id = ?
    ORDER BY occurred_at DESC
  `).all(company.id) as TransactionRow[];

  return {
    company: { id: company.id, name: company.name },
    card: { status: card.status, invoiceDue: card.invoice_due },
    spending: {
      used: transactions.reduce((total, transaction) => total + transaction.amount, 0),
      limit: company.spending_limit,
      currency: "SEK"
    },
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      occurredAt: transaction.occurred_at
    })),
    remainingTransactionCount: company.remaining_transaction_count
  };
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