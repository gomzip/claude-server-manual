const pptxgen = require("pptxgenjs");

// ============================================================
// 색상 팔레트 - Midnight Executive + Claude Purple
// ============================================================
const C = {
  NAVY: "0F172A",       // 슬라이드 배경 (어두운)
  NAVY_MID: "1E293B",   // 카드/박스 배경
  NAVY_LIGHT: "334155",
  ICE: "CBD5E1",         // 보조 텍스트
  ICE_LIGHT: "E2E8F0",
  ICE_BG: "F1F5F9",      // 밝은 배경
  WHITE: "FFFFFF",
  PURPLE: "7C3AED",      // Claude 액센트
  PURPLE_LIGHT: "A78BFA",
  PURPLE_BG: "EDE9FE",
  TEAL: "0D9488",        // 성공/정상
  RED: "EF4444",         // 위험/경고
  AMBER: "F59E0B",       // 주의
  BLUE: "3B82F6",        // 정보
  DARK_TEXT: "1E293B",
  LIGHT_TEXT: "94A3B8",
};

// ============================================================
// 공통 스타일 팩토리 (매번 새 객체 생성 - PptxGenJS mutate 방지)
// ============================================================
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });
const makeCardShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.15 });

// ============================================================
// 프레젠테이션 생성
// ============================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Claude Code";
pres.title = "Claude Code 서버관리 요약 매뉴얼";

// ============================================================
// 슬라이드 마스터 정의
// ============================================================
pres.defineSlideMaster({
  title: "DARK_MASTER",
  background: { color: C.NAVY },
  objects: [
    // 하단 바
    { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: C.NAVY_MID } } },
    { text: {
      text: "Claude Code 서버관리 요약 매뉴얼",
      options: { x: 0.5, y: 5.15, w: 6, h: 0.4, fontSize: 9, color: C.LIGHT_TEXT, fontFace: "Malgun Gothic" }
    }},
  ],
});

pres.defineSlideMaster({
  title: "LIGHT_MASTER",
  background: { color: C.ICE_BG },
  objects: [
    // 상단 네이비 바
    { rect: { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.PURPLE } } },
    // 하단 바
    { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: C.WHITE } } },
    { text: {
      text: "Claude Code 서버관리 요약 매뉴얼",
      options: { x: 0.5, y: 5.15, w: 6, h: 0.4, fontSize: 9, color: C.LIGHT_TEXT, fontFace: "Malgun Gothic" }
    }},
  ],
});

// ============================================================
// 슬라이드 1: 타이틀
// ============================================================
function slideCover() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  // 퍼플 그라데이션 효과 대용: 좌측 액센트 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.PURPLE }
  });

  // 메인 타이틀 영역
  slide.addText("서버 관리자를 위한", {
    x: 1.0, y: 1.2, w: 8, h: 0.6,
    fontSize: 20, fontFace: "Malgun Gothic", color: C.ICE, align: "left", margin: 0,
  });

  slide.addText("Claude Code 활용\n요약 매뉴얼", {
    x: 1.0, y: 1.8, w: 8, h: 1.6,
    fontSize: 40, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, align: "left", margin: 0,
    lineSpacingMultiple: 1.15,
  });

  // 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0, y: 3.55, w: 2.5, h: 0.05, fill: { color: C.PURPLE }
  });

  // 서브 정보
  slide.addText("RHEL 8/9  |  설치 · 프롬프트 · 모니터링", {
    x: 1.0, y: 3.8, w: 8, h: 0.5,
    fontSize: 16, fontFace: "Malgun Gothic", color: C.PURPLE_LIGHT, margin: 0,
  });

  slide.addText([
    { text: "대상 OS: ", options: { color: C.LIGHT_TEXT } },
    { text: "Red Hat Enterprise Linux 8.x / 9.x", options: { color: C.ICE } },
  ], {
    x: 1.0, y: 4.4, w: 8, h: 0.35,
    fontSize: 12, fontFace: "Malgun Gothic", margin: 0,
  });

  slide.addText("v1.0 요약본  |  2026-03-20", {
    x: 1.0, y: 4.75, w: 8, h: 0.3,
    fontSize: 11, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
  });

  // 우측 장식 원
  slide.addShape(pres.shapes.OVAL, {
    x: 8.0, y: 0.5, w: 2.5, h: 2.5,
    fill: { color: C.PURPLE, transparency: 85 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7.0, y: 2.5, w: 1.5, h: 1.5,
    fill: { color: C.PURPLE, transparency: 90 },
  });
}

// ============================================================
// 슬라이드 2: 목차
// ============================================================
function slideAgenda() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  slide.addText("목차", {
    x: 0.7, y: 0.3, w: 8, h: 0.7,
    fontSize: 28, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // 구분선
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.PURPLE }
  });

  const chapters = [
    { num: "01", title: "RHEL 환경 Claude Code 설치", desc: "시스템 요구사항, 설치 순서, 인증 설정, 원커맨드 설치 스크립트", icon: ">" },
    { num: "02", title: "서버 관리 프롬프트 샘플", desc: "시스템 점검, 로그 분석, 보안 감사, 장애 대응 등 8가지 핵심 프롬프트", icon: ">" },
    { num: "03", title: "실시간 모니터링", desc: "로그 감시, 임계값 모니터링, 대시보드, Claude 자동 생성", icon: ">" },
  ];

  chapters.forEach((ch, i) => {
    const y = 1.4 + i * 1.3;

    // 카드 배경
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y, w: 8.6, h: 1.1,
      fill: { color: C.NAVY_MID },
      shadow: makeCardShadow(),
    });

    // 좌측 넘버 박스
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y, w: 1.0, h: 1.1,
      fill: { color: C.PURPLE },
    });

    slide.addText(ch.num, {
      x: 0.7, y, w: 1.0, h: 1.1,
      fontSize: 28, fontFace: "Consolas", color: C.WHITE, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    // 제목
    slide.addText(ch.title, {
      x: 2.0, y: y + 0.15, w: 7, h: 0.45,
      fontSize: 18, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
    });

    // 설명
    slide.addText(ch.desc, {
      x: 2.0, y: y + 0.6, w: 7, h: 0.35,
      fontSize: 11, fontFace: "Malgun Gothic", color: C.ICE, margin: 0,
    });
  });
}

