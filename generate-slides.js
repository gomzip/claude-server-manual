const pptxgen = require("pptxgenjs");

// ============================================================
// 색상 팔레트 - Terminal Industrial Crisp (Black + Lime)
// ============================================================
const C = {
  BLACK:    "000000",   // 슬라이드 배경
  SURFACE:  "111111",   // 카드/박스 배경
  BORDER:   "1A1A1A",   // 구분선/테두리
  SURFACE2: "1E1E1E",   // 보조 서페이스
  WHITE:    "FFFFFF",   // 주요 텍스트
  SEC:      "999999",   // 보조 텍스트
  TERT:     "6E6E6E",   // 3차 텍스트
  LIME:     "BFFF00",   // 주 액센트 (lime)
  LIME_DIM: "8BBF00",   // 어두운 lime
  WARN:     "F59E0B",   // 경고
  ERROR:    "FF4444",   // 에러
  GREEN:    "4ADE80",   // 성공/정상
  BLUE:     "38BDF8",   // 정보
};

// ============================================================
// 공통 스타일 팩토리
// ============================================================
const makeShadow = () => ({ type: "outer", blur: 10, offset: 4, angle: 135, color: "000000", opacity: 0.5 });

// ============================================================
// 프레젠테이션 생성
// ============================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Claude Code";
pres.title = "Claude Code 서버관리 매뉴얼";

// ============================================================
// 슬라이드 마스터
// ============================================================
pres.defineSlideMaster({
  title: "DARK_MASTER",
  background: { color: C.BLACK },
  objects: [
    // 하단 바
    { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: C.SURFACE } } },
    // 하단 좌측 텍스트
    { text: {
        text: "Claude Code 서버관리 매뉴얼",
        options: { x: 0.5, y: 5.15, w: 7, h: 0.4, fontSize: 9, color: C.TERT, fontFace: "Malgun Gothic" }
    }},
  ],
});

