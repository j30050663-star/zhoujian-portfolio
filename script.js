const video = document.querySelector(".scroll-video");
const sections = Array.from(document.querySelectorAll("[data-section][data-scene]"));
const navLinks = Array.from(document.querySelectorAll(".topline a"));
const progressFill = document.querySelector(".progress-fill");
const progressDot = document.querySelector(".progress-dot");
const progressIndex = document.querySelector(".progress-index");
const progressSection = document.querySelector(".progress-section");
const copyControls = Array.from(document.querySelectorAll("[data-copy-target]"));
const startupOverlay = document.querySelector(".startup-overlay");
const folderWindows = Array.from(document.querySelectorAll(".folder-window"));
const fileLoader = document.querySelector(".file-loader");
const fileModal = document.querySelector(".file-modal");
const fileModalTitle = document.getElementById("file-modal-title");
const fileModalFrame = document.querySelector(".file-modal__preview iframe");
const fileModalDownload = document.querySelector(".file-modal__download");
const fileModalOpen = document.querySelector(".file-modal__open");
const fileCloseControls = Array.from(document.querySelectorAll("[data-file-close]"));

let ticking = false;
let videoReady = false;
let fileOpenTimer = 0;

const sectionLabels = {
  "00": "首页",
  "01": "四大平台内容研究",
  "02": "AI 剧本评估",
  "03": "AI 制片统筹",
  "04": "AI 导演调研",
  "05": "联系方式",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pageProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) {
    return 0;
  }

  return clamp(window.scrollY / maxScroll, 0, 1);
};

const syncVideoToScroll = () => {
  ticking = false;
  const progress = pageProgress();

  if (progressFill) {
    progressFill.style.height = `${progress * 100}%`;
  }

  if (progressDot) {
    progressDot.style.top = `${progress * 100}%`;
  }

  if (!video || !videoReady || !Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }

  video.currentTime = progress * video.duration;
};

const requestSync = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(syncVideoToScroll);
  }
};

const setActiveScene = (scene) => {
  if (!scene) {
    return;
  }

  const id = scene.id;
  const index = scene.dataset.scene || "00";

  sections.forEach((section) => {
    section.classList.toggle("is-visible", section === scene);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });

  if (progressIndex) {
    progressIndex.textContent = index;
  }

  if (progressSection) {
    progressSection.textContent = sectionLabels[index] || scene.dataset.section || "首页";
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target) {
      setActiveScene(visible.target);
    }
  },
  {
    root: null,
    rootMargin: "-24% 0px -48% 0px",
    threshold: [0.16, 0.32, 0.5, 0.72],
  },
);

sections.forEach((section) => observer.observe(section));
setActiveScene(sections[0]);

if (video) {
  video.addEventListener("loadedmetadata", () => {
    videoReady = true;
    video.pause();
    syncVideoToScroll();
  });

  video.addEventListener("timeupdate", () => {
    video.pause();
  });

  video.addEventListener("error", () => {
    videoReady = false;
  });
}

window.addEventListener("scroll", requestSync, { passive: true });
window.addEventListener("resize", requestSync);
requestSync();

const finishStartup = () => {
  document.body.classList.remove("startup-pending");
  document.body.classList.add("startup-ready");
  if (startupOverlay) {
    startupOverlay.classList.add("is-done");
  }
};

window.setTimeout(finishStartup, 1350);

const closeFileModal = () => {
  window.clearTimeout(fileOpenTimer);
  if (fileLoader) {
    fileLoader.hidden = true;
  }
  if (fileModal) {
    fileModal.hidden = true;
  }
  if (fileModalFrame) {
    fileModalFrame.removeAttribute("src");
  }
};

const openFileModal = (link) => {
  if (!fileModal || !fileLoader || !fileModalTitle || !fileModalFrame || !fileModalDownload || !fileModalOpen) {
    window.open(link.href, "_blank", "noopener,noreferrer");
    return;
  }

  const isViewingReport = link.classList.contains("report-window");
  const isProductionPortfolio = link.classList.contains("pdf-window");
  const fileTitle = isViewingReport
    ? "周简阶段性作品集.pdf"
    : isProductionPortfolio
      ? "周简制片作品集.pdf"
      : link.querySelector("strong")?.textContent?.trim() || "文件预览";
  const downloadName = isViewingReport
    ? "周简阶段性作品集.pdf"
    : isProductionPortfolio
      ? "周简制片作品集.pdf"
      : "";
  fileModalTitle.textContent = fileTitle;
  fileModalFrame.src = link.href;
  fileModalDownload.href = link.href;
  fileModalDownload.setAttribute("download", downloadName);
  fileModalOpen.href = link.href;
  fileLoader.hidden = false;
  fileModal.hidden = true;

  window.clearTimeout(fileOpenTimer);
  fileOpenTimer = window.setTimeout(() => {
    fileLoader.hidden = true;
    fileModal.hidden = false;
  }, 600);
};

