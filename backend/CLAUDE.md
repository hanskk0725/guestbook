# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Backend (Spring Boot)
```bash
./gradlew build          # Build the project
./gradlew bootRun        # Run the application (port 8080)
./gradlew test           # Run all tests
./gradlew test --tests "com.likelion.guestbook.GuestbookApplicationTests"  # Single test
./gradlew clean build    # Clean build
```

### Frontend (Next.js)
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Run dev server (port 3000)
npm run build            # Build for production
```

### Docker
```bash
docker-compose up --build       # Build and run all services
docker-compose up -d --build    # Run in background
docker-compose down             # Stop all services
docker-compose down -v          # Stop and remove volumes
docker-compose logs -f          # Follow logs
```

## Architecture

Full-stack guestbook application with Spring Boot 4.0 backend and Next.js 16 frontend.

### Backend Tech Stack
- Spring Boot 4.0 with Spring MVC (REST API)
- Spring Data JPA with MySQL
- Spring Security (CORS configured for localhost:3000)
- Lombok for boilerplate reduction

### Backend Package Structure
- `com.likelion.guestbook` - Main application class
- `com.likelion.guestbook.domain` - JPA entities
- `com.likelion.guestbook.repository` - Spring Data JPA repositories
- `com.likelion.guestbook.controller` - REST controllers
- `com.likelion.guestbook.config` - Security and CORS configuration

### Frontend Tech Stack
- Next.js 16 with App Router
- React 19
- Tailwind CSS v4 (uses `@tailwindcss/postcss` plugin)

### API Endpoints
- `GET /api/guestbook` - List all entries
- `POST /api/guestbook` - Create new entry

### Database
- MySQL on port 3307 (not default 3306)
- Database name: `guestbook`
- JPA ddl-auto is set to `create` (drops and recreates tables on startup)