// ============================================================
// 슬라이드 1: 표지
// ============================================================
function slideCover() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 좌측 lime 액센트 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.07, h: 5.625, fill: { color: C.LIME }
  });

  // 배지
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.9, y: 0.9, w: 3.8, h: 0.35,
    fill: { color: C.SURFACE }
  });
  slide.addText("SERVER ADMIN GUIDE  ·  v1.0", {
    x: 0.9, y: 0.9, w: 3.8, h: 0.35,
    fontSize: 10, fontFace: "Consolas", color: C.LIME, letterSpacing: 2,
    align: "center", valign: "middle", margin: 0,
  });

  // 메인 타이틀 — 폭 5.1" (끝 x=6.0), 터미널(x=6.3)과 0.3" 여백
  slide.addText("Claude Code\n서버관리 요약 매뉴얼", {
    x: 0.9, y: 1.35, w: 5.1, h: 1.9,
    fontSize: 30, fontFace: "Malgun Gothic", color: C.WHITE, bold: true,
    align: "left", margin: 0, lineSpacingMultiple: 1.25,
  });

  // 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.9, y: 3.38, w: 3.0, h: 0.04, fill: { color: C.LIME }
  });

  // 서브 텍스트
  slide.addText("RHEL 8/9  |  설치 · 프롬프트 · 모니터링", {
    x: 0.9, y: 3.55, w: 5.1, h: 0.42,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
  });

  // 메타 정보
  slide.addText([
    { text: "대상 OS: ", options: { color: C.TERT } },
    { text: "Red Hat Enterprise Linux 8.x / 9.x", options: { color: C.SEC } },
  ], {
    x: 0.9, y: 4.08, w: 5.1, h: 0.35,
    fontSize: 11, fontFace: "Malgun Gothic", margin: 0,
  });
  slide.addText("2026-03-20", {
    x: 0.9, y: 4.42, w: 5.1, h: 0.3,
    fontSize: 10, fontFace: "Consolas", color: C.TERT, margin: 0,
  });

  // 우측: 터미널 패널 — x=6.3 (왼쪽 콘텐츠 끝 5.7과 0.6" 여백)
  const TX = 6.3;
  const TW = 3.45;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: TX, y: 0.3, w: TW, h: 4.85,
    fill: { color: C.SURFACE }
  });
  // 터미널 상단 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x: TX, y: 0.3, w: TW, h: 0.32,
    fill: { color: C.BORDER }
  });
  // 신호등 점
  slide.addShape(pres.shapes.OVAL, { x: TX + 0.15, y: 0.39, w: 0.13, h: 0.13, fill: { color: C.ERROR } });
  slide.addShape(pres.shapes.OVAL, { x: TX + 0.37, y: 0.39, w: 0.13, h: 0.13, fill: { color: C.WARN } });
  slide.addShape(pres.shapes.OVAL, { x: TX + 0.59, y: 0.39, w: 0.13, h: 0.13, fill: { color: C.GREEN } });

  // 터미널 텍스트
  slide.addText([
    { text: "$ claude --version", options: { color: C.LIME, fontSize: 10, breakLine: true } },
    { text: "Claude Code 1.0.x", options: { color: C.GREEN, fontSize: 10, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "$ claude -p \"서버 상태 점검해줘\"", options: { color: C.LIME, fontSize: 10, breakLine: true } },
    { text: "## 서버 헬스체크 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
    { text: "CPU: 23.5% (정상)", options: { color: C.GREEN, fontSize: 9, breakLine: true } },
    { text: "메모리: 65% (정상)", options: { color: C.GREEN, fontSize: 9, breakLine: true } },
    { text: "/var: 78% [주의]", options: { color: C.WARN, fontSize: 9, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "종합: /var 파티션 조치 필요", options: { color: C.ERROR, bold: true, fontSize: 9 } },
  ], {
    x: TX + 0.15, y: 0.75, w: TW - 0.25, h: 4.2,
    fontFace: "Consolas", margin: 0, valign: "top",
  });

  // 페이지 번호
  slide.addText("01 / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 슬라이드 2: 목차
// ============================================================
function slideAgenda() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 배지
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.3, w: 1.4, h: 0.3,
    fill: { color: C.SURFACE }
  });
  slide.addText("TABLE OF CONTENTS", {
    x: 0.6, y: 0.3, w: 1.4, h: 0.3,
    fontSize: 7, fontFace: "Consolas", color: C.LIME, letterSpacing: 1,
    align: "center", valign: "middle", margin: 0,
  });

  slide.addText("목차", {
    x: 0.6, y: 0.65, w: 8, h: 0.8,
    fontSize: 36, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // lime 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.4, w: 2.0, h: 0.04, fill: { color: C.LIME }
  });

  const chapters = [
    {
      num: "01", title: "RHEL 환경 Claude Code 설치",
      desc: "시스템 요구사항, 6단계 설치, 인증 설정, 원커맨드 스크립트",
      slides: "슬라이드 3 – 5"
    },
    {
      num: "02", title: "서버 관리 프롬프트 샘플",
      desc: "시스템 점검, 로그 분석, 보안 감사, 장애 대응 등 8가지 핵심 프롬프트",
      slides: "슬라이드 6 – 10"
    },
    {
      num: "03", title: "실시간 모니터링",
      desc: "로그 감시, 임계값 모니터링, 대시보드, Claude 자동 생성",
      slides: "슬라이드 11 – 15"
    },
  ];

  chapters.forEach((ch, i) => {
    const y = 1.6 + i * 1.1;

    // 카드 배경
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y, w: 8.8, h: 0.95,
      fill: { color: C.SURFACE }
    });
    // 좌측 lime 바
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y, w: 0.06, h: 0.95, fill: { color: C.LIME }
    });

    // 넘버
    slide.addText(ch.num, {
      x: 0.8, y, w: 0.7, h: 0.95,
      fontSize: 26, fontFace: "Consolas", color: C.LIME, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    // 제목
    slide.addText(ch.title, {
      x: 1.65, y: y + 0.1, w: 5.5, h: 0.38,
      fontSize: 17, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
    });
    // 설명
    slide.addText(ch.desc, {
      x: 1.65, y: y + 0.52, w: 5.5, h: 0.3,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });

    // 슬라이드 범위
    slide.addText(ch.slides, {
      x: 7.4, y, w: 2.0, h: 0.95,
      fontSize: 9, fontFace: "Consolas", color: C.TERT,
      align: "center", valign: "middle", margin: 0,
    });
  });

  slide.addText("02 / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 공통 헬퍼: 챕터 배지 + 제목 헤더
// ============================================================
function addPageHeader(slide, chapter, title, pageNum) {
  // 배지
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.2, w: 0.06, h: 0.38, fill: { color: C.LIME }
  });
  slide.addText(chapter, {
    x: 0.7, y: 0.2, w: 8.5, h: 0.38,
    fontSize: 11, fontFace: "Malgun Gothic", color: C.LIME, bold: true, margin: 0, valign: "middle",
  });

  slide.addText(title, {
    x: 0.5, y: 0.6, w: 9.0, h: 0.55,
    fontSize: 26, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.17, w: 9.0, h: 0.02, fill: { color: C.BORDER }
  });

  // 페이지 번호
  slide.addText(pageNum + " / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 슬라이드 3: 시스템 요구사항
// ============================================================
function slideRequirements() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "1장 · 시스템 요구사항", "설치 전 확인 사항", "03");

  // 요구사항 테이블
  const tableRows = [
    [
      { text: "항목", options: { bold: true, color: C.LIME, fill: { color: C.SURFACE }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "최소 사양", options: { bold: true, color: C.LIME, fill: { color: C.SURFACE }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "권장 사양", options: { bold: true, color: C.LIME, fill: { color: C.SURFACE }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...([
      ["OS", "RHEL 8.6+ / 9.0+", "RHEL 8.10 / 9.4"],
      ["CPU", "1 Core 이상", "2 Core 이상"],
      ["RAM", "1GB 이상", "2GB 이상"],
      ["디스크", "500MB", "1GB"],
      ["Node.js", "v18.0.0 이상", "v20.x LTS"],
      ["네트워크", "외부 인터넷 필수", "안정적인 연결"],
    ].map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: ci === 0 ? "Malgun Gothic" : "Consolas",
        color: ci === 2 ? C.GREEN : C.WHITE,
        align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK },
      }
    })))),
  ];

  slide.addTable(tableRows, {
    x: 0.5, y: 1.3, w: 5.2, colW: [1.3, 1.95, 1.95],
    border: { pt: 0.5, color: C.BORDER },
    rowH: [0.38, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });

  // 우측: 네트워크 요구사항
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: 1.3, w: 3.8, h: 2.4,
    fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: 1.3, w: 3.8, h: 0.04, fill: { color: C.LIME }
  });
  slide.addText("네트워크 요구사항", {
    x: 6.15, y: 1.4, w: 3.5, h: 0.35,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  const netItems = [
    { domain: "api.anthropic.com", desc: "Claude AI API 통신" },
    { domain: "registry.npmjs.org", desc: "npm 패키지 다운로드" },
    { domain: "console.anthropic.com", desc: "API Key 발급 관리" },
  ];
  netItems.forEach((item, i) => {
    const ny = 1.9 + i * 0.55;
    slide.addText(item.domain, {
      x: 6.15, y: ny, w: 3.5, h: 0.27,
      fontSize: 10, fontFace: "Consolas", color: C.LIME, bold: true, margin: 0,
    });
    slide.addText("Port 443 (HTTPS)  —  " + item.desc, {
      x: 6.15, y: ny + 0.26, w: 3.5, h: 0.22,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });
  });

  // 경고 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: 3.85, w: 3.8, h: 0.7,
    fill: { color: "1A1200" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: 3.85, w: 0.06, h: 0.7, fill: { color: C.WARN }
  });
  slide.addText([
    { text: "⚠  주의: ", options: { color: C.WARN, bold: true } },
    { text: "방화벽/프록시로 위 도메인이 차단되면 설치 및 실행 불가. 사전에 네트워크 담당자에게 확인하세요.", options: { color: C.SEC } },
  ], {
    x: 6.2, y: 3.85, w: 3.5, h: 0.7,
    fontSize: 9, fontFace: "Malgun Gothic", margin: 0, valign: "middle",
  });
}

// ============================================================
// 슬라이드 4: 설치 순서
// ============================================================
function slideInstallSteps() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "1장 · RHEL 환경 설치", "설치 순서 (6단계)", "04");

  const steps = [
    { num: "1", title: "OS 버전 확인", cmd: "cat /etc/redhat-release", desc: "RHEL 8.x / 9.x 확인" },
    { num: "2", title: "EPEL 저장소 활성화", cmd: "dnf install -y epel-release", desc: "RHEL 9: dnf / RHEL 8: yum" },
    { num: "3", title: "Node.js 20.x 설치", cmd: "dnf module enable nodejs:20 -y &&\ndnf install -y nodejs", desc: "AppStream 모듈 설치" },
    { num: "4", title: "npm 업데이트", cmd: "npm install -g npm@latest", desc: "최신 npm으로 업데이트" },
    { num: "5", title: "필수 패키지", cmd: "dnf install -y curl git jq", desc: "자동화 유틸리티 설치" },
    { num: "6", title: "설치 확인", cmd: "node -v && npm -v", desc: "Node.js / npm 버전 확인" },
  ];

  steps.forEach((step, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.15;
    const y = 1.3 + row * 1.9;

    // 카드
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.95, h: 1.7,
      fill: { color: C.SURFACE }
    });

    // 넘버 뱃지 (lime circle)
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.15, y: y + 0.15, w: 0.42, h: 0.42,
      fill: { color: C.LIME },
    });
    slide.addText(step.num, {
      x: x + 0.15, y: y + 0.15, w: 0.42, h: 0.42,
      fontSize: 15, fontFace: "Consolas", color: C.BLACK, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    // 제목
    slide.addText(step.title, {
      x: x + 0.65, y: y + 0.17, w: 2.15, h: 0.37,
      fontSize: 12, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0, valign: "middle",
    });

    // 명령어
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.15, y: y + 0.7, w: 2.65, h: 0.52,
      fill: { color: C.BLACK }
    });
    slide.addText("$ " + step.cmd, {
      x: x + 0.25, y: y + 0.7, w: 2.45, h: 0.52,
      fontSize: 7.5, fontFace: "Consolas", color: C.LIME, margin: 0, valign: "middle",
      shrinkText: true,
    });

    // 설명
    slide.addText(step.desc, {
      x: x + 0.15, y: y + 1.32, w: 2.65, h: 0.28,
      fontSize: 9, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });
  });
}

