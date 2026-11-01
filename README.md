# IT Equipment Tracker

A full-stack enterprise web application for managing company IT assets, tracking equipment checkouts, and handling scheduled reservations. Built with a modern 3-tier architecture, robust Role-Based Access Control (RBAC), and automated background processes.

## 🚀 Tech Stack

**Backend**
* Java 25 & Spring Boot 4.x
* Spring Security (JWT) & Spring Data JPA
* Hibernate & PostgreSQL (Aiven Cloud)
* Spring Boot Mail

**Frontend**
* React 19 & Vite
* React Router & Context API
* Axios (with request/response interceptors)

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Secure stateless authentication using JSON Web Tokens (JWT) with `ADMIN`, `MANAGER`, and `EMPLOYEE` clearance levels protecting both API endpoints and React routes.
* **Asset Management & Normalization:** Auto-generation of unique internal Asset Tags alongside optional manufacturer serial numbers (normalized to `NULL` for database uniqueness constraints).
* **Real-time Checkout System:** Dashboard visibility of equipment status, active checkouts, and current holders via optimized SQL fetch joins to prevent N+1 query problems.
* **Reservation Engine:** Overlap-preventing scheduling system utilizing pessimistic database row locks (`@LockModeType.PESSIMISTIC_WRITE`) for high-concurrency environments.
* **Automated Notifications:** Background `@Scheduled` cron jobs triggering automated email reminders via `JavaMailSender` 24 hours prior to reservation expiry.

## ⚙️ Local Setup

### Prerequisites
* Java 25 & Maven
* Node.js & npm
* PostgreSQL database
* Local SMTP server for testing (e.g., [Mailpit](https://github.com/axllent/mailpit))

### Backend Configuration
1. Navigate to the Spring Boot root directory.
2. Provide the following environment variables in your IDE or shell:
   * `DB_URL` (JDBC format, e.g., `jdbc:postgresql://...`)
   * `DB_USERNAME`
   * `DB_PASSWORD`
   * `JWT_SECRET` (Minimum 32 characters for HS256)
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Configuration
1. Navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the frontend project:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Notes
* Environment variables are excluded via `.gitignore`.
* Passwords are encrypted using `BCryptPasswordEncoder` before database persistence.
* Unauthenticated API calls return standard HTTP 401 Unauthorized responses handled globally by `RestControllerAdvice`.