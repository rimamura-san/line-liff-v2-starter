cat > main.js << 'EOF'
// デバッグ表示
const logEl = document.getElementById("log");
function log(msg) {
  logEl.textContent += "\\n" + msg;
}

// 挨拶表示
function greet(name) {
  document.getElementById("greet").textContent = `${name} さん、こんにちは！`;
}

async function initLiff() {
  try {
    await liff.init({
      liffId: "2008493036-jGpNZplP"
    });

    log("LIFF init 完了");

    try {
      await liff.getProfile();
      log("profile取得成功（最初から同意済み？）");
    } catch {
      log("profile取得失敗（まだ profile 同意なし）");
    }

  } catch (e) {
    log("LIFF init エラー：" + e);
  }
}

document.getElementById("btn-request").addEventListener("click", async () => {
  log("追加同意リクエスト開始…");
  try {
    const res = await liff.permission.requestAll();
    log("requestAll 結果：" + JSON.stringify(res));

    if (res.permissions?.profile === "granted") {
      const profile = await liff.getProfile();
      log("profile取得成功！");
      greet(profile.displayName);
    } else {
      log("profile 同意なし or 拒否");
    }
  } catch (err) {
    log("requestAll エラー：" + err);
  }
});

initLiff();
EOF