folderWindows.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openFileModal(link);
  });
});

fileCloseControls.forEach((control) => {
  control.addEventListener("click", closeFileModal);
});

window.addEventListener("keydown", (event) => {
  const isTyping =
    event.target instanceof HTMLElement &&
    ["input", "textarea", "select"].includes(event.target.tagName.toLowerCase());

  if (isTyping) {
    return;
  }

  if (event.key === "Escape") {
    if ((fileModal && !fileModal.hidden) || (fileLoader && !fileLoader.hidden)) {
      closeFileModal();
    }
  }
});

const canUsePointerParallax = window.matchMedia("(pointer: fine)").matches;

if (canUsePointerParallax) {
  window.addEventListener(
    "mousemove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 16;
      const y = (event.clientY / window.innerHeight - 0.5) * 16;
      document.body.style.setProperty("--video-shift-x", `${x.toFixed(2)}px`);
      document.body.style.setProperty("--video-shift-y", `${y.toFixed(2)}px`);
      document.body.style.setProperty("--texture-shift-x", `${(-x * 0.42).toFixed(2)}px`);
      document.body.style.setProperty("--texture-shift-y", `${(-y * 0.42).toFixed(2)}px`);
    },
    { passive: true },
  );

  window.addEventListener("mouseleave", () => {
    document.body.style.setProperty("--video-shift-x", "0px");
    document.body.style.setProperty("--video-shift-y", "0px");
    document.body.style.setProperty("--texture-shift-x", "0px");
    document.body.style.setProperty("--texture-shift-y", "0px");
  });
}

