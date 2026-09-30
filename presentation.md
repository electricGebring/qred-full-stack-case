# Qred Full-Stack Case Study
## A simple approach to collaboration and delivery

### 1. The problem

Qred's teams experience three main problems:

- The API is sometimes decided too late.
- Product requirements can be unclear technically.
- Frontend work can be blocked while waiting for backend work.

My goal would be to make the expected data and user flow clear early.

### 2. Agree on the API early

Before implementation, Product, Frontend, and Backend should agree on:

- What the user should be able to do
- What data the screen needs
- What the API response should look like
- What happens while loading or when something fails

In this demo, that agreement is represented by the dashboard contract, the Express routes, and the TypeScript models.

For a larger team, I would document and version the contract with OpenAPI/Swagger so Frontend and Backend can work from the same specification.

That gives Frontend a predictable contract while the backend is being built and avoids late surprises.

### 3. How teams can work in parallel

1. Product explains the user goal and expected result.
2. Frontend and Backend agree on a small API response.
3. As a team workflow, Frontend can use mock data or a mock server while Backend builds the real integration.
4. Both teams show their work early and adjust together.

This reduces waiting and makes misunderstandings visible sooner.

### 4. How I would support Product Managers

I would help turn a product idea into concrete questions:

- What should happen when there is no data?
- What should happen when the API fails?
- Which user is allowed to see or change the data?
- What should each button do?
- Which fields are required?

For this case, these questions helped define the company selector, card status, spending information, transactions, and error states.

### 5. What I built

- A React mobile dashboard
- An Express API with a simple typed contract
- A SQLite database with companies, cards, and transactions
- A company selector with two demo companies
- Card activation and refresh of the dashboard state
- Paginated transaction list with a load-more action
- Loading and error handling
- API tests for the main happy-path and invalid cases

Demo flow:

1. Start the API and frontend.
2. Show the dashboard for `Nordic AB`.
3. Activate the inactive card.
4. Open the menu and show the support link.
5. Load the next page of transactions.
6. Explain that the API contract was agreed before implementation.

### Values and limitations

**Transparency:** I kept the API contract explicit in TypeScript and documented key API responses in the README. The UI implements basic loading and error feedback.

**Innovation:** I used a small working prototype with seeded data and paginated transactions to make the user flow concrete and testable.

**Passion:** I wanted the main dashboard flow to work end to end, from loading the data to activating a card and viewing transactions.

With more time, I would add authentication, stronger validation, database migrations, a production deployment setup, and real integration to Qred services.
