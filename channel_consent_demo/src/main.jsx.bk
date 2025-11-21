// src/main.js

const logEl = document.getElementById("log");
function log(msg) {
  logEl.textContent += msg + "\n";
}

async function initLiff() {
  try {
    await liff.init({
      liffId: "2008493036-jGpNZplP"  // ← MINIアプリチャネルID
    });
    log("LIFF init 完了");

    // openid 同意済み → uid は取得可能
    const decoded = await liff.getDecodedIDToken();
    log("UID: " + decoded.sub);

    // profile 取れるかチェック
    try {
      const profile = await liff.getProfile();
      log("profile取得成功（初回ですでに同意済み？）");
      log(JSON.stringify(profile, null, 2));
    } catch (err) {
      log("profile取得失敗（まだ profile 同意なし）");
      log("→ 下のボタンを押して追加同意へ");
    }
  } catch (err) {
    log("LIFF init エラー: " + err);
  }
}

document.getElementById("btn-request").addEventListener("click", async () => {
  try {
    log("追加同意リクエスト開始...");
    const res = await liff.permission.requestAll();

    log("requestAll 結果:");
    log(JSON.stringify(res, null, 2));

    if (res.permissions?.profile === "granted") {
      log("profile 同意OK → プロフィール取得します...");
      const profile = await liff.getProfile();
      log(JSON.stringify(profile, null, 2));
    } else {
      log("ユーザーが拒否 or profile 同意が得られず");
    }
  } catch (err) {
    log("requestAll エラー: " + err);
  }
});

initLiff();