const platformData = {
  tencent: {
    title: "腾讯视频：大众入口和传播场面要同时成立",
    summary:
      "腾讯视频这一组，会先看一个项目能不能被不同人从不同入口接住。腾讯视频仍然是长视频市场里的头部平台，对内容研究来说，这意味着它不能只服务一个小圈层的热闹。项目既要有清楚的大众入口，也要有能被拆出来传播的人物、关系和场面。",
    focus: [
      "是否有足够清楚的大众故事入口，而不是只靠题材名词。",
      "是否存在可传播的人物关系、冲突场面和短视频切片价值。",
      "明星热度能不能真正转化为剧情承接，而不是只停在启动阶段。",
      "播出后观众讨论点，是否与平台前期主打卖点一致。",
    ],
    cases: [
      "《老舅》：地域文化不能只停在方言、食物和笑点。真正让它有平台价值的，是普通人在时代变化里不断找位置。东北文化提供辨识度，人物命运扩大共鸣。",
      "《许我耀眼》：适合看明星、女性情绪和短视频传播怎样一起启动项目。但热度不能直接当成剧作成功，热度只能说明有人注意，不能说明人物和故事真的站住。",
      "《扫毒风暴》：能看到涉案题材的另一面。正反人物都要有行动力，但反派再有魅力，也不能抢走项目的价值方向。",
    ],
    conclusion:
      "对腾讯视频的判断是：只讲题材价值不够，只靠演员热度也不够。项目要先让普通观众看得懂，再准备能被传播的角色关系和情节场面。",
  },
  iqiyi: {
    title: "爱奇艺：类型承诺和持续回报更重要",
    summary:
      "爱奇艺这一组，会先看项目能不能稳定兑现一个类型承诺。公开年报和片单能看出一个倾向：原创剧集、系列内容和类型品牌对它很重要。它不是只赌单个爆款，更重视从内容开发、制作到播后运营的一整套方法。",
    focus: [
      "项目能否清楚告诉观众：我是什么类型、你会得到什么。",
      "类型快感是否能持续兑现，而不是只在前几集成立。",
      "系列内容、文学改编、行业剧等是否有清晰规则与可延展空间。",
      "人物推进是否持续有力，能否支撑长线观看。",
    ],
    cases: [
      "《生万物》：不是简单的年代乡土剧。文学改编进入平台时，必须找到普通观众能进入的人物命运，土地、家族、女性成长不能只是主题词，要真的改变人物选择。",
      "《唐朝诡事录之长安》：适合看系列剧的价值。系列不是靠片名续命，而是靠稳定主角团、清楚单元规则和还能继续长出新案件的空间。",
      "《大生意人》：提醒行业剧不能只堆资料。商业智斗要让观众看懂难题、规则和破法，不然行业知识就只是背景。",
      "《罚罪2》：说明续作要有新冲突。观众可以因为前作回来，但这一季必须自己成立。",
    ],
    conclusion:
      "对爱奇艺的判断是：文学改编、系列、行业剧、涉案续作都可以成立，但前提是类型规则清楚，人物推进有力，项目也要不断兑现自己最初给观众的承诺。",
  },
  youku: {
    title: "优酷：强启动之后，内容必须接得住",
    summary:
      "优酷这一组，会把启动能力和内容承接分开看。公开视频资料能看到白夜剧场、生花剧场等剧场化表达，也能看到不同剧场承接悬疑、情感等内容方向。但这些材料更适合支撑阶段观察，不能直接写成平台长期标准。",
    focus: [
      "项目是否具备强启动条件，如明星、古装、版权、视觉声量等。",
      "高关注项目的剧作因果是否扎实，人物行动是否真正成立。",
      "版权改编是否保留了原类型快感，而不是只做表面升级。",
      "正片完成度能否承接启动声量，决定项目能不能真正留下来。",
    ],
    cases: [
      "《藏海传》：有明星、有古装、有复仇权谋，也有很强的市场启动条件。但这类项目越受关注，越需要剧作因果扎实。高智人设不能靠台词自证，必须靠行动成立。",
      "《凡人修仙传》：很适合放进作品集。它提醒的是，强版权不是保险箱。原著和动漫用户已经知道自己要什么，真人剧可以做美学升级，但不能丢掉主角性格和原类型快感。韩立最重要的不是仙气，而是谨慎、能忍、会活。",
      "《以法之名》：不只靠明星或版权启动，而是靠案件、证据、程序和人物灰度留下口碑。这个样本适合证明程序本身也可以成为戏。",
    ],
    conclusion:
      "对优酷的判断是：它能接强启动项目，也需要强情节项目。但启动只是开门，人物因果、类型规则和正片完成度，决定项目能不能真正留下来。",
  },
  mango: {
    title: "芒果系：情感关系和台网表达要一起看",
    summary:
      "芒果TV这一组，更适合放进芒果系里看。因为它背后不只是一个网络平台，还有湖南卫视、金鹰独播剧场、综艺节目、艺人采访和自有宣传渠道。这不是简单的平台归属问题，而是会影响项目表达：它既要考虑移动端用户，也要考虑电视观众对家庭、情感和价值出口的接受方式。",
    focus: [
      "项目是否具备可被放大的情感关系，而不是只有氛围和CP感。",
      "都市情感、治愈、现偶类内容是否有具体行动支撑情绪推进。",
      "是否兼顾台网表达：电视观众、移动端用户和年轻讨论场的接受方式。",
      "平台宣传资源、综艺资源和艺人渠道是否能为项目增加外部助推。",
    ],
    cases: [
      "《深情眼》：适合看芒果系怎样卖都市情感、治愈氛围和演员关系感。但这类剧也容易有风险：如果治愈只停在画面和氛围里，没有具体行动，观众会觉得空。",
      "《耀眼》：更适合作为芒果现偶回到前台的观察样本。公开材料可以支撑对它的播出方式、演员关系、物料打法和观众讨论的分析。",
      "芒果系样本整体提醒：台网联动不只是播出形式，更会影响项目表达、宣传节奏和观众接收路径。",
    ],
    conclusion:
      "对芒果系的判断是：不能只卖氛围和CP感。情感关系要有推进，情绪要有行动支撑。台网表达也会影响项目选择，电视观众、移动端用户和年轻讨论场都要一起考虑。",
  },
};

const platformTabs = Array.from(document.querySelectorAll(".platform-tab"));
const platformPanel = document.getElementById("platform-panel");

