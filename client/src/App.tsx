import { useEffect, useState } from "react";
import "./styles.css";

type Dashboard = {
  company: { id: string; name: string };
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

type Company = {
  id: string;
  name: string;
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency }).format(amount);

function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isActivatingCard, setIsActivatingCard] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/companies")
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte hämta företag.");
        return response.json() as Promise<Company[]>;
      })
      .then((loadedCompanies) => {
        if (loadedCompanies.length === 0) throw new Error("Inga företag hittades.");
        setCompanies(loadedCompanies);
        setSelectedCompanyId(loadedCompanies[0].id);
      })
      .catch(() => setError("Kunde inte hämta företag."));
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;

    setError(null);
    setShowAllTransactions(false);
    setDashboard(null);
    fetch(`http://localhost:3000/api/dashboard?companyId=${encodeURIComponent(selectedCompanyId)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte hämta dashboard-data.");
        return response.json() as Promise<Dashboard>;
      })
      .then(setDashboard)
      .catch(() => setError("Kunde inte hämta dashboard-data."));
  }, [selectedCompanyId]);

  const activateCard = () => {
    if (!dashboard || dashboard.card.status === "active") return;

    setIsActivatingCard(true);
    fetch(`http://localhost:3000/api/cards/${encodeURIComponent(selectedCompanyId)}/activate`, {
      method: "POST"
    })
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte aktivera kortet.");
        return fetch(`http://localhost:3000/api/dashboard?companyId=${encodeURIComponent(selectedCompanyId)}`);
      })
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte uppdatera dashboard-data.");
        return response.json() as Promise<Dashboard>;
      })
      .then(setDashboard)
      .catch(() => setError("Kunde inte aktivera kortet."))
      .finally(() => setIsActivatingCard(false));
  };

  if (error) return <main className="status">{error}</main>;
  if (!dashboard) return <main className="status">Laddar dashboard...</main>;

  const remainingAmount = Math.max(dashboard.spending.limit - dashboard.spending.used, 0);
  const remainingPercentage = Math.round(
    (remainingAmount / dashboard.spending.limit) * 100
  );

  return (
    <main className="phone-shell">
      <header className="topbar">
        <strong className="brand">qred<span>.</span></strong>
        <button
          className="menu-button"
          type="button"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          Meny
        </button>
      </header>

      {isMenuOpen && (
        <nav className="menu-panel" aria-label="Main menu">
          <a href="#dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
          <a href="#transactions" onClick={() => setIsMenuOpen(false)}>Transactions</a>
          <a href="mailto:support@qred.com">Support</a>
        </nav>
      )}

      <label className="company-picker">
        <span className="sr-only">Välj företag</span>
        <select
          value={selectedCompanyId}
          onChange={(event) => setSelectedCompanyId(event.target.value)}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
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
          <span>{remainingPercentage}%</span>
        </div>
        <strong className="spending-total">
          {formatMoney(remainingAmount, dashboard.spending.currency)} / {formatMoney(dashboard.spending.limit, dashboard.spending.currency)}
        </strong>
        <div className="progress-track"><span style={{ width: `${remainingPercentage}%` }} /></div>
        <p>based on your set limit</p>
      </section>

      <section className="transactions" id="transactions">
        <h2>Latest transactions</h2>
        <p className="transaction-summary">{dashboard.remainingTransactionCount} more transactions available</p>
        {dashboard.transactions
          .slice(0, showAllTransactions ? dashboard.transactions.length : 2)
          .map((transaction) => (
          <div className="transaction" key={transaction.id}>
            <span>{transaction.description}<small>{transaction.occurredAt}</small></span>
            <strong>{formatMoney(transaction.amount, transaction.currency)}</strong>
          </div>
        ))}
        <button
          className="more-button"
          type="button"
          onClick={() => setShowAllTransactions((isShown) => !isShown)}
        >
          {showAllTransactions ? "Show fewer transactions" : "Show all loaded transactions"} <span>›</span>
        </button>
      </section>

      <div className="actions">
        <button
          type="button"
          onClick={activateCard}
          disabled={dashboard.card.status === "active" || isActivatingCard}
        >
          {isActivatingCard ? "Activating..." : dashboard.card.status === "active" ? "Card active" : "Activate card"}
        </button>
        <a className="action-link" href="mailto:support@qred.com">
          Contact Qred&apos;s support
        </a>
      </div>
    </main>
  );
}

export default App;