const scenarios = window.productionAgentScenarios;

const state = {
  scenarioId: "silentFactory",
  hasRun: false,
  selectedShotId: null,
  report: "",
  versions: [],
};

const elements = {
  body: document.body,
  scenarioSelect: document.getElementById("scenario-select"),
  title: document.getElementById("project-title"),
  segmentType: document.getElementById("segment-type"),
  targetOutput: document.getElementById("target-output"),
  brief: document.getElementById("shot-brief"),
  runRouting: document.getElementById("run-routing"),
  runStatus: document.getElementById("run-status"),
  caseStatus: document.getElementById("case-status"),
  versionStatus: document.getElementById("version-status"),
  statShotCount: document.getElementById("stat-shot-count"),
  statAiReady: document.getElementById("stat-ai-ready"),
  statHighRisk: document.getElementById("stat-high-risk"),
  statNeedsAsset: document.getElementById("stat-needs-asset"),
  analysisLabel: document.getElementById("analysis-label"),
  analysisProgress: document.getElementById("analysis-progress"),
  analysisSteps: document.getElementById("analysis-steps"),
  processList: document.getElementById("process-list"),
  summaryDecision: document.getElementById("summary-decision"),
  summaryBoundary: document.getElementById("summary-boundary"),
  summaryHandoff: document.getElementById("summary-handoff"),
  shotTableBody: document.getElementById("shot-table-body"),
  detailTitle: document.getElementById("detail-title"),
  detailContent: document.getElementById("detail-content"),
  reportOutput: document.getElementById("report-output"),
  downloadTable: document.getElementById("download-table"),
  copyShot: document.getElementById("copy-shot"),
  saveVersion: document.getElementById("save-version"),
  versionHistory: document.getElementById("version-history"),
  toast: document.getElementById("toast"),
  tooltip: document.getElementById("tooltip"),
};

function currentScenario() {
  return scenarios[state.scenarioId];
}

function loadScenario(id) {
  const scenario = scenarios[id];
  state.scenarioId = id;
  state.hasRun = false;
  state.selectedShotId = scenario.shots[0].id;
  state.report = "";
  state.versions = [...scenario.versionHistory];

  elements.title.value = scenario.projectTitle;
  elements.segmentType.value = scenario.segmentType;
  elements.targetOutput.value = scenario.targetOutput;
  elements.brief.value = scenario.brief;
  elements.runStatus.textContent = "等待启动";
  elements.caseStatus.textContent = "未生成镜头表";
  elements.versionStatus.textContent = "公开模拟版 / 模拟数据";
  elements.analysisLabel.textContent = "等待启动";
  elements.analysisProgress.style.width = "0%";
  elements.reportOutput.textContent = "点击“启动模拟拆解”后，这里会生成公开模拟版报告。";

  renderSummary();
  renderStats();
  renderEmptyTable();
  renderDetailPlaceholder();
  renderVersionHistory();
  resetProcess();
  resetAnalysisSteps();
}

function renderSummary() {
  const scenario = currentScenario();
  elements.summaryDecision.textContent = scenario.summary.decision;
  elements.summaryBoundary.textContent = scenario.summary.boundary;
  elements.summaryHandoff.textContent = scenario.summary.handoff;
}

function renderStats() {
  const shots = currentScenario().shots;
  const aiReady = shots.filter((shot) => shot.method === "AI 生成" || shot.method === "AI + 后期合成").length;
  const highRisk = shots.filter((shot) => shot.risk === "高").length;
  const needsAsset = shots.filter((shot) => shot.assets.includes("后期") || shot.risk === "高").length;

  elements.statShotCount.textContent = shots.length;
  elements.statAiReady.textContent = aiReady;
  elements.statHighRisk.textContent = highRisk;
  elements.statNeedsAsset.textContent = needsAsset;
}

