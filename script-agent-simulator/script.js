const data = window.scriptAgentMockData;

const state = {
  activeSample: "jingmo",
  hasRun: false,
  reportMarkdown: "",
  versions: [...data.versionHistory],
};

const elements = {
  sampleTabs: [...document.querySelectorAll(".sample-tab")],
  title: document.getElementById("project-title"),
  type: document.getElementById("project-type"),
  stage: document.getElementById("project-stage"),
  brief: document.getElementById("project-brief"),
  tasks: [...document.querySelectorAll(".task-box input[type='checkbox']")],
  mockUpload: document.getElementById("mock-upload"),
  uploadHint: document.getElementById("upload-hint"),
  runAnalysis: document.getElementById("run-analysis"),
  runStatus: document.getElementById("run-status"),
  currentSample: document.getElementById("current-sample"),
  progressBar: document.getElementById("progress-bar"),
  progressList: document.getElementById("progress-list"),
  reviewerGrid: document.getElementById("reviewer-grid"),
  reportOutput: document.getElementById("report-output"),
  copyReport: document.getElementById("copy-report"),
  downloadMd: document.getElementById("download-md"),
  saveVersion: document.getElementById("save-version"),
  versionStatus: document.getElementById("version-status"),
  versionHistory: document.getElementById("version-history"),
};

function activeSample() {
  return data.samples[state.activeSample];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedTasks() {
  return elements.tasks
    .filter((item) => item.checked)
    .map((item) => item.value);
}

function applySample(sampleKey) {
  state.activeSample = sampleKey;
  const sample = activeSample();

  elements.sampleTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.sample === sampleKey);
  });

  elements.title.value = sample.title;
  elements.type.value = sample.type;
  elements.stage.value = sample.stage;
  elements.brief.value = sample.brief;
  elements.currentSample.textContent = `《${sample.title}》`;
  elements.runStatus.textContent = "等待启动";
  elements.progressBar.style.width = "0%";
  state.hasRun = false;
  state.reportMarkdown = "";

  renderProgress(0);
  renderReviewers();
  renderReportPlaceholder(sample);
}

function renderProgress(doneCount) {
  elements.progressList.innerHTML = data.steps
    .map((step, index) => {
      const isDone = index < doneCount;
      const isActive = index === doneCount;
      return `<div class="progress-item${isDone ? " is-done" : ""}${isActive ? " is-active" : ""}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${step}</strong>
        <em>${isDone ? "已完成" : isActive ? "进行中" : "等待"}</em>
      </div>`;
    })
    .join("");
}

function renderReviewers() {
  const sample = activeSample();
  elements.reviewerGrid.innerHTML = sample.reviewers
    .map(
      (reviewer) => `<article class="reviewer-card">
        <div class="reviewer-head">
          <span>${escapeHtml(reviewer.role)}</span>
          <strong>${reviewer.score}</strong>
        </div>
        <p>${escapeHtml(reviewer.judgment)}</p>
        <dl>
          <div><dt>机会</dt><dd>${escapeHtml(reviewer.opportunity)}</dd></div>
          <div><dt>风险</dt><dd>${escapeHtml(reviewer.risk)}</dd></div>
        </dl>
      </article>`,
    )
    .join("");
}

function renderVersionHistory() {
  elements.versionHistory.innerHTML = state.versions
    .map(
      (item) =>
        `<li><time>${escapeHtml(item.time)}</time><span>${escapeHtml(item.event)}</span><em>${escapeHtml(item.owner)}</em></li>`,
    )
    .join("");
}

function getReportData() {
  const sample = activeSample();
  return {
    title: elements.title.value.trim() || sample.title,
    type: elements.type.value,
    stage: elements.stage.value,
    brief: elements.brief.value.trim() || sample.brief,
    tasks: selectedTasks(),
    sample,
  };
}

function renderReportPlaceholder(sample) {
  elements.reportOutput.innerHTML = `<p class="empty-state">
    当前样例：${escapeHtml(sample.sampleLabel)}。点击“启动模拟分析”后，这里会生成三层报告。
  </p>`;
}

