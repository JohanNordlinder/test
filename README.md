# Todo app — Spring Boot + Angular

A small Todo application: a Spring Boot 4 REST API (`backend/`, Java 21, JPA + in-memory H2)
with a web GUI built in Angular 22 (`frontend/`).

## Run it

Build the GUI into Spring Boot's static resources, then start the backend:

```bash
cd frontend && npm install && npm run build
```

```bash
cd backend && mvn spring-boot:run
```

Open http://localhost:8080.

For frontend development with live reload, run the backend as above and `npm start` in
`frontend/` (http://localhost:4200; `/api` is proxied to port 8080).

## REST API

| Method | Path              | Body                         |
|--------|-------------------|------------------------------|
| GET    | `/api/todos`      |                              |
| POST   | `/api/todos`      | `{"title": "..."}`           |
| PUT    | `/api/todos/{id}` | `{"title": "...", "done": true}` |
| DELETE | `/api/todos/{id}` |                              |

## Tests

```bash
cd backend && mvn test
```

```bash
cd frontend && npm test -- --watch=false
```

- Backend (JUnit 5): `@WebMvcTest` controller tests (validation, 404s), a `@DataJpaTest`
  repository test, and a `@SpringBootTest` full CRUD integration test.
- Frontend (Vitest): `TodoService` HTTP tests and `App` component tests (render, add, toggle,
  delete, error handling).
