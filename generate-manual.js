const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
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

const PAGE_WIDTH = 11906; // A4
const PAGE_HEIGHT = 16838;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 9026

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

function codeLine(text) {
  return new Paragraph({
    spacing: { after: 0, line: 276 },
    shading: { fill: COLOR_LIGHT_GRAY, type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    children: [new TextRun({ text, font: FONT_CODE, size: 20, color: COLOR_DARK })],
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
      spacing: { before: 0, after: i === lines.length - 1 ? 0 : 0, line: 276 },
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

function emptyPara() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function rhelLabel() {
  return paraRuns([{ text: "\u25A0 RHEL (dnf/yum) \uD658\uACBD", bold: true, color: COLOR_PRIMARY }]);
}

function ubuntuLabel() {
  return paraRuns([{ text: "\u25A0 Ubuntu (apt) \uD658\uACBD", bold: true, color: "E67E22" }]);
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
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
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
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
      children: [new TextRun({ text: "Claude Code", font: FONT_BODY, size: 56, bold: true, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "설치 및 활용 가이드", font: FONT_BODY, size: 36, color: COLOR_PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_PRIMARY } },
      children: [],
    }),
    emptyPara(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "대상 OS: Red Hat Enterprise Linux 8.x / 9.x, Ubuntu 22.04 / 24.04 LTS", font: FONT_BODY, size: 24, color: "666666" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "대상 독자: 서버 관리자 (초보~중급)", font: FONT_BODY, size: 24, color: "666666" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "문서 버전: 1.3", font: FONT_BODY, size: 24, color: "666666" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "작성일: 2026-03-20", font: FONT_BODY, size: 24, color: "666666" })],
    }),
    emptyPara(), emptyPara(), emptyPara(), emptyPara(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Confidential", font: FONT_BODY, size: 20, color: "999999", italics: true })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 변경 이력
// ============================================================
function changeHistory() {
  return [
    heading1("변경 이력"),
    makeTable(
      ["버전", "일자", "작성자", "변경 내용"],
      [
        ["1.0", "2026-03-20", "-", "최초 작성"],
        ["1.1", "2026-03-20", "-", "4장 서버 서비스 설치 추가 (계정 생성, SSH, MySQL, MariaDB, Apache, Nginx)"],
        ["1.2", "2026-03-20", "-", "Ubuntu 22.04/24.04 LTS 환경 설치 가이드 추가 (4장)"],
        ["1.3", "2026-03-20", "-", "2장 사전 준비, 7장 모니터링, 10장 문제 해결에 Ubuntu 가이드 보완"],
        ["", "", "", ""],
      ],
      [1200, 2000, 1800, 4026]
    ),
    emptyPara(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 1장. 개요
// ============================================================
function chapter1() {
  return [
    heading1("1장. 개요"),
    heading2("1.1 Claude Code란?"),
    para("Claude Code는 Anthropic이 개발한 터미널(CLI) 기반 AI 코딩 에이전트입니다. 자연어로 명령을 내리면 서버의 파일을 읽고, 명령어를 실행하고, 로그를 분석하는 등 시스템 관리 작업을 자동화할 수 있습니다. 별도의 GUI 없이 SSH 터미널에서 바로 사용할 수 있어 서버 관리자에게 특히 유용합니다."),
    emptyPara(),
    heading2("1.2 서버 관리자가 Claude Code를 사용하면 좋은 이유"),
    emptyPara(),
    makeTable(
      ["번호", "이유", "상세 설명"],
      [
        ["1", "로그 분석 자동화", "수천 줄의 로그를 자연어 질문 하나로 요약·분석할 수 있습니다. /var/log/messages, /var/log/secure, journalctl 등 다양한 로그를 즉시 분석합니다."],
        ["2", "보안 취약점 점검", "열린 포트, SSH 설정, 파일 권한, SELinux 정책 등을 종합적으로 점검하여 보안 위협을 사전에 발견합니다."],
        ["3", "장애 원인 분석", "서비스 다운, 높은 로드, 디스크 풀 등 장애 상황에서 원인을 빠르게 파악하고 대응 방안을 제시합니다."],
        ["4", "서버 설정 최적화", "커널 파라미터, 서비스 설정, 네트워크 구성 등을 분석하여 최적화 포인트를 제안합니다."],
        ["5", "자동 문서화 및 보고서", "서버 구성 문서, 장애 보고서, 점검 결과를 자동으로 생성하여 관리 업무를 효율화합니다."],
      ],
      [800, 2200, 6026]
    ),
    emptyPara(),
    heading2("1.3 매뉴얼 구성 안내"),
    para("이 매뉴얼은 총 10개 장과 부록으로 구성되어 있습니다. 1~3장은 설치와 기본 설정, 4장은 서버 서비스 설치, 5장은 실전 프롬프트 샘플, 6~8장은 자동화·모니터링·알림 연동, 9~10장은 추가 활용법과 문제 해결을 다룹니다."),
    emptyPara(),
    heading2("1.4 매뉴얼에서 사용하는 기호"),
    makeTable(
      ["기호", "의미", "설명"],
      [
        ["\u26A0\uFE0F", "경고", "실행 전 반드시 확인해야 할 주의사항"],
        ["\uD83D\uDCA1", "팁", "작업 효율을 높이는 유용한 정보"],
        ["\uD83D\uDCCC", "중요", "핵심적인 개념이나 필수 설정"],
        ["\uD83D\uDD27", "실습", "직접 따라해볼 수 있는 실습 과정"],
      ],
      [1500, 1500, 6026]
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 2장. 사전 준비 및 설치
// ============================================================
function chapter2() {
  return [
    heading1("2장. 사전 준비 및 설치"),

    heading2("2.1 시스템 요구사항"),
    para("Claude Code를 설치하기 전에 아래 요구사항을 확인하세요."),
    emptyPara(),
    heading3("2.1.1 하드웨어/소프트웨어 요구사항"),
    makeTable(
      ["항목", "최소 사양", "권장 사양"],
      [
        ["OS", "RHEL 8.6+ / 9.0+ 또는\nUbuntu 22.04 / 24.04 LTS", "RHEL 8.10 / 9.4 또는\nUbuntu 24.04 LTS"],
        ["CPU", "1 Core 이상", "2 Core 이상"],
        ["RAM", "1GB 이상", "2GB 이상"],
        ["디스크 여유 공간", "500MB", "1GB"],
        ["Node.js", "v18.0.0 이상", "v20.x LTS"],
        ["npm", "v9.0.0 이상", "최신 버전"],
        ["네트워크", "외부 인터넷 연결 필수", "안정적인 인터넷 연결"],
      ],
      [2500, 3263, 3263]
    ),
    emptyPara(),
    heading3("2.1.2 네트워크 요구사항"),
    para("Claude Code가 정상 작동하려면 아래 도메인/포트로의 외부 통신이 필요합니다."),
    makeTable(
      ["도메인", "포트", "용도"],
      [
        ["api.anthropic.com", "443 (HTTPS)", "Claude AI API 통신"],
        ["registry.npmjs.org", "443 (HTTPS)", "npm 패키지 다운로드 (설치 시)"],
        ["rpm.nodesource.com", "443 (HTTPS)", "Node.js 저장소 (RHEL 설치 시)"],
        ["deb.nodesource.com", "443 (HTTPS)", "Node.js 저장소 (Ubuntu 설치 시)"],
        ["console.anthropic.com", "443 (HTTPS)", "API Key 발급 및 관리"],
      ],
      [3000, 2500, 3526]
    ),
    warningBox("방화벽이나 프록시가 위 도메인을 차단하고 있다면 설치 및 실행이 불가합니다. 사전에 네트워크 담당자에게 확인하세요."),
    emptyPara(),

    heading2("2.2 사전 패키지 설치"),
    heading3("Step 1: OS 버전 확인"),
    para("먼저 현재 서버의 OS 버전을 확인합니다."),
    rhelLabel(),
    ...terminalBlock([
      "[root@rhel-server ~]# cat /etc/redhat-release",
      "Red Hat Enterprise Linux release 9.4 (Plow)",
    ]),
    ubuntuLabel(),
    ...terminalBlock([
      "root@ubuntu-server:~# lsb_release -a",
      "No LSB modules are available.",
      "Distributor ID: Ubuntu",
      "Description:    Ubuntu 24.04 LTS",
      "Release:        24.04",
      "Codename:       noble",
    ]),

    heading3("Step 2: EPEL 저장소 활성화 (RHEL 전용)"),
    para("추가 패키지 설치를 위해 EPEL(Extra Packages for Enterprise Linux) 저장소를 활성화합니다."),
    importantBox("RHEL 8은 yum, RHEL 9은 dnf를 사용합니다. 기능은 동일하며 명령어만 다릅니다."),
    tipBox("Ubuntu 환경에서는 이 단계가 필요하지 않습니다. Ubuntu는 기본 apt 저장소에 대부분의 패키지가 포함되어 있으므로 Step 3으로 바로 진행하세요."),
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
    para("Claude Code는 Node.js 런타임이 필요합니다."),
    rhelLabel(),
    para("RHEL AppStream 모듈로 설치합니다."),
    para("RHEL 9:"),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf module reset nodejs -y",
      "[root@rhel-server ~]# dnf module enable nodejs:20 -y",
      "[root@rhel-server ~]# dnf install -y nodejs",
      "...",
      "Installed:",
      "  nodejs-1:20.18.1-1.module+el9.5.0+xxxxx+xxxxxxxx.x86_64",
      "  nodejs-libs-1:20.18.1-1.module+el9.5.0+xxxxx+xxxxxxxx.x86_64",
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

    ubuntuLabel(),
    para("Ubuntu에서는 NodeSource 공식 저장소를 통해 Node.js 20.x를 설치합니다."),
    ...terminalBlock([
      "root@ubuntu-server:~# apt update",
      "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease",
      "...",
      "Reading package lists... Done",
      "",
      "root@ubuntu-server:~# apt install -y ca-certificates curl gnupg",
      "...",
      "",
      "root@ubuntu-server:~# curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
      "## Installing the NodeSource Node.js 20.x repo...",
      "...",
      "## Run \`apt-get install -y nodejs\` to install Node.js 20.x",
      "",
      "root@ubuntu-server:~# apt install -y nodejs",
      "...",
      "Setting up nodejs (20.18.1-1nodesource1) ...",
    ]),
    emptyPara(),

    heading3("Step 4: npm 최신 버전 업데이트"),
    ...terminalBlock([
      "[root@rhel-server ~]# npm install -g npm@latest",
      "",
      "changed 1 package in 5s",
    ]),

    heading3("Step 5: 기타 필수 패키지 설치"),
    para("자동화 스크립트에서 사용할 유틸리티를 설치합니다."),
    rhelLabel(),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install -y curl git jq",
      "...",
      "Complete!",
    ]),
    ubuntuLabel(),
    ...terminalBlock([
      "root@ubuntu-server:~# apt install -y curl git jq",
      "...",
      "Setting up jq (1.7-1) ...",
    ]),

    heading3("Step 6: 설치 확인"),
    ...terminalBlock([
      "[root@rhel-server ~]# node -v",
      "v20.18.1",
      "[root@rhel-server ~]# npm -v",
      "10.8.2",
    ]),
    emptyPara(),

    heading2("2.3 Claude Code 설치"),
    heading3("Step 1: npm 전역 설치"),
    para("root 권한으로 Claude Code를 전역 설치합니다."),
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
    rhelLabel(),
    para("RHEL은 firewalld를 사용합니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-port=443/tcp",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    ubuntuLabel(),
    para("Ubuntu는 UFW(Uncomplicated Firewall)를 사용합니다."),
    ...terminalBlock([
      "root@ubuntu-server:~# ufw allow out 443/tcp",
      "Rule added",
      "Rule added (v6)",
      "root@ubuntu-server:~# ufw status",
      "Status: active",
    ]),
    tipBox("대부분의 서버에서 아웃바운드 HTTPS(443)는 기본 허용 상태입니다. 위 명령은 차단된 환경에서만 필요합니다."),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 3장. 실행 및 인증
// ============================================================
function chapter3() {
  return [
    heading1("3장. 실행 및 인증"),

    heading2("3.1 최초 실행"),
    para("설치가 완료되면 터미널에서 claude 명령어로 실행합니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E",
      "\u2502  Welcome to Claude Code!                  \u2502",
      "\u2502  v1.0.x                                   \u2502",
      "\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F",
      "",
      "  You need to sign in to use Claude Code.",
      "  Choose an authentication method:",
      "",
      "  > Sign in with Claude (OAuth)",
      "    Use an API key",
    ]),
    emptyPara(),

    heading3("주요 실행 옵션"),
    makeTable(
      ["옵션", "설명", "사용 예시"],
      [
        ["(없음)", "대화형 모드 진입", "claude"],
        ["-p \"...\"", "비대화형 실행 (스크립트용)", "claude -p \"서버 상태 점검\""],
        ["--model", "사용할 모델 지정", "claude --model opus"],
        ["--output-format json", "출력을 JSON 형식으로", "claude -p \"...\" --output-format json"],
        ["--verbose", "상세 로그 출력", "claude --verbose"],
        ["--allowedTools", "허용할 도구 제한", "claude --allowedTools \"Bash(read_only:true),Read\""],
        ["--debug", "디버그 모드", "claude --debug"],
        ["--max-turns N", "최대 대화 턴 수 제한", "claude -p \"...\" --max-turns 5"],
        ["--no-permissions", "권한 확인 건너뜀", "claude --no-permissions (주의 필요)"],
        ["--dangerously-skip-permissions", "모든 권한 승인", "자동화 스크립트 전용 (위험)"],
      ],
      [2800, 3200, 3026]
    ),
    warningBox("--dangerously-skip-permissions 옵션은 Claude가 모든 명령을 확인 없이 실행합니다. 자동화 스크립트에서만 사용하고, 반드시 신뢰할 수 있는 프롬프트와 함께 사용하세요."),
    emptyPara(),

    heading2("3.2 OAuth 인증 (Claude Max 구독 사용자)"),
    para("Claude Max(월 구독) 사용자는 OAuth 인증을 사용합니다."),
    emptyPara(),
    heading3("Step 1: 인증 URL 확인"),
    para("claude 실행 후 'Sign in with Claude (OAuth)'를 선택하면 인증 URL이 표시됩니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# claude",
      "",
      "  To sign in, open this URL in your browser:",
      "",
      "  https://claude.ai/oauth/authorize?code=XXXXXXXX",
      "",
      "  Waiting for authentication...",
    ]),
    emptyPara(),
    heading3("Step 2: 브라우저 없는 서버 환경에서의 인증"),
    importantBox("SSH로 접속한 서버에는 브라우저가 없습니다. 아래 방법으로 인증하세요."),
    para("1. 터미널에 표시된 URL을 복사합니다."),
    para("2. 로컬 PC(노트북 등)의 웹 브라우저에 URL을 붙여넣습니다."),
    para("3. Claude 계정으로 로그인 후 'Authorize' 버튼을 클릭합니다."),
    para("4. 인증이 완료되면 터미널에 자동으로 인증 성공 메시지가 표시됩니다."),
    ...terminalBlock([
      "  Authentication successful!",
      "  Welcome, user@company.com",
      "",
      "  Type your message to start a conversation.",
      "",
      "  You > _",
    ]),
    emptyPara(),
    heading3("Step 3: 인증 토큰 저장 위치"),
    para("인증 토큰은 아래 경로에 자동 저장됩니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# ls -la ~/.claude/",
      "total 12",
      "drwx------ 2 root root 4096 Mar 20 10:00 .",
      "drwx------ 5 root root 4096 Mar 20 10:00 ..",
      "-rw------- 1 root root 1234 Mar 20 10:00 credentials.json",
    ]),
    tipBox("토큰이 만료되면 claude 실행 시 자동으로 재인증을 요청합니다."),
    emptyPara(),

    heading2("3.3 API Key 인증"),
    para("Anthropic API를 직접 사용하는 경우 API Key로 인증합니다."),
    emptyPara(),
    heading3("Step 1: API Key 발급"),
    para("1. 웹 브라우저에서 console.anthropic.com 접속"),
    para("2. 로그인 후 'API Keys' 메뉴로 이동"),
    para("3. 'Create Key' 클릭 후 키 이름 입력"),
    para("4. 생성된 API Key(sk-ant-xxxxx...)를 안전한 곳에 복사·보관"),
    warningBox("API Key는 생성 시 한 번만 표시됩니다. 반드시 즉시 복사하여 안전하게 보관하세요."),
    emptyPara(),

    heading3("Step 2: 환경변수 설정"),
    ...terminalBlock([
      "[root@rhel-server ~]# export ANTHROPIC_API_KEY=\"sk-ant-api03-XXXXX...\"",
    ]),

    heading3("Step 3: 영구 등록"),
    para("방법 1: 개인 환경 (~/.bashrc)"),
    ...terminalBlock([
      "[root@rhel-server ~]# echo 'export ANTHROPIC_API_KEY=\"sk-ant-api03-XXXXX...\"' >> ~/.bashrc",
      "[root@rhel-server ~]# source ~/.bashrc",
    ]),
    para("방법 2: 전용 환경 파일 분리 (권장)"),
    ...terminalBlock([
      "[root@rhel-server ~]# cat > /etc/profile.d/claude-env.sh << 'EOF'",
      "export ANTHROPIC_API_KEY=\"sk-ant-api03-XXXXX...\"",
      "EOF",
      "[root@rhel-server ~]# chmod 600 /etc/profile.d/claude-env.sh",
    ]),
    warningBox("API Key를 스크립트 파일에 직접 하드코딩하지 마세요. 반드시 환경변수로 관리하고, 파일 권한을 600으로 설정하세요."),
    emptyPara(),

    heading2("3.4 인증 방식 비교"),
    makeTable(
      ["비교 항목", "OAuth (Claude Max)", "API Key"],
      [
        ["비용 구조", "월 정액 구독 (약 $100~200/월)", "사용량 기반 과금 (토큰당)"],
        ["설정 난이도", "쉬움 (브라우저 인증)", "약간 복잡 (Key 발급 + 환경변수)"],
        ["서버 환경 적합도", "브라우저 없으면 URL 복사 필요", "환경변수만 설정하면 완료"],
        ["보안", "토큰 자동 관리·갱신", "Key 노출 주의 필요"],
        ["자동화 적합도", "토큰 만료 시 재인증 필요", "Key만 있으면 무중단 실행"],
        ["일일 사용량 제한", "구독 플랜별 제한 있음", "잔액 한도까지 무제한"],
        ["권장 용도", "대화형 분석 위주", "자동화·스케줄링 위주"],
      ],
      [2500, 3263, 3263]
    ),
    tipBox("자동화(cron) 위주라면 API Key, 대화형 분석 위주라면 OAuth를 권장합니다. 두 방식을 병행할 수도 있습니다."),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 4장. 서버 관리 프롬프트 샘플
// ============================================================
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
// 4장. 서버 서비스 설치
// ============================================================
function chapterServices() {
  return [
    heading1("4장. 서버 서비스 설치"),
    para("이 장에서는 서버에서 자주 사용하는 핵심 서비스들의 설치 및 기본 설정 방법을 다룹니다. 각 서비스에 대해 두 가지 방법을 제시합니다: 전통적인 패키지 설치 방법과 Claude Code를 활용한 자동화 설치 방법입니다."),
    warningBox("이 장에서는 RHEL과 Ubuntu 두 가지 OS 환경의 설치 방법을 모두 제공합니다. RHEL 8에서는 yum, RHEL 9에서는 dnf를, Ubuntu에서는 apt를 사용합니다. 각 서비스별로 \u25A0 RHEL / \u25A0 Ubuntu 라벨로 구분되어 있습니다."),
    emptyPara(),

    // --- 4.1 계정 생성 및 관리 ---
    heading2("4.1 계정 생성 및 관리"),
    para("서버에 새로운 사용자를 추가하고 권한을 설정하는 것은 서버 관리의 가장 기본적인 작업입니다. 서비스 설치 전에 적절한 관리 계정을 먼저 준비해야 합니다."),
    emptyPara(),

    heading3("4.1.1 기본 명령어를 이용한 계정 생성"),
    rhelLabel(),
    para("1단계: 사용자 계정 생성", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# useradd -m -s /bin/bash srvadmin",
      "[root@rhel-server ~]# passwd srvadmin",
      "새 비밀번호 변경: [비밀번호 입력]",
      "새 비밀번호 재입력: [비밀번호 재입력]",
      "passwd: 모든 인증 토큰이 성공적으로 업데이트 되었습니다.",
    ]),
    para("주요 옵션 설명:", { run: { bold: true } }),
    makeTable(
      ["옵션", "설명", "사용 예시"],
      [
        ["-m", "홈 디렉토리 자동 생성", "useradd -m username"],
        ["-s", "기본 셸 지정", "useradd -s /bin/bash username"],
        ["-g", "기본 그룹 지정", "useradd -g wheel username"],
        ["-G", "보조 그룹 추가", "useradd -G docker,dev username"],
        ["-d", "홈 디렉토리 경로 지정", "useradd -d /home/custom username"],
        ["-e", "계정 만료일 설정", "useradd -e 2026-12-31 username"],
        ["-c", "사용자 설명(코멘트)", 'useradd -c "서버관리자" username'],
      ],
      [1200, 3500, 4326]
    ),
    emptyPara(),

    para("2단계: sudo 권한 부여", { run: { bold: true } }),
    ...terminalBlock([
      "# 방법 1: wheel 그룹에 추가 (RHEL 기본 sudo 그룹)",
      "[root@rhel-server ~]# usermod -aG wheel srvadmin",
      "",
      "# 방법 2: sudoers 파일에 직접 추가",
      "[root@rhel-server ~]# visudo",
      "# 아래 줄 추가:",
      "srvadmin    ALL=(ALL)    ALL",
      "",
      "# 비밀번호 없이 sudo 허용 (자동화 스크립트용)",
      "srvadmin    ALL=(ALL)    NOPASSWD: ALL",
    ]),
    para("3단계: 계정 생성 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# id srvadmin",
      "uid=1001(srvadmin) gid=1001(srvadmin) groups=1001(srvadmin),10(wheel)",
      "",
      "[root@rhel-server ~]# grep srvadmin /etc/passwd",
      "srvadmin:x:1001:1001::/home/srvadmin:/bin/bash",
      "",
      "[root@rhel-server ~]# ls -la /home/srvadmin/",
      "합계 12",
      "drwx------. 2 srvadmin srvadmin  62  3월 20 10:00 .",
      "drwxr-xr-x. 4 root     root      36  3월 20 10:00 ..",
      "-rw-r--r--. 1 srvadmin srvadmin  18  3월 20 10:00 .bash_logout",
      "-rw-r--r--. 1 srvadmin srvadmin 141  3월 20 10:00 .bash_profile",
      "-rw-r--r--. 1 srvadmin srvadmin 492  3월 20 10:00 .bashrc",
    ]),
    para("4단계: 비밀번호 정책 설정", { run: { bold: true } }),
    ...terminalBlock([
      "# 비밀번호 최소 길이 및 복잡도 설정",
      "[root@rhel-server ~]# vi /etc/security/pwquality.conf",
      "minlen = 8                # 최소 8자",
      "dcredit = -1              # 숫자 최소 1개",
      "ucredit = -1              # 대문자 최소 1개",
      "lcredit = -1              # 소문자 최소 1개",
      "ocredit = -1              # 특수문자 최소 1개",
      "",
      "# 비밀번호 만료 정책 설정",
      "[root@rhel-server ~]# chage -M 90 -W 7 -m 1 srvadmin",
      "[root@rhel-server ~]# chage -l srvadmin",
      "마지막으로 비밀번호를 바꾼 날                     : 3월 20, 2026",
      "비밀번호 만료                                    : 6월 18, 2026",
      "비밀번호가 비활성화 기간                          : 안함",
      "계정 만료                                       : 안함",
      "비밀번호를 바꿀 수 있는 최소 날 수               : 1",
      "비밀번호를 바꿔야 하는 최대 날 수               : 90",
      "비밀번호 만료 예고를 하는 날 수                  : 7",
    ]),
    para("5단계: 서비스 전용 계정 생성 (비로그인)", { run: { bold: true } }),
    ...terminalBlock([
      "# 셸 로그인 불가능한 서비스 전용 계정",
      "[root@rhel-server ~]# useradd -r -s /sbin/nologin -d /opt/myapp myapp",
      "",
      "# -r : 시스템 계정 (UID 1000 미만)",
      "# -s /sbin/nologin : 로그인 비활성화",
      "# -d /opt/myapp : 서비스 디렉토리를 홈으로 지정",
    ]),
    warningBox("root 계정으로 직접 작업하는 것은 보안상 위험합니다. 일반 관리 계정을 생성하고 sudo를 통해 권한을 상승시키는 것을 권장합니다."),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: 사용자 계정 생성", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# adduser srvadmin",
      "새 비밀번호 입력: [비밀번호 입력]",
      "새 비밀번호 재입력: [비밀번호 재입력]",
      "passwd: 비밀번호를 성공적으로 업데이트했습니다",
      "  전체 이름 []: 서버관리자",
      "  방 번호 []: ",
      "  직장 전화번호 []: ",
      "  자택 전화번호 []: ",
      "  기타 []: ",
      "정보가 올바릅니까? [Y/n] y",
    ]),
    para("2단계: sudo 권한 부여", { run: { bold: true } }),
    ...terminalBlock([
      "# Ubuntu에서는 sudo 그룹 사용 (RHEL의 wheel 대응)",
      "[root@ubuntu-server ~]# usermod -aG sudo srvadmin",
      "",
      "# 확인",
      "[root@ubuntu-server ~]# id srvadmin",
      "uid=1001(srvadmin) gid=1001(srvadmin) groups=1001(srvadmin),27(sudo)",
    ]),
    para("3단계: 비밀번호 정책 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt install libpam-pwquality -y",
      "[root@ubuntu-server ~]# vi /etc/security/pwquality.conf",
      "# RHEL과 동일한 설정 사용 (minlen, dcredit, ucredit 등)",
      "[root@ubuntu-server ~]# chage -M 90 -W 7 -m 1 srvadmin",
    ]),
    tipBox("Ubuntu에서는 adduser 명령이 useradd보다 편리합니다. 홈 디렉토리 생성, 비밀번호 설정, 사용자 정보 입력을 대화형으로 한 번에 처리합니다. sudo 그룹은 RHEL의 wheel 그룹에 대응합니다."),
    emptyPara(),

    heading3("4.1.2 Claude Code를 이용한 계정 생성 및 설정"),
    para("Claude Code를 활용하면 계정 생성, 권한 설정, 보안 정책 적용을 한 번에 처리할 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 서버에 관리자 계정을 생성하고 보안 설정을 적용해줘.',
      '1) srvadmin 사용자 계정 생성 (홈 디렉토리 자동 생성, bash 셸)',
      '2) wheel 그룹에 추가하여 sudo 권한 부여',
      '3) 비밀번호 정책 설정:',
      '   - 최소 8자, 대/소문자+숫자+특수문자 포함',
      '   - 90일마다 변경, 7일 전 만료 경고',
      '4) 현재 시스템의 전체 사용자 계정 목록과 상태를 보여줘',
      '5) 보안 권장사항이 있으면 알려줘"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 서버에 관리자 계정을 생성하고 보안 설정을 적용해줘..."',
      "",
      "관리자 계정 생성 및 보안 설정을 진행하겠습니다.",
      "",
      "1. 계정 생성 완료:",
      "   srvadmin (UID: 1001, GID: 1001)",
      "   홈 디렉토리: /home/srvadmin",
      "   셸: /bin/bash",
      "",
      "2. sudo 권한 부여 완료:",
      "   wheel 그룹에 추가됨",
      "",
      "3. 비밀번호 정책 적용 완료:",
      "   /etc/security/pwquality.conf 설정 완료",
      "   chage: 90일 만료, 7일 전 경고 설정 완료",
      "",
      "4. 현재 시스템 계정 현황:",
      "   일반 사용자: 2개 (root, srvadmin)",
      "   시스템 계정: 25개",
      "   셸 로그인 가능: root, srvadmin",
      "",
      "5. 보안 권장사항:",
      "   - srvadmin 비밀번호를 설정하세요: passwd srvadmin",
      "   - root 직접 SSH 접속을 비활성화하세요",
      "   - SSH 키 기반 인증 전환을 권장합니다",
    ]),
    tipBox("계정 생성 후 반드시 passwd 명령으로 비밀번호를 설정하세요. Claude Code는 보안상 비밀번호를 직접 설정하지 않으며, 대화형 비밀번호 입력이 필요한 작업은 수동으로 수행해야 합니다."),
    emptyPara(),

    // --- 4.2 SSH (OpenSSH) ---
    heading2("4.2 SSH (OpenSSH) 설치 및 설정"),
    para("SSH(Secure Shell)는 서버 원격 접속의 기본 프로토콜입니다. RHEL에는 기본 설치되어 있는 경우가 많지만, 설치 및 보안 설정 방법을 알아둘 필요가 있습니다."),
    emptyPara(),

    heading3("4.2.1 기본 패키지 설치"),
    rhelLabel(),
    para("1단계: 패키지 설치 확인 및 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install openssh-server openssh-clients -y",
      "마지막 메타자료 만료확인 : 0:45:12 전에 2026년 03월 20일 (목) ...",
      "패키지 openssh-server-8.7p1-38.el9.x86_64가 이미 설치되어 있습니다.",
      "패키지 openssh-clients-8.7p1-38.el9.x86_64가 이미 설치되어 있습니다.",
      "완료되었습니다!",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# systemctl start sshd",
      "[root@rhel-server ~]# systemctl enable sshd",
      "Created symlink /etc/systemd/system/multi-user.target.wants/sshd.service",
      " → /usr/lib/systemd/system/sshd.service.",
      "[root@rhel-server ~]# systemctl status sshd",
      "● sshd.service - OpenSSH server daemon",
      "     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 10:00:00 KST",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-service=ssh",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    para("4단계: 기본 보안 설정 (/etc/ssh/sshd_config)", { run: { bold: true } }),
    ...codeBlock([
      "# 주요 보안 설정 변경",
      "Port 22                          # 필요시 변경 (예: 2222)",
      "PermitRootLogin no               # root 직접 로그인 비활성화",
      "PasswordAuthentication yes        # 키 기반 인증 전환 시 no로 변경",
      "MaxAuthTries 3                   # 최대 인증 시도 횟수",
      "ClientAliveInterval 300          # 유휴 연결 타임아웃 (5분)",
      "ClientAliveCountMax 2            # 최대 유휴 허용 횟수",
    ]),
    ...terminalBlock([
      "[root@rhel-server ~]# vi /etc/ssh/sshd_config",
      "[root@rhel-server ~]# systemctl restart sshd",
    ]),
    tipBox("SSH 설정 변경 후에는 반드시 다른 터미널에서 새로운 접속을 테스트한 후 기존 세션을 종료하세요. 잘못된 설정으로 접속이 불가능해질 수 있습니다."),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: 패키지 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt update",
      "[root@ubuntu-server ~]# apt install openssh-server -y",
      "...",
      "openssh-server (1:9.6p1-3ubuntu13) 설정하는 중입니다 ...",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl start ssh",
      "[root@ubuntu-server ~]# systemctl enable ssh",
      "[root@ubuntu-server ~]# systemctl status ssh",
      "● ssh.service - OpenBSD Secure Shell server",
      "     Loaded: loaded (/usr/lib/systemd/system/ssh.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 10:00:00 KST",
    ]),
    para("3단계: 방화벽 설정 (UFW)", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# ufw allow ssh",
      "Rule added",
      "[root@ubuntu-server ~]# ufw enable",
      "Firewall is active and enabled on system startup",
    ]),
    para("4단계: 보안 설정", { run: { bold: true } }),
    para("/etc/ssh/sshd_config 보안 설정은 RHEL과 동일합니다. 설정 변경 후 서비스 재시작:"),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl restart ssh    # RHEL: systemctl restart sshd",
    ]),
    tipBox("Ubuntu에서 SSH 서비스명은 sshd가 아닌 ssh입니다. 방화벽은 firewalld 대신 UFW(Uncomplicated Firewall)를 사용합니다. SELinux 대신 AppArmor가 기본 보안 모듈입니다."),
    emptyPara(),

    heading3("4.2.2 Claude Code를 이용한 설치 및 설정"),
    para("Claude Code를 활용하면 SSH 설치부터 보안 설정까지 한 번에 자동화할 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 서버에 OpenSSH를 설치하고 기본 보안 설정을 적용해줘.',
      '1) openssh-server, openssh-clients 패키지 설치',
      '2) sshd 서비스 시작 및 부팅 시 자동 시작 설정',
      '3) 방화벽에 SSH 서비스 허용',
      '4) /etc/ssh/sshd_config에서 보안 설정 적용:',
      '   - root 로그인 비활성화',
      '   - 최대 인증 시도 3회',
      '   - 유휴 타임아웃 5분',
      '5) 설정 적용 후 sshd 재시작 및 상태 확인"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 서버에 OpenSSH를 설치하고 기본 보안 설정을 적용해줘..."',
      "",
      "OpenSSH 설치 및 보안 설정을 진행하겠습니다.",
      "",
      "1. 패키지 설치 확인:",
      "   openssh-server, openssh-clients 모두 설치되어 있습니다.",
      "",
      "2. 서비스 상태:",
      "   sshd가 active (running) 상태이며 enabled입니다.",
      "",
      "3. 방화벽 설정:",
      "   SSH 서비스가 허용 목록에 추가되었습니다.",
      "",
      "4. 보안 설정 적용 완료:",
      "   - PermitRootLogin no",
      "   - MaxAuthTries 3",
      "   - ClientAliveInterval 300",
      "   - ClientAliveCountMax 2",
      "",
      "5. sshd 서비스 재시작 완료. 정상 동작 확인됨.",
    ]),
    tipBox("Claude Code는 현재 서버 상태를 확인한 후 필요한 작업만 수행합니다. 이미 설치된 패키지는 건너뛰고, 이미 적용된 설정은 중복 변경하지 않습니다."),
    emptyPara(),

    // --- 4.3 MySQL ---
    heading2("4.3 MySQL 설치 및 설정"),
    para("MySQL은 가장 널리 사용되는 관계형 데이터베이스 관리 시스템(RDBMS)입니다. RHEL에서는 MySQL Community Server를 설치합니다."),
    emptyPara(),

    heading3("4.3.1 기본 패키지 설치"),
    rhelLabel(),
    para("1단계: MySQL 저장소 추가 및 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install https://dev.mysql.com/get/mysql80-community-release-el9-5.noarch.rpm -y",
      "...",
      "설치됨:",
      "  mysql80-community-release-el9-5.noarch",
      "완료되었습니다!",
      "",
      "[root@rhel-server ~]# dnf install mysql-community-server -y",
      "...",
      "설치됨:",
      "  mysql-community-server-8.0.xx-1.el9.x86_64",
      "  mysql-community-client-8.0.xx-1.el9.x86_64",
      "  mysql-community-common-8.0.xx-1.el9.x86_64",
      "완료되었습니다!",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# systemctl start mysqld",
      "[root@rhel-server ~]# systemctl enable mysqld",
      "[root@rhel-server ~]# systemctl status mysqld",
      "● mysqld.service - MySQL Server",
      "     Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 10:30:00 KST",
    ]),
    para("3단계: 임시 비밀번호 확인 및 보안 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# grep 'temporary password' /var/log/mysqld.log",
      "2026-03-20T01:30:00.000000Z 6 [Note] A temporary password is generated for",
      "root@localhost: Abc123!@#xyz",
      "",
      "[root@rhel-server ~]# mysql_secure_installation",
      "Enter password for user root: [임시 비밀번호 입력]",
      "",
      "New password: [새 비밀번호 입력]",
      "Re-enter new password: [새 비밀번호 재입력]",
      "",
      "Remove anonymous users? (Press y|Y for Yes) : y",
      "Disallow root login remotely? (Press y|Y for Yes) : y",
      "Remove test database? (Press y|Y for Yes) : y",
      "Reload privilege tables now? (Press y|Y for Yes) : y",
      "",
      "All done!",
    ]),
    para("4단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-port=3306/tcp",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    warningBox("mysql_secure_installation 실행 시 반드시 임시 비밀번호를 먼저 확인하세요. 비밀번호 정책은 대문자, 소문자, 숫자, 특수문자를 포함한 8자 이상입니다."),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: MySQL 설치 (기본 저장소)", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt update",
      "[root@ubuntu-server ~]# apt install mysql-server -y",
      "...",
      "mysql-server (8.0.xx-0ubuntu0.24.04.1) 설정하는 중입니다 ...",
    ]),
    para("2단계: 서비스 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl status mysql",
      "● mysql.service - MySQL Community Server",
      "     Active: active (running) since Thu 2026-03-20 10:30:00 KST",
    ]),
    para("3단계: 보안 초기화", { run: { bold: true } }),
    ...terminalBlock([
      "# Ubuntu에서 MySQL root는 기본적으로 auth_socket 인증 사용",
      "# sudo mysql로 바로 접속 가능 (임시 비밀번호 불필요)",
      "[root@ubuntu-server ~]# sudo mysql",
      "mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '새비밀번호';",
      "mysql> FLUSH PRIVILEGES;",
      "mysql> exit;",
      "",
      "[root@ubuntu-server ~]# mysql_secure_installation",
      "# 이후 RHEL과 동일한 보안 초기화 절차 진행",
    ]),
    para("4단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# ufw allow 3306/tcp",
      "Rule added",
    ]),
    tipBox("Ubuntu에서는 MySQL이 기본 저장소에 포함되어 있어 별도 저장소 추가가 불필요합니다. 초기 root 인증이 auth_socket 방식이므로 sudo mysql로 바로 접속할 수 있습니다."),
    emptyPara(),

    heading3("4.3.2 Claude Code를 이용한 설치 및 설정"),
    para("Claude Code를 활용하면 MySQL 저장소 추가부터 보안 초기화까지 가이드를 받을 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 RHEL 서버에 MySQL 8.0을 설치해줘.',
      '1) MySQL 공식 저장소(mysql80-community-release) 추가',
      '2) mysql-community-server 패키지 설치',
      '3) mysqld 서비스 시작 및 부팅 시 자동 시작 설정',
      '4) 임시 root 비밀번호를 /var/log/mysqld.log에서 찾아서 알려줘',
      '5) 방화벽에 3306 포트 허용',
      '6) mysql_secure_installation 실행에 필요한 단계별 안내 제공"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 RHEL 서버에 MySQL 8.0을 설치해줘..."',
      "",
      "MySQL 8.0 설치를 진행하겠습니다.",
      "",
      "1. MySQL 공식 저장소 추가 완료",
      "2. mysql-community-server 설치 완료 (8.0.xx)",
      "3. mysqld 서비스 시작 및 enable 완료",
      "4. 임시 root 비밀번호: Abc123!@#xyz",
      "   ※ 반드시 mysql_secure_installation으로 변경하세요",
      "5. 방화벽 3306/tcp 포트 허용 완료",
      "",
      "다음 단계: mysql_secure_installation을 실행하여",
      "root 비밀번호 변경 및 보안 설정을 완료하세요.",
    ]),
    warningBox("mysql_secure_installation은 대화형 명령이므로 Claude Code가 직접 실행하기 어렵습니다. Claude가 안내하는 단계를 따라 수동으로 실행하세요."),
    emptyPara(),

    // --- 4.4 MariaDB ---
    heading2("4.4 MariaDB 설치 및 설정"),
    para("MariaDB는 MySQL의 포크(fork)로, RHEL의 기본 저장소에 포함되어 있어 별도 저장소 추가 없이 설치할 수 있습니다. MySQL과 호환되며 성능이 우수합니다."),
    emptyPara(),

    heading3("4.4.1 기본 패키지 설치"),
    rhelLabel(),
    para("1단계: 패키지 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install mariadb-server mariadb -y",
      "...",
      "설치됨:",
      "  mariadb-server-10.5.xx-1.el9.x86_64",
      "  mariadb-10.5.xx-1.el9.x86_64",
      "완료되었습니다!",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# systemctl start mariadb",
      "[root@rhel-server ~]# systemctl enable mariadb",
      "Created symlink /etc/systemd/system/multi-user.target.wants/mariadb.service",
      " → /usr/lib/systemd/system/mariadb.service.",
      "[root@rhel-server ~]# systemctl status mariadb",
      "● mariadb.service - MariaDB 10.5 database server",
      "     Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 11:00:00 KST",
    ]),
    para("3단계: 보안 초기화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# mysql_secure_installation",
      "",
      "Enter current password for root (enter for none): [Enter]",
      "Switch to unix_socket authentication [Y/n] y",
      "Change the root password? [Y/n] y",
      "New password: [새 비밀번호 입력]",
      "Re-enter new password: [새 비밀번호 재입력]",
      "Remove anonymous users? [Y/n] y",
      "Disallow root login remotely? [Y/n] y",
      "Remove test database and access to it? [Y/n] y",
      "Reload privilege tables now? [Y/n] y",
      "",
      "All done!",
    ]),
    para("4단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-port=3306/tcp",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    tipBox("MariaDB는 RHEL 기본 저장소에 포함되어 있어 별도 저장소 설정이 불필요합니다. MySQL과 달리 초기 root 비밀번호가 비어있으므로 바로 mysql_secure_installation을 실행할 수 있습니다."),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: 패키지 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt update",
      "[root@ubuntu-server ~]# apt install mariadb-server mariadb-client -y",
      "...",
      "mariadb-server (1:10.11.x-0ubuntu0.24.04.1) 설정하는 중입니다 ...",
    ]),
    para("2단계: 서비스 확인 및 보안 초기화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl status mariadb",
      "● mariadb.service - MariaDB 10.11.x database server",
      "     Active: active (running) since Thu 2026-03-20 11:00:00 KST",
      "",
      "[root@ubuntu-server ~]# mysql_secure_installation",
      "# RHEL과 동일한 보안 초기화 절차 진행",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# ufw allow 3306/tcp",
      "Rule added",
    ]),
    emptyPara(),

    heading3("4.4.2 Claude Code를 이용한 설치 및 설정"),
    para("Claude Code를 활용하여 MariaDB를 빠르게 설치하고 설정할 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 RHEL 서버에 MariaDB를 설치해줘.',
      '1) mariadb-server, mariadb 패키지 설치',
      '2) mariadb 서비스 시작 및 부팅 시 자동 시작 설정',
      '3) 방화벽에 3306 포트 허용',
      '4) 기본 문자셋을 UTF-8로 설정 (/etc/my.cnf.d/)',
      '5) mysql_secure_installation 실행 안내 제공"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 RHEL 서버에 MariaDB를 설치해줘..."',
      "",
      "MariaDB 설치를 진행하겠습니다.",
      "",
      "1. mariadb-server, mariadb 패키지 설치 완료 (10.5.xx)",
      "2. mariadb 서비스 시작 및 enable 완료",
      "3. 방화벽 3306/tcp 포트 허용 완료",
      "4. UTF-8 문자셋 설정 완료:",
      "   /etc/my.cnf.d/charset.cnf 생성",
      "   [mysqld] character-set-server=utf8mb4",
      "   [client] default-character-set=utf8mb4",
      "",
      "다음 단계: mysql_secure_installation을 실행하여",
      "root 비밀번호 설정 및 보안 초기화를 완료하세요.",
      "(MariaDB는 초기 root 비밀번호가 비어있습니다)",
    ]),
    emptyPara(),

    // --- 4.5 Apache (httpd) ---
    heading2("4.5 Apache (httpd) 설치 및 설정"),
    para("Apache HTTP Server(httpd)는 세계에서 가장 많이 사용되는 웹 서버 중 하나입니다. RHEL 기본 저장소에 포함되어 있습니다."),
    emptyPara(),

    heading3("4.5.1 기본 패키지 설치"),
    rhelLabel(),
    para("1단계: 패키지 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install httpd httpd-tools mod_ssl -y",
      "...",
      "설치됨:",
      "  httpd-2.4.57-x.el9.x86_64",
      "  httpd-tools-2.4.57-x.el9.x86_64",
      "  mod_ssl-2.4.57-x.el9.x86_64",
      "완료되었습니다!",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# systemctl start httpd",
      "[root@rhel-server ~]# systemctl enable httpd",
      "Created symlink /etc/systemd/system/multi-user.target.wants/httpd.service",
      " → /usr/lib/systemd/system/httpd.service.",
      "[root@rhel-server ~]# systemctl status httpd",
      "● httpd.service - The Apache HTTP Server",
      "     Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 11:30:00 KST",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-service=http",
      "success",
      "[root@rhel-server ~]# firewall-cmd --permanent --add-service=https",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    para("4단계: SELinux 설정 (필요시)", { run: { bold: true } }),
    ...terminalBlock([
      "# 웹서버가 네트워크 연결을 허용하도록 SELinux 설정",
      "[root@rhel-server ~]# setsebool -P httpd_can_network_connect 1",
      "",
      "# 특정 디렉토리를 웹 콘텐츠로 사용할 경우",
      "[root@rhel-server ~]# semanage fcontext -a -t httpd_sys_content_t '/var/www/html(/.*)?'",
      "[root@rhel-server ~]# restorecon -Rv /var/www/html",
    ]),
    para("5단계: 동작 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# curl -I http://localhost",
      "HTTP/1.1 403 Forbidden",
      "Date: Thu, 20 Mar 2026 02:30:00 GMT",
      "Server: Apache/2.4.57 (Red Hat Enterprise Linux)",
      "Content-Type: text/html; charset=iso-8859-1",
    ]),
    tipBox("설치 직후 403 Forbidden은 정상입니다. /var/www/html/에 index.html 파일을 생성하면 웹 페이지가 표시됩니다."),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: 패키지 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt update",
      "[root@ubuntu-server ~]# apt install apache2 -y",
      "...",
      "apache2 (2.4.58-1ubuntu8) 설정하는 중입니다 ...",
    ]),
    para("2단계: 서비스 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl status apache2",
      "● apache2.service - The Apache HTTP Server",
      "     Active: active (running) since Thu 2026-03-20 11:30:00 KST",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      '[root@ubuntu-server ~]# ufw allow "Apache Full"',
      "Rule added",
    ]),
    para("4단계: SSL 모듈 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# a2enmod ssl",
      "Enabling module ssl.",
      "[root@ubuntu-server ~]# a2enmod rewrite",
      "Enabling module rewrite.",
      "[root@ubuntu-server ~]# systemctl restart apache2",
    ]),
    para("5단계: 동작 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# curl -I http://localhost",
      "HTTP/1.1 200 OK",
      "Server: Apache/2.4.58 (Ubuntu)",
    ]),
    tipBox("Ubuntu에서 Apache 패키지명은 httpd가 아닌 apache2입니다. 설정 파일은 /etc/apache2/에 위치하며, a2enmod/a2dismod로 모듈을, a2ensite/a2dissite로 사이트를 관리합니다. SELinux 대신 AppArmor가 기본 보안 모듈입니다."),
    emptyPara(),

    heading3("4.5.2 Claude Code를 이용한 설치 및 설정"),
    para("Claude Code를 활용하면 Apache 설치부터 가상 호스트 설정까지 자동화할 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 RHEL 서버에 Apache 웹 서버를 설치하고 설정해줘.',
      '1) httpd, httpd-tools, mod_ssl 패키지 설치',
      '2) httpd 서비스 시작 및 부팅 시 자동 시작 설정',
      '3) 방화벽에 http, https 서비스 허용',
      '4) SELinux에서 httpd 네트워크 연결 허용',
      '5) 기본 테스트 페이지 생성 (/var/www/html/index.html)',
      '6) 동작 확인 (curl 테스트)"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 RHEL 서버에 Apache 웹 서버를 설치하고 설정해줘..."',
      "",
      "Apache 웹 서버 설치를 진행하겠습니다.",
      "",
      "1. httpd, httpd-tools, mod_ssl 설치 완료 (2.4.57)",
      "2. httpd 서비스 시작 및 enable 완료",
      "3. 방화벽 설정 완료 (http, https 허용)",
      "4. SELinux 설정: httpd_can_network_connect → on",
      "5. 테스트 페이지 생성 완료: /var/www/html/index.html",
      "6. 동작 확인 결과:",
      "   HTTP/1.1 200 OK",
      "   Server: Apache/2.4.57 (Red Hat Enterprise Linux)",
      "",
      "Apache 웹 서버가 정상적으로 설치 및 설정되었습니다.",
      "브라우저에서 http://서버IP 로 접속하여 확인하세요.",
    ]),
    emptyPara(),

    // --- 4.6 Nginx ---
    heading2("4.6 Nginx 설치 및 설정"),
    para("Nginx는 고성능 웹 서버이자 리버스 프록시 서버입니다. 가볍고 동시 접속 처리에 뛰어나 최근 많이 사용됩니다."),
    emptyPara(),

    heading3("4.6.1 기본 패키지 설치"),
    rhelLabel(),
    para("1단계: EPEL 저장소 확인 및 Nginx 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# dnf install epel-release -y    # EPEL 저장소 설치",
      "...",
      "[root@rhel-server ~]# dnf install nginx -y",
      "...",
      "설치됨:",
      "  nginx-1.24.x-1.el9.x86_64",
      "완료되었습니다!",
    ]),
    para("2단계: 서비스 시작 및 활성화", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# systemctl start nginx",
      "[root@rhel-server ~]# systemctl enable nginx",
      "Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service",
      " → /usr/lib/systemd/system/nginx.service.",
      "[root@rhel-server ~]# systemctl status nginx",
      "● nginx.service - The nginx HTTP and reverse proxy server",
      "     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; ...)",
      "     Active: active (running) since Thu 2026-03-20 12:00:00 KST",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# firewall-cmd --permanent --add-service=http",
      "success",
      "[root@rhel-server ~]# firewall-cmd --permanent --add-service=https",
      "success",
      "[root@rhel-server ~]# firewall-cmd --reload",
      "success",
    ]),
    para("4단계: SELinux 설정 (필요시)", { run: { bold: true } }),
    ...terminalBlock([
      "# Nginx가 네트워크 연결을 허용하도록 SELinux 설정",
      "[root@rhel-server ~]# setsebool -P httpd_can_network_connect 1",
      "",
      "# 리버스 프록시로 사용할 경우",
      "[root@rhel-server ~]# setsebool -P httpd_can_network_relay 1",
    ]),
    para("5단계: 동작 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@rhel-server ~]# curl -I http://localhost",
      "HTTP/1.1 200 OK",
      "Server: nginx/1.24.x",
      "Date: Thu, 20 Mar 2026 03:00:00 GMT",
      "Content-Type: text/html",
      "Content-Length: 3429",
    ]),
    para("6단계: 기본 설정 파일 구조 확인", { run: { bold: true } }),
    ...codeBlock([
      "/etc/nginx/",
      "├── nginx.conf              # 메인 설정 파일",
      "├── conf.d/                  # 추가 설정 디렉토리",
      "│   └── default.conf        # 기본 서버 블록",
      "├── mime.types               # MIME 타입 정의",
      "└── /usr/share/nginx/html/  # 기본 웹 루트",
    ]),
    emptyPara(),

    ubuntuLabel(),
    para("1단계: Nginx 설치", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# apt update",
      "[root@ubuntu-server ~]# apt install nginx -y",
      "...",
      "nginx (1.24.x-1ubuntu1) 설정하는 중입니다 ...",
    ]),
    para("2단계: 서비스 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# systemctl status nginx",
      "● nginx.service - A high performance web server and a reverse proxy server",
      "     Active: active (running) since Thu 2026-03-20 12:00:00 KST",
    ]),
    para("3단계: 방화벽 설정", { run: { bold: true } }),
    ...terminalBlock([
      '[root@ubuntu-server ~]# ufw allow "Nginx Full"',
      "Rule added",
    ]),
    para("4단계: 동작 확인", { run: { bold: true } }),
    ...terminalBlock([
      "[root@ubuntu-server ~]# curl -I http://localhost",
      "HTTP/1.1 200 OK",
      "Server: nginx/1.24.x (Ubuntu)",
    ]),
    para("5단계: 설정 파일 구조", { run: { bold: true } }),
    ...codeBlock([
      "/etc/nginx/",
      "├── nginx.conf              # 메인 설정 파일",
      "├── conf.d/                  # 추가 설정 디렉토리",
      "├── sites-available/         # 사이트 설정 (Ubuntu 전용)",
      "│   └── default             # 기본 사이트",
      "├── sites-enabled/           # 활성화된 사이트 (심볼릭 링크)",
      "└── /var/www/html/          # 기본 웹 루트",
    ]),
    tipBox("Ubuntu에서는 EPEL 저장소 없이 기본 저장소에서 Nginx를 설치할 수 있습니다. RHEL과 달리 sites-available/sites-enabled 디렉토리를 사용하며, SELinux 대신 AppArmor가 적용됩니다."),
    emptyPara(),

    heading3("4.6.2 Claude Code를 이용한 설치 및 설정"),
    para("Claude Code를 활용하면 Nginx 설치부터 리버스 프록시 설정까지 자동화할 수 있습니다."),
    emptyPara(),
    para("프롬프트 (비대화형 실행):", { run: { bold: true } }),
    ...codeBlock([
      'claude -p "이 RHEL 서버에 Nginx를 설치하고 설정해줘.',
      '1) EPEL 저장소 확인 후 nginx 패키지 설치',
      '2) nginx 서비스 시작 및 부팅 시 자동 시작 설정',
      '3) 방화벽에 http, https 서비스 허용',
      '4) SELinux에서 httpd 네트워크 연결 허용',
      '5) 기본 테스트 페이지 생성',
      '6) 동작 확인 (curl 테스트)',
      '7) 주요 설정 파일 위치와 구조를 알려줘"',
    ]),
    ...terminalBlock([
      '[root@rhel-server ~]# claude -p "이 RHEL 서버에 Nginx를 설치하고 설정해줘..."',
      "",
      "Nginx 설치를 진행하겠습니다.",
      "",
      "1. EPEL 저장소 확인 → nginx 설치 완료 (1.24.x)",
      "2. nginx 서비스 시작 및 enable 완료",
      "3. 방화벽 설정 완료 (http, https 허용)",
      "4. SELinux 설정:",
      "   httpd_can_network_connect → on",
      "   httpd_can_network_relay → on",
      "5. 기본 페이지 확인 완료",
      "6. 동작 확인: HTTP/1.1 200 OK",
      "",
      "주요 설정 파일:",
      "  메인 설정: /etc/nginx/nginx.conf",
      "  사이트 설정: /etc/nginx/conf.d/*.conf",
      "  웹 루트: /usr/share/nginx/html/",
      "",
      "Nginx가 정상적으로 설치 및 설정되었습니다.",
    ]),
    tipBox("Apache와 Nginx를 같은 서버에서 동시에 사용하려면 포트를 다르게 설정해야 합니다. 예: Apache는 8080, Nginx는 80 포트 사용."),
    emptyPara(),

    // --- 4.6 서비스 비교표 ---
    heading2("4.7 서비스 설치 요약 비교"),
    makeTable(
      ["서비스", "RHEL 패키지명", "Ubuntu 패키지명", "기본 포트", "비고"],
      [
        ["계정 관리", "shadow-utils", "passwd (기본)", "-", "RHEL: wheel / Ubuntu: sudo 그룹"],
        ["SSH", "openssh-server", "openssh-server", "22", "서비스명: RHEL sshd / Ubuntu ssh"],
        ["MySQL", "mysql-community-server", "mysql-server", "3306", "Ubuntu는 기본 저장소 포함"],
        ["MariaDB", "mariadb-server", "mariadb-server", "3306", "양쪽 모두 기본 저장소"],
        ["Apache", "httpd", "apache2", "80/443", "설정: /etc/httpd/ vs /etc/apache2/"],
        ["Nginx", "nginx (EPEL)", "nginx", "80/443", "Ubuntu는 EPEL 불필요"],
      ],
      [1200, 1800, 1800, 1000, 3226]
    ),
    emptyPara(),
    warningBox("MySQL과 MariaDB는 같은 포트(3306)를 사용하므로 동시에 설치하면 충돌이 발생합니다. 한 가지만 선택하여 설치하세요."),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function chapter4() {
  return [
    heading1("5장. 서버 관리 프롬프트 샘플"),
    para("이 장은 매뉴얼의 핵심입니다. 각 프롬프트를 복사하여 바로 사용할 수 있습니다. 모든 샘플에는 실행 방법, 예상 출력, 해석, 후속 조치가 포함되어 있습니다."),
    emptyPara(),

    // --- 5.1 시스템 상태 점검 ---
    heading2("5.1 시스템 상태 점검"),

    ...promptSample(
      "5.1.1 서버 전체 헬스체크",
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
        "- [정상] 메모리 여유 충분",
        "",
        "### 디스크",
        "- /       : 45% 사용 (23GB/50GB) - 정상",
        "- /var    : 78% 사용 (39GB/50GB) - [주의] 80% 근접",
        "- /tmp    : 12% 사용 (1.2GB/10GB) - 정상",
        "",
        "### 서비스 상태",
        "- sshd: active (running) - 정상",
        "- httpd: active (running) - 정상",
        "- crond: active (running) - 정상",
        "- firewalld: active (running) - 정상",
        "",
        "### 종합 평가: [주의] /var 파티션 78% - 로그 정리 권장",
      ],
      "/var 파티션이 78%로 80% 임계값에 근접했습니다. 나머지 항목은 정상 범위입니다.",
      "/var 파티션의 오래된 로그를 정리하거나 logrotate 설정을 점검하세요. 'journalctl --vacuum-size=500M' 으로 journal 로그를 정리할 수 있습니다.",
      {
        description: "Claude에게 구체적인 정리 작업을 요청하면 안전하게 공간을 확보할 수 있습니다. 삭제 대상 파일을 분석하고 우선순위별로 정리 명령어를 생성해줍니다.",
        prompt: ["/var 파티션이 78%야. 안전하게 공간을 확보할 수 있는 방법을", "우선순위별로 알려주고, 각 정리 명령어를 실행해줘.", "삭제 전에 반드시 파일 목록을 보여주고 확인을 받아줘."],
        terminal: [
          "[root@rhel-server ~]# claude",
          "",
          "You > /var 파티션 78%. 안전하게 정리해줘.",
          "",
          "Claude > /var 디렉토리를 분석하겠습니다.",
          "",
          "  정리 대상 (안전):",
          "  1. dnf 캐시: 3.2GB -> dnf clean all 실행할까요? (y/n)",
          "  2. journal 로그: 4.5GB -> 500MB로 축소할까요? (y/n)",
          "  3. 오래된 로그(90일+): 2.1GB -> 삭제할까요? (y/n)",
          "",
          "You > y",
          "",
          "Claude > 정리 완료. /var 사용률: 78% -> 52%",
        ],
      }
    ),

    ...promptSample(
      "5.1.2 디스크 사용량 분석",
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
        "| /tmp | 10GB | 1.2GB | 12% | 정상 |",
        "",
        "### /var 내 큰 디렉토리 Top 5",
        "1. /var/log/          - 15.2GB",
        "2. /var/lib/mysql/     - 12.8GB",
        "3. /var/cache/         - 5.3GB",
        "4. /var/lib/docker/    - 3.1GB",
        "5. /var/spool/         - 1.8GB",
        "",
        "### 정리 추천 항목",
        "1. /var/log/messages-20260101  (2.1GB) - 3개월 이전 로그",
        "2. /var/cache/dnf/             (3.2GB) - dnf clean all 실행 권장",
        "3. /var/log/journal/           (4.5GB) - vacuum 권장",
      ],
      "80% 이상이면 [위험], 70~80%면 [주의], 70% 미만이면 [정상]입니다.",
      "'dnf clean all'로 캐시 정리, 'journalctl --vacuum-size=1G'로 journal 크기 제한을 적용하세요.",
      {
        description: "Claude에게 디스크 정리를 직접 수행하도록 요청할 수 있습니다. 대화형 모드에서 확인을 받으며 단계별로 정리합니다.",
        prompt: ["디스크 사용량이 높아. 정리 가능한 항목을 분석하고,", "각 항목별 예상 확보 용량과 함께 보여줘.", "내가 승인하는 항목만 정리해줘."],
      }
    ),

    ...promptSample(
      "5.1.3 메모리/CPU 사용률 분석",
      "현재 메모리와 CPU 사용률을 상세 분석해줘. 메모리를 많이 사용하는 프로세스 Top 10과 CPU를 많이 사용하는 프로세스 Top 10을 보여주고, 이상 여부를 판단해줘.",
      "비대화형: claude -p \"메모리와 CPU 사용률을 상세 분석해줘...\"",
      [
        "[root@rhel-server ~]# claude -p \"메모리와 CPU 상세 분석\"",
        "",
        "## 리소스 분석 결과",
        "",
        "### 메모리 Top 5 프로세스",
        "| PID | 프로세스 | RSS(MB) | %MEM |",
        "| 1234 | mysqld | 1,024 | 12.5% |",
        "| 2345 | httpd(worker) | 512 | 6.3% |",
        "| 3456 | java | 486 | 5.9% |",
        "",
        "### CPU Top 5 프로세스",
        "| PID | 프로세스 | %CPU | 상태 |",
        "| 5678 | httpd | 15.2% | 정상 (요청 처리 중) |",
        "| 1234 | mysqld | 8.7% | 정상 |",
        "",
        "### 판단: 전체적으로 정상 범위. 특이사항 없음.",
      ],
      "개별 프로세스가 단일 코어의 80% 이상을 지속 점유하거나, 메모리 단일 프로세스가 전체의 50% 이상이면 이상입니다.",
      "이상 프로세스 발견 시 'strace -p PID' 또는 'perf top'으로 상세 분석하세요.",
      {
        description: "Claude에게 이상 프로세스를 심층 분석하도록 요청하면, strace/lsof 결과를 해석하고 원인을 진단해줍니다.",
        prompt: ["PID 1234 프로세스가 CPU를 과다 사용 중이야.", "이 프로세스의 strace, lsof, /proc 정보를 분석해서", "원인을 진단하고 안전한 대응 방안을 제시해줘."],
      }
    ),

    ...promptSample(
      "5.1.4 좀비/이상 프로세스 탐지",
      "좀비 프로세스와 비정상 상태의 프로세스를 찾아줘. 부모 프로세스 정보와 함께 정리 방법도 알려줘.",
      "비대화형: claude -p \"좀비 프로세스와 비정상 프로세스를 찾아줘...\"",
      [
        "[root@rhel-server ~]# claude -p \"좀비 프로세스 탐지\"",
        "",
        "## 프로세스 상태 점검",
        "",
        "### 좀비 프로세스: 0개 발견",
        "현재 좀비(Z) 상태 프로세스가 없습니다.",
        "",
        "### D(Uninterruptible Sleep) 상태: 0개",
        "디스크 I/O 대기 프로세스가 없습니다.",
        "",
        "### 결과: 정상 - 이상 프로세스 없음",
      ],
      "좀비(Z) 프로세스가 다수 존재하면 부모 프로세스에 문제가 있습니다. D 상태가 지속되면 I/O 장애를 의심하세요.",
      "좀비 프로세스 정리: 부모 프로세스를 재시작하거나 'kill -SIGCHLD <부모PID>'를 시도하세요.",
      {
        description: "Claude에게 좀비 프로세스의 부모를 추적하고, 안전한 정리 절차를 자동으로 수행하도록 요청할 수 있습니다.",
        prompt: ["좀비 프로세스가 발견됐어. 부모 프로세스를 추적하고,", "부모 프로세스의 상태와 로그를 분석해서", "안전하게 정리하는 방법을 실행해줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 5.2 로그 분석 ---
    heading2("5.2 로그 분석"),

    ...promptSample(
      "5.2.1 시스템 로그 분석 (최근 24시간)",
      "/var/log/messages에서 최근 24시간 동안의 로그를 분석해줘. 에러와 경고를 분류하고, 발생 빈도별로 정리하고, 심각도를 평가해줘.",
      "비대화형: claude -p \"/var/log/messages 최근 24시간 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"/var/log/messages 최근 24시간 분석\"",
        "",
        "## /var/log/messages 분석 (최근 24시간)",
        "",
        "### 총 로그 건수: 2,847건",
        "",
        "### 에러 요약 (심각도순)",
        "| 심각도 | 서비스 | 메시지 패턴 | 건수 |",
        "| CRITICAL | kernel | Out of memory | 0 |",
        "| ERROR | httpd | Connection refused | 12 |",
        "| WARNING | systemd | Service restart | 3 |",
        "| WARNING | chronyd | Source unreachable | 7 |",
        "",
        "### 주요 발견사항",
        "1. httpd Connection refused 12건 - 03:00~03:15 집중 발생",
        "   -> 새벽 배치 작업과 관련된 것으로 추정",
        "2. chronyd 시간 소스 접근 불가 7건 - NTP 서버 점검 필요",
        "",
        "### 종합 평가: [주의] NTP 설정 확인 권장",
      ],
      "CRITICAL 에러가 1건 이상이면 즉시 대응, ERROR는 패턴을 확인, WARNING은 추세를 관찰합니다.",
      "NTP 서버 설정을 확인하고 'chronyc sources'로 시간 동기화 상태를 점검하세요.",
      {
        description: "Claude에게 에러 패턴의 근본 원인을 추적하고, chrony 설정을 자동으로 점검·수정하도록 요청할 수 있습니다.",
        prompt: ["위 로그 분석에서 발견된 에러들의 근본 원인을 추적해줘.", "특히 NTP 동기화 문제는 /etc/chrony.conf를 확인하고", "필요한 설정 변경안을 제시해줘."],
      }
    ),

    ...promptSample(
      "5.2.2 보안 로그 분석 (로그인 시도)",
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
        "| IP | 실패 건수 | 국가 | 판단 |",
        "| 203.0.113.45 | 187 | CN | [차단 권고] Brute force |",
        "| 198.51.100.22 | 98 | RU | [차단 권고] Brute force |",
        "| 192.168.1.50 | 57 | 내부 | [확인 필요] 내부 사용자 |",
        "",
        "### 권고사항",
        "1. 203.0.113.45, 198.51.100.22 IP 즉시 차단",
        "2. fail2ban 설치 및 활성화 권장",
        "3. SSH 포트 변경 또는 Key 인증 전환 검토",
      ],
      "단일 IP에서 10회 이상 실패하면 의심, 50회 이상이면 무차별 대입 공격으로 판단합니다.",
      "'firewall-cmd --permanent --add-rich-rule=\"rule family=ipv4 source address=203.0.113.45 reject\"'로 IP를 차단하세요.",
      {
        description: "Claude에게 공격 IP를 자동 차단하는 방화벽 명령어 생성과 fail2ban 설치·설정을 한번에 요청할 수 있습니다.",
        prompt: ["위 분석에서 차단 권고된 IP들을 firewalld로 즉시 차단해줘.", "그리고 fail2ban을 설치하고 SSH brute force 방어 설정을 해줘.", "sshd jail 설정에서 maxretry=3, bantime=3600으로 해줘."],
        terminal: [
          "[root@rhel-server ~]# claude",
          "",
          "You > 차단 권고 IP를 firewalld로 차단하고 fail2ban 설정해줘",
          "",
          "Claude > 차단 작업을 진행합니다.",
          "",
          "  1. IP 차단 완료:",
          "     - 203.0.113.45 -> reject (firewalld)",
          "     - 198.51.100.22 -> reject (firewalld)",
          "     - firewall-cmd --reload 완료",
          "",
          "  2. fail2ban 설치 및 설정:",
          "     - dnf install -y fail2ban -> 완료",
          "     - /etc/fail2ban/jail.local 생성:",
          "       [sshd]",
          "       enabled = true",
          "       maxretry = 3",
          "       bantime = 3600",
          "     - systemctl enable --now fail2ban -> 완료",
        ],
      }
    ),

    ...promptSample(
      "5.2.3 서비스 오류 분석 (journalctl)",
      "journalctl로 최근 24시간 동안 실패(failed)한 서비스와 에러 로그를 분석해줘. 서비스별로 분류하고 해결 방안을 제시해줘.",
      "비대화형: claude -p \"journalctl 최근 24시간 실패 서비스 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"journalctl 서비스 오류 분석\"",
        "",
        "## 서비스 오류 분석",
        "",
        "### 실패 서비스 목록",
        "| 서비스 | 상태 | 실패 시간 | 원인 |",
        "| postfix.service | failed | 03:12:45 | 소켓 바인딩 실패 |",
        "",
        "### 에러 로그 상세",
        "postfix: fatal: bind port 25: Address already in use",
        "-> 다른 프로세스가 25번 포트를 점유 중",
        "",
        "### 해결 방안",
        "1. ss -tlnp | grep :25 로 포트 점유 프로세스 확인",
        "2. 충돌 프로세스 종료 후 systemctl restart postfix",
      ],
      "failed 상태의 서비스가 있으면 즉시 원인을 파악해야 합니다.",
      "서비스 재시작: systemctl restart <서비스명>, 부팅 시 자동 시작 확인: systemctl is-enabled <서비스명>",
      {
        description: "Claude에게 실패 서비스의 로그와 설정 파일을 동시에 분석하여 근본 원인을 찾고, 복구까지 수행하도록 요청할 수 있습니다.",
        prompt: ["실패한 서비스들의 journalctl 로그와 설정 파일을 분석해서", "각 서비스별 실패 원인과 복구 절차를 알려줘.", "가능한 것은 직접 복구를 시도해줘."],
      }
    ),

    ...promptSample(
      "5.2.4 특정 기간 로그 필터링",
      "2026년 3월 19일 오전 2시부터 오전 6시 사이의 시스템 로그를 분석해줘. 이 시간대에 발생한 모든 에러와 경고를 시간순으로 정리해줘.",
      "비대화형: claude -p \"2026-03-19 02:00 ~ 06:00 시스템 로그 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"3월 19일 02시~06시 로그 분석\"",
        "",
        "## 기간 지정 로그 분석 (2026-03-19 02:00~06:00)",
        "",
        "### 타임라인",
        "02:15 - WARNING: disk /var usage 85%",
        "02:30 - ERROR: httpd max clients reached",
        "02:31 - ERROR: httpd connection timeout (x15)",
        "03:00 - INFO: cron backup job started",
        "03:45 - INFO: cron backup job completed",
        "04:00 - WARNING: high load average 7.2",
        "04:15 - INFO: load average normalized to 1.5",
        "",
        "### 분석",
        "02:30 ~ 04:15 사이 httpd 과부하 발생.",
        "원인: 새벽 배치 작업과 백업이 동시 실행되어 리소스 경합",
      ],
      "시간별 이벤트를 타임라인으로 보면 인과관계를 파악할 수 있습니다.",
      "백업과 배치 작업의 실행 시간을 조정하여 리소스 경합을 방지하세요.",
      {
        description: "Claude에게 crontab을 분석하여 작업 간 시간 충돌을 찾고, 최적의 스케줄 재배치 방안을 제시하도록 요청할 수 있습니다.",
        prompt: ["현재 crontab에 등록된 모든 작업을 분석해서", "시간대별 리소스 경합이 발생하는 구간을 찾아줘.", "최적의 스케줄 재배치 방안을 제시해줘."],
      }
    ),

    ...promptSample(
      "5.2.5 웹서버 로그 분석",
      "httpd(또는 nginx) 액세스 로그와 에러 로그를 분석해줘. 상위 요청 URL, HTTP 상태 코드 분포, 에러 패턴, 의심스러운 접근을 찾아줘.",
      "비대화형: claude -p \"httpd 액세스/에러 로그 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"httpd 로그 분석\"",
        "",
        "## 웹서버 로그 분석",
        "",
        "### HTTP 상태 코드 분포 (최근 24시간)",
        "| 코드 | 건수 | 비율 |",
        "| 200 OK | 45,230 | 89.2% |",
        "| 301 Redirect | 2,100 | 4.1% |",
        "| 404 Not Found | 1,850 | 3.6% |",
        "| 500 Server Error | 156 | 0.3% |",
        "",
        "### 의심스러운 접근 패턴",
        "1. /wp-admin/ 접근 시도 230건 (WordPress 미사용 서버)",
        "2. /phpmyadmin/ 스캔 시도 87건",
        "3. SQL Injection 시도 패턴 12건",
        "",
        "### 권고: WAF 또는 ModSecurity 도입 검토",
      ],
      "404가 전체의 5% 이상이면 broken link 점검, 500 에러가 1% 이상이면 즉시 원인 분석이 필요합니다.",
      "의심 IP를 firewalld로 차단하고, ModSecurity 등 WAF 도입을 검토하세요.",
      {
        description: "Claude에게 의심 IP를 자동 차단하고, ModSecurity 설치 및 기본 룰셋 설정까지 한번에 요청할 수 있습니다.",
        prompt: ["위 분석에서 발견된 스캔/공격 IP들을 firewalld로 차단해줘.", "그리고 mod_security 설치와 OWASP CRS 기본 룰셋 적용 방법을 알려줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 5.3 보안 취약점 분석 ---
    heading2("5.3 보안 취약점 분석"),

    ...promptSample(
      "5.3.1 열린 포트 및 서비스 점검",
      "현재 열린 포트와 리스닝 중인 서비스를 모두 점검해줘. 각 포트별로 서비스명, PID, 외부 노출 여부를 확인하고, 불필요하게 열린 포트를 알려줘.",
      "비대화형: claude -p \"열린 포트와 리스닝 서비스 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"열린 포트 점검\"",
        "",
        "## 포트/서비스 점검 결과",
        "",
        "| 포트 | 프로토콜 | 서비스 | PID | 바인딩 | 평가 |",
        "| 22 | TCP | sshd | 1024 | 0.0.0.0 | 정상 (필수) |",
        "| 80 | TCP | httpd | 2048 | 0.0.0.0 | 정상 |",
        "| 443 | TCP | httpd | 2048 | 0.0.0.0 | 정상 |",
        "| 3306 | TCP | mysqld | 3072 | 0.0.0.0 | [위험] 외부 노출 |",
        "| 8080 | TCP | java | 4096 | 0.0.0.0 | [주의] 확인 필요 |",
        "",
        "### 권고사항",
        "1. MySQL(3306) 외부 노출 위험 - 127.0.0.1로 바인딩 변경 권고",
        "2. 8080 포트 용도 확인 필요",
      ],
      "0.0.0.0으로 바인딩된 서비스는 외부에서 접근 가능합니다. DB 서비스는 반드시 127.0.0.1로 제한하세요.",
      "MySQL: /etc/my.cnf에서 bind-address=127.0.0.1 설정 후 systemctl restart mysqld",
      {
        description: "Claude에게 위험 포트의 설정 파일을 직접 수정하고, 서비스 재시작까지 안전하게 수행하도록 요청할 수 있습니다.",
        prompt: ["MySQL이 0.0.0.0으로 바인딩되어 외부 노출 중이야.", "/etc/my.cnf에서 bind-address를 127.0.0.1로 변경하고", "mysqld를 안전하게 재시작해줘. 변경 전 백업도 해줘."],
      }
    ),

    ...promptSample(
      "5.3.2 SSH 보안 감사",
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
        "| Protocol | 2 | 2 | 정상 |",
        "| X11Forwarding | yes | no | [주의] |",
        "| AllowUsers | 미설정 | 설정 권장 | [주의] |",
        "| LoginGraceTime | 120 | 60 | [참고] |",
        "",
        "### 점수: 4/10 (개선 필요)",
      ],
      "PermitRootLogin yes는 가장 위험한 설정입니다. 반드시 비활성화하고 일반 계정 + sudo를 사용하세요.",
      "sshd_config 수정 후 'sshd -t'로 문법 검증, 'systemctl restart sshd'로 적용하세요.",
      {
        description: "Claude에게 SSH 보안 설정을 CIS Benchmark 기준으로 자동 수정하도록 요청할 수 있습니다. 변경 전 백업과 문법 검증을 포함합니다.",
        prompt: ["위 SSH 감사 결과에서 [위험]과 [주의] 항목을 모두 수정해줘.", "/etc/ssh/sshd_config를 CIS Benchmark 권장값으로 변경하되,", "변경 전 백업을 만들고, sshd -t로 검증 후 적용해줘."],
        terminal: [
          "[root@rhel-server ~]# claude",
          "",
          "You > SSH 보안 설정을 CIS Benchmark 기준으로 강화해줘",
          "",
          "Claude > SSH 설정을 강화하겠습니다.",
          "",
          "  1. 백업 생성: /etc/ssh/sshd_config.bak.20260320",
          "  2. 변경 적용:",
          "     PermitRootLogin yes -> no",
          "     MaxAuthTries 6 -> 3",
          "     X11Forwarding yes -> no",
          "     + AllowUsers admin operator",
          "  3. 문법 검증: sshd -t -> OK",
          "  4. 서비스 재시작: systemctl restart sshd -> 완료",
          "",
          "  [주의] 현재 SSH 세션은 유지됩니다.",
          "  새 터미널에서 일반 계정으로 접속 테스트를 권장합니다.",
        ],
      }
    ),

    ...promptSample(
      "5.3.3 파일 권한 이상 탐지",
      "SUID/SGID 비트가 설정된 파일과 world-writable 파일을 모두 찾아줘. 정상적인 시스템 파일을 제외하고 비정상적인 파일만 목록으로 보여줘.",
      "비대화형: claude -p \"SUID/SGID, world-writable 파일 탐지...\"",
      [
        "[root@rhel-server ~]# claude -p \"파일 권한 이상 탐지\"",
        "",
        "## 파일 권한 점검 결과",
        "",
        "### SUID 파일 (비정상 의심)",
        "| 경로 | 소유자 | 권한 | 평가 |",
        "| /tmp/.hidden/escalate | root | -rwsr-xr-x | [위험] 의심 파일 |",
        "",
        "### World-Writable 디렉토리 (sticky bit 없음)",
        "| 경로 | 권한 | 평가 |",
        "| /opt/shared/data | drwxrwxrwx | [주의] sticky bit 없음 |",
        "",
        "### 정상 SUID 파일: 15개 (시스템 기본 - 목록 생략)",
      ],
      "/tmp 하위의 SUID 파일은 높은 확률로 침해 흔적입니다. 즉시 조사가 필요합니다.",
      "의심 파일: 'file /tmp/.hidden/escalate'로 파일 유형 확인, 'ls -la'로 생성 시간 확인 후 격리 또는 삭제하세요.",
      {
        description: "Claude에게 의심 파일을 심층 분석(file, strings, md5sum)하고, 침해 지표(IOC)를 조사하여 보안 사고 여부를 판단하도록 요청할 수 있습니다.",
        prompt: ["/tmp/.hidden/escalate 파일이 의심스러워.", "file, strings, md5sum, ls -la로 상세 분석하고,", "침해 흔적인지 판단해줘. 격리가 필요하면 /quarantine/으로 이동해줘."],
      }
    ),

    ...promptSample(
      "5.3.4 사용자 계정 보안 점검",
      "서버의 사용자 계정을 보안 관점에서 점검해줘. UID 0 계정, 비밀번호 없는 계정, 90일 이상 미사용 계정, 비밀번호 만료 정책을 확인해줘.",
      "비대화형: claude -p \"사용자 계정 보안 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"사용자 계정 보안 점검\"",
        "",
        "## 계정 보안 점검 결과",
        "",
        "### UID 0 계정",
        "- root (정상)",
        "- 다른 UID 0 계정: 없음 (정상)",
        "",
        "### 비밀번호 없는 계정: 0개 (정상)",
        "",
        "### 90일 이상 미접속 계정",
        "| 계정 | 마지막 로그인 | 경과일 | 권고 |",
        "| testuser | 2025-11-05 | 135일 | [주의] 비활성화 권고 |",
        "| deploy_old | 2025-08-20 | 212일 | [주의] 삭제 검토 |",
        "",
        "### 비밀번호 정책",
        "- 최소 길이: 8자 (권장: 12자 이상)",
        "- 만료 기간: 99999일 (미설정) [주의]",
        "- 권장: /etc/login.defs에서 PASS_MAX_DAYS=90 설정",
      ],
      "UID 0이 root 외에 존재하면 즉시 조사, 미사용 계정은 비활성화(usermod -L)가 필요합니다.",
      "'usermod -L testuser'로 계정 잠금, '/etc/login.defs' 수정으로 비밀번호 정책을 강화하세요.",
      {
        description: "Claude에게 미사용 계정 잠금, 비밀번호 정책 강화를 일괄 적용하도록 요청할 수 있습니다.",
        prompt: ["위 점검에서 발견된 미사용 계정들을 잠금 처리해줘.", "그리고 /etc/login.defs에서 PASS_MAX_DAYS=90, PASS_MIN_LEN=12로 변경해줘.", "변경 내역을 요약해서 보여줘."],
      }
    ),

    ...promptSample(
      "5.3.5 SELinux 점검",
      "SELinux 상태와 최근 정책 위반(AVC denial)을 점검해줘. 위반 건수, 영향받는 서비스, 해결 방법을 알려줘.",
      "비대화형: claude -p \"SELinux 상태 및 위반 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"SELinux 점검\"",
        "",
        "## SELinux 점검 결과",
        "",
        "### 현재 상태",
        "- 모드: Enforcing (정상)",
        "- 정책: targeted",
        "",
        "### 최근 AVC Denial (24시간)",
        "| 시간 | 소스 | 타겟 | 권한 | 횟수 |",
        "| 14:23 | httpd_t | var_log_t | write | 5 |",
        "",
        "### 해결 방법",
        "1. setsebool -P httpd_unified 1",
        "2. 또는 audit2allow -a -M mypolicy && semodule -i mypolicy.pp",
      ],
      "SELinux가 Disabled이면 즉시 Enforcing으로 전환하세요. AVC denial은 서비스 장애 원인이 될 수 있습니다.",
      "'ausearch -m avc -ts recent'으로 상세 확인, 'audit2why'로 원인을 분석하세요.",
      {
        description: "Claude에게 SELinux AVC denial을 분석하여 적절한 정책 모듈을 자동 생성하고 적용하도록 요청할 수 있습니다.",
        prompt: ["SELinux AVC denial을 분석해서 필요한 정책 변경을 해줘.", "audit2allow로 커스텀 모듈을 생성하되,", "보안상 과도한 허용이 없는지 검증하고 적용해줘."],
      }
    ),

    ...promptSample(
      "5.3.6 보안 패치 확인",
      "현재 서버에 적용 가능한 보안 패치 목록을 확인해줘. CRITICAL, IMPORTANT 등급의 패치가 있는지 우선순위별로 정리해줘.",
      "비대화형: claude -p \"보안 패치 현황 확인...\"",
      [
        "[root@rhel-server ~]# claude -p \"보안 패치 확인\"",
        "",
        "## 보안 패치 현황",
        "",
        "### 미적용 보안 업데이트",
        "| 등급 | 패키지 | CVE | 설명 |",
        "| CRITICAL | openssl | CVE-2026-XXXX | 원격 코드 실행 |",
        "| IMPORTANT | kernel | CVE-2026-YYYY | 권한 상승 |",
        "| MODERATE | curl | CVE-2026-ZZZZ | 정보 노출 |",
        "",
        "### 요약: CRITICAL 1건, IMPORTANT 1건 - 즉시 패치 권고",
        "",
        "### 패치 명령어",
        "# dnf update --security  (보안 패치만 적용)",
        "# dnf update openssl kernel  (특정 패키지만 적용)",
      ],
      "CRITICAL은 즉시 패치, IMPORTANT는 1주일 이내, MODERATE는 정기 점검 시 적용합니다.",
      "패치 전 백업 확인, 테스트 서버에서 사전 검증 후 운영 서버에 적용하세요.",
      {
        description: "Claude에게 CRITICAL/IMPORTANT 패치를 우선 적용하고, 패치 후 서비스 정상 동작을 검증하도록 요청할 수 있습니다.",
        prompt: ["CRITICAL과 IMPORTANT 등급 보안 패치를 적용해줘.", "패치 전에 현재 패키지 버전을 기록하고,", "패치 후 주요 서비스(httpd, sshd, mysqld) 정상 동작을 확인해줘."],
      }
    ),

    ...promptSample(
      "5.3.7 방화벽 규칙 검토",
      "firewalld의 현재 규칙을 분석해줘. 활성 zone, 허용된 서비스/포트, rich rule을 정리하고, 불필요하게 열린 항목이 있는지 점검해줘.",
      "비대화형: claude -p \"firewalld 규칙 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"방화벽 규칙 검토\"",
        "",
        "## 방화벽 규칙 분석",
        "",
        "### 활성 Zone: public",
        "",
        "### 허용 서비스/포트",
        "| 서비스/포트 | 용도 | 평가 |",
        "| ssh (22/tcp) | SSH 접속 | 정상 |",
        "| http (80/tcp) | 웹서버 | 정상 |",
        "| https (443/tcp) | 웹서버 SSL | 정상 |",
        "| 3306/tcp | MySQL | [위험] 외부 노출 불필요 |",
        "| 8080/tcp | 관리 포트 | [주의] 확인 필요 |",
        "",
        "### 권고: 3306/tcp 제거, 8080/tcp 용도 확인",
      ],
      "DB 포트(3306, 5432 등)가 외부에 열려있으면 공격 대상이 됩니다.",
      "'firewall-cmd --permanent --remove-port=3306/tcp && firewall-cmd --reload'로 차단하세요.",
      {
        description: "Claude에게 불필요 포트를 자동 차단하고, 방화벽 규칙을 최적화(최소 권한 원칙)하도록 요청할 수 있습니다.",
        prompt: ["위 분석에서 불필요하게 열린 포트들을 firewalld에서 제거해줘.", "그리고 현재 방화벽 규칙을 최소 권한 원칙에 맞게 최적화해줘.", "변경 전/후를 비교해서 보여줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 5.4 서버 설정 최적화 ---
    heading2("5.4 서버 설정 최적화"),

    ...promptSample(
      "5.4.1 커널 파라미터 최적화",
      "현재 서버의 sysctl 커널 파라미터를 분석해줘. 네트워크 성능, 메모리 관리, 보안 관련 파라미터 중 기본값에서 변경이 필요한 항목을 권장 값과 함께 알려줘.",
      "비대화형: claude -p \"sysctl 커널 파라미터 최적화 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"커널 파라미터 최적화\"",
        "",
        "## 커널 파라미터 분석",
        "",
        "### 변경 권장 항목",
        "| 파라미터 | 현재 값 | 권장 값 | 이유 |",
        "| net.core.somaxconn | 128 | 1024 | 웹서버 접속 대기열 |",
        "| vm.swappiness | 30 | 10 | Swap 사용 최소화 |",
        "| net.ipv4.tcp_fin_timeout | 60 | 30 | TIME_WAIT 감소 |",
        "| fs.file-max | 65535 | 262144 | 파일 디스크립터 확장 |",
        "",
        "### 적용 방법",
        "# vi /etc/sysctl.d/99-custom.conf",
        "# sysctl -p /etc/sysctl.d/99-custom.conf",
      ],
      "기본값은 범용적이라 서비스 특성에 맞게 튜닝하면 성능이 개선됩니다.",
      "변경 전 현재 값을 기록해두고, 한 번에 한 항목씩 변경하며 효과를 모니터링하세요.",
      {
        description: "Claude에게 현재 서버 워크로드를 분석하여 맞춤형 sysctl 설정 파일을 생성하고 안전하게 적용하도록 요청할 수 있습니다.",
        prompt: ["현재 서버 워크로드(웹서버, DB 등)를 분석해서", "최적의 sysctl 파라미터를 /etc/sysctl.d/99-optimized.conf에 작성해줘.", "적용 전 현재 값을 백업하고, 적용 후 효과를 비교해줘."],
      }
    ),

    ...promptSample(
      "5.4.2 서비스 상태 종합 점검",
      "systemd에 등록된 모든 서비스의 상태를 점검해줘. failed 서비스, enabled이지만 inactive인 서비스, 불필요한 서비스를 찾아 정리 대상을 알려줘.",
      "비대화형: claude -p \"systemd 서비스 상태 종합 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"서비스 상태 점검\"",
        "",
        "## 서비스 상태 점검",
        "",
        "### Failed 서비스: 1건",
        "- postfix.service: 포트 충돌로 실패",
        "",
        "### Enabled + Inactive (의심)",
        "- bluetooth.service: 서버에서 불필요",
        "- avahi-daemon.service: 서버에서 불필요",
        "",
        "### 비활성화 권고 서비스",
        "bluetooth, avahi-daemon, cups (프린터 미사용 시)",
      ],
      "failed 서비스는 즉시 원인 분석, 불필요 서비스는 비활성화하여 공격 면적을 줄이세요.",
      "'systemctl disable --now bluetooth avahi-daemon'으로 비활성화하세요.",
      {
        description: "Claude에게 서버 용도에 맞지 않는 불필요 서비스를 식별하고 일괄 비활성화하도록 요청할 수 있습니다.",
        prompt: ["이 서버는 웹서버 용도야. 서버 용도에 불필요한 서비스를 모두 찾아서", "비활성화 대상 목록을 보여주고, 내가 승인하면 일괄 비활성화해줘."],
      }
    ),

    ...promptSample(
      "5.4.3 NTP 시간 동기화 점검",
      "Chrony(또는 NTP) 시간 동기화 상태를 점검해줘. 동기화 서버 목록, 오프셋, 상태를 확인하고 이상이 있으면 알려줘.",
      "비대화형: claude -p \"시간 동기화 상태 점검...\"",
      [
        "[root@rhel-server ~]# claude -p \"시간 동기화 점검\"",
        "",
        "## 시간 동기화 점검",
        "",
        "### Chrony 상태: active (running)",
        "",
        "### 소스 서버",
        "| 서버 | 상태 | Stratum | 오프셋 |",
        "| time.google.com | * (활성) | 1 | +0.003s |",
        "| ntp.ubuntu.com | + (후보) | 2 | +0.015s |",
        "",
        "### 시스템 시계 오프셋: +0.003초 (정상)",
        "### 판단: 정상 - 시간 동기화 양호",
      ],
      "오프셋이 1초 이상이면 서비스 장애(인증, 로그 시간 불일치 등)를 유발할 수 있습니다.",
      "동기화 실패 시 'chronyc makestep'으로 강제 동기화, /etc/chrony.conf에서 서버 목록을 확인하세요.",
      {
        description: "Claude에게 시간 동기화 문제를 진단하고, chrony 설정을 최적화하도록 요청할 수 있습니다.",
        prompt: ["시간 동기화에 문제가 있어. /etc/chrony.conf를 분석하고,", "안정적인 NTP 서버 목록으로 변경한 후 동기화를 복구해줘."],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),

    // --- 5.5 장애 대응 ---
    heading2("5.5 장애 대응"),

    ...promptSample(
      "5.5.1 서비스 다운 원인 분석",
      "httpd(Apache) 서비스가 다운되었어. 원인을 분석해줘. 최근 로그, 설정 파일 오류, 리소스 부족 여부를 종합적으로 확인하고 복구 방법을 알려줘.",
      "대화형: claude 진입 후 위 프롬프트 입력 (상호작용하며 분석)",
      [
        "You > httpd 서비스 다운 원인 분석해줘",
        "",
        "Claude > httpd 서비스 상태와 로그를 분석하겠습니다.",
        "",
        "## httpd 장애 분석",
        "",
        "### 서비스 상태",
        "httpd.service - Apache HTTP Server",
        "   Loaded: loaded",
        "   Active: failed (Result: exit-code)",
        "   Since: Thu 2026-03-20 14:23:00 KST",
        "",
        "### 최근 에러 로그",
        "AH00526: Syntax error on line 42 of /etc/httpd/conf.d/ssl.conf:",
        "SSLCertificateFile: file '/etc/pki/tls/certs/server.crt' does not exist",
        "",
        "### 원인: SSL 인증서 파일 누락",
        "### 복구 방법:",
        "1. 인증서 파일 복원 또는 재발급",
        "2. systemctl restart httpd",
      ],
      "에러 메시지의 핵심 키워드(Syntax error, does not exist, Permission denied 등)로 원인을 파악합니다.",
      "설정 파일 수정 후 'httpd -t'로 문법 검증 → 'systemctl restart httpd'로 재시작하세요.",
      {
        description: "Claude 대화형 모드에서 서비스 장애를 단계별로 분석하고, 설정 수정부터 복구까지 직접 수행할 수 있습니다.",
        prompt: ["httpd가 다운됐어. 원인을 분석하고 복구해줘.", "설정 파일 오류가 있으면 수정하되, 변경 전 백업을 만들어줘.", "복구 후 httpd -t 검증과 서비스 재시작까지 해줘."],
        terminal: [
          "[root@rhel-server ~]# claude",
          "",
          "You > httpd 다운됨. 분석하고 복구해줘.",
          "",
          "Claude > httpd 장애를 분석합니다.",
          "",
          "  원인: /etc/httpd/conf.d/ssl.conf:42 - 인증서 파일 누락",
          "  백업: /etc/httpd/conf.d/ssl.conf.bak.20260320 생성",
          "  조치: ssl.conf에서 SSLCertificateFile 경로 수정",
          "  검증: httpd -t -> Syntax OK",
          "  복구: systemctl restart httpd -> 완료",
          "  확인: curl -I https://localhost -> 200 OK",
        ],
      }
    ),

    ...promptSample(
      "5.5.2 디스크 풀(100%) 긴급 대응",
      "디스크가 100%야! 긴급하게 공간을 확보해야 해. 삭제 가능한 파일을 우선순위별로 알려주고, 안전하게 정리하는 방법을 단계별로 안내해줘.",
      "대화형: claude 진입 후 위 프롬프트 입력",
      [
        "You > 디스크 100% 긴급 대응!",
        "",
        "Claude > 즉시 디스크 공간을 확보하겠습니다.",
        "",
        "## 긴급 디스크 확보 (우선순위순)",
        "",
        "### 1순위: 즉시 삭제 가능 (영향 없음)",
        "- /var/cache/dnf/ : 3.2GB -> dnf clean all",
        "- /tmp 내 7일 이전 파일: 800MB",
        "- /var/log/*.gz (압축된 오래된 로그): 2.5GB",
        "",
        "### 2순위: 정리 가능 (확인 후)",
        "- /var/log/journal/: 4.5GB -> vacuum 적용",
        "- 삭제되었으나 프로세스가 잡고 있는 파일: 1.2GB",
        "",
        "### 즉시 실행 명령어",
        "# dnf clean all",
        "# journalctl --vacuum-size=500M",
        "# find /tmp -type f -mtime +7 -delete",
        "",
        "### 예상 확보 용량: 약 12.2GB",
      ],
      "1순위(캐시, 임시파일)부터 정리하고, 2순위는 영향도를 확인 후 진행합니다.",
      "정리 후 'df -h'로 확인, 재발 방지를 위해 logrotate 및 자동 정리 cron을 설정하세요.",
      {
        description: "Claude 대화형 모드에서 단계별 확인을 받으며 안전하게 디스크 공간을 확보하고, 재발 방지 스크립트까지 생성할 수 있습니다.",
        prompt: ["디스크가 100%야! 안전한 항목부터 정리해줘.", "각 항목마다 삭제 전에 확인을 받아줘.", "정리 후 재발 방지를 위한 자동 정리 cron 스크립트도 만들어줘."],
      }
    ),

    ...promptSample(
      "5.5.3 높은 Load Average 분석",
      "서버 Load Average가 매우 높아 (15.0 이상). 원인을 분석해줘. CPU bound인지 I/O bound인지 구분하고, 원인 프로세스를 찾아줘.",
      "대화형: claude 진입 후 위 프롬프트 입력",
      [
        "You > Load Average 15.0 이상, 원인 분석해줘",
        "",
        "Claude > 높은 부하의 원인을 분석하겠습니다.",
        "",
        "## 부하 분석",
        "",
        "### 현재 상태",
        "Load Average: 15.23, 12.45, 8.67 (4 cores)",
        "-> CPU 코어 대비 3.8배 (매우 높음)",
        "",
        "### 부하 유형: I/O Bound",
        "- CPU 사용률: 35% (높지 않음)",
        "- I/O Wait: 62% [원인]",
        "- D 상태 프로세스: 8개",
        "",
        "### 원인 프로세스",
        "| PID | 프로세스 | 상태 | I/O 읽기 | I/O 쓰기 |",
        "| 5678 | rsync | D | 0 | 150MB/s |",
        "| 1234 | mysqld | D | 80MB/s | 40MB/s |",
        "",
        "### 분석: rsync 백업이 디스크 I/O를 과점유",
        "### 대응: ionice -c3 -p 5678 (I/O 우선순위 낮춤)",
      ],
      "Load Average > 코어 수 * 2 이면 과부하입니다. I/O Wait가 높으면 디스크 병목입니다.",
      "'ionice'로 I/O 우선순위 조정, 백업 시간대를 비피크 시간으로 변경하세요.",
      {
        description: "Claude에게 실시간으로 부하 원인을 추적하고, 즉각 대응(I/O 우선순위 조정, 프로세스 제어)을 수행하도록 요청할 수 있습니다.",
        prompt: ["Load Average가 15 이상이야. 원인 프로세스를 찾고,", "I/O bound인지 CPU bound인지 구분해줘.", "원인 프로세스의 I/O 우선순위를 낮추고, 근본 해결책을 제시해줘."],
      }
    ),

    ...promptSample(
      "5.5.4 OOM Killer 분석",
      "OOM Killer가 발동했어. 어떤 프로세스가 kill되었는지, 왜 메모리가 부족했는지 분석해줘. 재발 방지 방법도 알려줘.",
      "비대화형: claude -p \"OOM Killer 분석...\"",
      [
        "[root@rhel-server ~]# claude -p \"OOM Killer 발동 분석\"",
        "",
        "## OOM Killer 분석",
        "",
        "### Kill된 프로세스",
        "| 시간 | PID | 프로세스 | RSS(MB) | OOM Score |",
        "| 03:45:12 | 3456 | java | 3,840 | 850 |",
        "",
        "### 메모리 상황 (발동 시점)",
        "- 전체 RAM: 8GB",
        "- 사용: 7.8GB (97.5%)",
        "- Swap: 2GB/2GB (100%)",
        "- 가용: 12MB",
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
      {
        description: "Claude에게 OOM 재발 방지를 위한 systemd 메모리 제한 설정과 커널 파라미터 조정을 자동 수행하도록 요청할 수 있습니다.",
        prompt: ["OOM Killer가 발동했어. 원인 프로세스를 분석하고,", "해당 서비스의 systemd unit에 MemoryMax를 설정해줘.", "그리고 vm.overcommit 설정도 최적화해줘.", "재발 방지를 위한 모니터링 스크립트도 만들어줘."],
        terminal: [
          "[root@rhel-server ~]# claude",
          "",
          "You > OOM Killer 분석하고 재발 방지 설정해줘",
          "",
          "Claude > OOM 이벤트를 분석합니다.",
          "",
          "  원인: java (PID 3456) - 힙 메모리 무제한 (-Xmx 미설정)",
          "",
          "  조치 1: systemd 메모리 제한",
          "    mkdir -p /etc/systemd/system/java-app.service.d/",
          "    echo '[Service]' > override.conf",
          "    echo 'MemoryMax=5G' >> override.conf",
          "    systemctl daemon-reload -> 완료",
          "",
          "  조치 2: 커널 파라미터",
          "    vm.overcommit_memory = 2 (엄격 모드)",
          "    vm.overcommit_ratio = 80",
          "    /etc/sysctl.d/99-oom-prevent.conf 생성 -> 완료",
          "",
          "  조치 3: 모니터링 스크립트",
          "    /opt/claude-scripts/mem-monitor.sh 생성 -> 완료",
          "    메모리 85% 초과 시 알림 발송 설정",
        ],
      }
    ),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 6장. 자동화 스케줄링
// ============================================================
function chapter5() {
  return [
    heading1("6장. 자동화 스케줄링"),

    heading2("6.1 비대화형 실행 기본"),
    para("claude -p 옵션을 사용하면 프롬프트를 인자로 전달하여 비대화형으로 실행할 수 있습니다. 이 방식은 cron이나 스크립트에서 자동 실행할 때 필수입니다."),
    emptyPara(),
    heading3("기본 사용법"),
    ...terminalBlock([
      "# 기본 실행",
      "[root@rhel-server ~]# claude -p \"서버 상태를 점검해줘\"",
      "",
      "# 결과를 파일로 저장",
      "[root@rhel-server ~]# claude -p \"서버 상태를 점검해줘\" > /var/log/claude/check.log 2>&1",
      "",
      "# JSON 형식 출력",
      "[root@rhel-server ~]# claude -p \"서버 상태\" --output-format json > result.json",
    ]),
    warningBox("자동화에서 --dangerously-skip-permissions를 사용할 때는 프롬프트를 신뢰할 수 있는 내용으로 고정하세요."),
    emptyPara(),

    heading2("6.2 스케줄 추천 및 적용"),
    para("서버 점검 항목을 주기별로 분류하고, 각각에 대한 cron 설정과 실행 스크립트를 제공합니다."),
    emptyPara(),

    heading3("스케줄 추천 총괄표"),
    makeTable(
      ["주기", "점검 항목", "중요도", "스크립트"],
      [
        ["매시간", "디스크 사용률 체크", "높음", "hourly-check.sh"],
        ["매시간", "서비스 상태 체크", "높음", "hourly-check.sh"],
        ["매시간", "최근 1시간 에러 로그 건수", "높음", "hourly-check.sh"],
        ["매일 06:00", "보안 로그 분석", "높음", "daily-security.sh"],
        ["매일 07:00", "시스템 리소스 트렌드", "높음", "daily-resource.sh"],
        ["매일 22:00", "백업 상태 확인", "높음", "daily-backup-check.sh"],
        ["매주 월 09:00", "보안 취약점 종합 점검", "중간", "weekly-audit.sh"],
        ["매주 월 09:30", "패치 현황 확인", "중간", "weekly-audit.sh"],
        ["매주 금 17:00", "사용자 계정 감사", "중간", "weekly-audit.sh"],
        ["매월 1일 10:00", "서버 설정 종합 리뷰", "낮음", "monthly-review.sh"],
        ["매월 1일 11:00", "성능 최적화 분석", "낮음", "monthly-review.sh"],
      ],
      [2200, 3000, 1200, 2626]
    ),
    emptyPara(),

    heading3("6.2.1 매시간 점검 스크립트"),
    para("파일: /opt/claude-scripts/hourly-check.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 매시간 서버 점검 스크립트",
      "# 위치: /opt/claude-scripts/hourly-check.sh",
      "",
      "source /opt/claude-scripts/lib/common.sh",
      "source /opt/claude-scripts/conf/config.env",
      "",
      'LOG_DIR="/var/log/claude/hourly"',
      'LOG_FILE="${LOG_DIR}/$(date +%Y%m%d_%H%M).log"',
      "mkdir -p ${LOG_DIR}",
      "",
      "# 디스크 사용률 체크",
      'DISK_USAGE=$(df / --output=pcent | tail -1 | tr -d " %")',
      "if [ ${DISK_USAGE} -ge 80 ]; then",
      '  RESULT=$(claude -p "디스크 사용량이 ${DISK_USAGE}%입니다. 긴급 분석하고 정리 방안을 알려줘." --dangerously-skip-permissions 2>&1)',
      '  echo "[$(date)] [CRITICAL] 디스크 ${DISK_USAGE}%" >> ${LOG_FILE}',
      '  echo "${RESULT}" >> ${LOG_FILE}',
      '  source /opt/claude-scripts/lib/send_alert.sh',
      '  send_alert "CRITICAL" "디스크 사용률 ${DISK_USAGE}%" "${RESULT}"',
      "fi",
      "",
      "# 서비스 상태 체크",
      'FAILED=$(systemctl --failed --no-legend | wc -l)',
      "if [ ${FAILED} -gt 0 ]; then",
      '  RESULT=$(claude -p "실패한 서비스가 ${FAILED}개 있습니다. 원인을 분석해줘." --dangerously-skip-permissions 2>&1)',
      '  echo "[$(date)] [WARNING] 실패 서비스 ${FAILED}개" >> ${LOG_FILE}',
      '  echo "${RESULT}" >> ${LOG_FILE}',
      '  send_alert "WARNING" "실패 서비스 ${FAILED}개" "${RESULT}"',
      "fi",
      "",
      "# 에러 로그 건수",
      'ERROR_COUNT=$(journalctl --since "1 hour ago" -p err --no-pager | wc -l)',
      "if [ ${ERROR_COUNT} -gt 10 ]; then",
      '  RESULT=$(claude -p "최근 1시간 에러 ${ERROR_COUNT}건 발생. 주요 에러를 분석해줘." --dangerously-skip-permissions 2>&1)',
      '  echo "[$(date)] [WARNING] 에러 ${ERROR_COUNT}건" >> ${LOG_FILE}',
      '  echo "${RESULT}" >> ${LOG_FILE}',
      '  send_alert "WARNING" "에러 ${ERROR_COUNT}건/시간" "${RESULT}"',
      "fi",
      "",
      'echo "[$(date)] 매시간 점검 완료" >> ${LOG_FILE}',
    ]),
    emptyPara(),

    heading3("6.2.2 매일 보안 점검 스크립트"),
    para("파일: /opt/claude-scripts/daily-security.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 일일 보안 점검 스크립트",
      "# 위치: /opt/claude-scripts/daily-security.sh",
      "",
      "source /opt/claude-scripts/lib/common.sh",
      "source /opt/claude-scripts/conf/config.env",
      "",
      'LOG_DIR="/var/log/claude/daily"',
      'LOG_FILE="${LOG_DIR}/security_$(date +%Y%m%d).log"',
      "mkdir -p ${LOG_DIR}",
      "",
      'echo "====== 일일 보안 점검 시작: $(date) ======" > ${LOG_FILE}',
      "",
      "# 로그인 시도 분석",
      "claude -p \"/var/log/secure를 분석해줘. 실패한 로그인 시도를 IP별로 정리하고 brute force 의심 패턴을 찾아줘. 차단 권고 IP를 알려줘.\" --dangerously-skip-permissions >> ${LOG_FILE} 2>&1",
      "",
      'echo "" >> ${LOG_FILE}',
      'echo "---" >> ${LOG_FILE}',
      "",
      "# SUID/SGID 변경 감지",
      "claude -p \"어제 이후 새로 생성되거나 변경된 SUID/SGID 파일이 있는지 확인해줘.\" --dangerously-skip-permissions >> ${LOG_FILE} 2>&1",
      "",
      'echo "====== 일일 보안 점검 완료: $(date) ======" >> ${LOG_FILE}',
      "",
      "# 결과 요약 알림 전송",
      "source /opt/claude-scripts/lib/send_alert.sh",
      'SUMMARY=$(head -50 ${LOG_FILE})',
      'send_alert "INFO" "일일 보안 점검 완료" "${SUMMARY}"',
    ]),
    emptyPara(),

    heading3("6.2.3 매주 종합 감사 스크립트"),
    para("파일: /opt/claude-scripts/weekly-audit.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 주간 종합 감사 스크립트",
      "# 위치: /opt/claude-scripts/weekly-audit.sh",
      "",
      "source /opt/claude-scripts/lib/common.sh",
      "source /opt/claude-scripts/conf/config.env",
      "",
      'LOG_DIR="/var/log/claude/weekly"',
      'LOG_FILE="${LOG_DIR}/audit_$(date +%Y%m%d).log"',
      "mkdir -p ${LOG_DIR}",
      "",
      'echo "====== 주간 보안 감사: $(date) ======" > ${LOG_FILE}',
      "",
      "# 보안 취약점 종합 점검",
      "claude -p \"서버 보안 종합 점검을 실시해줘. 열린 포트, SSH 설정, 파일 권한 이상, SELinux 상태, 방화벽 규칙을 분석하고 위험도별로 정리해줘.\" --dangerously-skip-permissions >> ${LOG_FILE} 2>&1",
      "",
      "# 패치 현황",
      "claude -p \"미적용 보안 패치를 확인하고 CRITICAL/IMPORTANT 등급만 목록으로 보여줘.\" --dangerously-skip-permissions >> ${LOG_FILE} 2>&1",
      "",
      "# 계정 감사",
      "claude -p \"사용자 계정 보안 점검을 해줘. 미사용 계정, 비밀번호 정책 미준수 계정을 찾아줘.\" --dangerously-skip-permissions >> ${LOG_FILE} 2>&1",
      "",
      'echo "====== 주간 감사 완료: $(date) ======" >> ${LOG_FILE}',
      "",
      "source /opt/claude-scripts/lib/send_alert.sh",
      'SUMMARY=$(head -80 ${LOG_FILE})',
      'send_alert "INFO" "주간 보안 감사 완료" "${SUMMARY}"',
    ]),
    emptyPara(),

    heading3("6.2.4 crontab 등록"),
    para("위 스크립트들을 cron에 등록합니다."),
    ...terminalBlock([
      "[root@rhel-server ~]# crontab -e",
      "",
      "# Claude Code 자동 점검 스케줄",
      "# 매시간 정각 - 헬스체크",
      "0 * * * * /opt/claude-scripts/hourly-check.sh",
      "",
      "# 매일 06:00 - 보안 점검",
      "0 6 * * * /opt/claude-scripts/daily-security.sh",
      "",
      "# 매일 07:00 - 리소스 트렌드",
      "0 7 * * * /opt/claude-scripts/daily-resource.sh",
      "",
      "# 매주 월요일 09:00 - 종합 감사",
      "0 9 * * 1 /opt/claude-scripts/weekly-audit.sh",
      "",
      "# 매월 1일 10:00 - 월간 리뷰",
      "0 10 1 * * /opt/claude-scripts/monthly-review.sh",
    ]),
    emptyPara(),

    heading2("6.3 스크립트 통합 관리"),
    heading3("디렉토리 구조"),
    ...codeBlock([
      "/opt/claude-scripts/",
      "\u251C\u2500\u2500 hourly-check.sh        # 매시간 헬스체크",
      "\u251C\u2500\u2500 daily-security.sh      # 일일 보안 점검",
      "\u251C\u2500\u2500 daily-resource.sh      # 일일 리소스 트렌드",
      "\u251C\u2500\u2500 daily-backup-check.sh  # 일일 백업 확인",
      "\u251C\u2500\u2500 weekly-audit.sh        # 주간 종합 감사",
      "\u251C\u2500\u2500 monthly-review.sh      # 월간 종합 리뷰",
      "\u251C\u2500\u2500 lib/",
      "\u2502   \u251C\u2500\u2500 common.sh            # 공통 변수/함수",
      "\u2502   \u2514\u2500\u2500 send_alert.sh        # 알림 전송 공통 함수",
      "\u251C\u2500\u2500 conf/",
      "\u2502   \u2514\u2500\u2500 config.env           # 설정 파일 (API Key, 알림 설정)",
      "\u2514\u2500\u2500 logs/                        # 실행 로그 심볼릭 링크",
    ]),
    emptyPara(),

    heading3("logrotate 설정"),
    para("파일: /etc/logrotate.d/claude-scripts"),
    ...codeBlock([
      "/var/log/claude/*/*.log {",
      "    daily",
      "    rotate 30",
      "    compress",
      "    delaycompress",
      "    missingok",
      "    notifempty",
      "    create 0640 root root",
      "}",
    ]),
    ...terminalBlock([
      "[root@rhel-server ~]# chmod 644 /etc/logrotate.d/claude-scripts",
      "[root@rhel-server ~]# logrotate -d /etc/logrotate.d/claude-scripts",
      "... (dry-run 결과 확인)",
    ]),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 7장. 실시간 모니터링
// ============================================================
function chapter6() {
  return [
    heading1("7장. 실시간 모니터링"),

    heading2("7.1 Claude Code vs 기존 모니터링 도구"),
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

    heading2("7.2 실시간 로그 감시 스크립트"),
    para("시스템 로그를 실시간으로 감시하여 특정 패턴 발생 시 Claude Code로 분석하는 스크립트입니다."),
    emptyPara(),
    tipBox("RHEL에서는 /var/log/messages, Ubuntu에서는 /var/log/syslog가 기본 시스템 로그 파일입니다. 환경에 맞게 WATCH_LOG 변수를 설정하세요."),
    heading3("감시 스크립트"),
    para("파일: /opt/claude-scripts/log-monitor.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 실시간 로그 감시 + Claude 분석",
      "",
      "source /opt/claude-scripts/conf/config.env",
      "source /opt/claude-scripts/lib/send_alert.sh",
      "",
      'WATCH_LOG="/var/log/messages"      # RHEL 환경',
      '# Ubuntu 환경에서는 아래로 변경',
      '# WATCH_LOG="/var/log/syslog"       # Ubuntu 환경',
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
      "[root@rhel-server ~]# systemctl daemon-reload",
      "[root@rhel-server ~]# systemctl enable --now claude-log-monitor",
      "Created symlink ... -> claude-log-monitor.service.",
      "[root@rhel-server ~]# systemctl status claude-log-monitor",
      "  claude-log-monitor.service - Claude Code Log Monitor",
      "     Loaded: loaded (enabled)",
      "     Active: active (running)",
    ]),
    emptyPara(),

    heading2("7.3 임계값 기반 모니터링"),
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

    heading2("7.4 모니터링 종합 대시보드"),
    para("터미널에서 주요 지표를 한 눈에 볼 수 있는 대시보드 스크립트입니다."),
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

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 8장. 알림 연동
// ============================================================
function chapter7() {
  return [
    heading1("8장. 알림 연동"),

    heading2("8.1 텔레그램 (Telegram) 연동"),
    heading3("Step 1: 봇 생성"),
    para("1. 텔레그램에서 @BotFather를 검색하여 대화를 시작합니다."),
    para("2. /newbot 명령어를 입력합니다."),
    para("3. 봇 이름(예: My Server Monitor)과 유저네임(예: my_server_monitor_bot)을 입력합니다."),
    para("4. 생성 완료 시 봇 토큰이 표시됩니다 (예: 7123456789:AAH...)."),
    emptyPara(),
    heading3("Step 2: Chat ID 확인"),
    ...terminalBlock([
      "[root@rhel-server ~]# curl -s \"https://api.telegram.org/bot<BOT_TOKEN>/getUpdates\" | jq '.result[0].message.chat.id'",
      "123456789",
    ]),
    tipBox("봇에게 먼저 아무 메시지를 보낸 후 위 명령을 실행해야 Chat ID가 표시됩니다."),
    emptyPara(),
    heading3("Step 3: 메시지 전송 함수"),
    ...codeBlock([
      "# /opt/claude-scripts/lib/telegram.sh",
      "send_telegram() {",
      '  local LEVEL="$1"',
      '  local TITLE="$2"',
      '  local MESSAGE="$3"',
      "",
      '  local ICON=""',
      '  case ${LEVEL} in',
      '    "CRITICAL") ICON="\uD83D\uDD34";;',
      '    "WARNING")  ICON="\uD83D\uDFE1";;',
      '    "INFO")     ICON="\uD83D\uDFE2";;',
      "  esac",
      "",
      '  local TEXT="${ICON} *[${LEVEL}] ${TITLE}*',
      '',
      'Host: $(hostname)',
      'Time: $(date "+%Y-%m-%d %H:%M:%S")',
      '',
      '${MESSAGE}"',
      "",
      "  curl -s -X POST \"https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage\" \\",
      "    -d chat_id=\"${TG_CHAT_ID}\" \\",
      "    -d parse_mode=\"Markdown\" \\",
      '    -d text="${TEXT}" > /dev/null',
      "}",
    ]),
    emptyPara(),

    heading2("8.2 슬랙 (Slack) 연동"),
    heading3("Step 1: Incoming Webhook 설정"),
    para("1. Slack 워크스페이스에서 '앱 추가' > 'Incoming Webhooks'를 검색합니다."),
    para("2. 알림을 받을 채널을 선택합니다."),
    para("3. Webhook URL이 생성됩니다 (예: https://hooks.slack.com/services/T.../B.../xxx)."),
    emptyPara(),
    heading3("Step 2: 메시지 전송 함수"),
    ...codeBlock([
      "# /opt/claude-scripts/lib/slack.sh",
      "send_slack() {",
      '  local LEVEL="$1"',
      '  local TITLE="$2"',
      '  local MESSAGE="$3"',
      "",
      '  local COLOR=""',
      '  case ${LEVEL} in',
      '    "CRITICAL") COLOR="#FF0000";;',
      '    "WARNING")  COLOR="#FFA500";;',
      '    "INFO")     COLOR="#36A64F";;',
      "  esac",
      "",
      "  curl -s -X POST \"${SLACK_WEBHOOK_URL}\" \\",
      "    -H 'Content-type: application/json' \\",
      "    -d \"{",
      '      \\\"attachments\\\": [{',
      "        \\\"color\\\": \\\"${COLOR}\\\",",
      "        \\\"title\\\": \\\"[${LEVEL}] ${TITLE}\\\",",
      "        \\\"text\\\": \\\"${MESSAGE}\\\",",
      "        \\\"footer\\\": \\\"$(hostname) | $(date '+%Y-%m-%d %H:%M:%S')\\\"",
      "      }]",
      '    }" > /dev/null',
      "}",
    ]),
    emptyPara(),

    heading2("8.3 디스코드 (Discord) 연동"),
    heading3("Step 1: Webhook URL 생성"),
    para("1. Discord 서버 설정 > '연동' > '웹후크' > '새 웹후크'를 클릭합니다."),
    para("2. 이름과 채널을 설정한 후 'Webhook URL 복사'를 클릭합니다."),
    emptyPara(),
    heading3("Step 2: 메시지 전송 함수"),
    ...codeBlock([
      "# /opt/claude-scripts/lib/discord.sh",
      "send_discord() {",
      '  local LEVEL="$1"',
      '  local TITLE="$2"',
      '  local MESSAGE="$3"',
      "",
      '  local COLOR=0',
      '  case ${LEVEL} in',
      '    "CRITICAL") COLOR=16711680;;  # Red',
      '    "WARNING")  COLOR=16753920;;  # Orange',
      '    "INFO")     COLOR=3066993;;   # Green',
      "  esac",
      "",
      "  curl -s -X POST \"${DISCORD_WEBHOOK_URL}\" \\",
      "    -H 'Content-type: application/json' \\",
      "    -d \"{",
      '      \\\"embeds\\\": [{',
      "        \\\"title\\\": \\\"[${LEVEL}] ${TITLE}\\\",",
      "        \\\"description\\\": \\\"${MESSAGE}\\\",",
      "        \\\"color\\\": ${COLOR},",
      "        \\\"footer\\\": {\\\"text\\\": \\\"$(hostname) | $(date '+%Y-%m-%d %H:%M:%S')\\\"}",
      "      }]",
      '    }" > /dev/null',
      "}",
    ]),
    emptyPara(),

    heading2("8.4 알림 통합 관리"),
    heading3("공통 알림 함수"),
    para("파일: /opt/claude-scripts/lib/send_alert.sh"),
    ...codeBlock([
      "#!/bin/bash",
      "# 알림 통합 관리 공통 함수",
      "",
      "source /opt/claude-scripts/conf/config.env",
      "source /opt/claude-scripts/lib/telegram.sh",
      "source /opt/claude-scripts/lib/slack.sh",
      "source /opt/claude-scripts/lib/discord.sh",
      "",
      "# 중복 알림 방지 (10분 쿨다운)",
      'ALERT_HISTORY="/tmp/claude-alert-history"',
      "",
      "send_alert() {",
      '  local LEVEL="$1"',
      '  local TITLE="$2"',
      '  local MESSAGE="$3"',
      "",
      "  # 중복 체크",
      '  local HASH=$(echo "${LEVEL}${TITLE}" | md5sum | cut -d" " -f1)',
      '  local NOW=$(date +%s)',
      '  local LAST=$(grep "^${HASH}" ${ALERT_HISTORY} 2>/dev/null | cut -d" " -f2)',
      "",
      '  if [ -n "${LAST}" ] && [ $((NOW - LAST)) -lt 600 ]; then',
      "    return 0  # 10분 이내 중복 - 전송 안 함",
      "  fi",
      "",
      '  echo "${HASH} ${NOW}" >> ${ALERT_HISTORY}',
      "",
      "  # 활성화된 플랫폼으로 전송",
      '  [ "${ALERT_TELEGRAM_ENABLED}" = "true" ] && send_telegram "${LEVEL}" "${TITLE}" "${MESSAGE}"',
      '  [ "${ALERT_SLACK_ENABLED}" = "true" ] && send_slack "${LEVEL}" "${TITLE}" "${MESSAGE}"',
      '  [ "${ALERT_DISCORD_ENABLED}" = "true" ] && send_discord "${LEVEL}" "${TITLE}" "${MESSAGE}"',
      "",
      '  echo "[$(date)] [${LEVEL}] ${TITLE}" >> /var/log/claude/alerts.log',
      "}",
    ]),
    emptyPara(),

    heading3("설정 파일"),
    para("파일: /opt/claude-scripts/conf/config.env"),
    ...codeBlock([
      "# Claude Code 자동화 설정",
      "",
      "# API 인증",
      'export ANTHROPIC_API_KEY="sk-ant-api03-여기에_API_KEY_입력"',
      "",
      "# 텔레그램 설정",
      'ALERT_TELEGRAM_ENABLED=true',
      'TG_BOT_TOKEN="여기에_봇_토큰_입력"',
      'TG_CHAT_ID="여기에_Chat_ID_입력"',
      "",
      "# 슬랙 설정",
      'ALERT_SLACK_ENABLED=false',
      'SLACK_WEBHOOK_URL="여기에_Webhook_URL_입력"',
      "",
      "# 디스코드 설정",
      'ALERT_DISCORD_ENABLED=false',
      'DISCORD_WEBHOOK_URL="여기에_Webhook_URL_입력"',
    ]),
    warningBox("config.env에는 API Key와 토큰이 포함됩니다. 반드시 chmod 600으로 권한을 제한하세요."),

    heading3("알림 레벨 정의"),
    makeTable(
      ["레벨", "색상", "조건 예시", "대응"],
      [
        ["CRITICAL", "\uD83D\uDD34 빨강", "디스크 90%+, 서비스 다운, OOM", "즉시 대응"],
        ["WARNING", "\uD83D\uDFE1 노랑", "디스크 80%+, 에러 급증, 높은 Load", "1시간 내 확인"],
        ["INFO", "\uD83D\uDFE2 초록", "일일/주간 점검 완료, 정상 보고", "참고용"],
      ],
      [1800, 1800, 3000, 2426]
    ),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 9장. 추가 활용법
// ============================================================
function chapter8() {
  return [
    heading1("9장. 추가 활용법"),

    heading2("9.1 서버 마이그레이션 지원"),
    heading3("현재 서버 설정 추출 프롬프트"),
    importantBox("프롬프트"),
    ...codeBlock([
      "현재 서버의 전체 구성을 문서화해줘.",
      "설치된 패키지 목록, 네트워크 설정(IP, DNS, 게이트웨이, bonding),",
      "서비스 목록(enabled), crontab 내용, 방화벽 규칙,",
      "마운트 포인트, 커널 파라미터 변경사항을 정리해줘.",
      "마이그레이션 체크리스트도 함께 만들어줘.",
    ]),
    emptyPara(),

    heading2("9.2 장애 보고서 자동 작성"),
    heading3("장애 보고서 생성 프롬프트"),
    importantBox("프롬프트"),
    ...codeBlock([
      "최근 1시간 동안의 시스템 로그, 서비스 상태, 리소스 사용량을",
      "분석하여 장애 보고서를 작성해줘.",
      "다음 항목을 포함해줘:",
      "- 장애 개요 (시작 시간, 영향 서비스)",
      "- 타임라인 (시간순 이벤트)",
      "- 근본 원인 분석 (Root Cause)",
      "- 조치 사항 (완료/진행중)",
      "- 재발 방지 대책",
    ]),
    emptyPara(),

    heading2("9.3 서버 구성 문서 자동 생성"),
    heading3("서버 인벤토리 문서화 프롬프트"),
    importantBox("프롬프트"),
    ...codeBlock([
      "현재 서버 환경을 인벤토리 문서로 작성해줘.",
      "호스트명, OS, 커널 버전, CPU/메모리/디스크 사양,",
      "네트워크 인터페이스, 설치된 주요 소프트웨어 버전,",
      "보안 설정(SELinux, 방화벽) 현황을 표 형식으로 정리해줘.",
    ]),
    emptyPara(),

    heading2("9.4 셸 스크립트 작성 지원"),
    heading3("스크립트 작성 요청 프롬프트 예시"),
    importantBox("프롬프트"),
    ...codeBlock([
      "RHEL 서버에서 30일 이상 된 로그 파일을 자동으로 gzip 압축하고,",
      "90일 이상 된 압축 파일은 삭제하는 bash 스크립트를 작성해줘.",
      "대상 디렉토리: /var/log/",
      "제외 대상: messages, secure (현재 사용 중)",
      "실행 로그를 /var/log/cleanup.log에 기록해줘.",
    ]),
    heading3("기존 스크립트 검토 요청 프롬프트 예시"),
    importantBox("프롬프트"),
    ...codeBlock([
      "/opt/scripts/backup.sh 스크립트를 검토해줘.",
      "보안 취약점(command injection 등), 에러 처리 누락,",
      "성능 개선 가능 부분을 찾아서 개선된 버전을 제안해줘.",
    ]),
    emptyPara(),

    heading2("9.5 규정 준수(Compliance) 점검"),
    heading3("CIS Benchmark 점검 프롬프트"),
    importantBox("프롬프트"),
    ...codeBlock([
      "CIS Benchmark for Red Hat Enterprise Linux 기준으로",
      "현재 서버의 보안 설정을 점검해줘.",
      "파일시스템 설정, 서비스 비활성화, 네트워크 설정,",
      "감사(audit) 설정, 인증 및 권한 설정을 확인하고",
      "통과/미통과를 표로 정리해줘.",
    ]),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 10장. 문제 해결
// ============================================================
function chapter9() {
  return [
    heading1("10장. 문제 해결 (Troubleshooting)"),

    heading2("10.1 자주 발생하는 오류"),
    makeTable(
      ["증상", "원인", "해결 방법"],
      [
        ["command not found: claude", "PATH에 npm 전역 경로 미포함", "npm config get prefix 확인 후 PATH에 추가\nexport PATH=$PATH:$(npm config get prefix)/bin"],
        ["EACCES: permission denied", "npm 전역 설치 권한 부족", "sudo npm install -g @anthropic-ai/claude-code\n또는 npm config set prefix ~/.npm-global"],
        ["인증 실패 (OAuth)", "토큰 만료 또는 손상", "rm -rf ~/.claude/credentials.json 후 재인증"],
        ["인증 실패 (API Key)", "환경변수 미설정 또는 키 오류", "echo $ANTHROPIC_API_KEY 로 확인\n키 재발급 후 재설정"],
        ["ETIMEDOUT / ECONNREFUSED", "네트워크 차단 (방화벽/프록시)", "api.anthropic.com:443 아웃바운드 허용 확인\nHTTPS_PROXY 환경변수 설정"],
        ["Node.js 버전 오류", "v18 미만 버전 사용", "node -v 확인 후\nRHEL: dnf module enable nodejs:20\nUbuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs"],
        ["응답이 매우 느림", "모델/네트워크 지연", "--model 옵션으로 다른 모델 시도\n네트워크 latency 확인"],
        ["Permission denied (Bash)", "Claude의 명령 실행 권한 부족", "--allowedTools 옵션 확인\n또는 --dangerously-skip-permissions (자동화 시)"],
        ["JSON parse error", "출력 형식 충돌", "--output-format 옵션 확인\n파이프 조합 시 stderr 분리: 2>/dev/null"],
        ["npm WARN deprecated", "패키지 의존성 경고 (무시 가능)", "기능에 영향 없음, npm update -g로 업데이트"],
      ],
      [2500, 2800, 3726]
    ),
    emptyPara(),

    heading2("10.2 프록시 환경 설정"),
    para("사내 프록시가 있는 환경에서는 아래 환경변수를 설정해야 합니다."),
    ...codeBlock([
      "# /etc/profile.d/proxy.sh",
      'export HTTP_PROXY="http://proxy.company.com:8080"',
      'export HTTPS_PROXY="http://proxy.company.com:8080"',
      'export NO_PROXY="localhost,127.0.0.1,.company.com"',
    ]),
    emptyPara(),

    heading2("10.3 업데이트 및 재설치"),
    heading3("업데이트"),
    ...terminalBlock([
      "[root@rhel-server ~]# npm update -g @anthropic-ai/claude-code",
      "changed 1 package in 10s",
      "[root@rhel-server ~]# claude --version",
      "Claude Code v1.x.x (updated)",
    ]),
    heading3("완전 재설치"),
    ...terminalBlock([
      "[root@rhel-server ~]# npm uninstall -g @anthropic-ai/claude-code",
      "[root@rhel-server ~]# rm -rf ~/.claude",
      "[root@rhel-server ~]# npm install -g @anthropic-ai/claude-code",
      "[root@rhel-server ~]# claude --version",
    ]),
    warningBox("rm -rf ~/.claude는 인증 토큰과 설정을 모두 삭제합니다. 재인증이 필요합니다."),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// 부록
// ============================================================
function appendix() {
  return [
    heading1("부록"),

    heading2("A. 자주 쓰는 프롬프트 빠른 참조"),
    para("프린트하여 책상에 비치하면 편리합니다."),
    emptyPara(),
    makeTable(
      ["카테고리", "프롬프트 (요약)", "실행 방법"],
      [
        ["헬스체크", "서버 전체 상태 점검해줘", "claude -p \"...\""],
        ["디스크", "디스크 사용량 분석하고 정리 추천해줘", "claude -p \"...\""],
        ["메모리", "메모리/CPU Top 10 프로세스 보여줘", "claude -p \"...\""],
        ["로그분석", "/var/log/messages 최근 24시간 분석해줘", "claude -p \"...\""],
        ["보안로그", "/var/log/secure 로그인 시도 분석해줘", "claude -p \"...\""],
        ["포트점검", "열린 포트와 서비스 점검해줘", "claude -p \"...\""],
        ["SSH감사", "SSH 보안 설정 감사해줘", "claude -p \"...\""],
        ["SELinux", "SELinux 상태와 위반 점검해줘", "claude -p \"...\""],
        ["패치확인", "미적용 보안 패치 확인해줘", "claude -p \"...\""],
        ["장애대응", "[서비스명] 다운 원인 분석해줘", "claude (대화형)"],
        ["디스크풀", "디스크 100% 긴급 대응해줘", "claude (대화형)"],
        ["보고서", "장애 보고서 작성해줘", "claude -p \"...\""],
      ],
      [1800, 4200, 3026]
    ),
    emptyPara(),

    heading2("B. 참고 링크"),
    makeTable(
      ["자료", "URL"],
      [
        ["Anthropic 공식 문서", "https://docs.anthropic.com"],
        ["Claude Code GitHub", "https://github.com/anthropics/claude-code"],
        ["Anthropic Console (API Key)", "https://console.anthropic.com"],
        ["RHEL 8 문서", "https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8"],
        ["RHEL 9 문서", "https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9"],
        ["CIS Benchmarks", "https://www.cisecurity.org/benchmark/red_hat_linux"],
      ],
      [3500, 5526]
    ),
    emptyPara(),

    heading2("C. 용어 사전"),
    makeTable(
      ["용어", "설명"],
      [
        ["AI (Artificial Intelligence)", "인공지능. 인간의 학습·추론·판단 능력을 컴퓨터로 구현한 기술"],
        ["LLM (Large Language Model)", "대규모 언어 모델. 방대한 텍스트를 학습하여 자연어를 이해·생성하는 AI"],
        ["CLI (Command Line Interface)", "명령줄 인터페이스. 터미널에서 텍스트 명령으로 소프트웨어를 조작하는 방식"],
        ["API (Application Programming Interface)", "프로그램 간 데이터를 주고받기 위한 규격화된 인터페이스"],
        ["API Key", "API 사용 인증을 위한 고유 문자열. 비밀번호와 유사하게 보호해야 함"],
        ["OAuth", "사용자 인증을 위한 표준 프로토콜. 비밀번호 대신 토큰으로 인증"],
        ["Token (토큰)", "AI 모델이 텍스트를 처리하는 최소 단위. 영어 약 4글자, 한국어 약 2글자 = 1토큰"],
        ["Prompt (프롬프트)", "AI에게 전달하는 질문·명령·지시문"],
        ["SSH", "Secure Shell. 네트워크를 통해 원격 서버에 안전하게 접속하는 프로토콜"],
        ["SELinux", "Security-Enhanced Linux. RHEL의 강제 접근 제어(MAC) 보안 모듈"],
        ["CIS Benchmark", "Center for Internet Security에서 제공하는 시스템 보안 설정 가이드라인"],
      ],
      [3500, 5526]
    ),
    emptyPara(),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      children: [new TextRun({ text: "--- 문서 끝 ---", font: FONT_BODY, size: 22, color: "999999", italics: true })],
    }),
  ];
}

// ============================================================
// 문서 조립 및 생성
// ============================================================
async function main() {
  const children = [
    ...coverPage(),
    ...changeHistory(),
    new TableOfContents("목차", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ children: [new PageBreak()] }),
    ...chapter1(),
    ...chapter2(),
    ...chapter3(),
    ...chapterServices(),
    ...chapter4(),
    ...chapter5(),
    ...chapter6(),
    ...chapter7(),
    ...chapter8(),
    ...chapter9(),
    ...appendix(),
  ];

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
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_PRIMARY, space: 4 } },
            children: [
              new TextRun({ text: "Claude Code \uC11C\uBC84 \uAD00\uB9AC \uB9E4\uB274\uC5BC", font: FONT_BODY, size: 18, color: "999999" }),
              new TextRun({ text: "\tv1.0", font: FONT_BODY, size: 18, color: "999999" }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } },
            children: [
              new TextRun({ text: "Confidential  |  Page ", font: FONT_BODY, size: 18, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: "999999" }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "D:\\workspace\\claude-server-manual\\Claude_Code_서버관리_매뉴얼.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document created: " + outputPath);
  console.log("Size: " + (buffer.length / 1024).toFixed(1) + " KB");
}

main().catch(console.error);
