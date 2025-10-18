import React, { useEffect, useState } from "react";
import liff from "@line/liff";

// Viteは VITE_* だけ注入
const LIFF_ID = import.meta.env.VITE_LIFF_ID || "YOUR_LIFF_ID";

// utils
const mask = (s) => (s ? `${s.slice(0, 8)}…${s.slice(-6)}` : "");
function parseJwtSafe(t) {
  try {
    const base64 = t.split(".")[1];
    const padded = base64.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function App() {
  // --- state（このブロックだけに統一） ---
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false); // LIFF的にはログイン済みか（自動でtrueになることがある）
  const [loggedIn, setLoggedIn] = useState(false);     // ← ユーザーが「続ける/ログイン」押下でtrueにする（明示同意）
  const [profile, setProfile] = useState(null);
  const [omikuji, setOmikuji] = useState(null);
  const [error, setError] = useState("");
  const [caps, setCaps] = useState({ inClient: false, canShare: false });
  const [tokens, setTokens] = useState({ idToken: "", accessToken: "" });
  const [claims, setClaims] = useState(null);

  // --- init ---
  useEffect(() => {
    (async () => {
      try {
        console.log("LIFF init start:", LIFF_ID);
        await liff.init({ liffId: LIFF_ID });
        setReady(true);

        // init後にだけ触る
        const session = liff.isLoggedIn();
        setHasSession(session);
        setCaps({
          inClient: liff.isInClient(),
          canShare: liff.isApiAvailable("shareTargetPicker"),
        });

        // ここでは loggedIn を自動で true にしない！（明示操作待ち）
        // session が true なら「続ける」ボタンを表示して、押されたらプロフィール取得する運用にする
      } catch (e) {
        console.error("LIFF init error:", e);
        setError("LIFFの初期化に失敗しました。LIFF IDと公開URLを確認してください。");
      }
    })();
  }, []);

  // --- actions ---
  const proceedWithExistingSession = async () => {
    // 既存セッションを“明示的に許可”するボタン
    try {
      await afterLoginFlow();
    } catch (e) {
      console.error(e);
      setError("続行時にエラーが発生しました。");
    }
  };

  const startLogin = () => {
    try {
      // まだセッションがない場合のみリダイレクトログイン
      if (!hasSession) liff.login();
    } catch (e) {
      console.error(e);
      setError("ログインに失敗しました。");
    }
  };

  const logout = () => {
    try {
      if (hasSession) {
        liff.logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      // 画面状態を初期化（自動再ログインに見えないよう consent もリセット）
      setHasSession(false);
      setLoggedIn(false);
      setProfile(null);
      setTokens({ idToken: "", accessToken: "" });
      setClaims(null);
      setOmikuji(null);
      // 必要ならリロード（LINE内でセッションが残像になる場合に）
      // window.location.replace(window.location.origin + window.location.pathname);
    }
  };

  async function afterLoginFlow() {
    // 明示操作後にだけログイン完了扱いにして情報を取得
    const idt = liff.getIDToken() || "";
    const at = liff.getAccessToken() || "";
    setTokens({ idToken: idt, accessToken: at });
    setClaims(idt ? parseJwtSafe(idt) : null);

    const p = await liff.getProfile();
    setProfile(p);

    setHasSession(true);
    setLoggedIn(true);
  }

  function drawOmikuji() {
    const items = [
      { title: "大吉", msg: "今日は攻めてOK。新しい提案が刺さる日！" },
      { title: "中吉", msg: "コツコツが実を結ぶ。進捗共有を大切に。" },
      { title: "小吉", msg: "小さな改善が大きな効果に。1つ改善しよう。" },
      { title: "末吉", msg: "焦らず整える。仕込みに最適。" },
      { title: "凶", msg: "無理は禁物。丁寧に確認してミス回避。" },
    ];
    const pick = items[Math.floor(Math.random() * items.length)];
    setOmikuji(pick);
  }

  async function shareOmikuji() {
    if (!ready || !loggedIn || !omikuji) return;
    try {
      const text = `本日のおみくじ：${omikuji.title}\n${omikuji.msg}`;
      if (caps.canShare) {
        await liff.shareTargetPicker([{ type: "text", text }]);
      } else if (caps.inClient) {
        await liff.sendMessages([{ type: "text", text }]);
      } else {
        alert("ブラウザではシェア非対応のことがあります。LINEアプリ内で開いてください。");
      }
    } catch (e) {
      console.error(e);
      setError("シェアに失敗しました。");
    }
  }

  // --- UI ---
  const Btn = (props) => (
    <button
      {...props}
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        background: props.disabled ? "#94a3b8" : "#4f46e5",
        color: "#fff",
        border: "none",
        opacity: props.disabled ? 0.6 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...(props.style || {}),
      }}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <header
        style={{
          position: "sticky", top: 0, background: "rgba(255,255,255,.8)",
          backdropFilter: "blur(6px)", borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
          <strong>LINE Mini App Starter</strong>
          <span style={{ marginLeft: "auto", opacity: 0.7 }}>{ready ? "LIFF Ready" : "Initializing…"}</span>

          {/* 右上のアクション（状態に応じて） */}
          {!ready ? null : loggedIn ? (
            <Btn onClick={logout} style={{ background: "#0f172a" }}>Logout</Btn>
          ) : hasSession ? (
            // 既存セッションはあるが、明示操作待ち
            <>
              <Btn onClick={proceedWithExistingSession}>続ける</Btn>
              <Btn onClick={logout} style={{ background: "#0f172a" }}>Logout</Btn>
            </>
          ) : (
            <Btn onClick={startLogin} style={{ background: "#16a34a" }}>LINE Login</Btn>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
        {error && (
          <div style={{ padding: 12, borderRadius: 8, border: "1px solid #fecaca", color: "#b91c1c", background: "#fef2f2" }}>
            {error}
          </div>
        )}

        {/* 1) プロフィール */}
        <section style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>1) プロフィール</h2>
          {loggedIn && profile ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {profile.pictureUrl && <img src={profile.pictureUrl} alt="icon" style={{ width: 48, height: 48, borderRadius: "50%" }} />}
              <div>
                <div style={{ fontWeight: 600 }}>{profile.displayName}</div>
                {profile.statusMessage && <div style={{ fontSize: 12, opacity: 0.7 }}>{profile.statusMessage}</div>}
                <div style={{ fontSize: 12, opacity: 0.7 }}>userId: {profile.userId}</div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, opacity: 0.7 }}>
              {hasSession ? "「続ける」を押すとプロフィールを表示します" : "ログインすると表示されます"}
            </p>
          )}
        </section>

        {/* 2) おみくじ（ログイン完了まで無効化） */}
        <section style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>2) おみくじ</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Btn onClick={drawOmikuji} disabled={!loggedIn}>引く</Btn>
            {!loggedIn && <span style={{ fontSize: 12, opacity: 0.7 }}>※ ログイン後に引けます</span>}
            {omikuji && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{omikuji.title}</div>
                <div style={{ opacity: 0.8 }}>{omikuji.msg}</div>
              </div>
            )}
          </div>
          {omikuji && (
            <div style={{ marginTop: 8 }}>
              <Btn onClick={shareOmikuji} disabled={!loggedIn} style={{ background: "#334155" }}>
                LINEでシェア
              </Btn>
            </div>
          )}
        </section>

        {/* 3) デバッグ */}
        <section style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>3) デバッグ</h2>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>LIFF_ID(first6): {String(LIFF_ID).slice(0, 6)}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>ready: {String(ready)}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>hasSession(liff.isLoggedIn): {String(hasSession)}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>loggedIn(consent): {String(loggedIn)}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>inClient: {ready ? String(caps.inClient) : "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>api.shareTargetPicker: {ready ? String(caps.canShare) : "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>userId: {profile?.userId || "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>idToken: {tokens.idToken ? mask(tokens.idToken) : "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>accessToken: {tokens.accessToken ? mask(tokens.accessToken) : "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>claims.sub: {claims?.sub || "—"}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>claims.email: {claims?.email || "—"}</pre>
        </section>
      </main>
    </div>
  );
}
