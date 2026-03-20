const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

// ============================================================
// 공통 설정
// ============================================================
const FONT_BODY = "Malgun Gothic";
const FONT_CODE = "Consolas";
const COLOR_PRIMARY = "1F4E79";
const COLOR_DARK = "333333";
const COLOR_LIGHT_GRAY = "F2F2F2";
const COLOR_WHITE = "FFFFFF";
const COLOR_WARNING_BG = "FFF3CD";
const COLOR_WARNING_BORDER = "FFC107";
const COLOR_TIP_BG = "D1ECF1";
const COLOR_TIP_BORDER = "0DCAF0";
const COLOR_IMPORTANT_BG = "E8D5F5";
const COLOR_IMPORTANT_BORDER = "9B59B6";
const COLOR_TABLE_ALT = "F8F9FA";
const COLOR_CLAUDE_BG = "F0E6FF";
const COLOR_CLAUDE_BORDER = "7C3AED";

const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ============================================================
// 헬퍼 함수
// ============================================================
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, font: FONT_BODY, size: 32, bold: true, color: COLOR_PRIMARY })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 180 },
    children: [new TextRun({ text, font: FONT_BODY, size: 28, bold: true, color: COLOR_DARK })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: FONT_BODY, size: 24, bold: true, color: COLOR_DARK })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    ...opts,
    children: [new TextRun({ text, font: FONT_BODY, size: 22, color: COLOR_DARK, ...opts.run })],
  });
}

function paraRuns(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    ...opts,
    children: runs.map(r =>
      typeof r === "string"
        ? new TextRun({ text: r, font: FONT_BODY, size: 22, color: COLOR_DARK })
        : new TextRun({ font: FONT_BODY, size: 22, color: COLOR_DARK, ...r })
    ),
  });
}

function codeBlock(lines) {
  return lines.map((line, i) =>
    new Paragraph({
      spacing: { before: i === 0 ? 80 : 0, after: i === lines.length - 1 ? 80 : 0, line: 276 },
      shading: { fill: COLOR_LIGHT_GRAY, type: ShadingType.CLEAR },
      indent: { left: 200, right: 200 },
      children: [new TextRun({ text: line || " ", font: FONT_CODE, size: 20, color: COLOR_DARK })],
    })
  );
}

function terminalBlock(lines) {
  const all = [];
  all.push(new Paragraph({
    spacing: { before: 120, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: "666666" }, left: { style: BorderStyle.SINGLE, size: 1, color: "666666" }, right: { style: BorderStyle.SINGLE, size: 1, color: "666666" } },
    shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
    indent: { left: 100, right: 100 },
    children: [new TextRun({ text: "  Terminal", font: FONT_CODE, size: 18, color: "AAAAAA" })],
  }));
  lines.forEach((line, i) => {
    all.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 276 },
      border: { left: { style: BorderStyle.SINGLE, size: 1, color: "666666" }, right: { style: BorderStyle.SINGLE, size: 1, color: "666666" }, ...(i === lines.length - 1 ? { bottom: { style: BorderStyle.SINGLE, size: 1, color: "666666" } } : {}) },
      shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
      indent: { left: 100, right: 100 },
      children: [new TextRun({ text: "  " + (line || " "), font: FONT_CODE, size: 18, color: "E0E0E0" })],
    }));
  });
  all.push(emptyPara());
  return all;
}

function warningBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 360 },
    shading: { fill: COLOR_WARNING_BG, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_WARNING_BORDER } },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: "\u26A0\uFE0F " + text, font: FONT_BODY, size: 22, color: COLOR_DARK })],
  });
}

function tipBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 360 },
    shading: { fill: COLOR_TIP_BG, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_TIP_BORDER } },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: "\uD83D\uDCA1 " + text, font: FONT_BODY, size: 22, color: COLOR_DARK })],
  });
}

function importantBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 360 },
    shading: { fill: COLOR_IMPORTANT_BG, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_IMPORTANT_BORDER } },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: "\uD83D\uDCCC " + text, font: FONT_BODY, size: 22, color: COLOR_DARK })],
  });
}

function claudeBox(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 360 },
    shading: { fill: COLOR_CLAUDE_BG, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_CLAUDE_BORDER } },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text: "\uD83E\uDD16 " + text, font: FONT_BODY, size: 22, color: COLOR_DARK })],
  });
}

function emptyPara() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT_BODY, size: 20, bold: true, color: COLOR_WHITE })] })],
      })
    ),
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: ri % 2 === 1 ? { fill: COLOR_TABLE_ALT, type: ShadingType.CLEAR } : undefined,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), font: FONT_BODY, size: 20, color: COLOR_DARK })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

function promptSample(title, prompt, execMethod, outputLines, interpretation, followUp, claudeFollowUp) {
  const items = [
    heading3(title),
    importantBox("프롬프트 (복사하여 사용)"),
    ...codeBlock([prompt]),
    emptyPara(),
    para("실행 방법:", { run: { bold: true } }),
    para(execMethod),
    emptyPara(),
    para("예상 출력 화면:", { run: { bold: true } }),
    ...terminalBlock(outputLines),
    para("출력 결과 해석:", { run: { bold: true } }),
    para(interpretation),
    emptyPara(),
    paraRuns([{ text: "\uD83D\uDD27 후속 조치 (수동):", bold: true }]),
    para(followUp),
    emptyPara(),
  ];
  if (claudeFollowUp) {
    items.push(
      paraRuns([{ text: "\uD83E\uDD16 후속 조치 (Claude 활용):", bold: true, color: COLOR_PRIMARY }]),
      tipBox(claudeFollowUp.description),
    );
    if (claudeFollowUp.prompt) {
      items.push(
        para("Claude 후속 프롬프트:", { run: { bold: true } }),
        ...codeBlock(Array.isArray(claudeFollowUp.prompt) ? claudeFollowUp.prompt : [claudeFollowUp.prompt]),
      );
    }
    if (claudeFollowUp.terminal) {
      items.push(
        para("실행 예시:", { run: { bold: true } }),
        ...terminalBlock(claudeFollowUp.terminal),
      );
    }
    items.push(emptyPara());
  }
  return items;
}

// ============================================================
// 표지
// ============================================================
function coverPage() {
  return [
    emptyPara(), emptyPara(), emptyPara(), emptyPara(), emptyPara(),
    emptyPara(), emptyPara(), emptyPara(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "서버 관리자를 위한", font: FONT_BODY, size: 36, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "Claude Code 활용 요약 매뉴얼", font: FONT_BODY, size: 48, bold: true, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "RHEL 8/9 | 설치 · 프롬프트 · 모니터링", font: FONT_BODY, size: 28, color: "666666" })],
    }),
    emptyPara(), emptyPara(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "대상 OS: Red Hat Enterprise Linux 8.x / 9.x", font: FONT_BODY, size: 22, color: COLOR_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "대상 독자: 초보~중급 서버 관리자", font: FONT_BODY, size: 22, color: COLOR_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: `문서 버전: v1.0 (요약본)  |  작성일: ${new Date().toISOString().slice(0, 10)}`, font: FONT_BODY, size: 22, color: "999999" })],
    }),
    emptyPara(), emptyPara(), emptyPara(), emptyPara(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "본 문서는 전체 매뉴얼의 핵심 내용을 발췌·요약한 Quick Reference 입니다.", font: FONT_BODY, size: 20, italics: true, color: "999999" })],
    }),
  ];
}

