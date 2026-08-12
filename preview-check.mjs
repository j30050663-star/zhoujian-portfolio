import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "script-agent-simulator/index.html",
  "script-agent-simulator/style.css",
  "script-agent-simulator/script.js",
  "script-agent-simulator/mock-data.js",
  "ai-production-simulator/index.html",
  "ai-production-simulator/style.css",
  "ai-production-simulator/script.js",
  "ai-production-simulator/mock-data.js",
  "agents/script-agent/index.html",
  "agents/ai-production-agent/index.html",
  "assets/didi-ok-card.jpg",
  "assets/junie-card.jpg",
  "assets/didi-ok-ai-director-report.docx",
  "assets/junie-ai-director-report.docx",
  "assets/didi-ok-ai-director-report.html",
  "assets/junie-ai-director-report.html",
  "assets/zhou-jian-ai-portfolio.pdf",
  "assets/monthly-viewing-report.pdf",
  "assets/hero-poster.jpg",
  "assets/wanfeng-jian-shu-film.mp4",
  "favicon.svg",
  "assets/logos/tencent-video.svg",
  "assets/logos/iqiyi.svg",
  "assets/logos/youku.svg",
  "assets/logos/mangotv.svg",
];
const missing = files.filter((file) => !existsSync(join(root, file)));

if (missing.length) {
  throw new Error(`Missing preview files: ${missing.join(", ")}`);
}

const html = readFileSync(join(root, "index.html"), "utf8");
const rootScriptAgentSimulatorHtml = readFileSync(join(root, "script-agent-simulator/index.html"), "utf8");
const rootScriptAgentSimulatorCss = readFileSync(join(root, "script-agent-simulator/style.css"), "utf8");
const rootScriptAgentSimulatorJs = readFileSync(join(root, "script-agent-simulator/script.js"), "utf8");
const rootScriptAgentMockData = readFileSync(join(root, "script-agent-simulator/mock-data.js"), "utf8");
const rootProductionAgentSimulatorHtml = readFileSync(join(root, "ai-production-simulator/index.html"), "utf8");
const rootProductionAgentSimulatorCss = readFileSync(join(root, "ai-production-simulator/style.css"), "utf8");
const rootProductionAgentSimulatorJs = readFileSync(join(root, "ai-production-simulator/script.js"), "utf8");
const rootProductionAgentMockData = readFileSync(join(root, "ai-production-simulator/mock-data.js"), "utf8");
const scriptAgentHtml = readFileSync(join(root, "agents/script-agent/index.html"), "utf8");
const productionAgentHtml = readFileSync(join(root, "agents/ai-production-agent/index.html"), "utf8");
const css = readFileSync(join(root, "styles.css"), "utf8");
const js = readFileSync(join(root, "script.js"), "utf8");
const combined = `${html}\n${rootScriptAgentSimulatorHtml}\n${rootScriptAgentSimulatorCss}\n${rootScriptAgentSimulatorJs}\n${rootScriptAgentMockData}\n${rootProductionAgentSimulatorHtml}\n${rootProductionAgentSimulatorCss}\n${rootProductionAgentSimulatorJs}\n${rootProductionAgentMockData}\n${scriptAgentHtml}\n${productionAgentHtml}\n${css}\n${js}`;

const requiredSections = [
  "Home",
  "四大平台内容研究",
  "剧集开发与投资判断 Agent",
  "AI 制片统筹 Agent",
  "AI 原创短片",
  "AI 导演调研",
  "Contact",
];

const missingSections = requiredSections.filter((section) => !html.includes(section));
if (missingSections.length) {
  throw new Error(`Missing sections: ${missingSections.join(", ")}`);
}

const requiredFilmOpening = [
  "cinematic-production-home",
  "scroll-video",
  "hero-scroll.mp4",
  "scene-stage",
  "scene-copy",
  "field-note",
  "scene-index",
  "scroll-progress",
  "video-fallback",
  "周简AI作品集",
  "我关注 AI 进入影视生产后，制片人怎样判断内容、组织制作、控制成本，并把创意稳定交付出来。",
  "hero-subtitle single-line-copy",
  "page-footer-note",
  "2026 / 周简",
  "AI影视制片 / 作品集",
  "startup-overlay",
  "正在启动 AI 制片作品集系统...",
  "正在读取项目档案...",
  "正在同步 AI 智能体模块...",
  "访问已开启",
  "状态 / 可打开",
  "点击打开文件",
  "progress-dot",
  "progress-section",
  "file-loader",
  "正在读取文件...",
  "正在打开档案窗口...",
  "file-modal",
  "PDF 预览区域",
  "下载文件",
  "新窗口打开",
  "周简制片作品集.pdf",
  "周简阶段性作品集.pdf",
];

