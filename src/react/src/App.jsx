// src/react/src/App.jsx
import React, { useEffect, useState } from "react";
import liff from "@line/liff";

// ▼ Viteは VITE_* だけが注入されます
const LIFF_ID = import.meta.env.VITE_LIFF_ID || 2008303223-rXdkgozK;

// --- helpers ---
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
  // --- state（重複宣言しないでこの1ブロックだけ） ---
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
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

        // init 後にだけ liff.* を触る
        setReady(true);
        setCaps({
          inClient: liff.isInClient(),
          canShare: liff.isApiAvailable("shareTargetPicker"),
        });

        if (liff.isLoggedIn()) {
          setLoggedIn(true);

          // トークン類
          const idt = liff.getIDToken() || "";
          const at = liff.getAccessToken() || "";
          setTokens({ idToken: idt, accessToken: at });
          setClaims(idt ? parseJwtSafe(idt) : null);

          await fetchProfile();
        }
      } catch (e) {
        console.error("LIFF init error:", e);
        setError("LIFFの初期化に失敗しました。LIFF IDと公開URLを確認してください。");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- actions ---
  const login = () => {
    try {
      if (!liff.isLoggedIn()) liff.login();
    } catch (e) {
      console.error(e);
      setError("ログインに失敗しました。");
    }
  };

  const logout = () => {
    try {
      if (liff.isLoggedIn()) {
        liff.logout();
        setLoggedIn(false);
        setProfile(null);
        setTokens({ idToken: "", accessToken: "" });
        setClaims(null);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      setError("ログアウトに失敗しました。");
    }
  };

  async function fetchProfile() {
    try {
      const p = await liff.getProfile();
      setProfile(p);
    } catch (e) {
      console.error(e);
      setError("プロフィール取得に失敗しました。");
    }
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
    if (!ready) return;
    try {
      const text = `本日のおみくじ：${omikuji?.title}\n${omikuji?.msg}`;
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
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,.8)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
          <strong>LINE Mini App Starter</strong>
          <span style={{ marginLeft: "auto", opacity: 0.7 }}>{ready ? "LIFF Ready" : "Initializing…"}</span>
          {loggedIn ? (
            <button onClick={logout} style={{ padding: "6px 10px", borderRadius: 8, background: "#0f172a", color: "#fff" }}>
              Logout
            </button>
          ) : (
            <button onClick={login} style={{ padding: "6px 10px", borderRadius: 8, background: "#16a34a", color: "#fff" }}>
              LINE Login
            </button>
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
              {profile.pictureUrl && (
                <img src={profile.pictureUrl} alt="icon" style={{ width: 48, height: 48, borderRadius: "50%" }} />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{profile.displayName}</div>
                {profile.statusMessage && (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{profile.statusMessage}</div>
                )}
                <div style={{ fontSize: 12, opacity: 0.7 }}>userId: {profile.userId}</div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, opacity: 0.7 }}>ログインすると表示されます</p>
          )}
        </section>

        {/* 2) おみくじ */}
        <section style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>2) おみくじ</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={drawOmikuji} style={{ padding: "8px 14px", borderRadius: 10, background: "#4f46e5", color: "#fff" }}>
              引く
            </button>
            {omikuji && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{omikuji.title}</div>
                <div style={{ opacity: 0.8 }}>{omikuji.msg}</div>
              </div>
            )}
          </div>
          {omikuji && (
            <div style={{ marginTop: 8 }}>
              <button onClick={shareOmikuji} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #94a3b8" }}>
                LINEでシェア
              </button>
            </div>
          )}
        </section>

        {/* 3) デバッグ */}
        <section style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>3) デバッグ</h2>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>LIFF_ID(first6): {String(LIFF_ID).slice(0, 6)}</pre>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>ready: {String(ready)}</pre>
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