function renderSection(title, items) {
  return `<section class="report-section">
    <h3>${escapeHtml(title)}</h3>
    <div class="report-table">
      ${Object.entries(items)
        .map(
          ([key, value]) => `<div class="report-row">
            <span>${escapeHtml(key)}</span>
            <p>${escapeHtml(value)}</p>
          </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function buildReportHtml() {
  const report = getReportData();
  return `
    <div class="report-meta">
      <span>公开样例报告</span>
      <strong>《${escapeHtml(report.title)}》</strong>
      <p>${escapeHtml(report.type)} / ${escapeHtml(report.stage)}</p>
    </div>
    ${renderSection("04 / 项目决策摘要", report.sample.report.onePage)}
    ${renderSection("05 / 制片人分析", report.sample.report.producer)}
    ${renderSection("06 / 证据附件", report.sample.report.evidence)}
  `;
}

function objectToMarkdown(items) {
  return Object.entries(items)
    .map(([key, value]) => `- ${key}：${value}`)
    .join("\n");
}

function buildReportMarkdown() {
  const report = getReportData();
  const reviewers = report.sample.reviewers
    .map(
      (reviewer) =>
        `### ${reviewer.role}\n分数：${reviewer.score}\n核心判断：${reviewer.judgment}\n最大机会：${reviewer.opportunity}\n最大风险：${reviewer.risk}`,
    )
    .join("\n\n");

  return `# 《${report.title}》剧集开发与投资判断 Agent 公开样例报告

项目类型：${report.type}
项目阶段：${report.stage}
分析任务：${report.tasks.join("、") || "未选择"}

## 材料摘要
${report.brief}

## 04 / 项目决策摘要
${objectToMarkdown(report.sample.report.onePage)}

## 05 / 制片人分析
${objectToMarkdown(report.sample.report.producer)}

## 06 / 证据附件
${objectToMarkdown(report.sample.report.evidence)}

## 六评委意见
${reviewers}

公开版本说明：当前报告由前端模拟数据生成，只展示 Agent 的交互框架和输出结构；不包含核心提示词、评分权重、平台匹配规则、真实项目案例、私有剧本材料、市场资料库、Agent 执行流程或接口密钥。`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function runMockAnalysis() {
  elements.runAnalysis.disabled = true;
  elements.runStatus.textContent = "正在模拟分析";
  elements.reportOutput.innerHTML = `<p class="empty-state">正在读取材料并整理报告...</p>`;

  // TODO: replace mock data with real API call
  for (let index = 0; index <= data.steps.length; index += 1) {
    renderProgress(index);
    elements.progressBar.style.width = `${(index / data.steps.length) * 100}%`;
    if (index < data.steps.length) {
      await new Promise((resolve) => setTimeout(resolve, 460));
    }
  }

  state.hasRun = true;
  state.reportMarkdown = buildReportMarkdown();
  elements.reportOutput.innerHTML = buildReportHtml();
  elements.runStatus.textContent = "模拟报告已生成";
  elements.runAnalysis.disabled = false;
}

elements.sampleTabs.forEach((tab) => {
  tab.addEventListener("click", () => applySample(tab.dataset.sample));
});

elements.mockUpload.addEventListener("click", () => {
  // TODO: connect file upload service
  elements.uploadHint.textContent = "公开展示版只保留上传入口，不读取文件。";
});

elements.runAnalysis.addEventListener("click", runMockAnalysis);

elements.copyReport.addEventListener("click", async () => {
  if (!state.hasRun) {
    await runMockAnalysis();
  }
  await navigator.clipboard.writeText(state.reportMarkdown);
  elements.runStatus.textContent = "报告已复制";
});

elements.downloadMd.addEventListener("click", async () => {
  if (!state.hasRun) {
    await runMockAnalysis();
  }
  const title = getReportData().title.replace(/[\\/:*?"<>|]/g, "");
  downloadText(`${title}-公开样例报告.md`, state.reportMarkdown);
});

elements.saveVersion.addEventListener("click", () => {
  // TODO: connect version history database
  const now = new Date();
  const title = getReportData().title;
  state.versions.unshift({
    time: now.toLocaleString("zh-CN", { hour12: false }),
    event: `保存《${title}》公开样例报告`,
    owner: "本页模拟",
  });
  elements.versionStatus.textContent = "已保存到页面临时记录";
  renderVersionHistory();
});

renderVersionHistory();
applySample("jingmo");
