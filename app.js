const apps = [
  {
    id: "health-ledger",
    name: "电脑工伤账本",
    short: "久坐用眼健康账单",
    desc: "记录屏幕时长、久坐、眼疲劳和肩颈状态，生成电脑工作者的健康损耗账单。",
    fields: [
      ["date", "日期", "date"], ["hours", "屏幕工作小时", "number", "例如 8"], ["sit", "最长连续久坐小时", "number", "例如 3"],
      ["eye", "眼疲劳 1-10", "number", "例如 6"], ["neck", "肩颈痛 1-10", "number", "例如 5"], ["breaks", "有效休息次数", "number", "例如 3"],
      ["note", "今天身体反馈", "textarea", "眼干、肩颈紧、腰酸等"]
    ],
    title: r => `${r.date || "今天"} 屏幕 ${num(r.hours)}h`,
    insight: records => {
      const last = records[0] || {};
      const score = clamp(100 - num(last.hours) * 5 - num(last.sit) * 6 - num(last.eye) * 3 - num(last.neck) * 3 + num(last.breaks) * 4, 0, 100);
      return result(score, "健康余量", [
        score < 60 ? "今天身体消耗偏高，建议至少安排 2 次离屏恢复。" : "健康余量尚可，继续保持间歇休息。",
        num(last.sit) > 2 ? "连续久坐超过 2 小时，优先处理坐姿和拉伸。" : "久坐风险可控。",
        "传播点：生成本周电脑工伤账单，适合社群打卡。"
      ]);
    }
  },
  {
    id: "thesis-rescue",
    name: "论文拖延急救箱",
    short: "论文倒计时与最小任务",
    desc: "把论文焦虑拆成今天能做的小动作，适合本硕博开题、中期、初稿、盲审前使用。",
    fields: [
      ["topic", "论文题目", "text", "例如 低空经济治理研究"], ["degree", "学位阶段", "select", ["本科", "硕士", "博士"]],
      ["stage", "当前阶段", "select", ["选题", "开题", "实验/调研", "初稿", "修改", "盲审/答辩"]],
      ["deadline", "截止日期", "date"], ["progress", "完成度 %", "number", "例如 35"], ["blocker", "现在卡在哪里", "textarea", "不知道写什么、数据没跑完、导师没反馈等"]
    ],
    title: r => `${r.stage || "论文"}：${r.topic || "未命名论文"}`,
    insight: records => {
      const last = records[0] || {};
      const days = last.deadline ? Math.ceil((new Date(last.deadline) - new Date()) / 86400000) : 0;
      const progress = num(last.progress);
      const score = clamp(progress + Math.min(days, 60) - (days < 15 ? 25 : 0), 0, 100);
      return result(score, "推进安全度", [
        days > 0 ? `距离截止还有 ${days} 天，今天只做一个最小任务：写 300 字或整理 3 条文献。` : "先填截止日期，才能判断风险。",
        progress < 50 ? "完成度偏低，优先补齐目录和证据，不要先追求语言完美。" : "已有基础，下一步集中处理导师反馈和格式。",
        "传播点：输入答辩日期，看看现在有多危险。"
      ]);
    }
  },
  {
    id: "energy-budget",
    name: "打工人能量预算",
    short: "精力账本与任务排班",
    desc: "不只管时间，而是管今天还剩多少电，避免把高耗能任务排到错误时段。",
    fields: [
      ["date", "日期", "date"], ["energy", "起床能量 0-100", "number", "例如 72"], ["task", "关键任务", "text", "例如 周会汇报"],
      ["cost", "预计耗能 0-100", "number", "例如 35"], ["pressure", "压力 1-10", "number", "例如 7"],
      ["sleep", "昨晚睡眠小时", "number", "例如 6.5"], ["recovery", "恢复动作", "textarea", "散步、断屏、早睡、运动等"]
    ],
    title: r => `${r.date || "今天"}：${r.task || "未命名任务"}`,
    insight: records => {
      const last = records[0] || {};
      const remain = clamp(num(last.energy) - num(last.cost) - num(last.pressure) * 3 + Math.max(0, num(last.sleep) - 6) * 5, 0, 100);
      return result(remain, "剩余电量", [
        remain < 30 ? "今天不适合硬扛，建议砍掉低价值沟通和临时任务。" : "能量足够，优先处理高价值深度任务。",
        num(last.sleep) < 6 ? "睡眠不足会放大任务耗能，下午安排低负荷事项。" : "睡眠没有明显拖后腿。",
        "传播点：你的今天不是没时间，是没电了。"
      ]);
    }
  },
  {
    id: "desk-makeover",
    name: "工位微装修",
    short: "桌面效率与人体工学评分",
    desc: "用问卷快速诊断工位问题，生成低预算改造清单和适合分享的工位评分。",
    fields: [
      ["scene", "使用场景", "select", ["办公室", "宿舍", "居家办公", "实验室"]], ["monitor", "显示器数量", "number", "例如 1"],
      ["budget", "改造预算", "number", "例如 200"], ["pain", "主要不适", "select", ["肩颈", "眼睛", "腰背", "手腕", "杂乱低效"]],
      ["light", "光线评分 1-10", "number", "例如 6"], ["tidy", "整洁评分 1-10", "number", "例如 5"], ["items", "已有设备", "textarea", "支架、台灯、键盘、收纳等"]
    ],
    title: r => `${r.scene || "工位"} 改造预算 ${num(r.budget)} 元`,
    insight: records => {
      const last = records[0] || {};
      const score = clamp(num(last.light) * 5 + num(last.tidy) * 5 + (num(last.monitor) > 0 ? 10 : 0), 0, 100);
      return result(score, "工位评分", [
        score < 65 ? "优先买显示器支架、桌面收纳和可调台灯，成本低但改善明显。" : "基础不错，可以进一步优化线材和常用物品动线。",
        `针对 ${last.pain || "不适"}，先做一个 200 元以内的小改造清单。`,
        "传播点：测测你的工位值几分。"
      ]);
    }
  },
  {
    id: "meeting-compressor",
    name: "会议废话压缩器",
    short: "把会议压成结论和待办",
    desc: "记录议题、结论、负责人和截止时间，自动生成能执行的会议纪要。",
    fields: [
      ["title", "会议主题", "text", "例如 项目复盘会"], ["people", "参会人数", "number", "例如 6"], ["minutes", "会议分钟", "number", "例如 45"],
      ["hourly", "人均时薪", "number", "例如 80"], ["decision", "最终结论", "textarea", "本次会议做出的决定"],
      ["owner", "负责人", "text", "例如 李四"], ["due", "截止日期", "date"], ["todo", "待办事项", "textarea", "下一步要做什么"]
    ],
    title: r => `${r.title || "会议"}：${r.owner || "未分配"} 负责`,
    insight: records => {
      const last = records[0] || {};
      const cost = num(last.people) * num(last.minutes) / 60 * num(last.hourly);
      const score = clamp((last.decision ? 35 : 0) + (last.owner ? 25 : 0) + (last.due ? 20 : 0) + (last.todo ? 20 : 0), 0, 100);
      return result(score, "会议有效度", [
        `估算会议成本约 ${money(cost)}，请确认它是否产出了明确结论。`,
        score < 80 ? "纪要缺少结论、负责人或截止时间，会后容易失效。" : "这场会已经压缩成可执行格式。",
        "传播点：这场会到底浪费了多少钱。"
      ]);
    }
  },
  {
    id: "resume-radar",
    name: "简历战斗力雷达",
    short: "岗位匹配与经历量化诊断",
    desc: "根据目标岗位检查关键词、量化成果和经历可信度，给学生和跳槽人群快速反馈。",
    fields: [
      ["job", "目标岗位", "text", "例如 产品经理"], ["keywords", "岗位关键词", "textarea", "增长、数据分析、用户研究"],
      ["skills", "我的技能", "textarea", "Python、SQL、Axure、访谈"], ["experience", "核心经历", "textarea", "项目/实习/论文/工作经历"],
      ["metrics", "量化成果数量", "number", "例如 3"], ["versions", "简历版本数", "number", "例如 1"]
    ],
    title: r => `${r.job || "目标岗位"} 简历诊断`,
    insight: records => {
      const last = records[0] || {};
      const keywordHit = overlap(last.keywords, `${last.skills} ${last.experience}`);
      const score = clamp(keywordHit * 12 + num(last.metrics) * 12 + num(last.versions) * 8, 0, 100);
      return result(score, "战斗力", [
        keywordHit < 3 ? "岗位关键词命中不足，先把 JD 里的高频词翻译进经历。" : "关键词基础不错，继续强化成果证据。",
        num(last.metrics) < 3 ? "量化成果太少，每段经历至少补一个数字。" : "量化表达具备竞争力。",
        "传播点：测测你的简历战斗力。"
      ]);
    }
  },
  {
    id: "no-blame",
    name: "今日不背锅",
    short: "职场留痕与风险备忘",
    desc: "记录口头需求、变更、责任边界和证据，生成礼貌确认话术，降低职场背锅风险。",
    fields: [
      ["event", "事件标题", "text", "例如 需求临时变更"], ["person", "相关人", "text", "例如 王经理"],
      ["source", "来源", "select", ["口头", "微信", "会议", "邮件", "文档"]], ["risk", "风险等级", "select", ["低", "中", "高"]],
      ["impact", "影响范围", "textarea", "影响排期、成本、交付质量等"], ["confirm", "需要确认的话", "textarea", "请对方确认的内容"]
    ],
    title: r => `${r.risk || "中"}风险：${r.event || "未命名事件"}`,
    insight: records => {
      const last = records[0] || {};
      const score = last.risk === "高" ? 35 : last.risk === "中" ? 65 : 85;
      return result(score, "边界安全度", [
        `建议话术：${last.person || "您好"}，为避免理解偏差，我确认一下：${last.confirm || last.impact || "本次变更内容和影响范围如下"}。`,
        last.source === "口头" ? "口头来源风险较高，请尽快转成文字确认。" : "已有文字来源，继续补齐影响和截止时间。",
        "传播点：打工人防背锅神器。"
      ]);
    }
  },
  {
    id: "clip-manager",
    name: "跨屏剪贴管家",
    short: "资料收集与稍后整理",
    desc: "保存链接、文字、截图说明和灵感，避免资料散落在收藏夹、聊天和文档里。",
    fields: [
      ["title", "标题", "text", "例如 竞品资料"], ["type", "类型", "select", ["链接", "文字", "截图说明", "灵感", "待办"]],
      ["tag", "标签", "text", "例如 论文/工作/报销"], ["source", "来源链接", "text", "https://"],
      ["content", "内容", "textarea", "粘贴文字、链接说明或截图描述"]
    ],
    title: r => `${r.type || "资料"}：${r.title || "未命名"}`,
    insight: records => {
      const untagged = records.filter(r => !r.tag).length;
      const score = clamp(100 - untagged * 8, 0, 100);
      return result(score, "整理度", [
        records.length ? `当前收件箱有 ${records.length} 条资料，未打标签 ${untagged} 条。` : "先保存第一条资料，周末再整理。",
        untagged > 3 ? "未分类资料偏多，建议今天只做一件事：给最近 5 条打标签。" : "资料收集较有序。",
        "传播点：拯救复制党和截图党。"
      ]);
    }
  },
  {
    id: "shutdown-ritual",
    name: "睡前收工仪式",
    short: "下班断联与明日启动",
    desc: "用三分钟关闭工作脑：记录完成、未完成、担忧和明日三件事。",
    fields: [
      ["date", "日期", "date"], ["done", "今日完成", "textarea", "今天已经完成的事情"], ["undone", "未完成", "textarea", "可以明天继续的事情"],
      ["tomorrow", "明日三件事", "textarea", "最多三件"], ["worry", "担忧暂存箱", "textarea", "先写下来，不在睡前反复想"],
      ["mood", "情绪 1-10", "number", "例如 6"], ["screen", "计划几点断屏", "time"]
    ],
    title: r => `${r.date || "今晚"} 收工仪式`,
    insight: records => {
      const last = records[0] || {};
      const score = clamp(num(last.mood) * 10 + (last.tomorrow ? 20 : 0) + (last.worry ? 10 : 0), 0, 100);
      return result(score, "收工完成度", [
        last.tomorrow ? "明日启动已经有入口，睡前不需要继续复盘。" : "请写下明日三件事，降低睡前焦虑。",
        last.worry ? "担忧已暂存，今天到此为止。" : "如果脑子停不下来，把担忧写进暂存箱。",
        "传播点：每天 3 分钟，把工作关机。"
      ]);
    }
  },
  {
    id: "compound-ledger",
    name: "学习工作复利账本",
    short: "微进步与长期回报曲线",
    desc: "记录每天投入的 10 分钟，把学习、写作、运动、整理变成看得见的复利曲线。",
    fields: [
      ["project", "复利项目", "text", "例如 英语/论文/编程"], ["category", "类别", "select", ["学习", "写作", "运动", "工作", "整理"]],
      ["minutes", "今日投入分钟", "number", "例如 30"], ["output", "今日产出", "text", "例如 读 10 页/写 500 字"],
      ["quality", "质量自评 1-10", "number", "例如 7"], ["note", "备注", "textarea", "今天的收获"]
    ],
    title: r => `${r.project || "复利项目"} +${num(r.minutes)} 分钟`,
    insight: records => {
      const total = records.reduce((s, r) => s + num(r.minutes), 0);
      const avg = records.length ? records.reduce((s, r) => s + num(r.quality), 0) / records.length : 0;
      const score = clamp(total / 6 + avg * 6, 0, 100);
      return result(score, "复利进度", [
        `累计投入 ${Math.round(total / 60 * 10) / 10} 小时，下一里程碑是 ${nextMilestone(total)} 小时。`,
        records.length < 7 ? "先连续记录 7 次，不追求完美。" : "已经形成可见积累，可以生成月度成长账单。",
        "传播点：你不是没进步，只是没看见复利。"
      ]);
    }
  }
];