// ============================================================
// 슬라이드 5: Claude Code 설치 & 인증
// ============================================================
function slideInstallAuth() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "1장 · Claude Code 설치 & 인증", "npm 설치 및 인증 설정", "05");

  // 좌측: 설치
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.5, h: 3.6,
    fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.5, h: 0.04, fill: { color: C.GREEN }
  });
  slide.addText("npm 전역 설치", {
    x: 0.75, y: 1.45, w: 4.0, h: 0.38,
    fontSize: 15, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // 코드 블록
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.75, y: 2.0, w: 3.9, h: 1.0,
    fill: { color: C.BLACK }
  });
  slide.addText([
    { text: "$ npm install -g @anthropic-ai/claude-code", options: { breakLine: true, color: C.LIME } },
    { text: "", options: { breakLine: true, fontSize: 5 } },
    { text: "$ claude --version", options: { breakLine: true, color: C.LIME } },
    { text: "Claude Code v1.0.x", options: { color: C.GREEN } },
  ], {
    x: 0.9, y: 2.07, w: 3.6, h: 0.93,
    fontSize: 9, fontFace: "Consolas", margin: 0, valign: "top",
  });

  // 팁 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.75, y: 3.15, w: 3.9, h: 0.55,
    fill: { color: "001A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.75, y: 3.15, w: 0.05, h: 0.55, fill: { color: C.GREEN }
  });
  slide.addText("대부분 아웃바운드 HTTPS(443)는 기본 허용.\n차단된 경우에만 firewall-cmd 설정이 필요합니다.", {
    x: 0.9, y: 3.15, w: 3.6, h: 0.55,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.SEC, valign: "middle", margin: 0,
  });

  // 원커맨드 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.75, y: 3.85, w: 3.9, h: 0.7,
    fill: { color: "0D1A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.75, y: 3.85, w: 0.05, h: 0.7, fill: { color: C.LIME }
  });
  slide.addText([
    { text: "원커맨드 설치 스크립트\n", options: { bold: true, fontSize: 11, color: C.LIME, breakLine: true } },
    { text: "chmod +x install-claude.sh && ./install-claude.sh", options: { fontSize: 8, fontFace: "Consolas", color: C.SEC } },
  ], {
    x: 0.95, y: 3.85, w: 3.6, h: 0.7,
    fontFace: "Malgun Gothic", color: C.WHITE, valign: "middle", margin: 0,
  });

  // 우측: 인증 비교
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.3, w: 4.4, h: 3.6,
    fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.3, w: 4.4, h: 0.04, fill: { color: C.LIME }
  });
  slide.addText("인증 방식 비교", {
    x: 5.55, y: 1.45, w: 4.0, h: 0.38,
    fontSize: 15, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  const authTable = [
    [
      { text: "", options: { fill: { color: C.BORDER }, color: C.LIME, bold: true, fontSize: 9, fontFace: "Malgun Gothic" } },
      { text: "API Key (권장)", options: { fill: { color: C.BORDER }, color: C.LIME, bold: true, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "OAuth (Max)", options: { fill: { color: C.BORDER }, color: C.LIME, bold: true, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
    ],
    ...([
      ["비용", "사용량 과금", "월 정액"],
      ["설정", "환경변수 설정", "브라우저 인증"],
      ["자동화", "키 고정 사용", "토큰 갱신 필요"],
      ["보안", "키 보호 필요", "토큰 자동 관리"],
      ["서버 적합도", "높음 ✓", "보통"],
    ].map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 9, fontFace: "Malgun Gothic",
        color: ci === 2 && ri === 4 ? C.SEC : (ci === 1 && ri === 4 ? C.GREEN : C.WHITE),
        align: ci === 0 ? "left" : "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK },
      }
    })))),
  ];

  slide.addTable(authTable, {
    x: 5.55, y: 2.0, w: 3.9, colW: [1.1, 1.4, 1.4],
    border: { pt: 0.5, color: C.BORDER },
    rowH: [0.32, 0.3, 0.3, 0.3, 0.3, 0.3],
  });

  // 경고 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.55, y: 3.95, w: 3.9, h: 0.6,
    fill: { color: "1A0000" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.55, y: 3.95, w: 0.05, h: 0.6, fill: { color: C.ERROR }
  });
  slide.addText("API Key를 스크립트에 하드코딩 금지!\n환경변수 또는 별도 설정파일로 반드시 관리하세요.", {
    x: 5.75, y: 3.95, w: 3.6, h: 0.6,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.SEC, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 6: 프롬프트 실행 방법 (챕터 인트로)
// ============================================================
function slidePromptIntro() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 챕터 큰 번호 장식
  slide.addText("02", {
    x: 6.0, y: 0.3, w: 4.0, h: 5.0,
    fontSize: 200, fontFace: "Consolas", color: C.SURFACE, bold: true,
    align: "right", valign: "middle", margin: 0,
  });

  // 좌측 배지
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.3, w: 1.6, h: 0.32,
    fill: { color: C.SURFACE }
  });
  slide.addText("CHAPTER 2", {
    x: 0.5, y: 0.3, w: 1.6, h: 0.32,
    fontSize: 9, fontFace: "Consolas", color: C.LIME, letterSpacing: 3,
    align: "center", valign: "middle", margin: 0,
  });

  slide.addText("서버 관리\n프롬프트 샘플", {
    x: 0.5, y: 0.75, w: 6.5, h: 2.5,
    fontSize: 46, fontFace: "Malgun Gothic", color: C.WHITE, bold: true,
    margin: 0, lineSpacingMultiple: 1.1,
  });

  // lime 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.3, w: 3.0, h: 0.04, fill: { color: C.LIME }
  });

  slide.addText("4가지 실행 방식으로 서버 관리를 자동화합니다.", {
    x: 0.5, y: 3.5, w: 6.5, h: 0.4,
    fontSize: 14, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
  });

  // 4가지 실행 방식 카드
  const methods = [
    { title: "대화형", cmd: "claude", desc: "복잡한 분석·후속 질의", accentColor: C.LIME },
    { title: "비대화형", cmd: 'claude -p "..."', desc: "자동화·cron 연동", accentColor: C.GREEN },
    { title: "파일 저장", cmd: 'claude -p "..." > log', desc: "결과 로그 보관", accentColor: C.BLUE },
    { title: "JSON 출력", cmd: '--output-format json', desc: "파싱 자동화", accentColor: C.WARN },
  ];

  methods.forEach((m, i) => {
    const x = 0.5 + i * 2.35;
    const y = 4.0;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.15, h: 0.9,
      fill: { color: C.SURFACE }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.15, h: 0.04, fill: { color: m.accentColor }
    });

    slide.addText(m.title, {
      x: x + 0.1, y: y + 0.1, w: 1.3, h: 0.3,
      fontSize: 12, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
    });
    slide.addText(m.cmd, {
      x: x + 0.1, y: y + 0.42, w: 1.9, h: 0.25,
      fontSize: 7.5, fontFace: "Consolas", color: m.accentColor, margin: 0,
    });
    slide.addText(m.desc, {
      x: x + 0.1, y: y + 0.66, w: 1.9, h: 0.2,
      fontSize: 8, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });
  });

  slide.addText("06 / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 공통 헬퍼: 프롬프트 카드 (좌/우)
// ============================================================
function addPromptCard(slide, x, y, w, h, opts) {
  const { title, prompt, accentColor, outputLines } = opts;

  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h, fill: { color: accentColor || C.LIME }
  });

  slide.addText(title, {
    x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.32,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // 프롬프트 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.2, y: y + 0.5, w: w - 0.4, h: 0.42,
    fill: { color: C.BLACK }
  });
  slide.addText(prompt, {
    x: x + 0.3, y: y + 0.5, w: w - 0.55, h: 0.42,
    fontSize: 8.5, fontFace: "Malgun Gothic", color: C.LIME, italic: true,
    margin: 0, valign: "middle",
  });

  // 출력 예시
  if (outputLines) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: y + 1.05, w: w - 0.4, h: h - 1.25,
      fill: { color: C.BLACK }
    });
    slide.addText(outputLines, {
      x: x + 0.3, y: y + 1.1, w: w - 0.6, h: h - 1.35,
      fontFace: "Consolas", fontSize: 8.5, margin: 0, valign: "top",
    });
  }
}