// ============================================================
// 1장. RHEL 설치 가이드
// ============================================================
function chapterInstall() {
  return [
    heading1("1장. RHEL 환경 Claude Code 설치"),

    heading2("1.1 시스템 요구사항"),
    makeTable(
      ["항목", "최소 사양", "권장 사양"],
      [
        ["OS", "RHEL 8.6+ / 9.0+", "RHEL 8.10 / 9.4"],
        ["CPU", "1 Core 이상", "2 Core 이상"],
        ["RAM", "1GB 이상", "2GB 이상"],
        ["디스크 여유 공간", "500MB", "1GB"],
        ["Node.js", "v18.0.0 이상", "v20.x LTS"],
        ["네트워크", "외부 인터넷 연결 필수", "안정적인 인터넷 연결"],
      ],
      [2500, 3263, 3263]
    ),
    emptyPara(),

    heading3("네트워크 요구사항"),
    makeTable(
      ["도메인", "포트", "용도"],
      [
        ["api.anthropic.com", "443 (HTTPS)", "Claude AI API 통신"],
        ["registry.npmjs.org", "443 (HTTPS)", "npm 패키지 다운로드"],
        ["console.anthropic.com", "443 (HTTPS)", "API Key 발급 및 관리"],
      ],
      [3000, 2500, 3526]
    ),
    warningBox("방화벽이나 프록시가 위 도메인을 차단하고 있다면 설치 및 실행이 불가합니다. 사전에 네트워크 담당자에게 확인하세요."),
    emptyPara(),

    heading2("1.2 설치 순서 (RHEL 전용)"),

    heading3("Step 1: OS 버전 확인"),
    ...terminalBlock([
      "[root@rhel-server ~]# cat /etc/redhat-release",
      "Red Hat Enterprise Linux release 9.4 (Plow)",
    ]),

    heading3("Step 2: EPEL 저장소 활성화"),
    importantBox("RHEL 8은 yum, RHEL 9은 dnf를 사용합니다. 기능은 동일하며 명령어만 다릅니다."),
    para("RHEL 9:"),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install -y epel-release",
      "Updating Subscription Management repositories.",
      "...",
      "Installed:",
      "  epel-release-9-7.el9.noarch",
      "",
      "Complete!",
    ]),
    para("RHEL 8:"),
    ...terminalBlock([
      "[root@rhel-server ~]# yum install -y epel-release",
      "...",
      "Complete!",
    ]),

    heading3("Step 3: Node.js 20.x LTS 설치"),
    para("RHEL AppStream 모듈로 설치합니다."),
    para("RHEL 9:"),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf module reset nodejs -y",
      "[root@rhel-server ~]# dnf module enable nodejs:20 -y",
      "[root@rhel-server ~]# dnf install -y nodejs",
      "...",
      "Installed:",
      "  nodejs-1:20.18.1-1.module+el9.5.0+xxxxx+xxxxxxxx.x86_64",
      "  npm-1:10.8.2-1.20.18.1.1.module+el9.5.0+xxxxx+xxxxxxxx.x86_64",
      "",
      "Complete!",
    ]),
    para("RHEL 8:"),
    ...terminalBlock([
      "[root@rhel-server ~]# yum module reset nodejs -y",
      "[root@rhel-server ~]# yum module enable nodejs:20 -y",
      "[root@rhel-server ~]# yum install -y nodejs",
      "...",
      "Complete!",
    ]),

    heading3("Step 4: npm 최신 버전 업데이트"),
    ...terminalBlock([
      "[root@rhel-server ~]# npm install -g npm@latest",
      "",
      "changed 1 package in 5s",
    ]),

    heading3("Step 5: 기타 필수 패키지 설치"),
    para("자동화 스크립트에서 사용할 유틸리티를 설치합니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install -y curl git jq    # RHEL 9",
      "# 또는",
      "[root@rhel-server ~]# yum install -y curl git jq    # RHEL 8",
      "...",
      "Complete!",
    ]),

    heading3("Step 6: 설치 확인"),
    ...terminalBlock([
      "[root@rhel-server ~]# node -v",
      "v20.18.1",
      "[root@rhel-server ~]# npm -v",
      "10.8.2",
    ]),

    heading2("1.3 Claude Code 설치"),

    heading3("Step 1: npm 전역 설치"),
    ...terminalBlock([
      "[root@rhel-server ~]# npm install -g @anthropic-ai/claude-code",
      "",
      "added 1 package in 15s",
    ]),

    heading3("Step 2: 설치 확인"),
    ...terminalBlock([
      "[root@rhel-server ~]# claude --version",
      "Claude Code v1.0.x",
    ]),

    heading3("Step 3: 방화벽 설정 (필요 시)"),
    para("Claude Code는 HTTPS(443)로 API 서버와 통신합니다. 아웃바운드 443 포트가 차단된 경우:"),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-port=443/tcp",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    tipBox("대부분의 서버에서 아웃바운드 HTTPS(443)는 기본 허용 상태입니다. 위 명령은 차단된 환경에서만 필요합니다."),

    heading2("1.4 인증 설정"),
    heading3("방법 1: API Key 인증 (권장)"),
    para("Anthropic Console(console.anthropic.com)에서 API Key를 발급받아 환경변수로 설정합니다."),
    ...terminalBlock([
      '# 임시 적용 (현재 세션)',
      '[root@rhel-server ~]# export ANTHROPIC_API_KEY="sk-ant-api03-여기에_키_입력"',
      "",
      "# 영구 적용 (재부팅 후에도 유지)",
      '[root@rhel-server ~]# echo \'export ANTHROPIC_API_KEY="sk-ant-api03-여기에_키_입력"\' >> ~/.bashrc',
      "[root@rhel-server ~]# source ~/.bashrc",
      "",
      "# 보안: 파일 권한 제한",
      "[root@rhel-server ~]# chmod 600 ~/.bashrc",
    ]),
    warningBox("API Key를 스크립트에 하드코딩하지 마세요. 반드시 환경변수 또는 별도 설정 파일로 관리하세요."),
    emptyPara(),

    heading3("방법 2: OAuth 인증 (Claude Max 구독자)"),
    para("SSH 서버 환경에서는 브라우저가 없으므로 아래 절차를 따릅니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "To sign in, open this URL in your browser:",
      "https://console.anthropic.com/oauth/authorize?...",
      "",
      "Waiting for authentication...",
      "",
      "# → 표시된 URL을 로컬 PC 브라우저에 붙여넣기",
      "# → 로그인 후 인증 코드 복사 → 터미널에 붙여넣기",
      "",
      "Authentication successful!",
    ]),

    heading3("인증 방식 비교"),
    makeTable(
      ["비교 항목", "OAuth (Max 구독)", "API Key"],
      [
        ["비용 구조", "월 정액", "사용량 과금"],
        ["설정 난이도", "쉬움", "약간 복잡"],
        ["서버 환경 적합도", "브라우저 필요 (초기만)", "환경변수만 설정"],
        ["자동화 적합도", "토큰 갱신 필요", "키 고정 사용 가능"],
        ["보안", "토큰 자동 관리", "키 보호 필요"],
      ],
      [2200, 3413, 3413]
    ),

    heading2("1.5 빠른 설치 스크립트 (원커맨드)"),
    para("위의 모든 단계를 하나의 스크립트로 자동 실행할 수 있습니다."),
    ...codeBlock([
      "#!/bin/bash",
      "# Claude Code 원커맨드 설치 스크립트 (RHEL 8/9)",
      "# 실행: curl -sL https://your-repo/install.sh | bash",
      "",
      "set -e",
      "",
      '# OS 버전 감지',
      'RHEL_VER=$(rpm -E %{rhel})',
      'echo "RHEL ${RHEL_VER} 감지됨"',
      "",
      '# 패키지 매니저 선택',
      'if [ "${RHEL_VER}" -ge 9 ]; then',
      '  PKG="dnf"',
      "else",
      '  PKG="yum"',
      "fi",
      "",
      "# EPEL 설치",
      "${PKG} install -y epel-release",
      "",
      "# Node.js 20.x 설치",
      "${PKG} module reset nodejs -y 2>/dev/null || true",
      "${PKG} module enable nodejs:20 -y",
      "${PKG} install -y nodejs",
      "",
      "# npm 업데이트 및 필수 패키지",
      "npm install -g npm@latest",
      "${PKG} install -y curl git jq",
      "",
      "# Claude Code 설치",
      "npm install -g @anthropic-ai/claude-code",
      "",
      '# 설치 확인',
      'echo "============================="',
      'echo "Node.js: $(node -v)"',
      'echo "npm: $(npm -v)"',
      'echo "Claude: $(claude --version)"',
      'echo "============================="',
      'echo "설치 완료! ANTHROPIC_API_KEY를 설정하세요."',
    ]),
    ...terminalBlock([
      "[root@rhel-server ~]# chmod +x install-claude.sh",
      "[root@rhel-server ~]# ./install-claude.sh",
      "RHEL 9 감지됨",
      "...",
      "=============================",
      "Node.js: v20.18.1",
      "npm: 10.8.2",
      "Claude: Claude Code v1.0.x",
      "=============================",
      "설치 완료! ANTHROPIC_API_KEY를 설정하세요.",
    ]),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 2장. 서버 관리 프롬프트 샘플 (5장 발췌)