const renderPlatform = (key) => {
  const item = platformData[key];
  if (!item || !platformPanel) {
    return;
  }

  platformPanel.innerHTML = `
    <h2 class="platform-panel__title">${item.title}</h2>
    <p class="platform-panel__summary">${item.summary}</p>

    <div class="platform-panel__grid">
      <div class="platform-panel__block">
        <div class="platform-panel__label">观察重点</div>
        <ul class="platform-panel__list">
          ${item.focus.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </div>

      <div class="platform-panel__block">
        <div class="platform-panel__label">案例提醒</div>
        <ul class="platform-panel__list">
          ${item.cases.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="platform-panel__conclusion">
      <span class="platform-panel__label">判断结论</span>
      <p>${item.conclusion}</p>
    </div>
  `;
};

const setActivePlatformTab = (target) => {
  platformTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab === target);
  });
  renderPlatform(target.dataset.platform);
};

platformTabs.forEach((tab) => {
  tab.addEventListener("mouseenter", () => setActivePlatformTab(tab));
  tab.addEventListener("focus", () => setActivePlatformTab(tab));
  tab.addEventListener("click", () => setActivePlatformTab(tab));
});

renderPlatform("tencent");

const scriptAgentData = {
  stage: {
    topline: "01 / 项目阶段",
    title: "按项目阶段判断，不用同一把尺子看所有材料",
    desc:
      "一个早期创意、一本小说版权、前六集剧本和完整剧本，能被判断的内容是不一样的。这个评估系统不会用完整剧本标准去处罚一个早期创意，也不会把一个好概念直接当成成熟项目。",
    table: [
      ["小说版权", "判断原著机制、人物关系、读者反馈、改编空间和版权风险。"],
      ["原创创意 / 故事梗概", "判断核心设定、观众入口、代表作潜力和继续开发价值。"],
      ["人物小传 / 分集大纲", "判断主线推进、人物关系、阶段目标和篇幅支撑。"],
      ["前 1-6 集剧本", "判断开篇兑现、人物建立、逐集回报和追看动力。"],
      ["完整剧本", "判断全剧结构、人物变化、失速点、制作风险和表达风险。"],
    ],
    quote: "项目判断的第一步不是打分，而是先确认：这个材料现在到底应该被判断到什么程度。",
  },
  content: {
    topline: "02 / 内容判断",
    title: "从内容判断项目值不值得继续做",
    desc:
      "一个项目不能只看题材、版权、作者名气或社交平台热度。这个评估系统会先判断它作为长剧项目是否真正成立：观众为什么愿意点开，人物关系能不能持续变化，第十集以后还剩什么新问题。",
    leftLabel: "三层内容判断",
    left: [
      "观众吸引力：观众为什么愿意点开，为什么愿意追下去。",
      "国剧长剧成立：这个故事能不能写长，人物关系能不能持续变化。",
      "公司投入价值：它是否值得公司继续投入，能不能成为代表作或长期资产。",
    ],
    rightLabel: "长剧成立追问",
    right: [
      "核心机制是什么，故事靠什么持续产生新内容。",
      "哪几段人物关系能长期拉扯。",
      "主角是否主动推动主线，而不是只被事件推着走。",
      "第 10 集以后还剩什么新问题、新关系、新代价。",
      "建议体量是多少，最多能撑多少集。",
      "最容易从第几集开始不好看，原因是什么。",
    ],
    quote:
      "我想证明的不是我觉得一个项目看起来不错，而是我能判断它能不能写长、能不能拍、值不值得公司继续投入。",
  },
  jury: {
    topline: "03 / 多评委审读",
    title: "多评委审读：不是按人数投票，而是找出真正影响决策的意见",
    desc:
      "这个评估系统会用不同评委身份看同一个项目，再由主审站在公司利益上做取舍。它不追求每个评委平均发言，而是判断哪一条意见真正会影响公司是否继续投入。",
    table: [
      ["内容制片人", "看代表作潜力、公司长期价值，以及是否值得继续投入。"],
      ["长剧结构编辑", "看核心机制、人物关系、适配集数和失速点。"],
      ["大众观众评委", "看点开理由、追看动力、劝退点和讨论空间。"],
      ["市场研究评委", "看题材供需、同类项目、目标观众和市场阻力。"],
      ["平台与商业评委", "看爱优腾芒匹配度、平台顾虑和修改代价。"],
      ["制作投资评委", "看预算、演员依赖、表达风险和 AI 制作边界。"],
    ],
    quote:
      "好的项目评估不是让 AI 变成一个万能评委，而是让不同身份的风险被看见，再由制片判断来取舍。",
  },
  female: {
    topline: "04 / 大女主专项",
    title: "大女主专项：女性题材不等于女性成长，女主受苦也不等于大女主",
    desc:
      "如果项目主打大女主、女性成长或女性主体性，这个评估系统会单独执行大女主专项。它不看营销标签，只看剧情证据：女主是否有独立目标，是否推动主线，是否有能力兑现，也是否承担错误代价。",
    table: [
      ["独立目标", "删除爱情线后，女主的主线是否仍然成立。"],
      ["主线推动", "重大转折是否主要由女主决定或行动引发。"],
      ["能力兑现", "女主是否真的识别问题、判断路径、采取行动并产生结果。"],
      ["错误代价", "女主是否有主动错误，并承担持续后果。"],
      ["女性关系", "女性角色之间是否有独立目标、冲突和变化。"],
      ["结局归属", "最终核心问题是否主要由女主解决。"],
    ],
    quote: "这部分解决的是一个很常见的问题：女性题材不等于女性成长，女主受苦也不等于大女主。",
  },
  market: {
    topline: "05 / 市场平台转化",
    title: "内容成立之后，再判断它能不能被市场、平台和观众接住",
    desc:
      "平台意见可以帮助项目更好被理解，但不能替代公司自己的内容判断。这个评估系统会继续判断项目的市场机会、平台匹配、宣发入口和商业钩子。",
    leftLabel: "平台判断",
    left: [
      "腾讯视频：大众入口和传播场面能否同时成立。",
      "爱奇艺：类型承诺和持续回报是否稳定兑现。",
      "优酷：强启动之后内容能不能接住。",
      "芒果TV / 芒果系：情感关系和台网表达能否互相支撑。",
    ],
    rightLabel: "转化追问",
    right: [
      "平台为什么可能购买这个项目。",
      "平台最可能顾虑什么。",
      "平台会要求改什么。",
      "修改能不能提高成交率。",
      "修改会不会损害项目核心价值。",
      "最适合在哪个阶段沟通：采买前、改编方案、分集大纲、前几集剧本，还是完整剧本。",
    ],
    quote:
      "平台匹配不是写一句适合某平台就结束，而是判断它为什么可能被买、会被要求怎么改，以及这个修改是否伤害项目。",
  },
  output: {
    topline: "06 / 最终输出",
    title: "最终输出：不是一个分数，而是一份项目下一步判断",
    desc:
      "这个评估系统的最终价值不是给剧本贴一个好坏标签，而是帮助公司决定下一步：继续开发、暂停观察、换平台方向、补充材料、重写人物关系，还是尽早止损。",
    table: [
      ["内容判断", "观众入口、核心机制、人物关系、篇幅支撑、代表作潜力和最大风险。"],
      ["市场机会", "当前题材和受众环境是否值得进入，同类项目成功与失败分别卡在哪里。"],
      ["平台匹配", "最优先平台、第二选择、暂不建议平台，以及对应平台顾虑。"],
      ["宣发入口", "观众第一眼入口、一句话看点、前三集传播点、角色关系物料。"],
      ["商业钩子", "一句话卖法、目标买家、平台购买理由、会员价值、招商价值和版权价值。"],
      ["修改代价", "平台或市场要求会不会伤害项目核心价值。"],
      ["下一步验证", "需要补什么剧本证据、市场资料或物料方案。"],
    ],
    quote: "我不只判断剧本好不好，也判断它能不能进入平台语境、市场语境和观众语境。",
  },
};

