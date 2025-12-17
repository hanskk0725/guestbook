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

## AWS EC2 프리티어 배포 가이드

### 1. EC2 인스턴스 생성

1. AWS Console 접속 → EC2 → "인스턴스 시작"
2. 설정:
   - **이름**: guestbook-server
   - **AMI**: Amazon Linux 2023 (프리티어 eligible)
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

# EC2 접속
ssh -i your-key.pem ec2-user@<EC2-퍼블릭-IP>
```

### 3. Docker 설치 (Amazon Linux 2023)

```bash
# 시스템 업데이트
sudo dnf update -y

# Docker 설치
sudo dnf install -y docker

# Docker 서비스 시작 및 자동 시작 설정
sudo systemctl start docker
sudo systemctl enable docker

# ec2-user를 docker 그룹에 추가 (sudo 없이 docker 사용)
sudo usermod -aG docker ec2-user

# 변경사항 적용 (재접속 필요)
exit
# 다시 SSH 접속
```

### 4. Docker Compose 설치

```bash
# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 설치 확인
docker-compose --version
```

### 5. 프로젝트 배포

#### 방법 A: Git Clone (권장)
```bash
# Git 설치 (없는 경우)
sudo dnf install -y git

# 프로젝트 클론
git clone <your-repository-url>
cd guestbook
```

#### 방법 B: 파일 직접 전송
```bash
# 로컬에서 EC2로 파일 전송
scp -i your-key.pem -r ./guestbook ec2-user@<EC2-IP>:~/
```

### 6. 환경 설정 수정

배포 환경에 맞게 설정 파일 수정:

```bash
# docker-compose.yml에서 환경변수 확인/수정
# CORS 설정에서 localhost:3000 → EC2 퍼블릭 IP로 변경 필요
```

**application.properties 또는 환경변수 수정**:
```properties
# CORS 허용 origin 변경
# localhost:3000 → http://<EC2-퍼블릭-IP>:3000
```

### 7. Docker 컨테이너 실행

```bash
# 프로젝트 디렉토리에서
cd guestbook

# 백그라운드로 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 컨테이너 상태 확인
docker-compose ps
```

### 8. 접속 확인

- Frontend: `http://<EC2-퍼블릭-IP>:3000`
- Backend API: `http://<EC2-퍼블릭-IP>:8080/api/guestbook`

### 9. 유용한 명령어

```bash
# 컨테이너 재시작
docker-compose restart

# 컨테이너 중지
docker-compose down

# 볼륨 포함 완전 삭제
docker-compose down -v

# 이미지 다시 빌드
docker-compose up -d --build --force-recreate

# 디스크 정리 (프리티어 용량 부족 시)
docker system prune -a
```

### 10. 프리티어 주의사항

- **t2.micro**: 1 vCPU, 1GB RAM - 메모리 부족 시 스왑 설정 필요
- **스토리지**: 기본 8GB, 최대 30GB까지 프리티어
- **트래픽**: 월 100GB 아웃바운드 무료

#### 스왑 메모리 설정 (메모리 부족 시)
```bash
# 2GB 스왑 파일 생성
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 재부팅 후에도 유지
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 11. 도메인 연결 (선택사항)

1. Route 53 또는 외부 DNS에서 A 레코드 추가
2. EC2 퍼블릭 IP를 도메인에 연결
3. HTTPS 필요 시 Let's Encrypt + Nginx 리버스 프록시 구성