let activeId = localStorage.getItem("suite-active-id") || apps[0].id;
let editingId = null;

const els = Object.fromEntries([...document.querySelectorAll("[id]")].map(el => [el.id, el]));

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, Math.round(n))); }
function money(n) { return Number(n || 0).toLocaleString("zh-CN", { style: "currency", currency: "CNY" }); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function activeApp() { return apps.find(app => app.id === activeId) || apps[0]; }
function storageKey(id = activeId) { return `must-have-suite:${id}`; }
function loadRecords(id = activeId) {
  try { return JSON.parse(localStorage.getItem(storageKey(id)) || "[]"); } catch { return []; }
}
function saveRecords(records, id = activeId) { localStorage.setItem(storageKey(id), JSON.stringify(records)); }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function overlap(keywords = "", text = "") {
  const ks = String(keywords).split(/[，,、\s]+/).filter(Boolean);
  const hay = String(text).toLowerCase();
  return ks.filter(k => hay.includes(k.toLowerCase())).length;
}
function nextMilestone(minutes) {
  const hours = minutes / 60;
  return [10, 50, 100, 300, 1000].find(h => h > hours) || 1000;
}
function result(score, label, advice) {
  const color = score < 50 ? "#b42318" : score < 75 ? "#b45309" : "#0f766e";
  return { score, label, color, advice };
}
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function renderNav() {
  const q = els.appSearch.value.trim().toLowerCase();
  els.appNav.innerHTML = apps
    .filter(app => `${app.name} ${app.short} ${app.desc}`.toLowerCase().includes(q))
    .map(app => `<button class="nav-item ${app.id === activeId ? "active" : ""}" data-id="${app.id}">
      <strong>${escapeHtml(app.name)}</strong><span>${escapeHtml(app.short)}</span>
    </button>`).join("");
  els.appNav.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    activeId = btn.dataset.id;
    editingId = null;
    localStorage.setItem("suite-active-id", activeId);
    render();
  }));
}