const scriptAgentPanel = document.getElementById("script-agent-panel");
const scriptAgentTabs = Array.from(document.querySelectorAll(".script-agent-tab"));

const renderScriptTable = (rows) => `
  <table class="script-panel__table">
    <tbody>
      ${rows
        .map(
          (row) => `
            <tr>
              <td>${row[0]}</td>
              <td>${row[1]}</td>
            </tr>
          `,
        )
        .join("")}
    </tbody>
  </table>
`;

const renderScriptListBlock = (label, items) => `
  <div class="script-panel__block">
    <div class="script-panel__label">${label}</div>
    <ul class="script-panel__list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </div>
`;

const renderScriptAgentPanel = (key) => {
  const item = scriptAgentData[key];
  if (!item || !scriptAgentPanel) {
    return;
  }

  const middle = item.table
    ? renderScriptTable(item.table)
    : `
      <div class="script-panel__grid">
        ${renderScriptListBlock(item.leftLabel, item.left)}
        ${renderScriptListBlock(item.rightLabel, item.right)}
      </div>
    `;

  scriptAgentPanel.innerHTML = `
    <div class="script-panel__topline">${item.topline}</div>
    <h2 class="script-panel__title">${item.title}</h2>
    <p class="script-panel__desc">${item.desc}</p>
    ${middle}
    <div class="script-panel__quote">
      <span>我的判断立场</span>
      <p>${item.quote}</p>
    </div>
  `;
};