// ============================================================
// 슬라이드 7: 시스템 상태 점검
// ============================================================
function slideSystemCheck() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "2장 · 서버 관리 프롬프트 샘플", "2.1 시스템 상태 점검", "07");

  addPromptCard(slide, 0.5, 1.3, 4.5, 3.7, {
    title: "서버 전체 헬스체크",
    prompt: "현재 서버의 전체적인 상태를 점검해줘.\nCPU, 메모리, 디스크, 네트워크, 서비스 상태를 종합 분석해줘.",
    accentColor: C.LIME,
    outputLines: [
      { text: "## 서버 헬스체크 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
      { text: "CPU: 23.5% (정상)", options: { color: C.GREEN, fontSize: 8.5, breakLine: true } },
      { text: "메모리: 5.2GB/8GB (65%) - 정상", options: { color: C.GREEN, fontSize: 8.5, breakLine: true } },
      { text: "/var: 78% 사용 (39GB/50GB)", options: { color: C.WARN, fontSize: 8.5, breakLine: true } },
      { text: "   [주의] 80% 근접 - 로그 정리 권장", options: { color: C.WARN, fontSize: 8.5, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "종합: /var 파티션 78% - 조치 필요", options: { color: C.ERROR, bold: true, fontSize: 8.5 } },
    ],
  });

  addPromptCard(slide, 5.3, 1.3, 4.4, 3.7, {
    title: "디스크 사용량 분석",
    prompt: "디스크 사용량을 분석해줘.\n파티션별 사용률, Top 10 큰 파일, 정리 추천 항목.",
    accentColor: C.GREEN,
    outputLines: [
      { text: "## 디스크 분석 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
      { text: "/     : 45% (23GB/50GB) - 정상", options: { color: C.GREEN, fontSize: 8.5, breakLine: true } },
      { text: "/var  : 78% (39GB/50GB) - 주의", options: { color: C.WARN, fontSize: 8.5, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "정리 추천:", options: { color: C.WHITE, bold: true, fontSize: 8.5, breakLine: true } },
      { text: "1. /var/cache/dnf (3.2GB)", options: { color: C.SEC, fontSize: 8.5, breakLine: true } },
      { text: "2. /var/log/journal (4.5GB)", options: { color: C.SEC, fontSize: 8.5, breakLine: true } },
      { text: "3. 3개월 이전 로그 (2.1GB)", options: { color: C.SEC, fontSize: 8.5 } },
    ],
  });
}

// ============================================================
// 슬라이드 8: 로그 & 보안 분석
// ============================================================
function slideLogSecurity() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "2장 · 서버 관리 프롬프트 샘플", "2.2 로그 분석 & 보안 로그", "08");

  addPromptCard(slide, 0.5, 1.3, 4.5, 3.7, {
    title: "시스템 로그 분석 (24시간)",
    prompt: "/var/log/messages 최근 24시간 에러/경고\n분류, 빈도 정리, 심각도 평가",
    accentColor: C.BLUE,
    outputLines: [
      { text: "## 시스템 로그 분석", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "[CRITICAL] kernel: Out of memory", options: { color: C.ERROR, fontSize: 8.5, breakLine: true } },
      { text: "  → OOM Killer 발동 (12:34:21)", options: { color: C.WARN, fontSize: 8, breakLine: true } },
      { text: "[ERROR] kernel: EXT4-fs error", options: { color: C.ERROR, fontSize: 8.5, breakLine: true } },
      { text: "  → 디스크 I/O 오류 감지", options: { color: C.WARN, fontSize: 8, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "심각도: 높음  |  즉시 조치 권장", options: { color: C.ERROR, bold: true, fontSize: 8.5 } },
    ],
  });

  addPromptCard(slide, 5.3, 1.3, 4.4, 3.7, {
    title: "보안 로그 분석",
    prompt: "/var/log/secure 로그인 시도\nBrute force 감지 및 차단 IP 목록",
    accentColor: C.ERROR,
    outputLines: [
      { text: "## 보안 로그 분석 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "총 로그인 실패: 2,847건 (24시간)", options: { color: C.WARN, fontSize: 8.5, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "Top 공격 IP:", options: { color: C.WHITE, bold: true, fontSize: 8.5, breakLine: true } },
      { text: "203.0.113.45  (847회)", options: { color: C.ERROR, fontSize: 8.5, breakLine: true } },
      { text: "198.51.100.23 (456회)", options: { color: C.ERROR, fontSize: 8.5, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 4 } },
      { text: "→ fail2ban 즉시 차단 권장", options: { color: C.WARN, bold: true, fontSize: 8.5 } },
    ],
  });
}

// ============================================================
// 슬라이드 9: 보안 취약점 & 장애 대응
// ============================================================
function slideSecurityIncident() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "2장 · 서버 관리 프롬프트 샘플", "2.3 보안 취약점 & 2.4 장애 대응", "09");

  const cards = [
    {
      title: "열린 포트 점검", accentColor: C.BLUE,
      prompt: "열린 포트와 리스닝 서비스 점검해줘",
      result: "MySQL(3306) 0.0.0.0 바인딩\n→ [위험] 외부 노출됨\n→ 127.0.0.1로 변경 필요",
      resultColor: C.ERROR,
    },
    {
      title: "SSH 보안 감사 (CIS)", accentColor: C.ERROR,
      prompt: "sshd_config CIS Benchmark 감사해줘",
      result: "PermitRootLogin: yes → [위험]\nPasswordAuth: yes → [주의]\n점수: 4/10 (개선 필요)",
      resultColor: C.ERROR,
    },
    {
      title: "서비스 다운 분석", accentColor: C.WARN,
      prompt: "httpd 서비스 다운 원인 분석해줘",
      result: "SSL 인증서 누락 확인\n→ 설정 파일 복원\n→ httpd -t 검증 후 재시작",
      resultColor: C.WARN,
    },
    {
      title: "OOM Killer 분석", accentColor: C.LIME,
      prompt: "OOM Killer 발동 분석 및 재발 방지",
      result: "Java 프로세스 3.8GB (Xmx 미설정)\n→ -Xmx4g 설정 권장\n→ systemd MemoryMax=5G",
      resultColor: C.GREEN,
    },
  ];

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.75;
    const y = 1.3 + row * 1.88;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.55, h: 1.72, fill: { color: C.SURFACE }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.06, h: 1.72, fill: { color: card.accentColor }
    });

    slide.addText(card.title, {
      x: x + 0.2, y: y + 0.08, w: 4.1, h: 0.3,
      fontSize: 13, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
    });

    // 프롬프트
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: y + 0.44, w: 4.1, h: 0.28,
      fill: { color: C.BLACK }
    });
    slide.addText(card.prompt, {
      x: x + 0.3, y: y + 0.44, w: 3.9, h: 0.28,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: C.LIME, italic: true,
      margin: 0, valign: "middle",
    });

    slide.addText(card.result, {
      x: x + 0.25, y: y + 0.82, w: 4.1, h: 0.8,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: card.resultColor, margin: 0, valign: "top",
    });
  });
}

