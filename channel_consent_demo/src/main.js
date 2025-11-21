// デバッグログ表示
const logEl = document.getElementById("log");
function log(msg) {
  logEl.textContent += msg + "\n";
}

// LIFF 初期化
async function initLiff() {
  try {
    await liff.init({
      liffId: "YOUR_LIFF_ID"  // ← MINIアプリのチャネルIDに置き換え
    });

    log("LIFF init 完了");

    // openid は最初から取得済み（簡略化同意）
    const decoded = await liff.getDecodedIDToken();
    log("UID: " + decoded.sub);

    // profile 取得してみる（まだ profile に同意してない）
    try {
      const profile = await liff.getProfile();
      log("profile取得成功（最初から同意してる？）");
      log(JSON.stringify(profile, null, 2));
    } catch (e) {
      log("profile取得失敗（まだ profile 同意なし）");
    }

  } catch (e) {
    log("LIFF init 失敗: " + e);
  }
}

// requestAll を使って profile 同意を追加で取得
document.getElementById("btn-request").addEventListener("click", async () => {
  try {
    log("追加同意リクエスト開始...");
    const res = await liff.permission.requestAll();
    log("requestAll 結果：" + JSON.stringify(res));

    if (res.permissions?.profile === "granted") {
      const profile = await liff.getProfile();
      log("profile取得成功！");
      log(JSON.stringify(profile, null, 2));
    } else {
      log("profile 同意なし or 拒否");
    }

  } catch (err) {
    log("requestAll エラー：" + err);
  }
});

// 実行
initLiff();