// ============================================================
// 슬라이드 3: 시스템 요구사항
// ============================================================
function slideRequirements() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("1장. RHEL 환경 Claude Code 설치", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("시스템 요구사항", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 테이블
  const tableRows = [
    [
      { text: "항목", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "최소 사양", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "권장 사양", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...([
      ["OS", "RHEL 8.6+ / 9.0+", "RHEL 8.10 / 9.4"],
      ["CPU", "1 Core 이상", "2 Core 이상"],
      ["RAM", "1GB 이상", "2GB 이상"],
      ["디스크", "500MB", "1GB"],
      ["Node.js", "v18.0.0 이상", "v20.x LTS"],
      ["네트워크", "외부 인터넷 필수", "안정적인 연결"],
    ].map((row, ri) => row.map(cell => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: "Malgun Gothic", color: C.DARK_TEXT, align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG },
      }
    })))),
  ];

  slide.addTable(tableRows, {
    x: 0.5, y: 1.3, w: 5.0, colW: [1.3, 1.85, 1.85],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.38, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });

  // 우측: 네트워크 요구사항 카드
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.8, y: 1.3, w: 3.8, h: 2.8,
    fill: { color: C.WHITE },
    shadow: makeCardShadow(),
  });

  // 카드 상단 액센트
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.8, y: 1.3, w: 3.8, h: 0.06, fill: { color: C.PURPLE }
  });

  slide.addText("네트워크 요구사항", {
    x: 6.1, y: 1.5, w: 3.3, h: 0.4,
    fontSize: 14, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  const netItems = [
    { domain: "api.anthropic.com", desc: "Claude AI API 통신" },
    { domain: "registry.npmjs.org", desc: "npm 패키지 다운로드" },
    { domain: "console.anthropic.com", desc: "API Key 발급 관리" },
  ];

  netItems.forEach((item, i) => {
    const ny = 2.05 + i * 0.6;
    slide.addText(item.domain, {
      x: 6.1, y: ny, w: 3.3, h: 0.28,
      fontSize: 10, fontFace: "Consolas", color: C.PURPLE, bold: true, margin: 0,
    });
    slide.addText("Port 443 (HTTPS) — " + item.desc, {
      x: 6.1, y: ny + 0.25, w: 3.3, h: 0.25,
      fontSize: 9, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
    });
  });

  // 하단 경고 박스
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.3, w: 9.0, h: 0.6,
    fill: { color: "FEF3C7" },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.3, w: 0.07, h: 0.6, fill: { color: C.AMBER }
  });
  slide.addText("방화벽이나 프록시가 위 도메인을 차단하면 설치 및 실행이 불가합니다. 사전에 네트워크 담당자에게 확인하세요.", {
    x: 0.8, y: 4.3, w: 8.5, h: 0.6,
    fontSize: 10, fontFace: "Malgun Gothic", color: C.DARK_TEXT, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 4: 설치 순서
// ============================================================
function slideInstallSteps() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("1장. RHEL 환경 Claude Code 설치", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("설치 순서 (6단계)", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  const steps = [
    { num: "1", title: "OS 버전 확인", cmd: "cat /etc/redhat-release", desc: "RHEL 8.x / 9.x 확인" },
    { num: "2", title: "EPEL 저장소 활성화", cmd: "dnf install -y epel-release", desc: "RHEL 9: dnf / RHEL 8: yum" },
    { num: "3", title: "Node.js 20.x 설치", cmd: "dnf module enable nodejs:20 -y && dnf install -y nodejs", desc: "AppStream 모듈 설치" },
    { num: "4", title: "npm 업데이트", cmd: "npm install -g npm@latest", desc: "최신 npm으로 업데이트" },
    { num: "5", title: "필수 패키지", cmd: "dnf install -y curl git jq", desc: "자동화 유틸리티 설치" },
    { num: "6", title: "설치 확인", cmd: "node -v && npm -v", desc: "Node.js / npm 버전 확인" },
  ];

  // 2x3 그리드
  steps.forEach((step, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.3 + row * 1.85;

    // 카드
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.9, h: 1.65,
      fill: { color: C.WHITE },
      shadow: makeCardShadow(),
    });

    // 넘버 뱃지
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.45,
      fill: { color: C.PURPLE },
    });
    slide.addText(step.num, {
      x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.45,
      fontSize: 16, fontFace: "Consolas", color: C.WHITE, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    // 제목
    slide.addText(step.title, {
      x: x + 0.7, y: y + 0.18, w: 2.0, h: 0.38,
      fontSize: 13, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0, valign: "middle",
    });

    // 명령어
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.15, y: y + 0.7, w: 2.6, h: 0.45,
      fill: { color: C.NAVY },
    });
    slide.addText("$ " + step.cmd, {
      x: x + 0.25, y: y + 0.7, w: 2.4, h: 0.45,
      fontSize: 8, fontFace: "Consolas", color: C.ICE, margin: 0, valign: "middle",
      shrinkText: true,
    });

    // 설명
    slide.addText(step.desc, {
      x: x + 0.15, y: y + 1.25, w: 2.6, h: 0.3,
      fontSize: 9, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
    });
  });
}

