# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

RHEL 8/9 서버 관리자를 위한 Claude Code 설치 및 활용 매뉴얼을 프로그래밍 방식으로 생성하는 도구. `docx` 라이브러리로 Microsoft Word 문서를 코드로 빌드한다.

## 빌드 및 실행

```bash
# 의존성 설치
npm install

# 매뉴얼 문서(.docx) 생성
node generate-manual.js
```

출력 파일: `Claude_Code_서버관리_매뉴얼.docx`

테스트/린트 스크립트는 없음. 생성된 .docx 파일을 직접 열어 확인한다.

## 아키텍처

`generate-manual.js` (약 3,250줄) 단일 파일 구조:

### 구성 순서

1. **전역 상수** (12-36줄) — 폰트(`Malgun Gothic`, `Consolas`), 색상, A4 페이지 규격, 테두리 객체
2. **헬퍼 함수** (39-200줄) — 문서 요소 팩토리
3. **챕터 함수** (200-3150줄) — 각 장이 `docx` 객체 배열을 반환
4. **main()** (3153-3250줄) — 모든 챕터를 스프레드로 합치고 `Packer.toBuffer()`로 직렬화

### 핵심 헬퍼 함수

| 함수 | 용도 |
|------|------|
| `heading1/2/3(text)` | 제목 수준별 Paragraph |
| `para(text, opts)` | 본문 단락 |
| `codeBlock(lines)` | 회색 배경 코드 블록 |
| `terminalBlock(lines)` | 어두운 배경 터미널 출력 |
| `warningBox/tipBox/importantBox(text)` | 색상 구분 알림 박스 |
| `makeTable(headers, rows, colWidths)` | 헤더행+줄무늬 테이블 |
| `promptSample(title, prompt, ...)` | 프롬프트 예제 전체 구조 (제목→프롬프트→실행방법→출력→해석→후속조치) |

### 챕터 구조

각 챕터 함수(`chapter1()` ~ `chapter9()`, `chapterServices()`, `appendix()`)는 `Paragraph | Table | PageBreak` 배열을 반환. `main()`에서 스프레드로 연결:

```javascript
const children = [
  ...coverPage(), ...changeHistory(),
  new TableOfContents(...),
  ...chapter1(), ...chapter2(), /* ... */
  ...appendix(),
];
```

## 매뉴얼 명세서

`claude-code-server-manual-prompt.md`가 매뉴얼 내용의 권위 있는 명세서 역할. 문서 구조, 서식 규칙, 각 장별 요구사항이 정의되어 있다. 매뉴얼 내용을 수정할 때 이 파일을 먼저 참조할 것.

## 주요 규칙

- 모든 색상·폰트·크기는 파일 상단 전역 상수로 관리 — 스타일 변경 시 상수만 수정
- 새 챕터 추가 시: 챕터 함수를 만들고 `main()`의 children 배열에 스프레드로 추가
- 단위는 twips (1인치 = 1440 twips, 1pt = 2 twips)
- 한국어 본문, 영어 코드/명령어/경로 유지
