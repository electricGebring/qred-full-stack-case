export type Transaction = {
  id: string;
  description: string;
  amount: number;
  currency: "SEK";
  occurredAt: string;
};

export type TransactionsPage = {
  transactions: Transaction[];
  remainingTransactionCount: number;
};

export type DashboardResponse = {
  company: {
    id: string;
    name: string;
  };
  card: {
    status: "active" | "inactive";
    invoiceDue: string;
  };
  spending: {
    used: number;
    limit: number;
    currency: "SEK";
  };
  transactions: Transaction[];
  remainingTransactionCount: number;
};

export const dashboard: DashboardResponse = {
  company: {
    id: "company-ab",
    name: "Company AB"
  },
  card: {
    status: "active",
    invoiceDue: "2026-09-30"
  },
  spending: {
    used: 5400,
    limit: 10000,
    currency: "SEK"
  },
  transactions: [
    {
      id: "transaction-1",
      description: "Office supplies",
      amount: 1250,
      currency: "SEK",
      occurredAt: "2026-09-17"
    },
    {
      id: "transaction-2",
      description: "Travel booking",
      amount: 2300,
      currency: "SEK",
      occurredAt: "2026-09-15"
    },
    {
      id: "transaction-3",
      description: "Software subscription",
      amount: 1850,
      currency: "SEK",
      occurredAt: "2026-09-12"
    }
  ],
  remainingTransactionCount: 54
};