// ============================================================
// 슬라이드 10: 프롬프트 빠른 참조표
// ============================================================
function slideQuickRef() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "2장 · 서버 관리 프롬프트 샘플", "프롬프트 빠른 참조표", "10");

  const refData = [
    ["헬스체크", "서버 전체 상태 점검해줘", 'claude -p "..."'],
    ["디스크", "디스크 사용량 분석하고 정리 추천해줘", 'claude -p "..."'],
    ["로그분석", "/var/log/messages 최근 24시간 분석해줘", 'claude -p "..."'],
    ["보안로그", "/var/log/secure 로그인 시도 분석해줘", 'claude -p "..."'],
    ["포트점검", "열린 포트와 서비스 점검해줘", 'claude -p "..."'],
    ["SSH감사", "SSH 보안 설정 감사해줘", 'claude -p "..."'],
    ["장애대응", "[서비스명] 다운 원인 분석해줘", "claude (대화형)"],
    ["디스크풀", "디스크 100% 긴급 대응해줘", "claude (대화형)"],
    ["OOM", "OOM Killer 발동 분석해줘", 'claude -p "..."'],
  ];

  const tableRows = [
    [
      { text: "카테고리", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "프롬프트 (요약)", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "실행 방법", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(refData.map((row, ri) => [
      { text: row[0], options: { fontSize: 10, fontFace: "Malgun Gothic", color: C.LIME, bold: true, align: "center", valign: "middle", fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK } } },
      { text: row[1], options: { fontSize: 9.5, fontFace: "Malgun Gothic", color: C.WHITE, valign: "middle", fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK } } },
      { text: row[2], options: { fontSize: 8.5, fontFace: "Consolas", color: C.SEC, align: "center", valign: "middle", fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK } } },
    ])),
  ];

  slide.addTable(tableRows, {
    x: 0.5, y: 1.3, w: 9.0, colW: [1.3, 4.5, 3.2],
    border: { pt: 0.5, color: C.BORDER },
    rowH: [0.38, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });
}