// ============================================================
// 슬라이드 5: Claude Code 설치 & 인증
// ============================================================
function slideInstallAuth() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("1장. RHEL 환경 Claude Code 설치", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("Claude Code 설치 & 인증", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 좌측: 설치
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.3, h: 0.06, fill: { color: C.TEAL }
  });

  slide.addText("npm 전역 설치", {
    x: 0.8, y: 1.5, w: 3.8, h: 0.4,
    fontSize: 15, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 코드 블록
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.0, w: 3.7, h: 0.9,
    fill: { color: C.NAVY },
  });
  slide.addText([
    { text: "$ npm install -g @anthropic-ai/claude-code", options: { breakLine: true, color: C.ICE } },
    { text: "", options: { breakLine: true } },
    { text: "$ claude --version", options: { breakLine: true, color: C.ICE } },
    { text: "Claude Code v1.0.x", options: { color: "4ADE80" } },
  ], {
    x: 0.9, y: 2.05, w: 3.5, h: 0.85,
    fontSize: 9, fontFace: "Consolas", margin: 0, valign: "top",
  });

  // 방화벽 팁
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.1, w: 3.7, h: 0.55,
    fill: { color: "ECFDF5" },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.1, w: 0.06, h: 0.55, fill: { color: C.TEAL }
  });
  slide.addText("대부분 아웃바운드 HTTPS(443)는 기본 허용입니다.\n차단된 경우에만 firewall-cmd 설정이 필요합니다.", {
    x: 1.0, y: 3.1, w: 3.4, h: 0.55,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, valign: "middle", margin: 0,
  });

  // 원커맨드 스크립트
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.85, w: 3.7, h: 0.75,
    fill: { color: C.PURPLE_BG },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.85, w: 0.06, h: 0.75, fill: { color: C.PURPLE }
  });
  slide.addText([
    { text: "원커맨드 설치 스크립트", options: { bold: true, fontSize: 11, breakLine: true } },
    { text: "전체 설치를 하나의 스크립트로 자동 실행 가능", options: { fontSize: 9, color: C.LIGHT_TEXT, breakLine: true } },
    { text: "chmod +x install-claude.sh && ./install-claude.sh", options: { fontSize: 8, fontFace: "Consolas", color: C.PURPLE } },
  ], {
    x: 1.0, y: 3.85, w: 3.4, h: 0.75,
    fontFace: "Malgun Gothic", color: C.DARK_TEXT, valign: "middle", margin: 0,
  });

  // 우측: 인증 비교
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 4.3, h: 0.06, fill: { color: C.PURPLE }
  });

  slide.addText("인증 방식 비교", {
    x: 5.5, y: 1.5, w: 3.8, h: 0.4,
    fontSize: 15, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  const authTable = [
    [
      { text: "", options: { fill: { color: C.NAVY_MID }, color: C.WHITE, bold: true, fontSize: 9, fontFace: "Malgun Gothic" } },
      { text: "API Key (권장)", options: { fill: { color: C.NAVY_MID }, color: C.WHITE, bold: true, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "OAuth (Max)", options: { fill: { color: C.NAVY_MID }, color: C.WHITE, bold: true, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
    ],
    ...([
      ["비용", "사용량 과금", "월 정액"],
      ["설정", "환경변수 설정", "브라우저 인증"],
      ["자동화", "키 고정 사용", "토큰 갱신 필요"],
      ["보안", "키 보호 필요", "토큰 자동 관리"],
      ["서버 적합도", "높음", "보통"],
    ].map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT,
        align: ci === 0 ? "left" : "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG },
      }
    })))),
  ];

  slide.addTable(authTable, {
    x: 5.4, y: 2.05, w: 3.9, colW: [1.1, 1.4, 1.4],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.32, 0.3, 0.3, 0.3, 0.3, 0.3],
  });

  // API Key 경고
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 3.95, w: 3.9, h: 0.55,
    fill: { color: "FEF2F2" },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 3.95, w: 0.06, h: 0.55, fill: { color: C.RED }
  });
  slide.addText("API Key를 스크립트에 하드코딩하지 마세요.\n반드시 환경변수 또는 별도 설정파일로 관리!", {
    x: 5.6, y: 3.95, w: 3.6, h: 0.55,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 6: 프롬프트 실행 방법
// ============================================================
function slidePromptIntro() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  slide.addText("2장. 서버 관리 프롬프트 샘플", {
    x: 0.7, y: 0.3, w: 8, h: 0.7,
    fontSize: 28, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.PURPLE }
  });

  slide.addText("8가지 핵심 프롬프트로 서버 관리를 자동화할 수 있습니다.", {
    x: 0.7, y: 1.1, w: 8, h: 0.5,
    fontSize: 14, fontFace: "Malgun Gothic", color: C.ICE, margin: 0,
  });

  // 실행 방법 4가지 카드
  const methods = [
    { title: "대화형", cmd: "claude", desc: "복잡한 분석,\n후속 질의가 필요한 작업", color: C.PURPLE },
    { title: "비대화형", cmd: 'claude -p "프롬프트"', desc: "자동화, cron,\n스크립트 연동", color: C.TEAL },
    { title: "파일 저장", cmd: 'claude -p "..." > result.log', desc: "결과를\n로그로 보관", color: C.BLUE },
    { title: "JSON 출력", cmd: 'claude -p "..." --output-format json', desc: "파싱이 필요한\n자동화", color: C.AMBER },
  ];

  methods.forEach((m, i) => {
    const x = 0.5 + i * 2.35;
    const y = 1.8;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.15, h: 2.8,
      fill: { color: C.NAVY_MID }, shadow: makeCardShadow(),
    });

    // 상단 컬러 바
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.15, h: 0.06, fill: { color: m.color }
    });

    slide.addText(m.title, {
      x, y: y + 0.2, w: 2.15, h: 0.4,
      fontSize: 16, fontFace: "Malgun Gothic", color: C.WHITE, bold: true,
      align: "center", margin: 0,
    });

    // 명령어
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.15, y: y + 0.7, w: 1.85, h: 0.65,
      fill: { color: C.NAVY },
    });
    slide.addText("$ " + m.cmd, {
      x: x + 0.2, y: y + 0.7, w: 1.75, h: 0.65,
      fontSize: 7.5, fontFace: "Consolas", color: C.ICE, margin: 0, valign: "middle",
      shrinkText: true,
    });

    slide.addText(m.desc, {
      x: x + 0.15, y: y + 1.55, w: 1.85, h: 0.8,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.ICE, align: "center", margin: 0,
    });
  });
}