function renderForm() {
  const app = activeApp();
  const records = loadRecords();
  const editing = editingId ? records.find(r => r.id === editingId) : null;
  els.entryForm.innerHTML = `
    <div>
      <h3>${editing ? "编辑记录" : "新增记录"}</h3>
      <p class="muted">${escapeHtml(app.short)}</p>
    </div>
    <div class="form-grid">
      ${app.fields.map(([key, label, type, extra]) => fieldHtml(key, label, type, extra, editing)).join("")}
    </div>
    <div class="hero-actions">
      <button class="primary" type="submit">${editing ? "保存修改" : "保存记录"}</button>
      <button type="button" id="resetFormBtn">清空</button>
    </div>
  `;
  els.entryForm.onsubmit = saveForm;
  document.getElementById("resetFormBtn").onclick = () => { editingId = null; renderForm(); };
}

function fieldHtml(key, label, type, extra, editing) {
  const value = editing ? editing[key] ?? "" : type === "date" ? today() : "";
  const full = type === "textarea" ? " full" : "";
  if (type === "select") {
    return `<label class="${full}"><span>${label}</span><select name="${key}">${extra.map(option => `<option ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }
  if (type === "textarea") {
    return `<label class="${full}"><span>${label}</span><textarea name="${key}" placeholder="${escapeHtml(extra || "")}">${escapeHtml(value)}</textarea></label>`;
  }
  return `<label class="${full}"><span>${label}</span><input name="${key}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(extra || "")}"></label>`;
}