// ============================================================
// 슬라이드 11: 챕터 3 인트로 - Claude vs 기존 도구
// ============================================================
function slideMonitoringCompare() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 챕터 번호 장식
  slide.addText("03", {
    x: 6.0, y: 0.3, w: 4.0, h: 5.0,
    fontSize: 200, fontFace: "Consolas", color: C.SURFACE, bold: true,
    align: "right", valign: "middle", margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.3, w: 1.6, h: 0.32,
    fill: { color: C.SURFACE }
  });
  slide.addText("CHAPTER 3", {
    x: 0.5, y: 0.3, w: 1.6, h: 0.32,
    fontSize: 9, fontFace: "Consolas", color: C.LIME, letterSpacing: 3,
    align: "center", valign: "middle", margin: 0,
  });

  slide.addText("실시간 모니터링", {
    x: 0.5, y: 0.75, w: 7.0, h: 1.3,
    fontSize: 50, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.1, w: 3.0, h: 0.04, fill: { color: C.LIME }
  });

  // 비교 테이블
  slide.addText("Claude Code  vs  기존 모니터링 도구", {
    x: 0.5, y: 2.3, w: 6.5, h: 0.45,
    fontSize: 16, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
  });

  const compData = [
    ["설치 복잡도", "매우 간단 (npm)", "복잡 (서버+에이전트+DB)"],
    ["분석 능력", "자연어 심층 분석", "임계값 기반 알림"],
    ["실시간성", "요청 시 분석", "에이전트 실시간 수집"],
    ["강점", "분석 · 해석", "수집 · 시각화"],
  ];

  const compTable = [
    [
      { text: "항목", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Claude Code", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Zabbix / Prometheus", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(compData.map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: "Malgun Gothic",
        color: ci === 1 ? C.LIME : C.WHITE,
        bold: ci === 0,
        align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK },
      }
    })))),
  ];

  slide.addTable(compTable, {
    x: 0.5, y: 2.85, w: 6.5, colW: [1.7, 2.4, 2.4],
    border: { pt: 0.5, color: C.BORDER },
    rowH: [0.38, 0.38, 0.38, 0.38, 0.38],
  });

  // 팁 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.65, w: 6.5, h: 0.38,
    fill: { color: "0D1A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.65, w: 0.05, h: 0.38, fill: { color: C.GREEN }
  });
  slide.addText("상호 보완: 기존 도구로 수집/알림  +  Claude Code로 심층 분석 = 최적 조합", {
    x: 0.7, y: 4.65, w: 6.2, h: 0.38,
    fontSize: 10, fontFace: "Malgun Gothic", color: C.GREEN, valign: "middle", margin: 0,
  });

  slide.addText("11 / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 슬라이드 12: 모니터링 스크립트 구성
// ============================================================
function slideMonitoringScripts() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "3장 · 실시간 모니터링", "모니터링 스크립트 — 수동 작성 vs Claude 자동 생성", "12");

  const scripts = [
    {
      title: "실시간 로그 감시", file: "log-monitor.sh", accentColor: C.BLUE,
      code: [
        { t: "LOG=/var/log/messages", c: C.LIME },
        { t: "tail -Fn0 \"$LOG\" | while read L; do", c: C.LIME },
        { t: "  echo $L|grep -qiE \"error|crit\" &&", c: C.SEC },
        { t: "    claude -p \"에러 감지: $L\"", c: C.GREEN },
        { t: "done", c: C.LIME },
      ],
      prompt: "에러/critical 패턴 감지 시\nclaude -p로 자동 분석하는\n로그 감시 스크립트 만들어줘.\nsystemd 서비스로 등록까지 포함해줘.",
    },
    {
      title: "임계값 모니터링", file: "threshold-monitor.sh", accentColor: C.WARN,
      code: [
        { t: "CPU=$(top -bn1|grep Cpu|", c: C.LIME },
        { t: "      awk '{print $2}')", c: C.LIME },
        { t: "[ ${CPU%.*} -gt 90 ] && \\", c: C.SEC },
        { t: "  claude -p \\", c: C.GREEN },
        { t: "  \"CPU ${CPU}% 초과, 원인 분석해줘\"", c: C.GREEN },
      ],
      prompt: "CPU 90% / MEM 85% / DISK 90%\n초과 시 claude -p로 자동 분석.\n모든 마운트포인트 순회하고\ncron 5분 간격으로 실행해줘.",
    },
    {
      title: "종합 대시보드", file: "dashboard.sh", accentColor: C.LIME,
      code: [
        { t: "CPU=$(top -bn1|grep Cpu|awk '{print $2}')", c: C.LIME },
        { t: "MEM=$(free|awk '/Mem/{printf \"%d\",$3/$2*100}')", c: C.LIME },
        { t: "DISK=$(df /|awk 'NR==2{print $5}')", c: C.LIME },
        { t: "echo \"CPU:${CPU}% MEM:${MEM}% DISK:${DISK}\"", c: C.SEC },
        { t: "systemctl list-units --state=failed", c: C.SEC },
      ],
      prompt: "CPU/MEM/DISK 바 그래프와\n서비스 상태를 실시간으로\n표시하는 터미널 대시보드\n스크립트 만들어줘.",
    },
  ];

  // ── 왼쪽: 섹션 헤더 (수동 작성) ────────────────────────
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.5, h: 0.28, fill: { color: C.SURFACE2 }
  });
  slide.addText("✎  수동 작성  (bash 스크립트)", {
    x: 0.5, y: 1.3, w: 4.5, h: 0.28,
    fontSize: 10, fontFace: "Malgun Gothic", color: C.SEC, bold: true,
    align: "center", valign: "middle", margin: 0,
  });

  // ── 오른쪽: 섹션 헤더 (Claude 자동 생성) ────────────────
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 4.55, h: 0.28, fill: { color: "0D1A00" }
  });
  slide.addText("⚡  Claude 자동 생성  (프롬프트 입력만으로)", {
    x: 5.2, y: 1.3, w: 4.55, h: 0.28,
    fontSize: 10, fontFace: "Malgun Gothic", color: C.LIME, bold: true,
    align: "center", valign: "middle", margin: 0,
  });

  const CARD_H = 1.08;
  const CARD_GAP = 0.04;

  scripts.forEach((s, i) => {
    const y = 1.62 + i * (CARD_H + CARD_GAP);

    // ── 왼쪽 카드: 수동 스크립트 ──────────────────────────
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 4.5, h: CARD_H, fill: { color: C.SURFACE }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.05, h: CARD_H, fill: { color: s.accentColor }
    });

    // 파일명
    slide.addText(s.file, {
      x: 0.62, y: y + 0.06, w: 2.2, h: 0.24,
      fontSize: 10, fontFace: "Consolas", color: s.accentColor, bold: true, margin: 0, valign: "middle",
    });
    slide.addText(s.title, {
      x: 2.9, y: y + 0.06, w: 1.9, h: 0.24,
      fontSize: 9, fontFace: "Malgun Gothic", color: C.TERT, margin: 0, valign: "middle",
    });

    // 코드 블록
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.62, y: y + 0.35, w: 4.24, h: 0.67, fill: { color: C.BLACK }
    });
    const codeRuns = [];
    s.code.forEach((ln, li) => {
      codeRuns.push({ text: ln.t, options: { color: ln.c, fontSize: 7.5, fontFace: "Consolas", breakLine: li < s.code.length - 1 } });
    });
    slide.addText(codeRuns, {
      x: 0.7, y: y + 0.38, w: 4.1, h: 0.61,
      margin: 0, valign: "top",
    });

    // ── 오른쪽 카드: Claude 프롬프트 ──────────────────────
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y, w: 4.55, h: CARD_H, fill: { color: "0A0A0A" }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y, w: 0.05, h: CARD_H, fill: { color: C.LIME }
    });

    slide.addText("$ claude  (또는  claude -p \"...\")", {
      x: 5.32, y: y + 0.06, w: 4.3, h: 0.22,
      fontSize: 8.5, fontFace: "Consolas", color: C.LIME, margin: 0, valign: "middle",
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.32, y: y + 0.33, w: 4.2, h: 0.68, fill: { color: C.SURFACE }
    });
    slide.addText(s.prompt, {
      x: 5.42, y: y + 0.36, w: 4.0, h: 0.62,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: C.WHITE, italic: true,
      margin: 0, valign: "top",
    });
  });

  // ── 원커맨드 박스 ──────────────────────────────────────
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 4.77, w: 4.55, h: 0.3, fill: { color: "0D1A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 4.77, w: 0.05, h: 0.3, fill: { color: C.GREEN }
  });
  slide.addText("원커맨드:  \"이 서버 모니터링 환경 전체를 처음부터 구축해줘\"", {
    x: 5.34, y: 4.77, w: 4.3, h: 0.3,
    fontSize: 8.5, fontFace: "Malgun Gothic", color: C.GREEN, bold: true,
    margin: 0, valign: "middle",
  });
}