// ============================================================
// 슬라이드 7: 시스템 상태 점검
// ============================================================
function slideSystemCheck() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("2장. 서버 관리 프롬프트 샘플", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("2.1 시스템 상태 점검", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 좌: 헬스체크
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 0.07, h: 3.5, fill: { color: C.PURPLE }
  });

  slide.addText("서버 전체 헬스체크", {
    x: 0.8, y: 1.45, w: 3.8, h: 0.35,
    fontSize: 14, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.9, w: 3.7, h: 0.55,
    fill: { color: C.PURPLE_BG },
  });
  slide.addText("현재 서버의 전체적인 상태를 점검해줘.\nCPU, 메모리, 디스크, 네트워크, 서비스 상태를 종합 분석해줘.", {
    x: 0.9, y: 1.9, w: 3.5, h: 0.55,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.PURPLE, italic: true, margin: 0, valign: "middle",
  });

  // 출력 예시
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.6, w: 3.7, h: 1.9,
    fill: { color: C.NAVY },
  });
  slide.addText([
    { text: "## 서버 헬스체크 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
    { text: "CPU: 23.5% (정상)", options: { color: "4ADE80", fontSize: 8, breakLine: true } },
    { text: "메모리: 5.2GB/8GB (65%) - 정상", options: { color: "4ADE80", fontSize: 8, breakLine: true } },
    { text: "/var: 78% 사용 (39GB/50GB)", options: { color: C.AMBER, fontSize: 8, breakLine: true } },
    { text: "   [주의] 80% 근접 - 로그 정리 권장", options: { color: C.AMBER, fontSize: 8, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 5 } },
    { text: "종합: /var 파티션 78% - 조치 필요", options: { color: C.RED, bold: true, fontSize: 8 } },
  ], {
    x: 0.9, y: 2.65, w: 3.5, h: 1.8,
    fontFace: "Consolas", margin: 0, valign: "top",
  });

  // 우: 디스크 분석
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 0.07, h: 3.5, fill: { color: C.TEAL }
  });

  slide.addText("디스크 사용량 분석", {
    x: 5.5, y: 1.45, w: 3.8, h: 0.35,
    fontSize: 14, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 1.9, w: 3.7, h: 0.55,
    fill: { color: "ECFDF5" },
  });
  slide.addText("디스크 사용량을 분석해줘.\n파티션별 사용률, Top 10 큰 파일, 정리 추천 항목.", {
    x: 5.6, y: 1.9, w: 3.5, h: 0.55,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.TEAL, italic: true, margin: 0, valign: "middle",
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 2.6, w: 3.7, h: 1.9,
    fill: { color: C.NAVY },
  });
  slide.addText([
    { text: "## 디스크 분석 결과", options: { color: C.WHITE, bold: true, fontSize: 9, breakLine: true } },
    { text: "/     : 45% (23GB/50GB) - 정상", options: { color: "4ADE80", fontSize: 8, breakLine: true } },
    { text: "/var  : 78% (39GB/50GB) - 주의", options: { color: C.AMBER, fontSize: 8, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 5 } },
    { text: "정리 추천:", options: { color: C.WHITE, bold: true, fontSize: 8, breakLine: true } },
    { text: "1. /var/cache/dnf (3.2GB)", options: { color: C.ICE, fontSize: 8, breakLine: true } },
    { text: "2. /var/log/journal (4.5GB)", options: { color: C.ICE, fontSize: 8, breakLine: true } },
    { text: "3. 3개월 이전 로그 (2.1GB)", options: { color: C.ICE, fontSize: 8 } },
  ], {
    x: 5.6, y: 2.65, w: 3.5, h: 1.8,
    fontFace: "Consolas", margin: 0, valign: "top",
  });
}