function saveForm(event) {
  event.preventDefault();
  const form = new FormData(els.entryForm);
  const data = Object.fromEntries(form.entries());
  const app = activeApp();
  const records = loadRecords();
  const titleField = app.fields[0][0];
  if (!data[titleField]) {
    toast("请先填写第一项关键信息");
    return;
  }
  if (editingId) {
    const next = records.map(r => r.id === editingId ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
    saveRecords(next);
    toast("已保存修改");
  } else {
    records.unshift({ id: uid(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveRecords(records);
    toast("已新增记录");
  }
  editingId = null;
  render();
}

function renderMetrics(records, insight) {
  const appsWithData = apps.filter(app => loadRecords(app.id).length).length;
  const totalRecords = apps.reduce((sum, app) => sum + loadRecords(app.id).length, 0);
  els.metrics.innerHTML = [
    ["当前评分", `${insight.score}`, insight.label],
    ["当前工具记录", records.length, "本地保存"],
    ["已有数据工具", appsWithData, "10 个工具"],
    ["总记录数", totalRecords, "全站累计"]
  ].map(([name, value, note]) => `<div class="metric"><span>${name}</span><b>${value}</b><span>${note}</span></div>`).join("");
}

function renderInsight(records) {
  const app = activeApp();
  const insight = app.insight(records);
  els.insight.innerHTML = `
    <div class="score">
      <div class="score-ring" style="background:${insight.color}">${insight.score}</div>
      <div><h3>${escapeHtml(insight.label)}</h3><p class="muted">根据最近记录自动生成</p></div>
    </div>
    <div class="advice">${insight.advice.map(item => `<div>${escapeHtml(item)}</div>`).join("")}</div>
  `;
  return insight;
}

function renderRecords(records) {
  const q = els.recordSearch.value.trim().toLowerCase();
  const app = activeApp();
  const list = records.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  els.recordCount.textContent = `${records.length} 条`;
  els.records.innerHTML = list.length ? list.map(r => `
    <article class="record">
      <div class="record-top">
        <div>
          <div class="record-title">${escapeHtml(app.title(r))}</div>
          <div class="record-meta">${new Date(r.updatedAt || r.createdAt).toLocaleString("zh-CN")}</div>
        </div>
        <span class="pill">${escapeHtml(app.name)}</span>
      </div>
      <div class="record-meta">${summaryFields(app, r)}</div>
      <div class="record-actions">
        <button data-edit="${r.id}">编辑</button>
        <button data-copy="${r.id}">复制</button>
        <button class="danger" data-delete="${r.id}">删除</button>
      </div>
    </article>
  `).join("") : `<div class="empty">暂无记录，先保存一条试试看</div>`;
  els.records.querySelectorAll("[data-edit]").forEach(btn => btn.onclick = () => { editingId = btn.dataset.edit; renderForm(); });
  els.records.querySelectorAll("[data-copy]").forEach(btn => btn.onclick = () => duplicateRecord(btn.dataset.copy));
  els.records.querySelectorAll("[data-delete]").forEach(btn => btn.onclick = () => deleteRecord(btn.dataset.delete));
}

function summaryFields(app, record) {
  return app.fields.slice(0, 5).map(([key, label]) => `${label}：${escapeHtml(record[key] || "-")}`).join("　");
}

function duplicateRecord(id) {
  const records = loadRecords();
  const item = records.find(r => r.id === id);
  if (!item) return;
  records.unshift({ ...item, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  saveRecords(records);
  render();
  toast("已复制");
}

function deleteRecord(id) {
  if (!confirm("确认删除这条记录？")) return;
  saveRecords(loadRecords().filter(r => r.id !== id));
  render();
  toast("已删除");
}

function exportData() {
  const app = activeApp();
  const payload = { app: app.name, exportedAt: new Date().toISOString(), records: loadRecords() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${app.id}-records.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function copyReport() {
  const app = activeApp();
  const records = loadRecords();
  const insight = app.insight(records);
  const text = `我正在用「${app.name}」：${app.desc}\n当前${insight.label}：${insight.score} 分\n${insight.advice.join("\n")}`;
  try {
    await navigator.clipboard.writeText(text);
    toast("传播文案已复制");
  } catch {
    prompt("复制这段传播文案", text);
  }
}

function clearCurrent() {
  const app = activeApp();
  if (!confirm(`确认清空「${app.name}」的全部记录？`)) return;
  saveRecords([]);
  render();
}

function seedIfEmpty() {
  apps.forEach(app => {
    if (loadRecords(app.id).length) return;
    const sample = Object.fromEntries(app.fields.map(([key, label, type, extra]) => {
      if (type === "date") return [key, today()];
      if (type === "time") return [key, "22:30"];
      if (type === "select") return [key, extra[0]];
      if (type === "number") return [key, key.includes("hour") || key.includes("sleep") ? "6" : "3"];
      return [key, label + "样例"];
    }));
    saveRecords([{ id: uid(), ...sample, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }], app.id);
  });
}

function render() {
  const app = activeApp();
  const records = loadRecords();
  els.appTitle.textContent = app.name;
  els.appDesc.textContent = app.desc;
  renderNav();
  renderForm();
  const insight = renderInsight(records);
  renderMetrics(records, insight);
  renderRecords(records);
}

els.appSearch.addEventListener("input", renderNav);
els.recordSearch.addEventListener("input", () => renderRecords(loadRecords()));
els.exportBtn.addEventListener("click", exportData);
els.copyReportBtn.addEventListener("click", copyReport);
els.clearBtn.addEventListener("click", clearCurrent);

seedIfEmpty();
render();