// ============================================================
function chapterPrompts() {
  return [
    heading1("2장. 서버 관리 프롬프트 샘플"),
    para("이 장은 매뉴얼의 핵심입니다. 각 프롬프트를 복사하여 바로 사용할 수 있습니다. 모든 샘플에는 실행 방법, 예상 출력, 해석, 후속 조치가 포함되어 있습니다."),
    emptyPara(),

    heading3("프롬프트 실행 방법 요약"),
    makeTable(
      ["방식", "명령어", "용도"],
      [
        ["대화형", "claude", "복잡한 분석, 후속 질의가 필요한 작업"],
        ["비대화형", 'claude -p "프롬프트"', "자동화, cron, 스크립트 연동"],
        ["파일 저장", 'claude -p "..." > result.log 2>&1', "결과를 로그로 보관"],
        ["JSON 출력", 'claude -p "..." --output-format json', "파싱이 필요한 자동화"],
      ],
      [1800, 4000, 3226]
    ),
    emptyPara(),

    // --- 2.1 시스템 상태 점검 ---
    heading2("2.1 시스템 상태 점검"),

    ...promptSample(
      "2.1.1 서버 전체 헬스체크",
      "현재 서버의 전체적인 상태를 점검해줘. CPU, 메모리, 디스크, 네트워크, 실행 중인 서비스 상태를 종합적으로 분석하고 이상 여부를 알려줘.",
      "비대화형: claude -p \"현재 서버의 전체적인 상태를 점검해줘...\"",
      [
        "[root@rhel-server ~]# claude -p \"현재 서버의 전체적인 상태를 점검해줘.\"",
        "",
        "## 서버 헬스체크 결과",
        "",
        "### CPU",
        "- 사용률: 23.5% (정상)",
        "- Load Average: 0.82, 0.65, 0.71 (4 cores 기준 정상)",
        "",
        "### 메모리",
        "- 전체: 8GB / 사용: 5.2GB (65%) / 가용: 2.8GB",
        "- Swap 사용: 128MB / 전체 2GB (6.4%)",
        "",
        "### 디스크",
        "- /       : 45% 사용 (23GB/50GB) - 정상",
        "- /var    : 78% 사용 (39GB/50GB) - [주의] 80% 근접",
        "",
        "### 서비스 상태",
        "- sshd: active (running) - 정상",
        "- httpd: active (running) - 정상",
        "",
        "### 종합 평가: [주의] /var 파티션 78% - 로그 정리 권장",
      ],
      "/var 파티션이 78%로 80% 임계값에 근접했습니다. 나머지 항목은 정상 범위입니다.",
      "/var 파티션의 오래된 로그를 정리하거나 logrotate 설정을 점검하세요. 'journalctl --vacuum-size=500M'으로 journal 로그를 정리할 수 있습니다.",
      {
        description: "Claude에게 구체적인 정리 작업을 요청하면 안전하게 공간을 확보할 수 있습니다.",
        prompt: ["/var 파티션이 78%야. 안전하게 공간을 확보할 수 있는 방법을", "우선순위별로 알려주고, 각 정리 명령어를 실행해줘.", "삭제 전에 반드시 파일 목록을 보여주고 확인을 받아줘."],
      }
    ),

    ...promptSample(
      "2.1.2 디스크 사용량 분석",
      "디스크 사용량을 분석해줘. 각 파티션별 사용률, 가장 큰 파일/디렉토리 Top 10, 그리고 정리할 수 있는 항목을 추천해줘.",
      "비대화형: claude -p \"디스크 사용량을 분석해줘...\"",
      [
        "[root@rhel-server ~]# claude -p \"디스크 사용량을 분석해줘.\"",
        "",
        "## 디스크 분석 결과",
        "",
        "### 파티션별 사용량",
        "| 마운트포인트 | 크기 | 사용 | 사용률 | 상태 |",
        "| / | 50GB | 23GB | 45% | 정상 |",
        "| /var | 50GB | 39GB | 78% | 주의 |",
        "",
        "### 정리 추천 항목",
        "1. /var/cache/dnf/             (3.2GB) - dnf clean all 실행 권장",
        "2. /var/log/journal/           (4.5GB) - vacuum 권장",
        "3. /var/log/messages-20260101  (2.1GB) - 3개월 이전 로그",
      ],
      "80% 이상이면 [위험], 70~80%면 [주의], 70% 미만이면 [정상]입니다.",
      "'dnf clean all'로 캐시 정리, 'journalctl --vacuum-size=1G'로 journal 크기 제한을 적용하세요.",
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 2.2 로그 분석 ---
    heading2("2.2 로그 분석"),

    ...promptSample(
      "2.2.1 시스템 로그 분석 (최근 24시간)",
      "/var/log/messages에서 최근 24시간 동안의 로그를 분석해줘. 에러와 경고를 분류하고, 발생 빈도별로 정리하고, 심각도를 평가해줘.",
      "비대화형: claude -p \"/var/log/messages 최근 24시간 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"/var/log/messages 최근 24시간 분석\"",
        "",
        "## /var/log/messages 분석 (최근 24시간)",
        "",
        "### 에러 요약 (심각도순)",
        "| 심각도 | 서비스 | 메시지 패턴 | 건수 |",
        "| ERROR | httpd | Connection refused | 12 |",
        "| WARNING | chronyd | Source unreachable | 7 |",
        "",
        "### 종합 평가: [주의] NTP 설정 확인 권장",
      ],
      "CRITICAL 에러가 1건 이상이면 즉시 대응, ERROR는 패턴을 확인, WARNING은 추세를 관찰합니다.",
      "NTP 서버 설정을 확인하고 'chronyc sources'로 시간 동기화 상태를 점검하세요.",
    ),

    ...promptSample(
      "2.2.2 보안 로그 분석 (로그인 시도)",
      "/var/log/secure를 분석해줘. 실패한 로그인 시도, 특히 무차별 대입 공격(brute force) 의심 패턴을 찾아줘. 공격 출발지 IP별로 정리하고 차단 여부를 권고해줘.",
      "비대화형: claude -p \"/var/log/secure 로그인 시도 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"/var/log/secure 분석\"",
        "",
        "## 보안 로그 분석 결과",
        "",
        "### 로그인 시도 요약 (최근 24시간)",
        "- 성공: 15건 (정상 사용자)",
        "- 실패: 342건 [경고]",
        "",
        "### 실패 시도 Top IP",
        "| IP | 실패 건수 | 판단 |",
        "| 203.0.113.45 | 187 | [차단 권고] Brute force |",
        "| 198.51.100.22 | 98 | [차단 권고] Brute force |",
        "",
        "### 권고사항",
        "1. 위 IP 즉시 차단",
        "2. fail2ban 설치 및 활성화 권장",
      ],
      "단일 IP에서 10회 이상 실패하면 의심, 50회 이상이면 무차별 대입 공격으로 판단합니다.",
      "'firewall-cmd --permanent --add-rich-rule=\"rule family=ipv4 source address=203.0.113.45 reject\"'로 IP를 차단하세요.",
      {
        description: "Claude에게 공격 IP를 자동 차단하는 방화벽 명령어 생성과 fail2ban 설치·설정을 한번에 요청할 수 있습니다.",
        prompt: ["위 분석에서 차단 권고된 IP들을 firewalld로 즉시 차단해줘.", "그리고 fail2ban을 설치하고 SSH brute force 방어 설정을 해줘.", "sshd jail 설정에서 maxretry=3, bantime=3600으로 해줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 2.3 보안 취약점 분석 ---
    heading2("2.3 보안 취약점 분석"),

    ...promptSample(
      "2.3.1 열린 포트 및 서비스 점검",
      "현재 열린 포트와 리스닝 중인 서비스를 모두 점검해줘. 각 포트별로 서비스명, PID, 외부 노출 여부를 확인하고, 불필요하게 열린 포트를 알려줘.",
      "비대화형: claude -p \"열린 포트와 리스닝 서비스 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"열린 포트 점검\"",
        "",
        "## 포트/서비스 점검 결과",
        "",
        "| 포트 | 서비스 | 바인딩 | 평가 |",
        "| 22 | sshd | 0.0.0.0 | 정상 (필수) |",
        "| 80 | httpd | 0.0.0.0 | 정상 |",
        "| 443 | httpd | 0.0.0.0 | 정상 |",
        "| 3306 | mysqld | 0.0.0.0 | [위험] 외부 노출 |",
        "",
        "### 권고: MySQL(3306) 127.0.0.1로 바인딩 변경 필요",
      ],
      "0.0.0.0으로 바인딩된 서비스는 외부에서 접근 가능합니다. DB 서비스는 반드시 127.0.0.1로 제한하세요.",
      "MySQL: /etc/my.cnf에서 bind-address=127.0.0.1 설정 후 systemctl restart mysqld",
    ),

    ...promptSample(
      "2.3.2 SSH 보안 감사",
      "/etc/ssh/sshd_config 파일을 분석하여 SSH 보안 설정을 감사해줘. CIS Benchmark 기준으로 현재 설정의 적합 여부를 평가하고 개선 사항을 알려줘.",
      "비대화형: claude -p \"SSH 보안 설정 감사...\"",
      [
        "[root@rhel-server ~]# claude -p \"SSH 보안 감사\"",
        "",
        "## SSH 보안 감사 결과",
        "",
        "| 설정 항목 | 현재 값 | 권장 값 | 평가 |",
        "| PermitRootLogin | yes | no | [위험] |",
        "| PasswordAuthentication | yes | no (Key 사용) | [주의] |",
        "| MaxAuthTries | 6 | 3 | [주의] |",
        "",
        "### 점수: 4/10 (개선 필요)",
      ],
      "PermitRootLogin yes는 가장 위험한 설정입니다. 반드시 비활성화하고 일반 계정 + sudo를 사용하세요.",
      "sshd_config 수정 후 'sshd -t'로 문법 검증, 'systemctl restart sshd'로 적용하세요.",
      {
        description: "Claude에게 SSH 보안 설정을 CIS Benchmark 기준으로 자동 수정하도록 요청할 수 있습니다.",
        prompt: ["위 SSH 감사 결과에서 [위험]과 [주의] 항목을 모두 수정해줘.", "/etc/ssh/sshd_config를 CIS Benchmark 권장값으로 변경하되,", "변경 전 백업을 만들고, sshd -t로 검증 후 적용해줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 2.4 장애 대응 ---
    heading2("2.4 장애 대응"),

    ...promptSample(
      "2.4.1 서비스 다운 원인 분석",
      "httpd(Apache) 서비스가 다운되었어. 원인을 분석해줘. 최근 로그, 설정 파일 오류, 리소스 부족 여부를 종합적으로 확인하고 복구 방법을 알려줘.",
      "대화형: claude 진입 후 위 프롬프트 입력 (상호작용하며 분석)",
      [
        "You > httpd 서비스 다운 원인 분석해줘",
        "",
        "Claude > httpd 서비스 상태와 로그를 분석하겠습니다.",
        "",
        "### 최근 에러 로그",
        "AH00526: Syntax error on line 42 of /etc/httpd/conf.d/ssl.conf:",
        "SSLCertificateFile: file '/etc/pki/tls/certs/server.crt' does not exist",
        "",
        "### 원인: SSL 인증서 파일 누락",
        "### 복구: 인증서 파일 복원 후 systemctl restart httpd",
      ],
      "에러 메시지의 핵심 키워드(Syntax error, does not exist, Permission denied 등)로 원인을 파악합니다.",
      "설정 파일 수정 후 'httpd -t'로 문법 검증 → 'systemctl restart httpd'로 재시작하세요.",
      {
        description: "Claude 대화형 모드에서 서비스 장애를 단계별로 분석하고, 설정 수정부터 복구까지 직접 수행할 수 있습니다.",
        prompt: ["httpd가 다운됐어. 원인을 분석하고 복구해줘.", "설정 파일 오류가 있으면 수정하되, 변경 전 백업을 만들어줘.", "복구 후 httpd -t 검증과 서비스 재시작까지 해줘."],
      }
    ),

    ...promptSample(
      "2.4.2 디스크 풀(100%) 긴급 대응",
      "디스크가 100%야! 긴급하게 공간을 확보해야 해. 삭제 가능한 파일을 우선순위별로 알려주고, 안전하게 정리하는 방법을 단계별로 안내해줘.",
      "대화형: claude 진입 후 위 프롬프트 입력",
      [
        "You > 디스크 100% 긴급 대응!",
        "",
        "Claude > 즉시 디스크 공간을 확보하겠습니다.",
        "",
        "### 1순위: 즉시 삭제 가능 (영향 없음)",
        "- /var/cache/dnf/ : 3.2GB -> dnf clean all",
        "- /var/log/*.gz (압축 로그): 2.5GB",
        "",
        "### 2순위: 정리 가능 (확인 후)",
        "- /var/log/journal/: 4.5GB -> vacuum 적용",
        "",
        "### 예상 확보 용량: 약 12.2GB",
      ],
      "1순위(캐시, 임시파일)부터 정리하고, 2순위는 영향도를 확인 후 진행합니다.",
      "정리 후 'df -h'로 확인, 재발 방지를 위해 logrotate 및 자동 정리 cron을 설정하세요.",
    ),

    ...promptSample(
      "2.4.3 OOM Killer 분석",
      "OOM Killer가 발동했어. 어떤 프로세스가 kill되었는지, 왜 메모리가 부족했는지 분석해줘. 재발 방지 방법도 알려줘.",
      "비대화형: claude -p \"OOM Killer 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"OOM Killer 발동 분석\"",
        "",
        "## OOM Killer 분석",
        "",
        "### Kill된 프로세스",
        "| 시간 | PID | 프로세스 | RSS(MB) |",
        "| 03:45:12 | 3456 | java | 3,840 |",
        "",
        "### 원인: Java 프로세스 메모리 릭 의심 (-Xmx 미설정)",
        "",
        "### 재발 방지",
        "1. Java: -Xmx4g 옵션으로 최대 힙 제한",
        "2. systemd: MemoryMax=5G 설정",
        "3. vm.overcommit_memory=2 로 overcommit 방지",
      ],
      "OOM Killer는 메모리가 완전히 고갈되었을 때 OOM Score가 높은 프로세스를 강제 종료합니다.",
      "각 서비스에 메모리 제한을 설정하고, Swap을 적절히 구성하세요.",
    ),

    // --- 빠른 참조 ---
    new Paragraph({ children: [new PageBreak()] }),
    heading2("2.5 프롬프트 빠른 참조표"),
    para("프린트하여 책상에 비치하면 편리합니다."),
    emptyPara(),
    makeTable(
      ["카테고리", "프롬프트 (요약)", "실행 방법"],
      [
        ["헬스체크", "서버 전체 상태 점검해줘", 'claude -p "..."'],
        ["디스크", "디스크 사용량 분석하고 정리 추천해줘", 'claude -p "..."'],
        ["메모리", "메모리/CPU Top 10 프로세스 보여줘", 'claude -p "..."'],
        ["로그분석", "/var/log/messages 최근 24시간 분석해줘", 'claude -p "..."'],
        ["보안로그", "/var/log/secure 로그인 시도 분석해줘", 'claude -p "..."'],
        ["포트점검", "열린 포트와 서비스 점검해줘", 'claude -p "..."'],
        ["SSH감사", "SSH 보안 설정 감사해줘", 'claude -p "..."'],
        ["SELinux", "SELinux 상태와 위반 점검해줘", 'claude -p "..."'],
        ["패치확인", "미적용 보안 패치 확인해줘", 'claude -p "..."'],
        ["장애대응", "[서비스명] 다운 원인 분석해줘", "claude (대화형)"],
        ["디스크풀", "디스크 100% 긴급 대응해줘", "claude (대화형)"],
        ["OOM", "OOM Killer 발동 분석해줘", 'claude -p "..."'],
      ],
      [1800, 4200, 3026]
    ),
  ];
}

// ============================================================
// 3장. 실시간 모니터링
// ============================================================
function chapterMonitoring() {
  return [
    heading1("3장. 실시간 모니터링"),

    heading2("3.1 Claude Code vs 기존 모니터링 도구"),
    makeTable(
      ["비교 항목", "Claude Code", "기존 도구 (Zabbix/Prometheus)"],
      [
        ["설치 복잡도", "매우 간단 (npm 설치)", "복잡 (서버, 에이전트, DB 구성)"],
        ["분석 능력", "자연어 기반 심층 분석", "임계값 기반 알림"],
        ["실시간성", "요청 시 분석 (비실시간)", "에이전트 기반 실시간 수집"],
        ["비용", "API 사용량 과금", "오픈소스(무료) + 인프라 비용"],
        ["적합한 용도", "로그 분석, 원인 규명, 보안 감사", "메트릭 수집, 대시보드, 알림"],
        ["결론", "분석·해석에 강점", "수집·시각화에 강점"],
      ],
      [2000, 3513, 3513]
    ),
    tipBox("Claude Code와 기존 모니터링 도구는 대체 관계가 아닌 상호 보완 관계입니다. 기존 도구로 수집·알림하고, Claude Code로 심층 분석하는 것이 가장 효과적입니다."),
    emptyPara(),

    heading2("3.2 실시간 로그 감시 스크립트"),
    para("시스템 로그를 실시간으로 감시하여 특정 패턴 발생 시 Claude Code로 분석하는 스크립트입니다."),
    emptyPara(),

    heading3("감시 스크립트"),
    para("파일: /opt/claude-scripts/log-monitor.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 실시간 로그 감시 + Claude 분석",
      "",
      "source /opt/claude-scripts/conf/config.env",
      "source /opt/claude-scripts/lib/send_alert.sh",
      "",
      'WATCH_LOG="/var/log/messages"',
      'PATTERNS="error|critical|panic|kernel.*oom|segfault|out of memory"',
      'COOLDOWN=600  # 동일 패턴 10분 쿨다운',
      "declare -A LAST_ALERT",
      "",
      "tail -Fn0 ${WATCH_LOG} | while read LINE; do",
      '  if echo "${LINE}" | grep -iE "${PATTERNS}" > /dev/null; then',
      '    PATTERN_KEY=$(echo "${LINE}" | md5sum | cut -d" " -f1)',
      "    NOW=$(date +%s)",
      "    LAST=${LAST_ALERT[${PATTERN_KEY}]:-0}",
      "",
      "    if [ $((NOW - LAST)) -ge ${COOLDOWN} ]; then",
      "      LAST_ALERT[${PATTERN_KEY}]=${NOW}",
      '      RESULT=$(claude -p "다음 로그 라인에서 이상을 분석해줘: ${LINE}" --dangerously-skip-permissions 2>&1)',
      '      send_alert "WARNING" "로그 이상 감지" "${LINE}\\n\\n분석:\\n${RESULT}"',
      "    fi",
      "  fi",
      "done",
    ]),
    emptyPara(),

    heading3("systemd 서비스 등록"),
    para("파일: /etc/systemd/system/claude-log-monitor.service"),
    ...codeBlock([
      "[Unit]",
      "Description=Claude Code Log Monitor",
      "After=network.target",
      "",
      "[Service]",
      "Type=simple",
      "ExecStart=/opt/claude-scripts/log-monitor.sh",
      "Restart=always",
      "RestartSec=10",
      "User=root",
      "StandardOutput=journal",
      "StandardError=journal",
      "",
      "[Install]",
      "WantedBy=multi-user.target",
    ]),
    ...terminalBlock([
      "[root@rhel-server ~]# chmod +x /opt/claude-scripts/log-monitor.sh",
      "[root@rhel-server ~]# systemctl daemon-reload",
      "[root@rhel-server ~]# systemctl enable --now claude-log-monitor",
      "Created symlink ... -> claude-log-monitor.service.",
      "[root@rhel-server ~]# systemctl status claude-log-monitor",
      "  claude-log-monitor.service - Claude Code Log Monitor",
      "     Loaded: loaded (enabled)",
      "     Active: active (running)",
    ]),
    emptyPara(),

    heading2("3.3 임계값 기반 모니터링"),
    para("CPU, 메모리, 디스크 사용률이 임계값을 초과하면 자동으로 Claude Code 분석을 실행합니다."),
    heading3("임계값 모니터링 스크립트"),
    para("파일: /opt/claude-scripts/threshold-monitor.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 임계값 기반 모니터링",
      "",
      "source /opt/claude-scripts/conf/config.env",
      "source /opt/claude-scripts/lib/send_alert.sh",
      "",
      "CPU_THRESHOLD=90",
      "MEM_THRESHOLD=85",
      "DISK_THRESHOLD=90",
      "",
      "# CPU 체크",
      "CPU=$(top -bn1 | grep 'Cpu(s)' | awk '{print int($2+$4)}')",
      "if [ ${CPU} -ge ${CPU_THRESHOLD} ]; then",
      '  RESULT=$(claude -p "CPU 사용률이 ${CPU}%입니다. 원인 프로세스를 찾고 대응 방안을 알려줘." --dangerously-skip-permissions 2>&1)',
      '  send_alert "CRITICAL" "CPU ${CPU}% 초과" "${RESULT}"',
      "fi",
      "",
      "# 메모리 체크",
      "MEM=$(free | awk '/Mem:/{printf(\"%.0f\", $3/$2*100)}')",
      "if [ ${MEM} -ge ${MEM_THRESHOLD} ]; then",
      '  RESULT=$(claude -p "메모리 사용률이 ${MEM}%입니다. 상세 분석해줘." --dangerously-skip-permissions 2>&1)',
      '  send_alert "CRITICAL" "메모리 ${MEM}% 초과" "${RESULT}"',
      "fi",
      "",
      "# 디스크 체크 (모든 마운트포인트)",
      "df -h --output=pcent,target | tail -n+2 | while read PCENT MOUNT; do",
      '  USAGE=$(echo ${PCENT} | tr -d " %")',
      "  if [ ${USAGE} -ge ${DISK_THRESHOLD} ]; then",
      '    RESULT=$(claude -p "${MOUNT} 디스크 ${USAGE}% 사용. 분석 및 정리 방안을 알려줘." --dangerously-skip-permissions 2>&1)',
      '    send_alert "CRITICAL" "디스크 ${MOUNT} ${USAGE}%" "${RESULT}"',
      "  fi",
      "done",
    ]),
    emptyPara(),

    heading2("3.4 모니터링 종합 대시보드"),
    para("터미널에서 주요 지표를 한 눈에 볼 수 있는 대시보드 스크립트입니다."),
    heading3("대시보드 스크립트"),
    para("파일: /opt/claude-scripts/dashboard.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 서버 모니터링 종합 대시보드",
      "# 사용법: ./dashboard.sh 또는 watch -n 5 ./dashboard.sh",
      "",
      "clear",
      "",
      "# 색상 정의",
      'RED="\\033[0;31m"',
      'GREEN="\\033[0;32m"',
      'YELLOW="\\033[0;33m"',
      'BLUE="\\033[0;34m"',
      'NC="\\033[0m"  # No Color',
      "",
      "# 바 그래프 함수",
      "bar_graph() {",
      '  local USAGE=$1',
      '  local WIDTH=12',
      '  local FILLED=$((USAGE * WIDTH / 100))',
      '  local EMPTY=$((WIDTH - FILLED))',
      '  local BAR=""',
      '  for ((i=0; i<FILLED; i++)); do BAR+="\\u2588"; done',
      '  for ((i=0; i<EMPTY; i++)); do BAR+="\\u2591"; done',
      "",
      '  if [ ${USAGE} -ge 90 ]; then',
      '    echo -e "${RED}${BAR} ${USAGE}%${NC}"',
      '  elif [ ${USAGE} -ge 80 ]; then',
      '    echo -e "${YELLOW}${BAR} ${USAGE}% \\u26A0${NC}"',
      "  else",
      '    echo -e "${GREEN}${BAR} ${USAGE}%${NC}"',
      "  fi",
      "}",
      "",
      "# 시스템 정보 수집",
      'HOSTNAME=$(hostname)',
      'DATETIME=$(date "+%Y-%m-%d %H:%M:%S")',
      'CPU=$(top -bn1 | grep "Cpu(s)" | awk \'{print int($2+$4)}\')',
      'MEM=$(free | awk \'/Mem:/{printf("%.0f", $3/$2*100)}\')',
      'MEM_USED=$(free -h | awk \'/Mem:/{print $3}\')',
      'MEM_TOTAL=$(free -h | awk \'/Mem:/{print $2}\')',
      'DISK=$(df / --output=pcent | tail -1 | tr -d " %")',
      'LOAD=$(cat /proc/loadavg | awk \'{print $1, $2, $3}\')',
      'CORES=$(nproc)',
      "",
      "# 헤더",
      'echo -e "\\u250C\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2510"',
      'echo -e "\\u2502  ${BLUE}\\uD83D\\uDCCA Server Monitoring Dashboard${NC}              \\u2502"',
      'echo -e "\\u2502  Host: ${HOSTNAME}  |  ${DATETIME}  \\u2502"',
      'echo -e "\\u251C\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2524"',
      "",
      "# 리소스 상태",
      'echo -e "\\u2502  CPU:  $(bar_graph ${CPU})"',
      'echo -e "\\u2502  MEM:  $(bar_graph ${MEM})  (${MEM_USED}/${MEM_TOTAL})"',
      'echo -e "\\u2502  DISK: $(bar_graph ${DISK})"',
      'echo -e "\\u2502  LOAD: ${LOAD} / ${CORES} cores"',
      'echo -e "\\u251C\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2524"',
      "",
      "# 서비스 상태",
      'echo -e "\\u2502  Services:"',
      'SERVICES="httpd sshd crond firewalld mysqld chronyd"',
      'SVC_LINE="\\u2502   "',
      "for SVC in ${SERVICES}; do",
      "  if systemctl is-active --quiet ${SVC} 2>/dev/null; then",
      '    SVC_LINE+="${GREEN}\\u2705 ${SVC}${NC}  "',
      "  else",
      '    SVC_LINE+="${RED}\\u274C ${SVC}${NC}  "',
      "  fi",
      "done",
      'echo -e "${SVC_LINE}"',
      'echo -e "\\u251C\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2524"',
      "",
      "# 에러/로그인 실패 건수",
      'ERRORS=$(journalctl --since "1 hour ago" -p err --no-pager 2>/dev/null | wc -l)',
      'FAILED_LOGINS=$(grep -c "Failed password" /var/log/secure 2>/dev/null || echo 0)',
      'echo -e "\\u2502  Errors (1h): ${ERRORS}  |  Logins Failed (24h): ${FAILED_LOGINS}"',
      'echo -e "\\u2514\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2518"',
    ]),
    emptyPara(),
    ...terminalBlock([
      "[root@rhel-server ~]# chmod +x /opt/claude-scripts/dashboard.sh",
      "[root@rhel-server ~]# /opt/claude-scripts/dashboard.sh",
    ]),
    tipBox("watch -n 5 /opt/claude-scripts/dashboard.sh 명령으로 5초마다 자동 갱신되는 실시간 대시보드를 실행할 수 있습니다."),
    emptyPara(),

    heading3("대시보드 출력 예시"),
    ...terminalBlock([
      "[root@rhel-server ~]# /opt/claude-scripts/dashboard.sh",
      "",
      "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
      "\u2502  \uD83D\uDCCA Server Monitoring Dashboard              \u2502",
      "\u2502  Host: rhel-server  |  2026-03-20 14:30:22  \u2502",
      "\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
      "\u2502  CPU:  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591  67%                   \u2502",
      "\u2502  MEM:  \u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591  52%                   \u2502",
      "\u2502  DISK: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591  83% \u26A0\uFE0F                  \u2502",
      "\u2502  LOAD: 2.34 / 4 cores                       \u2502",
      "\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
      "\u2502  Services:                                   \u2502",
      "\u2502   \u2705 httpd   \u2705 sshd   \u2705 crond               \u2502",
      "\u2502   \u274C mysqld  \u2705 firewalld                   \u2502",
      "\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524",
      "\u2502  Errors (1h): 3  |  Logins Failed (24h): 47  \u2502",
      "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
    ]),
    emptyPara(),

    // ============================================================
    // 3.5 Claude를 활용한 모니터링 스크립트 자동 생성
    // ============================================================
    new Paragraph({ children: [new PageBreak()] }),
    heading2("3.5 Claude를 활용한 모니터링 스크립트 자동 생성"),
    para("앞서 소개한 모니터링 스크립트를 직접 작성하는 대신, Claude Code에게 서버 환경에 맞는 맞춤형 스크립트를 자동으로 생성하도록 요청할 수 있습니다. 이 방법은 스크립트 작성 경험이 없는 관리자에게 특히 유용합니다."),
    emptyPara(),

    heading3("3.5.1 실시간 로그 감시 스크립트 자동 생성"),
    claudeBox("Claude에게 서버 환경 정보를 제공하면, 맞춤형 로그 감시 스크립트를 자동으로 생성합니다."),
    para("프롬프트:", { run: { bold: true } }),
    ...codeBlock([
      "이 서버의 실시간 로그 감시 스크립트를 작성해줘.",
      "요구사항:",
      "- /var/log/messages와 /var/log/secure를 동시 감시",
      "- error, critical, panic, oom, segfault, failed password 패턴 감지",
      "- 이상 감지 시 claude -p로 자동 분석",
      "- 동일 패턴 10분 쿨다운 (중복 알림 방지)",
      "- 결과를 /var/log/claude/realtime/ 에 저장",
      "- systemd 서비스 유닛 파일도 같이 만들어줘",
    ]),
    emptyPara(),
    para("실행 예시:", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "You > 이 서버의 실시간 로그 감시 스크립트를 작성해줘.",
      "      요구사항: /var/log/messages와 /var/log/secure를 동시 감시...",
      "",
      "Claude > 서버 환경을 먼저 확인하겠습니다.",
      "",
      "  OS: RHEL 9.4 (Plow)",
      "  주요 서비스: httpd, sshd, mysqld, crond",
      "  로그 위치 확인 완료",
      "",
      "  2개의 파일을 생성합니다:",
      "",
      "  1. /opt/claude-scripts/realtime-monitor.sh (감시 스크립트)",
      "     - /var/log/messages + /var/log/secure 멀티 감시",
      "     - 6개 패턴 감지",
      "     - 10분 쿨다운 적용",
      "     - 분석 결과 /var/log/claude/realtime/ 저장",
      "",
      "  2. /etc/systemd/system/claude-realtime-monitor.service",
      "     - 자동 시작 + 장애 시 자동 재시작",
      "",
      "  파일을 생성할까요? (y/n)",
      "",
      "You > y",
      "",
      "Claude > 생성 완료.",
      "  chmod +x /opt/claude-scripts/realtime-monitor.sh -> 완료",
      "  systemctl daemon-reload -> 완료",
      "  systemctl enable --now claude-realtime-monitor -> 완료",
      "  상태: active (running)",
    ]),
    emptyPara(),

    heading3("3.5.2 임계값 모니터링 스크립트 자동 생성"),
    claudeBox("서버의 현재 리소스 상태를 기반으로 적절한 임계값을 자동 계산하여 스크립트를 생성합니다."),
    para("프롬프트:", { run: { bold: true } }),
    ...codeBlock([
      "이 서버에 맞는 임계값 기반 모니터링 스크립트를 만들어줘.",
      "요구사항:",
      "- CPU, 메모리, 디스크, Load Average 모니터링",
      "- 현재 서버 사양(코어 수, RAM 용량, 디스크 크기)을 확인해서 적절한 임계값 설정",
      "- 임계값 초과 시 claude -p로 원인 분석",
      "- 분석 결과를 텔레그램으로 알림 전송",
      "- cron에 등록할 수 있도록 만들어줘 (5분 간격)",
    ]),
    emptyPara(),
    para("실행 예시:", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "You > 이 서버에 맞는 임계값 모니터링 스크립트를 만들어줘...",
      "",
      "Claude > 서버 사양을 분석합니다.",
      "",
      "  서버 사양:",
      "  - CPU: 4 cores (Intel Xeon)",
      "  - RAM: 8GB",
      "  - Disk: / (50GB), /var (50GB), /data (200GB)",
      "  - 현재 평균 사용률: CPU 35%, MEM 62%, DISK 45-78%",
      "",
      "  권장 임계값:",
      "  | 항목 | WARNING | CRITICAL | 근거 |",
      "  | CPU | 80% | 90% | 4코어 기준 적정 |",
      "  | MEM | 80% | 90% | 8GB, 현재 62% |",
      "  | DISK | 80% | 90% | /var 이미 78% 근접 |",
      "  | Load Avg | 8.0 | 12.0 | 코어수 x 2/3 |",
      "",
      "  스크립트를 생성할까요? (y/n)",
      "",
      "You > y",
      "",
      "Claude > 생성 완료.",
      "  /opt/claude-scripts/smart-threshold-monitor.sh 생성",
      "  crontab 등록: */5 * * * * /opt/claude-scripts/smart-threshold-monitor.sh",
    ]),
    emptyPara(),

    heading3("3.5.3 종합 대시보드 자동 생성"),
    claudeBox("현재 서버에서 실행 중인 서비스를 자동 감지하여, 맞춤형 대시보드 스크립트를 생성합니다."),
    para("프롬프트:", { run: { bold: true } }),
    ...codeBlock([
      "이 서버의 터미널 대시보드 스크립트를 만들어줘.",
      "요구사항:",
      "- CPU, 메모리, 디스크, Load Average를 바 그래프로 표시",
      "- 현재 실행 중인 주요 서비스 상태 자동 감지 및 표시",
      "- 최근 1시간 에러 건수, 실패 로그인 건수 표시",
      "- 5초마다 자동 갱신 (watch 모드)",
      "- 임계값 초과 시 색상 경고 표시",
    ]),
    emptyPara(),
    para("실행 예시:", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "You > 이 서버의 터미널 대시보드 스크립트를 만들어줘...",
      "",
      "Claude > 서버 환경을 분석하여 대시보드를 구성합니다.",
      "",
      "  감지된 서비스: httpd, sshd, mysqld, crond, firewalld, chronyd",
      "  마운트포인트: /, /var, /data",
      "",
      "  /opt/claude-scripts/dashboard.sh 생성 완료",
      "  실행: /opt/claude-scripts/dashboard.sh",
      "  자동 갱신: watch -n 5 /opt/claude-scripts/dashboard.sh",
    ]),
    emptyPara(),

    heading3("3.5.4 모니터링 스크립트 일괄 생성 (원커맨드)"),
    claudeBox("Claude에게 모니터링 환경 전체를 한번에 구축하도록 요청할 수 있습니다. 이 방법이 가장 효율적입니다."),
    importantBox("프롬프트 (복사하여 사용)"),
    ...codeBlock([
      "이 서버의 모니터링 환경을 처음부터 전체 구축해줘.",
      "",
      "1. 서버 사양과 실행 중인 서비스를 먼저 분석",
      "2. 분석 결과를 바탕으로 아래 스크립트 전부 생성:",
      "   - 실시간 로그 감시 스크립트 (systemd 서비스로 등록)",
      "   - 임계값 기반 모니터링 스크립트 (cron 5분 간격)",
      "   - 터미널 대시보드 스크립트",
      "   - 알림 전송 공통 함수 (텔레그램/슬랙/디스코드)",
      "3. /opt/claude-scripts/ 아래에 체계적으로 정리",
      "4. crontab과 systemd 서비스 등록까지 완료",
      "5. 각 스크립트에 주석으로 설명 추가",
      "6. 테스트 실행으로 정상 동작 확인",
    ]),
    emptyPara(),
    para("실행 방법:", { run: { bold: true } }),
    ...terminalBlock([
      "# 대화형 모드에서 실행 (확인을 받으며 진행)",
      "[root@rhel-server ~]# claude",
      "You > [위 프롬프트 붙여넣기]",
      "",
      "# 비대화형 모드에서 실행 (자동 완료, 주의 필요)",
      "[root@rhel-server ~]# claude -p \"이 서버의 모니터링 환경을 처음부터 전체 구축해줘...\" --dangerously-skip-permissions",
    ]),
    emptyPara(),
    para("예상 결과:", { run: { bold: true } }),
    ...terminalBlock([
      "Claude > 서버 분석을 시작합니다.",
      "",
      "  === 서버 환경 분석 ===",
      "  OS: RHEL 9.4 | CPU: 4 cores | RAM: 8GB | Disk: 3 파티션",
      "  서비스: httpd, sshd, mysqld, crond, firewalld, chronyd",
      "",
      "  === 파일 생성 계획 ===",
      "  /opt/claude-scripts/",
      "  \u251C\u2500\u2500 log-monitor.sh           # 실시간 로그 감시",
      "  \u251C\u2500\u2500 threshold-monitor.sh     # 임계값 모니터링",
      "  \u251C\u2500\u2500 dashboard.sh             # 터미널 대시보드",
      "  \u251C\u2500\u2500 lib/",
      "  \u2502   \u251C\u2500\u2500 common.sh              # 공통 변수/함수",
      "  \u2502   \u251C\u2500\u2500 send_alert.sh          # 알림 통합 함수",
      "  \u2502   \u251C\u2500\u2500 telegram.sh            # 텔레그램 전송",
      "  \u2502   \u251C\u2500\u2500 slack.sh               # 슬랙 전송",
      "  \u2502   \u2514\u2500\u2500 discord.sh             # 디스코드 전송",
      "  \u2514\u2500\u2500 conf/",
      "      \u2514\u2500\u2500 config.env             # 설정 파일",
      "",
      "  진행할까요? (y/n)",
      "",
      "  ... (생성 진행) ...",
      "",
      "  === 구축 완료 ===",
      "  [OK] 스크립트 8개 생성",
      "  [OK] systemd 서비스 등록: claude-log-monitor.service (running)",
      "  [OK] crontab 등록: threshold-monitor.sh (5분 간격)",
      "  [OK] 테스트 실행 완료 - 모든 스크립트 정상 동작",
      "",
      "  다음 단계: /opt/claude-scripts/conf/config.env에서",
      "  알림 플랫폼 토큰을 설정하세요.",
    ]),
    warningBox("비대화형(--dangerously-skip-permissions)으로 실행할 때는 프롬프트 내용을 충분히 검토하세요. 대화형 모드에서 확인을 받으며 진행하는 것을 권장합니다."),
    emptyPara(),

    heading3("3.5.5 기존 스크립트 개선 요청"),
    para("이미 모니터링 스크립트가 있다면, Claude에게 분석·개선을 요청할 수 있습니다."),
    ...codeBlock([
      "# 방법 1: 파일 경로를 지정하여 분석 요청",
      "/opt/claude-scripts/threshold-monitor.sh 파일을 분석하고 개선해줘.",
      "- 에러 핸들링 추가",
      "- 로그 로테이션 적용",
      "- 실행 시간 측정 기능 추가",
      "",
      "# 방법 2: 기존 스크립트 성능 분석",
      "현재 /opt/claude-scripts/ 아래 모든 스크립트를 검토하고,",
      "중복 코드를 공통 함수로 분리하고, 에러 처리를 강화해줘.",
    ]),
    emptyPara(),

    heading2("3.6 스크립트 자동 생성 vs 수동 작성 비교"),
    makeTable(
      ["비교 항목", "수동 작성 (3.2~3.4절)", "Claude 자동 생성 (3.5절)"],
      [
        ["소요 시간", "스크립트당 30분~1시간", "전체 환경 5~10분"],
        ["사전 지식", "Bash 스크립팅 경험 필요", "프롬프트 작성 능력만 필요"],
        ["맞춤도", "직접 커스터마이징", "서버 환경 자동 분석 기반"],
        ["유지보수", "직접 수정", "Claude에게 개선 요청 가능"],
        ["학습 효과", "스크립트 이해도 높음", "결과물 검토로 학습 가능"],
        ["권장 대상", "Bash에 익숙한 관리자", "스크립팅 경험이 적은 관리자"],
      ],
      [2200, 3413, 3413]
    ),
    tipBox("처음에는 Claude 자동 생성으로 빠르게 구축하고, 생성된 스크립트를 검토하면서 점진적으로 수동 커스터마이징하는 것을 권장합니다."),
  ];
}

