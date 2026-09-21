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
- What the API request looks like
- What happens while loading or when something fails

For this demo, that agreement is represented by TypeScript types, Express routes, and the README.

The frontend then knows what data to expect while the backend is being built.

### 3. How teams can work in parallel

1. Product explains the user goal and expected result.
2. Frontend and Backend agree on a small API response.
3. Frontend can use example data while Backend connects the real database.
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
- An Express API
- A SQLite database with companies, cards, and transactions
- A company selector with two demo companies
- Card activation through the API
- Loading and error handling
- API tests for successful and invalid requests

Demo flow:

1. Start the API and frontend.
2. Show the dashboard.
3. Select `Nordic AB`.
4. Activate the inactive card.
5. Open the menu and the support link.
6. Show one successful API request and one error response.

### Values and limitations

**Transparency:** I documented assumptions and return clear API errors.

**Innovation:** I chose a small solution that can be extended without blocking frontend work.

**Passion:** I focused on a clear mobile experience and a complete working flow.

With more time, I would add authentication, more validation, pagination for transactions, and connect the actions to real Qred services.