const missingFilmOpening = requiredFilmOpening.filter((item) => !combined.includes(item));
if (missingFilmOpening.length) {
  throw new Error(`Missing film-opening rules: ${missingFilmOpening.join(", ")}`);
}

const requiredVideoCss = [
  "position: fixed",
  "object-fit: cover",
  "min-height: 400vh",
  "background: rgba(0, 0, 0",
  "mix-blend-mode",
  "letter-spacing",
  "position: sticky",
  "#0a0908",
  "#f4f0e8",
  "#3a1715",
  "#2b211d",
];

const missingVideoCss = requiredVideoCss.filter((item) => !css.includes(item));
if (missingVideoCss.length) {
  throw new Error(`Missing video CSS: ${missingVideoCss.join(", ")}`);
}

const requiredScrollJs = [
  "currentTime",
  "duration",
  "scrollY",
  "requestAnimationFrame",
  "IntersectionObserver",
  "data-scene",
  "timeupdate",
];

const missingScrollJs = requiredScrollJs.filter((item) => !js.includes(item));
if (missingScrollJs.length) {
  throw new Error(`Missing scroll video script: ${missingScrollJs.join(", ")}`);
}

const retiredStructures = [
  "comic-panel",
  "story-panel-grid",
  "poster-hero",
  "ticket-link",
  "hero-board",
  "dossier-card",
  "task-strip",
  "glass",
];

const retiredHits = retiredStructures.filter((item) => combined.includes(item));
if (retiredHits.length) {
  throw new Error(`Retired visual structure still present: ${retiredHits.join(", ")}`);
}

const requiredContactItems = [
  "contact-item",
  'id="phone"',
  "+86 19156234395",
  'id="wechat"',
  "xq7707071",
  'id="email"',
  "hu343434342022@163.com",
  "copyText(",
  "data-copy-target",
  "复制",
];

const missingContactItems = requiredContactItems.filter((item) => !combined.includes(item));
if (missingContactItems.length) {
  throw new Error(`Missing contact copy items: ${missingContactItems.join(", ")}`);
}