// ============================================================
// 슬라이드 8: 로그 & 보안 분석
// ============================================================
function slideLogSecurity() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("2장. 서버 관리 프롬프트 샘플", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("2.2 로그 분석 & 보안 로그", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 좌: 시스템 로그
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 0.07, h: 3.5, fill: { color: C.BLUE }
  });

  slide.addText("시스템 로그 분석 (24시간)", {
    x: 0.8, y: 1.45, w: 3.8, h: 0.35,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.9, w: 3.7, h: 0.45,
    fill: { color: "EFF6FF" },
  });
  slide.addText("/var/log/messages 최근 24시간 에러/경고\n분류, 빈도 정리, 심각도 평가", {
    x: 0.9, y: 1.9, w: 3.5, h: 0.45,
    fontSize: 8.5, fontFace: "Malgun Gothic", color: C.BLUE, italic: true, margin: 0, valign: "middle",
  });

  // 에러 테이블
  const logTable = [
    [
      { text: "심각도", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "서비스", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "메시지", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "건수", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
    ],
    [
      { text: "ERROR", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.RED, bold: true, align: "center" } },
      { text: "httpd", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, align: "center" } },
      { text: "Connection refused", options: { fontSize: 8, fontFace: "Consolas", color: C.DARK_TEXT } },
      { text: "12", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, align: "center" } },
    ],
    [
      { text: "WARN", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.AMBER, bold: true, align: "center", fill: { color: C.ICE_BG } } },
      { text: "chronyd", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, fill: { color: C.ICE_BG }, align: "center" } },
      { text: "Source unreachable", options: { fontSize: 8, fontFace: "Consolas", color: C.DARK_TEXT, fill: { color: C.ICE_BG } } },
      { text: "7", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, fill: { color: C.ICE_BG }, align: "center" } },
    ],
  ];
  slide.addTable(logTable, {
    x: 0.8, y: 2.5, w: 3.7, colW: [0.7, 0.8, 1.4, 0.5],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.3, 0.28, 0.28],
  });

  slide.addText("CRITICAL 1건 이상 = 즉시 대응\nERROR = 패턴 확인 / WARNING = 추세 관찰", {
    x: 0.8, y: 3.5, w: 3.7, h: 0.4,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
  });

  // 우: 보안 로그
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 4.3, h: 3.5,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.3, w: 0.07, h: 3.5, fill: { color: C.RED }
  });

  slide.addText("보안 로그 분석 (로그인)", {
    x: 5.5, y: 1.45, w: 3.8, h: 0.35,
    fontSize: 13, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 1.9, w: 3.7, h: 0.45,
    fill: { color: "FEF2F2" },
  });
  slide.addText("/var/log/secure 로그인 시도 분석\nBrute force 패턴, 공격 IP 차단 권고", {
    x: 5.6, y: 1.9, w: 3.5, h: 0.45,
    fontSize: 8.5, fontFace: "Malgun Gothic", color: C.RED, italic: true, margin: 0, valign: "middle",
  });

  // 큰 숫자 callout
  slide.addText([
    { text: "342", options: { fontSize: 32, bold: true, color: C.RED } },
    { text: "  실패 건수 (24h)", options: { fontSize: 11, color: C.DARK_TEXT } },
  ], {
    x: 5.5, y: 2.5, w: 3.7, h: 0.6,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle",
  });

  // IP 테이블
  const secTable = [
    [
      { text: "IP", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "건수", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
      { text: "판단", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 9, fontFace: "Malgun Gothic", align: "center" } },
    ],
    [
      { text: "203.0.113.45", options: { fontSize: 8, fontFace: "Consolas", color: C.DARK_TEXT, align: "center" } },
      { text: "187", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.RED, bold: true, align: "center" } },
      { text: "차단 권고", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.RED, bold: true, align: "center" } },
    ],
    [
      { text: "198.51.100.22", options: { fontSize: 8, fontFace: "Consolas", color: C.DARK_TEXT, fill: { color: C.ICE_BG }, align: "center" } },
      { text: "98", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.RED, bold: true, fill: { color: C.ICE_BG }, align: "center" } },
      { text: "차단 권고", options: { fontSize: 9, fontFace: "Malgun Gothic", color: C.RED, bold: true, fill: { color: C.ICE_BG }, align: "center" } },
    ],
  ];
  slide.addTable(secTable, {
    x: 5.5, y: 3.2, w: 3.7, colW: [1.4, 0.8, 1.2],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.3, 0.28, 0.28],
  });

  slide.addText("50회 이상 실패 = Brute force / fail2ban 설치 권장", {
    x: 5.5, y: 4.2, w: 3.7, h: 0.35,
    fontSize: 9, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
  });
}

// ============================================================
// 슬라이드 9: 보안 & 장애 대응
// ============================================================
function slideSecurityIncident() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("2장. 서버 관리 프롬프트 샘플", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("2.3 보안 취약점 & 2.4 장애 대응", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 4개 카드 (2x2)
  const cards = [
    {
      title: "열린 포트 점검", color: C.BLUE,
      prompt: "열린 포트와 리스닝 서비스 점검",
      result: "MySQL(3306) 0.0.0.0 바인딩\n→ [위험] 외부 노출됨\n→ 127.0.0.1로 변경 필요",
    },
    {
      title: "SSH 보안 감사", color: C.RED,
      prompt: "sshd_config CIS Benchmark 감사",
      result: "PermitRootLogin: yes → [위험]\nPasswordAuth: yes → [주의]\n점수: 4/10 (개선 필요)",
    },
    {
      title: "서비스 다운 분석", color: C.AMBER,
      prompt: "httpd 서비스 다운 원인 분석",
      result: "SSL 인증서 누락 확인\n→ 설정 파일 복원\n→ httpd -t 검증 후 재시작",
    },
    {
      title: "OOM Killer 분석", color: C.PURPLE,
      prompt: "OOM Killer 발동 분석 및 재발 방지",
      result: "Java 프로세스 3.8GB (Xmx 미설정)\n→ -Xmx4g 설정 권장\n→ systemd MemoryMax=5G",
    },
  ];

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.3 + row * 1.85;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.4, h: 1.65,
      fill: { color: C.WHITE }, shadow: makeCardShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.07, h: 1.65, fill: { color: card.color }
    });

    slide.addText(card.title, {
      x: x + 0.2, y: y + 0.08, w: 4.0, h: 0.3,
      fontSize: 13, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
    });

    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: y + 0.4, w: 4.0, h: 0.3,
      fill: { color: C.ICE_BG },
    });
    slide.addText(card.prompt, {
      x: x + 0.3, y: y + 0.4, w: 3.8, h: 0.3,
      fontSize: 8.5, fontFace: "Malgun Gothic", color: C.PURPLE, italic: true, margin: 0, valign: "middle",
    });

    slide.addText(card.result, {
      x: x + 0.3, y: y + 0.8, w: 3.8, h: 0.75,
      fontSize: 9, fontFace: "Malgun Gothic", color: C.DARK_TEXT, margin: 0, valign: "top",
    });
  });
}

