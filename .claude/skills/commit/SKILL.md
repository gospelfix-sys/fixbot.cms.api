---
name: commit
description: 변경된 파일을 분석하여 한국어 커밋 메시지를 자동 생성하고 원격 저장소에 푸시합니다. git-commit-pusher 에이전트를 통해 전체 Git 워크플로우를 자동화합니다.
argument-hint: "[커밋 힌트 (선택)] (예: Button 컴포넌트 스타일 개선, 로그인 버그 수정)"
model: sonnet
user-invocable: true
agent: git-commit-pusher
---

커밋 힌트: $ARGUMENTS

위 힌트를 참고하여 변경된 모든 파일을 스테이징하고, 한국어 커밋 메시지를 자동 생성한 후, 원격 저장소에 push하는 작업을 수행하라.
힌트가 비어있으면 변경 내용만으로 커밋 메시지를 작성하라.

## 실행 순서

### 1단계: 현재 상태 파악 (병렬 실행)
다음 명령어를 동시에 실행하라:
- `git status` — 변경된 파일 목록 확인
- `git diff` — 변경 내용 상세 확인
- `git log --oneline -5` — 최근 커밋 스타일 참고
- `git branch --show-current` — 현재 브랜치 확인

### 2단계: 변경사항 확인
변경사항이 없으면 "커밋할 변경사항이 없습니다."라고 안내하고 종료.

변경사항이 있으면:
- `.env`, `.env.local`, `*.pem`, `*secret*`, `*credential*` 등 민감한 파일이 포함되어 있으면 반드시 사용자에게 경고하고 확인을 받은 후 진행

### 3단계: 스테이징
민감한 파일을 제외하고 변경된 모든 파일을 스테이징:
git add -A

### 4단계: 커밋 메시지 작성
변경 내용을 분석하여 한국어로 커밋 메시지를 작성하라.
커밋 힌트(`$ARGUMENTS`)가 있으면 해당 내용을 커밋 메시지 요약에 반영하라.

커밋 타입:
- feat: 새로운 기능 추가
- fix: 버그 수정
- chore: 빌드/설정/의존성 등 기타 작업
- refactor: 코드 구조 개선
- docs: 문서 수정
- style: 코드 포맷/스타일
- test: 테스트 코드

커밋은 HEREDOC 형식으로 작성:
git commit -m "$(cat <<'EOF'
<타입>: <변경 내용 요약>

<필요시 상세 설명>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

### 5단계: Push
현재 브랜치를 원격 저장소에 push:
- 원격 추적 브랜치가 있으면: git push
- 없으면: git push -u origin <현재 브랜치명>

### 6단계: 결과 보고
완료 후 다음 정보를 간결하게 출력:
- 커밋된 파일 수
- 커밋 메시지
- push된 브랜치