const requiredReviewChanges = [
  "剧集开发与投资判断 Agent",
  "02 / 剧集开发与投资判断 Agent",
  "03 / AI 制片统筹 Agent",
  "04 / AI 原创短片",
  "05 / AI导演调研",
  "06 / 联系方式",
  "script-agent-scene",
  "script-agent-tab",
  "script-agent-panel",
  "scriptAgentData",
  "renderScriptAgentPanel",
  "setActiveScriptAgentTab",
  "按项目阶段判断",
  "内容成立判断",
  "多评委审读",
  "大女主专项",
  "市场平台转化",
  "最终输出",
  "我把制片判断整理成剧集开发与投资判断 Agent",
  "white-space: nowrap",
  "scene-platform",
  "四大平台内容研究",
  "platform-tabs",
  "platform-tab",
  "platform-panel",
  "platformData",
  "renderPlatform",
  "setActivePlatformTab",
  "腾讯视频：大众入口和传播场面要同时成立",
  "爱奇艺：类型承诺和持续回报更重要",
  "优酷：强启动之后，内容必须接得住",
  "芒果系：情感关系和台网表达要一起看",
  "./assets/logos/tencent-video.svg",
  "./assets/logos/iqiyi.svg",
  "./assets/logos/youku.svg",
  "./assets/logos/mangotv.svg",
  "ai-production-scene",
  "ai-production__inner",
  "production-board",
  "flow-node",
  "production-module-panel",
  "productionModules",
  "renderProductionModule",
  "setActiveProductionNode",
  "镜头归类与制作方式判断",
  "AI 镜头任务单与生成管理",
  "成片交接与风险检查",
  "人工复核节点",
  "AI 可以提高效率，但不能替代制片判断。",
  "research-title single-line-title",
  "director-samples",
  "director-sample",
  "didi-ok-card.jpg",
  "junie-card.jpg",
  "didi-ok-ai-director-report.html",
  "junie-ai-director-report.html",
  "查看分析报告",
  "folder-window pdf-window",
  "folder-window report-window",
  "制片作品集浏览",
  "月度观影报告",
  "./assets/zhou-jian-ai-portfolio.pdf",
  "./assets/monthly-viewing-report.pdf",
  'target="_blank"',
  'rel="noopener noreferrer"',
  "感谢观看期待您的联系!",
  "以下联系方式可以直接粘贴",
  "03 / AI 制片统筹 Agent",
  "04 / AI 原创短片",
  "05 / AI导演调研",
  "06 / 联系方式",
  "01 / 四大平台内容研究",
  "02 / 剧集开发与投资判断 Agent",
  "AI 进入制作后 真正要管的是判断 成本和交付",
  "AI 制片统筹系统",
  "输入材料",
  "这套系统可以提前暴露问题",
  "母版 / 质检 / 色彩 / 声音 / 授权 / 标注",
  "系统首页 / 文件入口 / 制片控制台",
  "平台案例 / 内容策略 / 项目判断",
  "故事成立 / 平台匹配 / 市场转化",
  "镜头判断 / 成本控制 / 成片交付",
  "原创短片 / 成片观看 / 制作验证",
  "影像风格 / 提示词方法 / AI 作者研究",
  "复制联系方式 / 打开文件 / 联系我",
  "AI Agent Lab",
  "我把影视制片、剧本审读和 AI 视频生产流程，整理成可以展示、追踪和检查的 Agent 原型。",
  "剧集开发与投资判断 Agent",
  "02 / Agent 入口",
  "03 / Agent 入口",
  "上传小说、故事梗概或剧本材料，模拟生成项目判断结果。",
  "输入剧本片段或镜头需求，模拟拆解 AI / 真人 / CG 边界，并生成镜头生产表、模型建议和交付风险。",
  "进入模拟工作台",
  "查看方法说明",
  'href="agents/script-agent/index.html"',
  'href="agents/ai-production-agent/index.html"',
  "script-agent-simulator/index.html",
  "ai-production-simulator/index.html",
  'href="style.css"',
  'src="mock-data.js"',
  'src="script.js"',
  "剧集开发与投资判断 Agent / 模拟工作台",
  "AI 制片统筹 Agent 模拟工作台",
  "公开展示版只保留上传入口，不读取文件。",
  "mock-data.js",
  "TODO: replace mock data with real API call",
  "TODO: connect file upload service",
  "TODO: connect version history database",
  "../index.html",
  "../index.html#lab",
  "../index.html#production",
  "启动模拟分析",
  "下载文本报告",
  "启动模拟拆解",
  "导出镜头表",
  "从小说采买到平台沟通的项目判断工作台",
  "《她从雨夜来》",
  "本页面只展示公开外壳，不包含真实 Prompt、评分权重、真实案例、私有数据库和 API Key",
  "从剧本镜头拆解到 AI 视频交付的生产管理工作台",
  "Brief 输入",
  "模型选择逻辑",
  "本页面只展示公开外壳，不包含真实 Prompt、模型价格表、项目案例、API Key、私有数据库和执行链路",
  "../../index.html",
  "startup-pending",
  "startup-ready",
  "folderScan",
  "sectionLabels",
  "--video-shift-x",
  "--texture-shift-x",
  "report-window",
  "周简阶段性作品集.pdf",
  "openFileModal",
  "closeFileModal",
  "Escape",
];

const missingReviewChanges = requiredReviewChanges.filter((item) => !combined.includes(item));
if (missingReviewChanges.length) {
  throw new Error(`Missing browser review changes: ${missingReviewChanges.join(", ")}`);
}

const requiredShareMetadata = [
  "周简｜影视制片与 AI 制片作品集",
  'name="description"',
  'rel="canonical" href="https://www.zhoujianstudio.com/"',
  'rel="icon" href="./favicon.svg"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url" content="https://www.zhoujianstudio.com/"',
  'property="og:image"',
  "https://www.zhoujianstudio.com/assets/hero-poster.jpg",
  'name="twitter:card" content="summary_large_image"',
  'itemprop="image"',
];

