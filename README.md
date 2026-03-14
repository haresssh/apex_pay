# APEX PAY.

APEX PAY. is a full-stack, decoupled core banking application designed to handle secure wallet transactions. It features a robust Django/PostgreSQL backend utilizing atomic database locks for financial integrity, paired with a React frontend styled in a high-end, brutalist dark mode. 

![APEX PAY. Dashboard](./screenshots/Screenshot%202026-03-14%20at%205.45.23 PM.png)

## Tech Stack

**Frontend:**
* React 18
* Vite (HMR)
* Material UI (v6) with custom Brutalist CSS overrides
* Axios (for API communication and JWT interception)

**Backend:**
* Django & Django REST Framework (DRF)
* SimpleJWT (Stateless Authentication)
* PostgreSQL
* Docker & Docker Compose

**Asynchronous Processing:**
* Celery (Task Queue)
* Celery Beat (Periodic Task Scheduler)
* Redis (Message Broker & Cache)

## Key Features

* **Atomic Transactions:** Uses Django's `transaction.atomic()` and `select_for_update()` to lock database rows during transfers, ensuring zero race conditions or double-spending.
* **Stateless Auth:** Secure login flow using JWT (JSON Web Tokens) stored in local storage, automatically attached to outbound API requests via Axios interceptors.
* **Background Processing:** Fully integrated Celery and Redis stack to offload heavy operations (like email receipts) to background workers, while Celery Beat handles scheduled, periodic system tasks.
* **Brutalist Dark UI:** A strict, grid-based, high-contrast user interface inspired by modern agency design and high-end fintech platforms.
* **Decoupled Architecture:** The React frontend, Django API, database, and background workers run in completely isolated Docker containers, communicating strictly over their respective internal networks.

## Local Development Setup

This project is fully dockerized. You do not need Python or Node.js installed locally to run it.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/apex-pay.git
cd apex-pay
\`\`\`

### 2. Build and start the containers
\`\`\`bash
docker-compose up --build
\`\`\`
*This command orchestrates the entire stack: PostgreSQL, Redis, Django API, Celery Worker, Celery Beat, and the Vite React app.*

### 3. Run Database Migrations
Open a new terminal window while the containers are running:
\`\`\`bash
docker-compose exec backend python manage.py migrate
\`\`\`

### 4. Create a Superuser
You need an account to log into the frontend. Create one via the Django CLI:
\`\`\`bash
docker-compose exec backend python manage.py createsuperuser
\`\`\`
*(Once created, you can log into the Django Admin at `localhost:8000/admin` to manually create an `Account` for this user and fund it).*

### 5. Access the Application
* **Frontend UI:** http://localhost:5173
* **Backend API:** http://localhost:8000/api/

---

## API Reference

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/token/` | `POST` | No | Obtain JWT access and refresh tokens. |
| `/api/token/refresh/` | `POST` | No | Refresh an expired access token. |
| `/wallet/api/dashboard/` | `GET` | Yes | Fetch user balance and top 5 recent transactions. |
| `/wallet/api/transfer/` | `POST` | Yes | Securely transfer funds to another account number. |

## Future Roadmap
- Implement Plaid API for external bank funding.
- Add pagination and filtering to the transaction history table.
- Implement PDF generation for monthly statement downloads via Celery workers.