const setActiveScriptAgentTab = (target) => {
  scriptAgentTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab === target);
  });
  renderScriptAgentPanel(target.dataset.agentTab);
};

scriptAgentTabs.forEach((tab) => {
  tab.addEventListener("mouseenter", () => setActiveScriptAgentTab(tab));
  tab.addEventListener("focus", () => setActiveScriptAgentTab(tab));
  tab.addEventListener("click", () => setActiveScriptAgentTab(tab));
});

renderScriptAgentPanel("stage");

const productionModules = {
  classify: {
    index: "模块 01",
    label: "镜头归类",
    title: "镜头归类与制作方式判断",
    desc:
      "这个模块判断的不是 AI 能不能生成，而是这个镜头在正式影视制作中是否应该交给 AI。它会根据剧本和分镜，把镜头分成 AI 可生成、真人拍摄和混合制作三类，避免剧组因为画面看起来可以，就错误地把核心表演或复杂调度交给 AI。",
    cards: [
      {
        tag: "生成",
        title: "AI 可生成镜头",
        text: "不依赖核心表演，不需要精确文字，画面以环境、氛围、远景、转场为主。",
      },
      {
        tag: "实拍",
        title: "真人拍摄镜头",
        text: "依赖演员表演、对白、情绪变化、人物关系和真实现场质感。",
      },
      {
        tag: "混合",
        title: "混合制作镜头",
        text: "需要实拍基础，同时由 AI、视效或后期补充视觉元素。",
      },
    ],
    rows: [
      ["叙事功能", "这个镜头是交代环境、推动情节，还是承担核心情绪？"],
      ["表演依赖", "镜头是否依赖演员眼神、微表情、对白和人物关系？"],
      ["动作复杂度", "是否涉及奔跑、打斗、骑马、车辆运动、多人调度等高风险动作？"],
      ["人物一致性", "角色的脸、身形、服装、发型、道具是否需要连续稳定？"],
      ["镜头衔接", "AI 镜头能不能接上前后实拍镜头，光线、景别和运动是否跳戏？"],
      ["制作必要性", "这个镜头交给 AI 是否真的减少成本和时间，还是反而增加返工？"],
    ],
    quote: "AI 视频统筹的第一步，不是推荐模型，也不是写提示词，而是判断这个镜头是否应该进入 AI 流程。",
  },
  task: {
    index: "模块 02",
    label: "任务单",
    title: "AI 镜头任务单与生成管理",
    desc:
      "当一个镜头已经确认适合 AI 后，这套系统会继续把它拆成一张可以执行、测试、验收和止损的制作任务单。它解决的不是提示词怎么写得更美，而是这个 AI 镜头能不能被正式派发、管理和验收。",
    cards: [
      {
        tag: "提示词",
        title: "任务单字段",
        text: "镜头用途、制作分类、输入方式、视觉要求、禁止内容、模型建议、后期要求。",
      },
      {
        tag: "成本",
        title: "成本与轮次",
        text: "记录每轮生成的积分、人民币成本、失败成本，并设置最大重试次数。",
      },
      {
        tag: "停止",
        title: "停止条件",
        text: "连续出现结构错误、运动错误、人物不稳定或画面不接戏时停止。",
      },
    ],
    rows: [
      ["镜头用途", "场景建立、时间转换、情绪铺垫、危险场面替代、视觉补充等。"],
      ["输入方式", "文生视频、图生视频、首尾帧参考、参考图驱动、实拍素材增强。"],
      ["模型 / 工具建议", "根据镜头复杂度选择够用的模型，而不是默认使用最高成本模型。"],
      ["测试轮次", "设定首轮测试数量和最大重试次数。"],
      ["成本预估", "记录每轮生成的积分、人民币成本和失败成本。"],
      ["替代方案", "改为空镜、采购素材、实拍远景、视效或传统后期处理。"],
      ["验收人", "导演、摄影指导、剪辑、后期统筹、制片、法务。"],
    ],
    quote: "真正重要的不是让 AI 多生成几版，而是让每一次生成都有目的、有边界、有成本控制，也有失败后的退路。",
  },
  handoff: {
    index: "模块 03",
    label: "交接检查",
    title: "成片交接与风险检查",
    desc:
      "AI 视频生成完成后，并不等于它可以直接进入正片。很多素材只有平台预览版，没有母版，没有版本记录，没有授权说明，也没有质检。这个模块会在 AI 素材进入正式制作前，检查它是否具备交付条件。",
    cards: [
      {
        tag: "母版",
        title: "文件与版本",
        text: "检查母版、代理文件、镜头编号、版本号、生成时间、采用状态和确认人。",
      },
      {
        tag: "质检",
        title: "画面与后期",
        text: "检查闪烁、畸变、文字错误、边缘变形、运动不自然和色彩衔接。",
      },
      {
        tag: "授权",
        title: "授权与标注",
        text: "追溯工具条款、参考资产来源、人物形象授权和 AI 画面标注要求。",
      },
    ],
    rows: [
      ["母版文件", "有最高质量导出文件，不只依赖平台预览版。"],
      ["代理文件", "有剪辑可用的轻量版本，并能回连母版。"],
      ["提示词归档", "保留中文提示词、英文提示词、负面词和参考资产编号。"],
      ["画面质检", "检查闪烁、畸变、文字错误、边缘变形、运动不自然。"],
      ["色彩衔接", "能与前后实拍镜头的黑位、色温、颗粒和锐度接上。"],
      ["声音处理", "AI 原声只作参考，正式声音由声音部门处理。"],
      ["标注要求", "全 AI 生成画面进入成片时，处理字幕、片尾说明或发行材料标注。"],
    ],
    quote: "AI 素材只有通过交接检查，才有资格进入正式制作。否则它只是一个看起来完成的测试片，不是剧组能放心使用的正片素材。",
  },
};