function renderEmptyTable() {
  elements.shotTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="empty-cell">点击“启动模拟拆解”后生成镜头生产表。</td>
    </tr>
  `;
}

function renderShotTable() {
  const scenario = currentScenario();
  elements.shotTableBody.innerHTML = scenario.shots
    .map((shot) => {
      const active = shot.id === state.selectedShotId ? "is-active" : "";
      const routeTooltip = tooltipForRoute(shot);
      const fitTooltip = tooltipForFit(shot);
      const riskTooltip = tooltipForRisk(shot);
      return `
        <tr class="${active}" data-shot-id="${shot.id}" tabindex="0">
          <td><strong>${shot.id}</strong><br><span>${shot.scene}</span></td>
          <td>${shot.description}</td>
          <td><span class="badge route route-${routeClass(shot.method)}" data-tooltip="${escapeAttr(routeTooltip)}">${shot.method}</span></td>
          <td><span class="badge fit fit-${fitClass(shot.fit)}" data-tooltip="${escapeAttr(fitTooltip)}">${shot.fit}</span></td>
          <td>${shot.modelStrategy}</td>
          <td>${shot.assets}</td>
          <td><span class="badge risk risk-${riskClass(shot.risk)}" data-tooltip="${escapeAttr(riskTooltip)}">${shot.risk}</span></td>
          <td>${shot.retryBudget}</td>
          <td>${shot.qc}</td>
        </tr>
      `;
    })
    .join("");
}

function renderDetailPlaceholder() {
  elements.detailTitle.textContent = "等待选择镜头";
  elements.detailContent.innerHTML = "<p>点击镜头后，这里会显示推荐模型、判断理由、所需资产、模拟视频提示词草案、风险提示和后期衔接建议。</p>";
}

function renderShotDetail() {
  const shot = findSelectedShot();
  if (!shot) {
    renderDetailPlaceholder();
    return;
  }

  elements.detailContent.classList.add("is-changing");
  elements.detailTitle.textContent = `${shot.id} / ${shot.scene}`;

  window.setTimeout(() => {
    elements.detailContent.innerHTML = `
      <section>
        <h3>镜头编号命名方式</h3>
        <p>${shot.id} = ${shotIdExplanation(shot.id)}</p>
      </section>
      <section>
        <h3>镜头描述</h3>
        <p>${shot.description}</p>
      </section>
      <section>
        <h3>推荐生产方式</h3>
        <p><span class="badge route route-${routeClass(shot.method)}" data-tooltip="${escapeAttr(tooltipForRoute(shot))}">${shot.method}</span></p>
      </section>
      <section>
        <h3>推荐模型 / 模型策略</h3>
        <p>${modelRecommendation(shot)}</p>
      </section>
      <section>
        <h3>为什么这样判断</h3>
        <p>${shot.reason}</p>
      </section>
      <section>
        <h3>所需资产</h3>
        <p>${shot.assets}</p>
      </section>
      <section>
        <h3>模拟视频提示词草案</h3>
        <div class="prompt-copy">${videoPromptDraft(shot)}</div>
      </section>
      <section>
        <h3>风险提示</h3>
        <p>${shot.warning}</p>
      </section>
      <section>
        <h3>后期衔接建议</h3>
        <p>${shot.post}</p>
      </section>
    `;
    elements.detailContent.classList.remove("is-changing");
  }, 90);
}

function findSelectedShot() {
  return currentScenario().shots.find((shot) => shot.id === state.selectedShotId);
}

function shotIdExplanation(id) {
  const [prefix, number] = id.split("-");
  const prefixMap = {
    JMC: "《静默车间》测试案例",
    XYS: "《雪夜驿书》测试案例",
  };
  return `${prefixMap[prefix] || "当前测试案例"} / 第 ${Number(number)} 个模拟拆解镜头`;
}

function modelRecommendation(shot) {
  if (shot.method === "真人拍摄" || shot.method === "不建议 AI") {
    return "不推荐正片视频生成模型。这个镜头只允许用 AI 做气氛参考、分镜预演或美术参考，最终表演、证据文字和关键动作必须由真人拍摄、道具、后期或视效控制。";
  }

  if (shot.method === "特效辅助") {
    return "公开模拟版建议：先用视频生成模型做动作和气氛预演，再交给特效、动作指导、马术团队或视效判断。具体模型入口、价格和可用规格以上线当天官方资料为准。";
  }

  if (shot.method === "AI + 后期合成") {
    return "公开模拟版建议：先做图生视频或首尾帧测试，再做运动和风格对照；关键文字、标识、官印、标签、界面和人物表演不交给模型自由生成。价格不在公开模拟版中写死。";
  }

  return "公开模拟版建议：先做低成本图生视频或首尾帧测试，再做质量对照。通过构图、运动和气氛测试后，再决定是否升级质量。具体价格、入口和限制以上线当天官方资料为准。";
}

function videoPromptDraft(shot) {
  const purpose = promptPurpose(shot);
  const movement = promptMovement(shot);
  const duration = promptDuration(shot);
  const negative = promptNegative(shot);

  return `
<dl class="prompt-list">
  <dt>镜头用途</dt>
  <dd>${purpose}</dd>
  <dt>推荐时长</dt>
  <dd>${duration}</dd>
  <dt>画幅 / 规格</dt>
  <dd>16:9 横版预览；正式分辨率、帧率和色彩空间由后期确认。</dd>
  <dt>画面主体</dt>
  <dd>${shot.description}</dd>
  <dt>场景与气氛</dt>
  <dd>${shot.promptDraft.replace(/^公开模拟版提示词草案：/, "").replace(/^公开模拟版不提供正片生成提示词。/, "")}</dd>
  <dt>镜头运动</dt>
  <dd>${movement}</dd>
  <dt>风格关键词</dt>
  <dd>写实、克制、低饱和、电影感光影、自然颗粒、非广告片质感，服务剧情气氛。</dd>
  <dt>负面限制</dt>
  <dd>${negative}</dd>
  <dt>后期备注</dt>
  <dd>${shot.post}</dd>
</dl>`.trim();
}

function promptPurpose(shot) {
  if (shot.method === "真人拍摄" || shot.method === "不建议 AI") {
    return "前期气氛参考 / 分镜预演，不作为正片生成指令。";
  }
  if (shot.method === "特效辅助") {
    return "危险动作或动物调度预演，帮助导演、动作、安全和视效团队讨论。";
  }
  if (shot.method === "AI + 后期合成") {
    return "生成可交后期处理的气氛层、环境层或远景素材。";
  }
  return "AI 环境补充镜头正片候选，用于场景建立、转场或情绪铺垫。";
}

function promptMovement(shot) {
  if (shot.description.includes("远景") || shot.scene.includes("驿道") || shot.scene.includes("工业园外")) {
    return "固定机位或极慢横移，避免复杂运镜，保持环境压迫感。";
  }
  if (shot.description.includes("马") || shot.description.includes("火")) {
    return "以预演为主，运动方向清晰，不追求一次生成正片动作。";
  }
  if (shot.description.includes("会议室") || shot.description.includes("东厢房")) {
    return "轻微推近或固定机位，重点保留空间关系和线索可读性。";
  }
  return "镜头运动克制，优先稳定构图和剪辑可接性。";
}

function promptDuration(shot) {
  if (shot.method === "真人拍摄" || shot.method === "不建议 AI") return "3-5 秒参考片段，不进入正片素材池。";
  if (shot.method === "特效辅助") return "4-6 秒预演片段。";
  return "4-6 秒正片候选或后期合成底片。";
}

function promptNegative(shot) {
  const common = "不要清晰真实品牌、乱码文字、错误标识、过度高动态效果、广告片光效、夸张运镜、人物脸部随机变化。";
  if (shot.risk === "高") {
    return `${common} 关键证据、官印、封条、标签、界面、人物核心表演和危险动作不由模型自由生成。`;
  }
  return `${common} 如出现结构变形、运动不稳或风格偏离，应停止当前方案。`;
}

function tooltipForRoute(shot) {
  const map = {
    "AI 生成": "这个镜头不依赖核心表演，可作为 AI 环境补充镜头或远景候选。",
    "真人拍摄": "这个镜头依赖演员表演、调度或关键叙事，正片应由真人主拍。",
    "AI + 后期合成": "AI 只负责环境层、气氛层或底片，关键元素交给后期控制。",
    "特效辅助": "适合做动作或危险调度预演，正片由特效、视效或专业团队判断。",
    "不建议 AI": "涉及核心表演、关键文字或证据线索，不适合模型自由生成。",
  };
  return map[shot.method] || "当前制作方式由制片判断决定。";
}

function tooltipForFit(shot) {
  const map = {
    高: "适合进入 AI 测试，但仍需通过质检和后期接收。",
    中: "可以辅助制作，但需要人工资产、后期或专业部门接管。",
    低: "AI 只适合做参考，不建议进入正片生成。",
    不适合: "不建议使用视频生成模型处理正片画面。",
  };
  return map[shot.fit] || "适配等级来自当前镜头用途和风险判断。";
}

function tooltipForRisk(shot) {
  const map = {
    高: "高风险通常来自核心表演、关键文字、动物、危险动作、证据或后期接收问题。",
    中: "中风险可以测试，但要限制轮次、资产来源和后期接收条件。",
    低: "低风险仍需保留版本、来源和质检记录。",
  };
  return map[shot.risk] || "风险等级来自镜头用途、资产和交付要求。";
}

function buildReport() {
  const scenario = currentScenario();
  const rows = scenario.shots
    .map(
      (shot) =>
        `| ${shot.id} | ${shot.method} | ${shot.fit} | ${shot.modelStrategy} | ${shot.risk} | ${shot.retryBudget} |`,
    )
    .join("\n");

  return `# ${elements.title.value}｜AI 制片统筹公开模拟报告

片段类型：${elements.segmentType.value}
目标输出：${elements.targetOutput.value}

## 输入片段
${elements.brief.value}

## 核心制片判断
${scenario.summary.decision}

## 边界提醒
${scenario.summary.boundary}

## 后期交付重点
${scenario.summary.handoff}

## 镜头生产表
| 镜头编号 | 生产方式 | AI 适配等级 | 模型策略 | 风险等级 | 重试预算 |
| --- | --- | --- | --- | --- | --- |
${rows}

公开版本说明：本报告由前端模拟数据生成，不调用真实接口，不包含完整核心提示词、真实模型价格表、私有数据库或后台执行流程。`;
}

function buildCsv() {
  const rows = [
    ["镜头编号", "场景", "镜头描述", "生产方式", "AI 适配等级", "模型策略", "资产需求", "风险等级", "重试预算", "质检重点"],
    ...currentScenario().shots.map((shot) => [
      shot.id,
      shot.scene,
      shot.description,
      shot.method,
      shot.fit,
      shot.modelStrategy,
      shot.assets,
      shot.risk,
      shot.retryBudget,
      shot.qc,
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadText(filename, text, type) {
  const blob = new Blob([`\uFEFF${text}`], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function runMockRouting() {
  elements.runRouting.disabled = true;
  elements.runRouting.textContent = "模拟拆解中...";
  elements.caseStatus.textContent = "正在模拟 Agent 判断";
  elements.reportOutput.textContent = "正在读取剧本片段、拆解镜头、判断制作边界...";
  resetProcess();
  resetAnalysisSteps();

  // 公开模拟版交互: 左侧长流程用于模拟生产工序推进。
  const items = Array.from(elements.processList.querySelectorAll("li"));
  items.forEach((item, index) => {
    window.setTimeout(() => {
      items.forEach((node, nodeIndex) => {
        node.classList.toggle("is-running", nodeIndex === index);
        if (nodeIndex < index) node.classList.add("is-done");
      });
      elements.runStatus.textContent = item.textContent;
    }, index * 260);
  });

  // 公开模拟版交互: 右侧短流程用于展示本次分析状态。
  const analysisItems = Array.from(elements.analysisSteps.querySelectorAll("li"));
  const analysisLabels = ["读取输入", "拆镜头", "判断边界", "匹配模型", "生成镜头表", "输出结果"];
  analysisItems.forEach((item, index) => {
    window.setTimeout(() => {
      analysisItems.forEach((node, nodeIndex) => {
        node.classList.toggle("is-running", nodeIndex === index);
        if (nodeIndex < index) node.classList.add("is-done");
      });
      elements.analysisLabel.textContent = analysisLabels[index];
      elements.analysisProgress.style.width = `${((index + 1) / analysisItems.length) * 100}%`;
    }, index * 430);
  });

  await wait(3000);

  items.forEach((item) => {
    item.classList.remove("is-running");
    item.classList.add("is-done");
  });
  analysisItems.forEach((item) => {
    item.classList.remove("is-running");
    item.classList.add("is-done");
  });

  state.hasRun = true;
  state.report = buildReport();
  elements.caseStatus.textContent = `${currentScenario().projectTitle} / 镜头表已生成`;
  elements.runStatus.textContent = "交付归档";
  elements.reportOutput.textContent = state.report;
  elements.runRouting.disabled = false;
  elements.runRouting.textContent = "启动模拟拆解";

  renderShotTable();
  renderShotDetail();
  showToast("模拟拆解完成。");
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function resetProcess() {
  elements.processList.querySelectorAll("li").forEach((item) => {
    item.classList.remove("is-running", "is-done");
  });
}

function resetAnalysisSteps() {
  elements.analysisSteps.querySelectorAll("li").forEach((item) => {
    item.classList.remove("is-running", "is-done");
  });
  elements.analysisProgress.style.width = "0%";
}

function renderVersionHistory() {
  elements.versionHistory.innerHTML = state.versions
    .map((item) => `<li><time>${item.time}</time> ${item.event} / ${item.owner}</li>`)
    .join("");
}

function routeClass(method) {
  if (method === "AI 生成") return "ai";
  if (method === "真人拍摄") return "live";
  if (method === "AI + 后期合成") return "hybrid";
  if (method === "特效辅助") return "cg";
  return "noai";
}

function fitClass(fit) {
  if (fit === "高") return "high";
  if (fit === "中") return "mid";
  if (fit === "低") return "low";
  return "none";
}

function riskClass(risk) {
  if (risk === "高") return "high";
  if (risk === "中") return "mid";
  return "low";
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

elements.scenarioSelect.addEventListener("change", (event) => {
  // 公开模拟版交互: 切换预设案例时做轻微淡出淡入，避免硬切。
  elements.body.classList.add("is-switching");
  elements.caseStatus.textContent = "正在切换测试剧本";
  window.setTimeout(() => {
    loadScenario(event.target.value);
    elements.body.classList.remove("is-switching");
    showToast("已切换测试剧本。");
  }, 220);
});

elements.runRouting.addEventListener("click", runMockRouting);

elements.shotTableBody.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-shot-id]");
  if (!row) return;
  state.selectedShotId = row.dataset.shotId;
  renderShotTable();
  renderShotDetail();
});

elements.shotTableBody.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("tr[data-shot-id]");
  if (!row) return;
  event.preventDefault();
  state.selectedShotId = row.dataset.shotId;
  renderShotTable();
  renderShotDetail();
});

elements.downloadTable.addEventListener("click", async () => {
  if (!state.hasRun) await runMockRouting();
  downloadText("AI制片统筹Agent-模拟镜头表.csv", buildCsv(), "text/csv;charset=utf-8");
  showToast("已导出模拟镜头表。");
});

elements.copyShot.addEventListener("click", async () => {
  if (!state.hasRun) await runMockRouting();
  const shot = findSelectedShot();
  if (!shot) return;

  const text = [
    `镜头编号：${shot.id}`,
    `镜头描述：${shot.description}`,
    `推荐生产方式：${shot.method}`,
    `推荐模型 / 模型策略：${modelRecommendation(shot)}`,
    `判断理由：${shot.reason}`,
    `所需资产：${shot.assets}`,
    `模拟视频提示词草案：${htmlToText(videoPromptDraft(shot))}`,
    `风险提示：${shot.warning}`,
    `后期衔接建议：${shot.post}`,
  ].join("\n");

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    showToast("当前镜头建议已复制。");
    return;
  }

  window.prompt("当前浏览器不允许直接复制，可以手动复制这段内容：", text);
  showToast("浏览器限制了直接复制。");
});

elements.saveVersion.addEventListener("click", () => {
  const now = new Date();
  state.versions.unshift({
    time: now.toLocaleString("zh-CN", { hour12: false }),
    event: `保存 ${currentScenario().projectTitle} 模拟拆解版本`,
    owner: "公开模拟版",
  });
  elements.versionStatus.textContent = "版本记录已写入本地模拟记录";
  renderVersionHistory();
  showToast("当前为公开模拟版本，未真实入库。");
});

loadScenario(state.scenarioId);
initTooltip();
initReveal();

function htmlToText(html) {
  return html
    .replace(/<dt>/g, "")
    .replace(/<\/dt>/g, "：")
    .replace(/<dd>/g, "")
    .replace(/<\/dd>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function initTooltip() {
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-tooltip]");
    if (!target) return;
    elements.tooltip.textContent = target.dataset.tooltip;
    elements.tooltip.classList.add("is-visible");
    moveTooltip(event);
  });

  document.addEventListener("pointermove", (event) => {
    if (!elements.tooltip.classList.contains("is-visible")) return;
    moveTooltip(event);
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.target.closest("[data-tooltip]")) return;
    elements.tooltip.classList.remove("is-visible");
  });
}

function moveTooltip(event) {
  const offset = 16;
  const x = Math.min(event.clientX + offset, window.innerWidth - 340);
  const y = Math.min(event.clientY + offset, window.innerHeight - 110);
  elements.tooltip.style.transform = `translate(${x}px, ${y}px)`;
}

function initReveal() {
  const cards = document.querySelectorAll(".reveal-card, .input-panel, .sim-hero");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  cards.forEach((card) => observer.observe(card));
}
