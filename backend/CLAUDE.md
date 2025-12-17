# CLAUDE.md

Claude Code 가이드 파일입니다.

## Build & Run Commands

### Backend (Spring Boot)
```bash
./gradlew build                    # 빌드
./gradlew bootRun                  # 실행 (port 8080)
./gradlew test                     # 테스트
./gradlew clean build              # 클린 빌드
```

### Frontend (Next.js)
```bash
cd frontend
npm install       # 의존성 설치
npm run dev       # 개발 서버 (port 3000)
npm run build     # 프로덕션 빌드
```

### Docker
```bash
docker compose up -d --build    # 빌드 및 백그라운드 실행
docker compose down             # 중지
docker compose down -v          # 중지 및 볼륨 삭제
docker compose logs -f          # 로그 확인
```

## Architecture

Spring Boot + Next.js 풀스택 방명록 애플리케이션

### Backend
- Spring Boot 4.0, Spring Data JPA, Spring Security
- MySQL (port 3307)
- Lombok

### Frontend
- Next.js 16 (App Router), React 19, Tailwind CSS v4

### Package Structure
```
com.likelion.guestbook
├── domain/        # JPA 엔티티
├── repository/    # JPA 리포지토리
├── controller/    # REST 컨트롤러
└── config/        # Security, CORS 설정
```

### API Endpoints

| Method | Endpoint       | Description    |
|--------|----------------|----------------|
| GET    | /api/guestbook | 전체 목록 조회 |
| POST   | /api/guestbook | 새 항목 생성   |

## 배포 정보

| 항목        | 값                                           |
|-------------|----------------------------------------------|
| 도메인      | guestboard.kro.kr                            |
| EC2 IP      | 15.165.67.246                                |
| Frontend    | http://guestboard.kro.kr                     |
| Backend API | http://guestboard.kro.kr:8080/api/guestbook  |

## EC2 배포 가이드 (Ubuntu)

### 1. EC2 인스턴스 생성
- AMI: Ubuntu 24.04 LTS
- 인스턴스: t2.micro (프리티어)
- 스토리지: 30GB
- 보안 그룹: SSH(22), HTTP(80), HTTPS(443), 3000, 8080

### 2. 초기 설정

**스왑 메모리 설정 (필수)**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h  # 확인
```

**Docker 설치**
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 3. 배포
```bash
git clone https://github.com/hanskk0725/guestbook.git
cd guestbook
docker compose up -d --build  # 빌드 5~10분 소요
```

### 4. 유용한 명령어
```bash
docker compose ps                              # 상태 확인
docker compose restart                         # 재시작
git pull && docker compose up -d --build       # 업데이트 배포
docker system prune -a                         # 디스크 정리
```

## IP/도메인 변경 시 수정 파일

1. `docker-compose.yml` - `NEXT_PUBLIC_API_URL`
2. `backend/.../SecurityConfig.java` - CORS allowedOrigins

```bash
# 수정 후
git add -A && git commit -m "설정 변경" && git push
# EC2에서
git pull && docker compose up -d --build
```

> IP 고정: AWS Console → EC2 → 탄력적 IP 할당