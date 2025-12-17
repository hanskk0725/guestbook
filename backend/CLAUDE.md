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

---

## AWS EC2 프리티어 배포 가이드 (Ubuntu)

### 현재 배포 정보
- **EC2 IP**: 15.165.67.246
- **Frontend**: http://15.165.67.246:3000
- **Backend API**: http://15.165.67.246:8080/api/guestbook

---

### 1. EC2 인스턴스 생성

1. AWS Console 접속 → EC2 → "인스턴스 시작"
2. 설정:
   - **이름**: guestbook-server
   - **AMI**: Ubuntu 24.04 LTS (프리티어 eligible)
   - **인스턴스 유형**: t2.micro (프리티어)
   - **스토리지**: 30GB (프리티어 최대, 빌드 시 용량 필요)
   - **키 페어**: 새로 생성 또는 기존 키 선택

3. **보안 그룹 인바운드 규칙**:
   ```
   SSH (22)      - 내 IP (또는 0.0.0.0/0)
   HTTP (80)     - 0.0.0.0/0
   HTTPS (443)   - 0.0.0.0/0
   Custom (3000) - 0.0.0.0/0  # Frontend
   Custom (8080) - 0.0.0.0/0  # Backend API
   ```

---

### 2. EC2 접속

**방법 1: AWS Console (권장)**
- EC2 인스턴스 선택 → "연결" → "EC2 Instance Connect"로 브라우저에서 바로 접속

**방법 2: SSH**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-퍼블릭-IP>
```

---

### 3. 스왑 메모리 설정 (필수!)

t2.micro는 1GB RAM이라 빌드 시 메모리 부족. **반드시 먼저 설정!**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 확인
free -h
```

---

### 4. Docker 설치

```bash
sudo apt update
```

```bash
sudo apt install -y ca-certificates curl gnupg git
```

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

```bash
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

```bash
sudo apt update
```

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

```bash
sudo usermod -aG docker $USER
```

```bash
newgrp docker
```

---

### 5. 프로젝트 배포

```bash
git clone https://github.com/hanskk0725/guestbook.git
cd guestbook
docker compose up -d --build
```

빌드에 **5~10분** 소요됩니다.

```bash
# 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f
```

---

### 6. 유용한 명령어

```bash
# 컨테이너 재시작
docker compose restart

# 컨테이너 중지
docker compose down

# 볼륨 포함 완전 삭제
docker compose down -v

# 코드 업데이트 후 재배포
git pull && docker compose up -d --build

# 디스크 정리
docker system prune -a

# 개별 로그 확인
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

---

### 7. EC2 IP 변경 시 수정 필요 파일

EC2를 재시작하면 퍼블릭 IP가 변경됩니다. 변경 시:

1. `docker-compose.yml` - frontend build args의 `NEXT_PUBLIC_API_URL`
2. `backend/.../SecurityConfig.java` - CORS allowedOrigins

수정 후:
```bash
git add -A && git commit -m "IP 변경" && git push
# EC2에서
git pull && docker compose up -d --build
```

**IP 고정**: AWS Console → EC2 → 탄력적 IP → 할당 → 인스턴스에 연결

---

### 8. EBS 볼륨 확장 (디스크 부족 시)

1. AWS Console → EC2 → 볼륨
2. 볼륨 선택 → 작업 → 볼륨 수정 → 30GB로 변경
3. EC2에서:
```bash
sudo growpart /dev/xvda 1
sudo resize2fs /dev/xvda1
df -h
```

---

### 9. 도메인 연결 (선택사항)

1. Route 53 또는 외부 DNS에서 A 레코드 추가
2. EC2 퍼블릭 IP를 도메인에 연결
3. HTTPS 필요 시 Let's Encrypt + Nginx 리버스 프록시 구성