// ============================================================
// 슬라이드 10: 프롬프트 빠른 참조표
// ============================================================
function slideQuickRef() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("2장. 서버 관리 프롬프트 샘플", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("프롬프트 빠른 참조표", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

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
      { text: "카테고리", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "프롬프트 (요약)", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "실행 방법", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 10, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(refData.map((row, ri) => [
      { text: row[0], options: { fontSize: 10, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, align: "center", valign: "middle", fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG } } },
      { text: row[1], options: { fontSize: 10, fontFace: "Malgun Gothic", color: C.DARK_TEXT, valign: "middle", fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG } } },
      { text: row[2], options: { fontSize: 9, fontFace: "Consolas", color: C.DARK_TEXT, align: "center", valign: "middle", fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG } } },
    ])),
  ];

  slide.addTable(tableRows, {
    x: 0.5, y: 1.3, w: 9.0, colW: [1.2, 4.5, 3.0],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.38, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35],
  });
}

// ============================================================
// 슬라이드 11: Claude Code vs 기존 도구
// ============================================================
function slideMonitoringCompare() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  slide.addText("3장. 실시간 모니터링", {
    x: 0.7, y: 0.3, w: 8, h: 0.7,
    fontSize: 28, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 0.95, w: 1.5, h: 0.04, fill: { color: C.PURPLE }
  });

  slide.addText("Claude Code vs 기존 모니터링 도구", {
    x: 0.7, y: 1.1, w: 8, h: 0.5,
    fontSize: 16, fontFace: "Malgun Gothic", color: C.ICE, margin: 0,
  });

  // 비교 테이블
  const compData = [
    ["설치 복잡도", "매우 간단 (npm)", "복잡 (서버+에이전트+DB)"],
    ["분석 능력", "자연어 심층 분석", "임계값 기반 알림"],
    ["실시간성", "요청 시 분석", "에이전트 실시간 수집"],
    ["비용", "API 사용량 과금", "오픈소스 + 인프라"],
    ["적합 용도", "로그 분석, 원인 규명", "메트릭 수집, 대시보드"],
    ["강점", "분석 · 해석", "수집 · 시각화"],
  ];

  const compTable = [
    [
      { text: "비교 항목", options: { bold: true, color: C.WHITE, fill: { color: C.PURPLE }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Claude Code", options: { bold: true, color: C.WHITE, fill: { color: C.PURPLE }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Zabbix / Prometheus", options: { bold: true, color: C.WHITE, fill: { color: C.PURPLE }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(compData.map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: "Malgun Gothic",
        color: ci === 0 ? C.ICE : C.WHITE,
        bold: ci === 0,
        align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.NAVY_MID : C.NAVY_LIGHT },
      }
    })))),
  ];

  slide.addTable(compTable, {
    x: 0.7, y: 1.7, w: 8.6, colW: [2.0, 3.3, 3.3],
    border: { pt: 0.5, color: C.NAVY_LIGHT },
    rowH: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
  });

  // 하단 팁
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.6, w: 8.6, h: 0.45,
    fill: { color: C.NAVY_MID },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.6, w: 0.07, h: 0.45, fill: { color: C.TEAL }
  });
  slide.addText("상호 보완 관계: 기존 도구로 수집/알림 + Claude Code로 심층 분석 = 최적 조합", {
    x: 1.0, y: 4.6, w: 8.0, h: 0.45,
    fontSize: 11, fontFace: "Malgun Gothic", color: C.ICE, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 12: 모니터링 스크립트 개요
// ============================================================
function slideMonitoringScripts() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("3장. 실시간 모니터링", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("모니터링 스크립트 구성", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 3개 카드
  const scripts = [
    {
      title: "실시간 로그 감시", file: "log-monitor.sh", color: C.BLUE,
      features: [
        "tail -Fn0 실시간 감시",
        "error/critical/panic 패턴 감지",
        "claude -p로 자동 분석",
        "동일 패턴 10분 쿨다운",
        "systemd 서비스로 등록",
      ],
    },
    {
      title: "임계값 모니터링", file: "threshold-monitor.sh", color: C.AMBER,
      features: [
        "CPU 90% / MEM 85% / DISK 90%",
        "임계값 초과 시 자동 분석",
        "모든 마운트포인트 순회",
        "알림 전송 (텔레그램/슬랙)",
        "cron 5분 간격 실행",
      ],
    },
    {
      title: "종합 대시보드", file: "dashboard.sh", color: C.TEAL,
      features: [
        "CPU/MEM/DISK 바 그래프",
        "서비스 상태 자동 감지",
        "에러/로그인 실패 건수",
        "임계값 색상 경고 표시",
        "watch -n 5 자동 갱신",
      ],
    },
  ];

  scripts.forEach((s, i) => {
    const x = 0.5 + i * 3.15;
    const y = 1.3;

    // 카드 배경
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.95, h: 3.5,
      fill: { color: C.WHITE }, shadow: makeCardShadow(),
    });

    // 상단 컬러바
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.95, h: 0.06, fill: { color: s.color }
    });

    // 제목
    slide.addText(s.title, {
      x: x + 0.2, y: y + 0.2, w: 2.55, h: 0.35,
      fontSize: 14, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
    });

    // 파일명
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: y + 0.6, w: 2.55, h: 0.3,
      fill: { color: C.NAVY },
    });
    slide.addText(s.file, {
      x: x + 0.3, y: y + 0.6, w: 2.35, h: 0.3,
      fontSize: 9, fontFace: "Consolas", color: C.ICE, margin: 0, valign: "middle",
    });

    // 기능 목록
    s.features.forEach((f, fi) => {
      const fy = y + 1.1 + fi * 0.42;
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.25, y: fy + 0.08, w: 0.12, h: 0.12,
        fill: { color: s.color },
      });
      slide.addText(f, {
        x: x + 0.5, y: fy, w: 2.2, h: 0.35,
        fontSize: 10, fontFace: "Malgun Gothic", color: C.DARK_TEXT, margin: 0, valign: "middle",
      });
    });
  });
}