const missingShareMetadata = requiredShareMetadata.filter((item) => !html.includes(item));
if (missingShareMetadata.length) {
  throw new Error(`Missing share metadata: ${missingShareMetadata.join(", ")}`);
}

const removedReviewText = [
  "02 / 剧集开发 Agent",
  "我把制片判断整理成 AI 剧本评估",
  "我判断一个项目，不只看它像不像爆款。",
  "我把制片判断整理成 Agent。",
  "我把制片判断整理成AI剧本评估",
  "这里不是炫工具而是把剧本平台制作风险整理成可以查看的判断内容",
  "剧本 Agent：故事是否成立",
  "平台匹配 Agent：项目可能被谁接住",
  "content-drawer agent-drawer",
  "导演资料库：创作者适不适合这个项目",
  "如果你想查看完整案例，我可以提供脱敏版本。",
  "真实项目、预算和内部资料统一脱敏。下面是可以直接复制的联系信息。",
  "把审美、预算、风险和交付放在同一张工作表里看。",
  "research-frame",
  "./assets/ai-director-overview.jpg",
  "PORTFOLIO CUT",
  "SCENE 03 / AI Production",
  "03 / Production",
  "04 / Research",
  "05 / Contact",
  "01 / Platform",
  "PROJECT OVERVIEW",
  "sound-consent",
  "是否开启背景音乐？",
  "建议佩戴耳机浏览，获得完整作品集体验。",
  "开启声音",
  "静音浏览",
  "immersive-control",
  "进入沉浸模式",
  "退出沉浸模式",
  "immersive-mode",
  "RESEARCH QUESTIONS",
  "METHOD / 研究方法",
  "PLATFORM SAMPLE",
  "INPUT MATERIALS",
  "MANUAL REVIEW NODES",
  "MY POSITION",
  "AI 进入制作后，真正要管的是判断、成本和交付。",
  "AI Production Coordinator Agent",
  "production-title single-line-title",
  "production-copy",
  "data-review-status",
  "待确认",
  "AI 视频统筹 Agent",
  "AI 镜头任务单 Agent",
  "AI 成片交接 Agent",
  "SCENE 04 / AI Director Research",
  "SCENE 05 / Contact",
  "SCENE 05 / 联系方式",
  "PDF / PORTFOLIO",
  "VIEWING / REPORT",
  "SCROLL / TIME",
  "SCENE 00 / OPENING FRAME",
  "00 / Home",
  "ROLE",
  "FOCUS",
  "COPY",
  "AI Film Production Portfolio",
  "WHY",
  'href="./assets/junie-ai-director-report.docx"',
  'href="./assets/didi-ok-ai-director-report.docx"',
  "platform-panel__topline",
  "TENCENT VIDEO",
  "IQIYI",
  "YOUKU",
  "MANGO ECOSYSTEM",
];

const removedReviewHits = removedReviewText.filter((item) => html.includes(item));
if (removedReviewHits.length) {
  throw new Error(`Old reviewed text still present: ${removedReviewHits.join(", ")}`);
}

const canonicalStructureChecks = [
  ['class="agent-lab-section"', "Agent Lab independent section"],
  ['class="agent-card__actions"', "Agent card action group"],
  ["mobile-wrap-title", "mobile wrapping title hook"],
  ['role="tablist"', "tablist semantics"],
  ['role="tab"', "tab semantics"],
  ['aria-selected="true"', "selected tab state"],
  ["lastModalTrigger", "modal focus restoration"],
  ["getFocusableModalElements", "modal focus trap"],
  ["modal-open", "modal background scroll lock"],
];

const missingCanonicalStructure = canonicalStructureChecks
  .filter(([needle]) => !combined.includes(needle))
  .map(([, label]) => label);
if (missingCanonicalStructure.length) {
  throw new Error(`Missing focused upgrades: ${missingCanonicalStructure.join(", ")}`);
}

const agentLabPosition = html.indexOf('class="agent-lab-section"');
const homeClosePosition = html.indexOf('</section>', html.indexOf('id="home"'));
const platformPosition = html.indexOf('id="platform"');
if (!(homeClosePosition !== -1 && agentLabPosition > homeClosePosition && agentLabPosition < platformPosition)) {
  throw new Error("Agent Lab must sit after the opening section and before platform research");
}