// ============================================================
// 문서 조립 및 생성
// ============================================================
async function main() {
  // 공통 페이지 속성
  const pageProps = {
    page: {
      size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
      margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
    },
  };

  // 섹션별 헤더/푸터 생성 함수
  function makeHeader() {
    return new Header({
      children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_PRIMARY, space: 4 } },
        children: [
          new TextRun({ text: "Claude Code \uC11C\uBC84 \uAD00\uB9AC \uC694\uC57D \uB9E4\uB274\uC5BC", font: FONT_BODY, size: 18, color: "999999" }),
          new TextRun({ text: "\tv1.0", font: FONT_BODY, size: 18, color: "999999" }),
        ],
      })],
    });
  }

  function makeFooter() {
    return new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } },
        children: [
          new TextRun({ text: "Confidential  |  Page ", font: FONT_BODY, size: 18, color: "999999" }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: "999999" }),
        ],
      })],
    });
  }

  // 섹션 생성 헬퍼
  function makeSection(children) {
    return {
      properties: pageProps,
      headers: { default: makeHeader() },
      footers: { default: makeFooter() },
      children,
    };
  }

  // 문서 끝 요소
  const endParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600 },
    children: [new TextRun({ text: "--- 문서 끝 ---", font: FONT_BODY, size: 22, color: "999999", italics: true })],
  });

  // 각 챕터를 개별 섹션으로 분리
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 22, color: COLOR_DARK },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: FONT_BODY, color: COLOR_PRIMARY },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: FONT_BODY, color: COLOR_DARK },
          paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT_BODY, color: COLOR_DARK },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [
      makeSection([...coverPage()]),
      makeSection([...chapterInstall()]),
      makeSection([...chapterPrompts()]),
      makeSection([...chapterMonitoring(), endParagraph]),
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "D:\\workspace\\claude-server-manual\\Claude_Code_서버관리_요약매뉴얼.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Summary document created: " + outputPath);
  console.log("Size: " + (buffer.length / 1024).toFixed(1) + " KB");
}

main().catch(console.error);
