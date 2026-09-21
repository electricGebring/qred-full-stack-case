# Qred Full-Stack Case Study
## Strategy, collaboration, and implementation

### Slide 1: The challenge

- API decisions happen too late.
- Product requirements do not always contain enough technical detail.
- Frontend work is blocked while waiting for backend APIs.
- Teams need a reliable way to work in parallel.

**Talk track:** The main problem is not only implementation speed. It is that uncertainty is discovered too late, when changes are more expensive.

### Slide 2: Start with a shared API contract

- Turn product requirements into an API contract early.
- For this demo, the contract is represented by TypeScript types, Express routes, and README documentation.
- In a larger team, I would formalize the same contract with OpenAPI if that matched the team's tooling.
- Review the contract together with Product, Frontend, and Backend.
- Treat the contract as a versioned artifact in the repository.

**Example:** `GET /api/dashboard?companyId={id}` defines the data needed by the mobile view before the database implementation is finished.

### Slide 3: Enable parallel work

1. Product and engineering agree on user flow and acceptance criteria.
2. Frontend and backend agree on the API contract.
3. Frontend can start with agreed example data while backend is implemented.
4. Frontend builds against the mock while backend builds the real implementation.
5. Add contract tests when the API becomes shared by multiple teams.
6. Integration happens continuously in CI.

**Result:** Frontend is not blocked by backend implementation timing.

### Slide 4: Support Product Managers

Use a lightweight technical specification template:

- User goal and acceptance criteria
- Data needed by the screen
- API operations and example payloads
- Loading, empty, and error states
- Permissions and security assumptions
- Analytics and non-functional requirements

A Full-Stack Developer can join refinement sessions, ask clarifying questions, and turn ambiguous requirements into testable examples.

### Slide 5: Quality and delivery speed

- Keep API types close to the contract and add focused endpoint tests.
- Introduce generated clients or contract tests when the API grows or is shared by multiple teams.
- Validate request parameters at the API boundary.
- Use structured logging and meaningful HTTP status codes.
- Keep database migrations and seed data reproducible.
- Review small pull requests early instead of integrating large changes late.

Speed comes from reducing rework, not from skipping design or testing.

### Slide 6: How this case implementation reflects the approach

- React consumes an Express API instead of embedding dashboard data.
- The frontend loads companies and requests a dashboard by selected `companyId`.
- SQLite models companies, cards, and transactions separately.
- The API returns only the data needed by the mobile view.
- Loading and error states are represented in the frontend.
- The project includes local setup and API documentation in `README.md`.

### Slide 7: Qred values and next steps

**Transparency**

- Shared contracts, visible assumptions, documented trade-offs, and clear error responses.

**Innovation**

- Mock-first development and reusable API patterns. OpenAPI and automated contract checks are possible next steps, not part of this demo.

**Passion**

- Close collaboration, attention to the user experience, and continuous improvement.

**With more time:** authentication and authorization, schema validation, migrations, pagination, automated API tests, observability, and production deployment.

### Demo flow

1. Start the Express API and React client.
2. Show the mobile dashboard.
3. Select another company from the dropdown.
4. Show that the API request contains the selected `companyId`.
5. Demonstrate missing and unknown `companyId` responses.
6. Explain how the same API contract enabled frontend and backend work in parallel.