const duplicateSimulatorPaths = [
  "agents/script-agent/simulator",
  "agents/ai-production-agent/simulator",
];
const remainingDuplicateSimulators = duplicateSimulatorPaths.filter((path) => existsSync(join(root, path)));
if (remainingDuplicateSimulators.length) {
  throw new Error(`Duplicate simulator directories remain: ${remainingDuplicateSimulators.join(", ")}`);
}

if (existsSync(join(root, "assets/hero-scroll-mobile.mp4")) || combined.includes("hero-scroll-mobile.mp4")) {
  throw new Error("Duplicate mobile background video remains");
}

if (!scriptAgentHtml.includes('../../script-agent-simulator/index.html')) {
  throw new Error("Script Agent method page is missing its simulator entry");
}

if (!productionAgentHtml.includes('../../ai-production-simulator/index.html')) {
  throw new Error("Production Agent method page is missing its simulator entry");
}

const scriptAgentTabCount = (html.match(/class="script-agent-tab(?:\s|")/g) || []).length;
if (scriptAgentTabCount !== 6) {
  throw new Error(`Expected 6 script agent tabs, found ${scriptAgentTabCount}`);
}

const productionNodeCount = (html.match(/class="flow-node(?:\s|")/g) || []).length;
if (productionNodeCount !== 3) {
  throw new Error(`Expected 3 production flow nodes, found ${productionNodeCount}`);
}

const bannedText = [
  ["赋", "能"],
  ["深", "度"],
  ["全", "方", "位"],
  ["多", "维", "度"],
  ["底", "层", "逻", "辑"],
  ["抓", "手"],
  ["闭", "环"],
  ["迭", "代"],
  ["颗", "粒", "度"],
  ["护", "城", "河"],
  ["生", "态"],
  ["矩", "阵"],
  ["赛", "道"],
  ["垂", "类"],
  ["首", "先"],
  ["其", "次"],
  ["最", "后"],
  ["不", "仅"],
  ["而", "且"],
  ["然", "而"],
  ["因", "此"],
  ["综", "上", "所", "述"],
].map((parts) => parts.join(""));

const bannedHits = bannedText.filter((word) => combined.includes(word));
if (bannedHits.length) {
  throw new Error(`Banned text found: ${bannedHits.join(", ")}`);
}

const contactStart = html.indexOf('<section class="scene contact-scene"');
if (contactStart === -1) {
  throw new Error("Contact section not found");
}

const beforeContact = html.slice(0, contactStart);
const contactOnlyPatterns = [
  "+86 19156234395",
  "xq7707071",
  "hu343434342022@163.com",
];

const earlyContactHits = contactOnlyPatterns.filter((item) => beforeContact.includes(item));
if (earlyContactHits.length) {
  throw new Error(`Contact info appears before Contact section: ${earlyContactHits.join(", ")}`);
}

const allowedImages = [
  "./assets/didi-ok-card.jpg",
  "./assets/junie-card.jpg",
  "./assets/wanfeng-jian-shu-key-visual.jpg",
  "./assets/wanfeng-still-river-wide.jpg",
  "./assets/wanfeng-still-river-close.jpg",
  "./assets/wanfeng-still-modern-elevator.jpg",
  "./assets/wanfeng-still-old-elevator.jpg",
  "./assets/wanfeng-still-press-conference.jpg",
  "./assets/wanfeng-still-screening-room.jpg",
  "./assets/logos/tencent-video.svg",
  "./assets/logos/iqiyi.svg",
  "./assets/logos/youku.svg",
  "./assets/logos/mangotv.svg",
];
const imageRefs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const unexpectedImages = imageRefs.filter((src) => !allowedImages.includes(src));
if (unexpectedImages.length) {
  throw new Error(`Unexpected image references: ${unexpectedImages.join(", ")}`);
}

const missingImages = allowedImages.filter((src) => !imageRefs.includes(src));
if (missingImages.length) {
  throw new Error(`Missing director images: ${missingImages.join(", ")}`);
}

if (!css.includes("@media")) {
  throw new Error("Responsive rules are missing");
}

console.log("Preview checks passed");