// ============================================================
// 슬라이드 13: 종합 대시보드 출력 예시
// ============================================================
function slideDashboardPreview() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "3장 · 실시간 모니터링", "대시보드 출력 예시 & Claude 자동 생성 비교", "13");

  // ══ 왼쪽: 터미널 출력 (dashboard.sh 결과) ════════════════
  // 터미널 상단 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 5.4, h: 0.3, fill: { color: C.BORDER }
  });
  slide.addShape(pres.shapes.OVAL, { x: 0.65, y: 1.38, w: 0.12, h: 0.12, fill: { color: C.ERROR } });
  slide.addShape(pres.shapes.OVAL, { x: 0.86, y: 1.38, w: 0.12, h: 0.12, fill: { color: C.WARN } });
  slide.addShape(pres.shapes.OVAL, { x: 1.07, y: 1.38, w: 0.12, h: 0.12, fill: { color: C.GREEN } });
  slide.addText("Terminal  —  dashboard.sh  출력", {
    x: 1.3, y: 1.3, w: 4.5, h: 0.3,
    fontSize: 8.5, fontFace: "Consolas", color: C.SEC, align: "center", valign: "middle", margin: 0,
  });

  // 터미널 바디
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 5.4, h: 3.45, fill: { color: C.SURFACE }
  });
  const termText = [
    { text: "Server Monitoring Dashboard", options: { color: C.LIME, bold: true, fontSize: 10, breakLine: true } },
    { text: "Host: rhel-server  |  2026-03-20 14:30:22", options: { color: C.SEC, fontSize: 8.5, breakLine: true } },
    { text: "", options: { fontSize: 5, breakLine: true } },
    { text: "CPU:  ||||||||....  67%   (정상)", options: { color: C.GREEN, fontSize: 9.5, breakLine: true } },
    { text: "MEM:  ||||||......  52%   4.2G/8G", options: { color: C.GREEN, fontSize: 9.5, breakLine: true } },
    { text: "DISK: ||||||||||..  83%   [WARNING]", options: { color: C.WARN, fontSize: 9.5, breakLine: true } },
    { text: "LOAD: 2.34 / 4 cores", options: { color: C.SEC, fontSize: 9.5, breakLine: true } },
    { text: "", options: { fontSize: 5, breakLine: true } },
    { text: "Services:", options: { color: C.WHITE, bold: true, fontSize: 9.5, breakLine: true } },
    { text: "  [●] httpd  [●] sshd  [●] crond", options: { color: C.GREEN, fontSize: 8.5, breakLine: true } },
    { text: "  [✗] mysqld  → INACTIVE", options: { color: C.ERROR, fontSize: 8.5, breakLine: true } },
    { text: "", options: { fontSize: 5, breakLine: true } },
    { text: "Errors (1h): 3  |  Login Failed: 47", options: { color: C.WARN, fontSize: 8.5 } },
  ];
  slide.addText(termText, {
    x: 0.7, y: 1.7, w: 5.1, h: 3.25,
    fontFace: "Consolas", margin: 0, valign: "top",
  });

  // 실행 명령어 (하단)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.08, w: 5.4, h: 0.0, fill: { color: C.BLACK }
  });
  slide.addText("watch -n 5 /opt/claude-scripts/dashboard.sh", {
    x: 0.5, y: 5.02, w: 5.4, h: 0.22,
    fontSize: 8, fontFace: "Consolas", color: C.TERT, align: "center", margin: 0,
  });

  // ══ 오른쪽: Claude 자동 생성 방법 ════════════════════════
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.1, y: 1.3, w: 3.65, h: 3.75, fill: { color: "0A0A0A" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.1, y: 1.3, w: 3.65, h: 0.04, fill: { color: C.LIME }
  });

  slide.addText("⚡  Claude 자동 생성", {
    x: 6.2, y: 1.4, w: 3.5, h: 0.3,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.LIME, bold: true, margin: 0,
  });

  // 프롬프트 입력
  slide.addText("① 프롬프트 입력", {
    x: 6.2, y: 1.82, w: 3.5, h: 0.24,
    fontSize: 9.5, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.2, y: 2.1, w: 3.45, h: 0.78, fill: { color: C.SURFACE }
  });
  slide.addText(
    "서버 상태를 실시간으로 보여주는\n터미널 대시보드 스크립트 만들어줘.\nCPU/MEM/DISK 바 그래프, 서비스 상태,\n에러 건수를 포함해줘.",
    {
      x: 6.3, y: 2.13, w: 3.25, h: 0.72,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: C.SEC, italic: true, margin: 0, valign: "top",
    }
  );

  // Claude가 자동으로 생성하는 것
  slide.addText("② Claude가 즉시 생성", {
    x: 6.2, y: 3.0, w: 3.5, h: 0.24,
    fontSize: 9.5, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  const genItems = [
    { icon: "▸", text: "dashboard.sh 전체 스크립트 코드", color: C.LIME },
    { icon: "▸", text: "서버 맞춤형 임계값 자동 설정", color: C.LIME },
    { icon: "▸", text: "watch -n 5 실행 명령어 안내", color: C.LIME },
    { icon: "▸", text: "systemd 서비스 등록 방법 포함", color: C.LIME },
  ];
  genItems.forEach((item, i) => {
    slide.addText(item.icon + "  " + item.text, {
      x: 6.2, y: 3.28 + i * 0.28, w: 3.5, h: 0.24,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: item.color, margin: 0,
    });
  });

  // 비교 요약
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.1, y: 4.45, w: 3.65, h: 0.6, fill: { color: "0D1A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.1, y: 4.45, w: 0.05, h: 0.6, fill: { color: C.GREEN }
  });
  slide.addText([
    { text: "수동 작성:  ", options: { color: C.TERT, fontSize: 9 } },
    { text: "30분~1시간  (bash 경험 필요)\n", options: { color: C.SEC, fontSize: 9, breakLine: true } },
    { text: "Claude 생성: ", options: { color: C.LIME, bold: true, fontSize: 9 } },
    { text: "5분 이내  (프롬프트만으로 완성)", options: { color: C.GREEN, bold: true, fontSize: 9 } },
  ], {
    x: 6.22, y: 4.48, w: 3.4, h: 0.55,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle",
  });
}