// ============================================================
// 슬라이드 13: 대시보드 출력 예시
// ============================================================
function slideDashboardPreview() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  slide.addText("3장. 실시간 모니터링", {
    x: 0.7, y: 0.2, w: 5, h: 0.4,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE_LIGHT, bold: true, margin: 0,
  });
  slide.addText("종합 대시보드 출력 예시", {
    x: 0.7, y: 0.5, w: 9, h: 0.5,
    fontSize: 22, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  // 터미널 프레임
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 1.1, w: 7.0, h: 0.35,
    fill: { color: "374151" },
  });
  // 터미널 3 dots
  slide.addShape(pres.shapes.OVAL, { x: 1.65, y: 1.2, w: 0.15, h: 0.15, fill: { color: C.RED } });
  slide.addShape(pres.shapes.OVAL, { x: 1.9, y: 1.2, w: 0.15, h: 0.15, fill: { color: C.AMBER } });
  slide.addShape(pres.shapes.OVAL, { x: 2.15, y: 1.2, w: 0.15, h: 0.15, fill: { color: C.TEAL } });

  slide.addText("Terminal — dashboard.sh", {
    x: 3.5, y: 1.1, w: 4, h: 0.35,
    fontSize: 9, fontFace: "Consolas", color: C.ICE, align: "center", valign: "middle", margin: 0,
  });

  // 터미널 바디
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 1.45, w: 7.0, h: 3.7,
    fill: { color: "111827" },
  });

  const termLines = [
    { text: "Server Monitoring Dashboard", opts: { color: C.BLUE, bold: true, fontSize: 11 } },
    { text: "Host: rhel-server  |  2026-03-20 14:30:22", opts: { color: C.ICE, fontSize: 9 } },
    { text: "", opts: { fontSize: 6 } },
    { text: "CPU:  ||||||||....  67%", opts: { color: "4ADE80", fontSize: 10 } },
    { text: "MEM:  ||||||......  52%  (4.2G/8G)", opts: { color: "4ADE80", fontSize: 10 } },
    { text: "DISK: ||||||||||..  83%  [WARNING]", opts: { color: C.AMBER, fontSize: 10 } },
    { text: "LOAD: 2.34 / 4 cores", opts: { color: C.ICE, fontSize: 10 } },
    { text: "", opts: { fontSize: 6 } },
    { text: "Services:", opts: { color: C.WHITE, bold: true, fontSize: 10 } },
    { text: "  httpd    sshd    crond    firewalld", opts: { color: "4ADE80", fontSize: 9 } },
    { text: "  mysqld [DOWN]", opts: { color: C.RED, fontSize: 9 } },
    { text: "", opts: { fontSize: 6 } },
    { text: "Errors (1h): 3  |  Logins Failed (24h): 47", opts: { color: C.AMBER, fontSize: 9 } },
  ];

  const termTextArr = termLines.map((line, i) => ({
    text: line.text,
    options: {
      ...line.opts,
      fontFace: "Consolas",
      breakLine: i < termLines.length - 1,
    },
  }));

  slide.addText(termTextArr, {
    x: 2.0, y: 1.6, w: 6.0, h: 3.4,
    margin: 0, valign: "top",
  });

  // 실행 명령어
  slide.addText("실행: watch -n 5 /opt/claude-scripts/dashboard.sh", {
    x: 1.5, y: 5.2, w: 7.0, h: 0.3,
    fontSize: 10, fontFace: "Consolas", color: C.PURPLE_LIGHT, align: "center", margin: 0,
  });
}

// ============================================================
// 슬라이드 14: Claude 자동 생성
// ============================================================
function slideAutoGeneration() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("3장. 실시간 모니터링", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("Claude를 활용한 스크립트 자동 생성", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 22, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  slide.addText("스크립트 작성 경험 없이도, Claude에게 서버 맞춤형 모니터링 환경을 자동 구축할 수 있습니다.", {
    x: 0.5, y: 1.15, w: 9, h: 0.35,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
  });

  // 4가지 자동 생성 항목
  const items = [
    { num: "01", title: "실시간 로그 감시", desc: "서버 환경 분석 → 맞춤형 로그 감시\nsystemd 서비스까지 자동 등록", color: C.BLUE },
    { num: "02", title: "임계값 모니터링", desc: "서버 사양 기반 임계값 자동 계산\ncron + 텔레그램 알림까지 설정", color: C.AMBER },
    { num: "03", title: "종합 대시보드", desc: "실행 중인 서비스 자동 감지\n맞춤형 터미널 대시보드 생성", color: C.TEAL },
    { num: "04", title: "일괄 구축 (원커맨드)", desc: "모니터링 환경 전체를 한번에 구축\n스크립트 8개 + 서비스 등록 + 테스트", color: C.PURPLE },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.65 + row * 1.5;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.4, h: 1.3,
      fill: { color: C.WHITE }, shadow: makeCardShadow(),
    });

    // 넘버 뱃지
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.7, h: 1.3,
      fill: { color: item.color },
    });
    slide.addText(item.num, {
      x, y, w: 0.7, h: 1.3,
      fontSize: 20, fontFace: "Consolas", color: C.WHITE, bold: true,
      align: "center", valign: "middle", margin: 0,
    });

    slide.addText(item.title, {
      x: x + 0.9, y: y + 0.15, w: 3.3, h: 0.35,
      fontSize: 14, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
    });

    slide.addText(item.desc, {
      x: x + 0.9, y: y + 0.55, w: 3.3, h: 0.6,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.LIGHT_TEXT, margin: 0,
    });
  });

  // 하단 핵심 프롬프트
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.7, w: 9.0, h: 0.35,
    fill: { color: C.PURPLE_BG },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.7, w: 0.07, h: 0.35, fill: { color: C.PURPLE }
  });
  slide.addText("핵심 프롬프트:  \"이 서버의 모니터링 환경을 처음부터 전체 구축해줘\"", {
    x: 0.8, y: 4.7, w: 8.5, h: 0.35,
    fontSize: 11, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, valign: "middle", margin: 0,
  });
}

