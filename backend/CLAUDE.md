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

### 1. EC2 인스턴스 생성

1. AWS Console 접속 → EC2 → "인스턴스 시작"
2. 설정:
   - **이름**: guestbook-server
   - **AMI**: Ubuntu 22.04 LTS (프리티어 eligible)
   - **인스턴스 유형**: t2.micro (프리티어)
   - **키 페어**: 새로 생성 또는 기존 키 선택 (.pem 파일 다운로드)
   - **네트워크 설정**:
     - 퍼블릭 IP 자동 할당 활성화
     - 보안 그룹 생성 (아래 포트 오픈)

3. **보안 그룹 인바운드 규칙**:
   ```
   SSH (22)      - 내 IP (또는 0.0.0.0/0)
   HTTP (80)     - 0.0.0.0/0
   HTTPS (443)   - 0.0.0.0/0
   Custom (3000) - 0.0.0.0/0  # Frontend
   Custom (8080) - 0.0.0.0/0  # Backend API
   ```

### 2. EC2 접속

```bash
# .pem 파일 권한 설정
chmod 400 your-key.pem

# EC2 접속 (Ubuntu는 ubuntu 사용자)
ssh -i your-key.pem ubuntu@<EC2-퍼블릭-IP>
```

### 3. Docker 설치 (Ubuntu)

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y ca-certificates curl gnupg git

# Docker GPG 키 추가
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 사용)
sudo usermod -aG docker $USER

# 변경사항 적용 (재접속 필요)
exit
# 다시 SSH 접속
```

### 4. 프로젝트 배포

```bash
# 프로젝트 클론
git clone https://github.com/hanskk0725/guestbook.git
cd guestbook

# 백그라운드로 실행
docker compose up -d --build

# 로그 확인
docker compose logs -f

# 컨테이너 상태 확인
docker compose ps
```

### 5. 접속 확인

- Frontend: `http://54.180.101.5:3000`
- Backend API: `http://54.180.101.5:8080/api/guestbook`

### 6. 유용한 명령어

```bash
# 컨테이너 재시작
docker compose restart

# 컨테이너 중지
docker compose down

# 볼륨 포함 완전 삭제
docker compose down -v

# 이미지 다시 빌드
docker compose up -d --build --force-recreate

# 디스크 정리 (프리티어 용량 부족 시)
docker system prune -a

# 로그 확인
docker compose logs -f backend
docker compose logs -f frontend
```

### 7. 프리티어 주의사항

- **t2.micro**: 1 vCPU, 1GB RAM - 메모리 부족 시 스왑 설정 필요
- **스토리지**: 기본 8GB, 최대 30GB까지 프리티어
- **트래픽**: 월 100GB 아웃바운드 무료

#### 스왑 메모리 설정 (메모리 부족 시)
```bash
# 2GB 스왑 파일 생성
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 재부팅 후에도 유지
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 8. 도메인 연결 (선택사항)

1. Route 53 또는 외부 DNS에서 A 레코드 추가
2. EC2 퍼블릭 IP를 도메인에 연결
3. HTTPS 필요 시 Let's Encrypt + Nginx 리버스 프록시 구성