// ============================================================
// 슬라이드 14: Claude 자동 생성
// ============================================================
function slideAutoGeneration() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "3장 · 실시간 모니터링", "Claude를 활용한 스크립트 자동 생성", "14");

  slide.addText("스크립트 경험 없이도, Claude에게 서버 맞춤형 모니터링 환경을 자동 구축할 수 있습니다.", {
    x: 0.5, y: 1.2, w: 9.0, h: 0.35,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
  });

  const items = [
    { num: "01", title: "실시간 로그 감시", desc: "서버 환경 분석 → 맞춤형 로그 감시\nsystemd 서비스까지 자동 등록", accentColor: C.BLUE },
    { num: "02", title: "임계값 모니터링", desc: "서버 사양 기반 임계값 자동 계산\ncron + 텔레그램 알림까지 설정", accentColor: C.WARN },
    { num: "03", title: "종합 대시보드", desc: "실행 중인 서비스 자동 감지\n맞춤형 터미널 대시보드 생성", accentColor: C.LIME },
    { num: "04", title: "일괄 구축 (원커맨드)", desc: "모니터링 환경 전체를 한번에 구축\n스크립트 8개 + 서비스 등록 + 테스트", accentColor: C.GREEN },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.75;
    const y = 1.7 + row * 1.55;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.55, h: 1.35, fill: { color: C.SURFACE }
    });

    // 넘버 뱃지
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.65, h: 1.35, fill: { color: item.accentColor }
    });
    slide.addText(item.num, {
      x, y, w: 0.65, h: 1.35,
      fontSize: 22, fontFace: "Consolas", color: C.BLACK, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    slide.addText(item.title, {
      x: x + 0.82, y: y + 0.13, w: 3.5, h: 0.35,
      fontSize: 14, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
    });
    slide.addText(item.desc, {
      x: x + 0.82, y: y + 0.55, w: 3.5, h: 0.65,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });
  });

  // 핵심 프롬프트
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.8, w: 9.0, h: 0.35,
    fill: { color: "0D1A00" }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.8, w: 0.05, h: 0.35, fill: { color: C.LIME }
  });
  slide.addText("핵심 프롬프트:  \"이 서버의 모니터링 환경을 처음부터 전체 구축해줘\"", {
    x: 0.7, y: 4.8, w: 8.5, h: 0.35,
    fontSize: 11, fontFace: "Malgun Gothic", color: C.LIME, bold: true, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 15: 수동 vs 자동 비교
// ============================================================
function slideManualVsAuto() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });
  addPageHeader(slide, "3장 · 실시간 모니터링", "수동 작성 vs Claude 자동 생성", "15");

  const compRows = [
    ["소요 시간", "스크립트당 30분~1시간", "전체 환경 5~10분"],
    ["사전 지식", "Bash 스크립팅 경험 필요", "프롬프트 작성 능력만"],
    ["맞춤도", "직접 커스터마이징", "서버 환경 자동 분석"],
    ["유지보수", "직접 수정", "Claude에 개선 요청"],
    ["학습 효과", "스크립트 이해도 높음", "결과물 검토로 학습"],
    ["권장 대상", "Bash 숙련 관리자", "스크립팅 초보 관리자"],
  ];

  const compTable = [
    [
      { text: "비교 항목", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "수동 작성", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Claude 자동 생성", options: { bold: true, color: C.BLACK, fill: { color: C.LIME }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(compRows.map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: "Malgun Gothic",
        color: ci === 2 ? C.LIME : C.WHITE,
        bold: ci === 0,
        align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.SURFACE : C.BLACK },
      }
    })))),
  ];

  // 테이블: 7행 × 0.34 = 2.38 → y=1.3 ~ y=3.68
  slide.addTable(compTable, {
    x: 0.7, y: 1.3, w: 8.6, colW: [2.0, 3.3, 3.3],
    border: { pt: 0.5, color: C.BORDER },
    rowH: [0.34, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34],
  });

  // 비교 숫자 카드 (y=3.82 ~ y=4.62)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 3.82, w: 4.1, h: 0.8, fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 3.82, w: 0.06, h: 0.8, fill: { color: C.SEC }
  });
  slide.addText([
    { text: "30분 ~ 1시간", options: { fontSize: 20, bold: true, color: C.SEC, breakLine: true } },
    { text: "스크립트 1개 작성 소요", options: { fontSize: 10, color: C.TERT } },
  ], {
    x: 0.9, y: 3.82, w: 3.7, h: 0.8,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle", align: "center",
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 3.82, w: 4.1, h: 0.8, fill: { color: C.SURFACE }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 3.82, w: 0.06, h: 0.8, fill: { color: C.LIME }
  });
  slide.addText([
    { text: "5 ~ 10분", options: { fontSize: 20, bold: true, color: C.LIME, breakLine: true } },
    { text: "전체 모니터링 환경 구축", options: { fontSize: 10, color: C.SEC } },
  ], {
    x: 5.4, y: 3.82, w: 3.7, h: 0.8,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle", align: "center",
  });
}

// ============================================================
// 슬라이드 16: 마무리
// ============================================================
function slideEnd() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 좌측 lime 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.07, h: 5.625, fill: { color: C.LIME }
  });

  slide.addText("감사합니다", {
    x: 1.0, y: 1.3, w: 8, h: 1.1,
    fontSize: 52, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0, y: 2.5, w: 2.5, h: 0.04, fill: { color: C.LIME }
  });

  slide.addText("Claude Code 서버관리 요약 매뉴얼", {
    x: 1.0, y: 2.7, w: 8, h: 0.5,
    fontSize: 18, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
  });

  // 요약 3 카드
  const summaries = [
    { num: "01", title: "RHEL 설치", desc: "6단계 설치 + 원커맨드 스크립트" },
    { num: "02", title: "프롬프트 8종", desc: "점검, 분석, 감사, 장애 대응" },
    { num: "03", title: "실시간 모니터링", desc: "스크립트 + Claude 자동 생성" },
  ];

  summaries.forEach((s, i) => {
    const x = 1.0 + i * 2.85;
    const y = 3.5;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.65, h: 1.0, fill: { color: C.SURFACE }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.65, h: 0.04, fill: { color: C.LIME }
    });

    slide.addText([
      { text: s.num + "  ", options: { fontSize: 14, fontFace: "Consolas", color: C.LIME, bold: true } },
      { text: s.title, options: { fontSize: 14, fontFace: "Malgun Gothic", color: C.WHITE, bold: true } },
    ], {
      x: x + 0.15, y: y + 0.12, w: 2.35, h: 0.38,
      margin: 0,
    });

    slide.addText(s.desc, {
      x: x + 0.15, y: y + 0.58, w: 2.35, h: 0.35,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.SEC, margin: 0,
    });
  });

  // 큰 장식 원
  slide.addShape(pres.shapes.OVAL, {
    x: 8.3, y: 0.3, w: 2.0, h: 2.0,
    fill: { color: C.LIME, transparency: 92 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7.5, y: 1.8, w: 1.2, h: 1.2,
    fill: { color: C.LIME, transparency: 95 },
  });

  slide.addText("16 / 16", {
    x: 9.0, y: 5.15, w: 0.9, h: 0.4,
    fontSize: 9, fontFace: "Consolas", color: C.TERT, align: "right", margin: 0,
  });
}

// ============================================================
// 조립 및 저장
// ============================================================
slideCover();
slideAgenda();
slideRequirements();
slideInstallSteps();
slideInstallAuth();
slidePromptIntro();
slideSystemCheck();
slideLogSecurity();
slideSecurityIncident();
slideQuickRef();
slideMonitoringCompare();
slideMonitoringScripts();
slideDashboardPreview();
slideAutoGeneration();
slideManualVsAuto();
slideEnd();

const outputPath = "d:\\Project\\claude-server-manual\\Claude_Code_서버관리_슬라이드.pptx";
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log("PPTX 생성 완료: " + outputPath);
    const fs = require("fs");
    const stats = fs.statSync(outputPath);
    console.log("파일 크기: " + (stats.size / 1024).toFixed(1) + " KB");
  })
  .catch(err => console.error("Error:", err));
