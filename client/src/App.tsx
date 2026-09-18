import { useEffect, useState } from "react";
import "./styles.css";

type Dashboard = {
  company: { name: string };
  card: { status: "active" | "inactive"; invoiceDue: string };
  spending: { used: number; limit: number; currency: "SEK" };
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    currency: "SEK";
    occurredAt: string;
  }>;
  remainingTransactionCount: number;
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency }).format(amount);

function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard")
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte hämta dashboard-data.");
        return response.json() as Promise<Dashboard>;
      })
      .then(setDashboard)
      .catch(() => setError("Kunde inte hämta dashboard-data."));
  }, []);

  if (error) return <main className="status">{error}</main>;
  if (!dashboard) return <main className="status">Laddar dashboard...</main>;

  const spendingPercentage = Math.round(
    (dashboard.spending.used / dashboard.spending.limit) * 100
  );

  return (
    <main className="phone-shell">
      <header className="topbar">
        <strong className="brand">qred<span>.</span></strong>
        <button className="menu-button" type="button">Meny</button>
      </header>

      <label className="company-picker">
        <span className="sr-only">Välj företag</span>
        <select defaultValue={dashboard.company.name}>
          <option>{dashboard.company.name}</option>
        </select>
      </label>

      <button className="invoice-card" type="button">
        <span>Invoice due</span>
        <strong>{new Date(dashboard.card.invoiceDue).toLocaleDateString("sv-SE")}</strong>
        <span aria-hidden="true">›</span>
      </button>

      <section className="spending-card">
        <div className="section-heading">
          <h1>Remaining spend</h1>
          <span>{spendingPercentage}%</span>
        </div>
        <strong className="spending-total">
          {formatMoney(dashboard.spending.used, dashboard.spending.currency)} / {formatMoney(dashboard.spending.limit, dashboard.spending.currency)}
        </strong>
        <div className="progress-track"><span style={{ width: `${spendingPercentage}%` }} /></div>
        <p>based on your set limit</p>
      </section>

      <section className="transactions">
        <h2>Latest transactions</h2>
        {dashboard.transactions.map((transaction) => (
          <div className="transaction" key={transaction.id}>
            <span>{transaction.description}<small>{transaction.occurredAt}</small></span>
            <strong>{formatMoney(transaction.amount, transaction.currency)}</strong>
          </div>
        ))}
        <button className="more-button" type="button">
          {dashboard.remainingTransactionCount} more items in transaction view <span>›</span>
        </button>
      </section>

      <div className="actions">
        <button type="button">{dashboard.card.status === "active" ? "Card active" : "Activate card"}</button>
        <button type="button">Contact Qred&apos;s support</button>
      </div>
    </main>
  );
}

export default App;