const productionModulePanel = document.getElementById("production-module-panel");
const productionNodes = Array.from(document.querySelectorAll(".flow-node"));

const renderProductionModule = (key) => {
  const data = productionModules[key];
  if (!data || !productionModulePanel) {
    return;
  }

  productionModulePanel.innerHTML = `
    <article class="production-panel">
      <div class="production-panel__topline">
        <span>${data.index}</span>
        <b>${data.label}</b>
      </div>

      <h2 class="production-panel__title">${data.title}</h2>
      <p class="production-panel__desc">${data.desc}</p>

      <div class="production-panel__cards">
        ${data.cards
          .map(
            (card) => `
              <div class="production-mini-card">
                <span>${card.tag}</span>
                <strong>${card.title}</strong>
                <p>${card.text}</p>
              </div>
            `,
          )
          .join("")}
      </div>

      <table class="production-panel__table">
        <tbody>
          ${data.rows
            .map(
              (row) => `
                <tr>
                  <td>${row[0]}</td>
                  <td>${row[1]}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="production-panel__quote">
        <span>我的判断</span>
        <p>${data.quote}</p>
      </div>
    </article>
  `;
};

const setActiveProductionNode = (target) => {
  productionNodes.forEach((node) => {
    node.classList.toggle("is-active", node === target);
  });
  renderProductionModule(target.dataset.productionModule);
};

productionNodes.forEach((node) => {
  node.addEventListener("mouseenter", () => setActiveProductionNode(node));
  node.addEventListener("focus", () => setActiveProductionNode(node));
  node.addEventListener("click", () => setActiveProductionNode(node));
});

renderProductionModule("classify");

const fallbackCopy = (text) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
};

const markCopied = (id) => {
  copyControls.forEach((control) => {
    const isCurrent = control.dataset.copyTarget === id;
    control.classList.toggle("is-copied", isCurrent);
    if (isCurrent) {
      control.textContent = "已复制";
      window.setTimeout(() => {
        control.classList.remove("is-copied");
        control.textContent = "复制";
      }, 1400);
    }
  });
};

window.copyText = async (id) => {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  const text = target.innerText.trim();

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    markCopied(id);
    alert(`已复制：${text}`);
  } catch {
    fallbackCopy(text);
    markCopied(id);
    alert(`已复制：${text}`);
  }
};