// ============================================================
// 슬라이드 15: 수동 vs 자동 비교
// ============================================================
function slideManualVsAuto() {
  const slide = pres.addSlide({ masterName: "LIGHT_MASTER" });

  slide.addText("3장. 실시간 모니터링", {
    x: 0.5, y: 0.2, w: 9, h: 0.5,
    fontSize: 12, fontFace: "Malgun Gothic", color: C.PURPLE, bold: true, margin: 0,
  });
  slide.addText("수동 작성 vs Claude 자동 생성", {
    x: 0.5, y: 0.6, w: 9, h: 0.6,
    fontSize: 24, fontFace: "Malgun Gothic", color: C.DARK_TEXT, bold: true, margin: 0,
  });

  // 비교 테이블
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
      { text: "비교 항목", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "수동 작성 (3.2~3.4절)", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
      { text: "Claude 자동 생성 (3.5절)", options: { bold: true, color: C.WHITE, fill: { color: C.NAVY_MID }, fontSize: 11, fontFace: "Malgun Gothic", align: "center", valign: "middle" } },
    ],
    ...(compRows.map((row, ri) => row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 11, fontFace: "Malgun Gothic",
        color: C.DARK_TEXT,
        bold: ci === 0,
        align: "center", valign: "middle",
        fill: { color: ri % 2 === 0 ? C.WHITE : C.ICE_BG },
      }
    })))),
  ];

  slide.addTable(compTable, {
    x: 0.7, y: 1.3, w: 8.6, colW: [2.0, 3.3, 3.3],
    border: { pt: 0.5, color: C.ICE_LIGHT },
    rowH: [0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
  });

  // 큰 숫자 비교
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.0, w: 4.1, h: 0.85,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.0, w: 0.07, h: 0.85, fill: { color: C.LIGHT_TEXT }
  });
  slide.addText([
    { text: "30분~1시간", options: { fontSize: 24, bold: true, color: C.LIGHT_TEXT } },
    { text: "\n스크립트 1개 작성 소요", options: { fontSize: 10, color: C.LIGHT_TEXT } },
  ], {
    x: 1.0, y: 4.0, w: 3.5, h: 0.85,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle", align: "center",
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 4.0, w: 4.1, h: 0.85,
    fill: { color: C.WHITE }, shadow: makeCardShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 4.0, w: 0.07, h: 0.85, fill: { color: C.PURPLE }
  });
  slide.addText([
    { text: "5~10분", options: { fontSize: 24, bold: true, color: C.PURPLE } },
    { text: "\n전체 모니터링 환경 구축", options: { fontSize: 10, color: C.PURPLE } },
  ], {
    x: 5.5, y: 4.0, w: 3.5, h: 0.85,
    fontFace: "Malgun Gothic", margin: 0, valign: "middle", align: "center",
  });
}

// ============================================================
// 슬라이드 16: 마무리
// ============================================================
function slideEnd() {
  const slide = pres.addSlide({ masterName: "DARK_MASTER" });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.PURPLE }
  });

  slide.addText("감사합니다", {
    x: 1.0, y: 1.5, w: 8, h: 1.0,
    fontSize: 40, fontFace: "Malgun Gothic", color: C.WHITE, bold: true, margin: 0,
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0, y: 2.6, w: 2.5, h: 0.05, fill: { color: C.PURPLE }
  });

  slide.addText("Claude Code 서버관리 요약 매뉴얼", {
    x: 1.0, y: 2.85, w: 8, h: 0.5,
    fontSize: 18, fontFace: "Malgun Gothic", color: C.PURPLE_LIGHT, margin: 0,
  });

  // 3개 요약 카드
  const summaries = [
    { num: "01", title: "RHEL 설치", desc: "6단계 설치 + 원커맨드 스크립트" },
    { num: "02", title: "프롬프트 8종", desc: "점검, 분석, 감사, 장애 대응" },
    { num: "03", title: "실시간 모니터링", desc: "스크립트 + Claude 자동 생성" },
  ];

  summaries.forEach((s, i) => {
    const x = 1.0 + i * 2.8;
    const y = 3.7;

    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.5, h: 1.0,
      fill: { color: C.NAVY_MID }, shadow: makeCardShadow(),
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.5, h: 0.05, fill: { color: C.PURPLE }
    });

    slide.addText([
      { text: s.num + "  ", options: { fontSize: 14, fontFace: "Consolas", color: C.PURPLE_LIGHT, bold: true } },
      { text: s.title, options: { fontSize: 14, fontFace: "Malgun Gothic", color: C.WHITE, bold: true } },
    ], {
      x: x + 0.15, y: y + 0.15, w: 2.2, h: 0.35,
      margin: 0,
    });

    slide.addText(s.desc, {
      x: x + 0.15, y: y + 0.55, w: 2.2, h: 0.35,
      fontSize: 10, fontFace: "Malgun Gothic", color: C.ICE, margin: 0,
    });
  });

  // 장식 원
  slide.addShape(pres.shapes.OVAL, {
    x: 8.2, y: 0.5, w: 2.0, h: 2.0,
    fill: { color: C.PURPLE, transparency: 88 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7.3, y: 2.0, w: 1.2, h: 1.2,
    fill: { color: C.PURPLE, transparency: 92 },
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

const outputPath = "D:\\workspace\\claude-server-manual\\Claude_Code_서버관리_요약매뉴얼.pptx";
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log("PPTX 생성 완료: " + outputPath);
    const fs = require("fs");
    const stats = fs.statSync(outputPath);
    console.log("파일 크기: " + (stats.size / 1024).toFixed(1) + " KB");
  })
  .catch(err => console.error("Error:", err));
