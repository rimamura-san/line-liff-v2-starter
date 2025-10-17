import React, { useEffect, useState } from "react";
// npm i @line/liff
import liff from "@line/liff";

/**
 * LINE Mini App / LIFF スターター（ログイン + プロフィール + おみくじ + シェア）
 * -------------------------------------------------------------
 * 使い方（Netlify/Vite/NextでもOK）
 * 1) LINE Developersでチャネルを作成 → LIFFアプリを追加し、LIFF IDを取得
 * 2) Netlifyの環境変数に LIFF_ID を設定（例：VITE_LIFF_ID または NEXT_PUBLIC_LIFF_ID）
 * 3) サイトの公開URLをLIFFのエンドポイントURLに設定
 * 4) デプロイ
 */

const LIFF_ID = import.meta?.env?.VITE_LIFF_ID || process.env.NEXT_PUBLIC_LIFF_ID || "YOUR_LIFF_ID";

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [omikuji, setOmikuji] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        setReady(true);
        if (liff.isLoggedIn()) {
          setLoggedIn(true);
          await fetchProfile();
        }
      } catch (e) {
        console.error(e);
        setError("LIFFの初期化に失敗しました。LIFF IDと公開URLを確認してください。");
      }
    })();
  }, []);

  const login = () => {
    if (!liff.isLoggedIn()) liff.login();
  };

  const logout = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
      setLoggedIn(false);
      setProfile(null);
    }
  };

  async function fetchProfile() {
    try {
      const p = await liff.getProfile();
      setProfile(p);
    } catch (e) {
      console.error(e);
      setError("プロフィール取得に失敗しました");
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
    try {
      if (liff.isApiAvailable("shareTargetPicker")) {
        await liff.shareTargetPicker([
          { type: "text", text: `本日のおみくじ：${omikuji?.title}\n${omikuji?.msg}` },
        ]);
      } else if (liff.isInClient()) {
        await liff.sendMessages([
          { type: "text", text: `本日のおみくじ：${omikuji?.title}\n${omikuji?.msg}` },
        ]);
      } else {
        alert("ブラウザではシェア非対応のことがあります。LINE内で開いてください。");
      }
    } catch (e) {
      console.error(e);
      setError("シェアに失敗しました");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 border-b border-stone-200/60 backdrop-blur bg-white/70">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">LINE Mini App Starter</div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            {ready ? <span className="opacity-70">LIFF Ready</span> : <span>Initializing…</span>}
            {loggedIn ? (
              <button onClick={logout} className="px-3 py-1 rounded bg-stone-800 text-white">Logout</button>
            ) : (
              <button onClick={login} className="px-3 py-1 rounded bg-green-600 text-white">LINE Login</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 grid gap-6">
        {error && (
          <div className="p-3 rounded border border-red-200 text-red-700 bg-red-50">{error}</div>
        )}

        <section className="p-4 rounded-2xl border bg-white">
          <h2 className="font-semibold mb-3">1) プロフィール</h2>
          {loggedIn && profile ? (
            <div className="flex items-center gap-3">
              <img src={profile.pictureUrl} alt="icon" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-medium">{profile.displayName}</div>
                {profile.statusMessage && (
                  <div className="text-sm opacity-70">{profile.statusMessage}</div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm opacity-70">ログインすると表示されます</p>
          )}
        </section>

        <section className="p-4 rounded-2xl border bg-white">
          <h2 className="font-semibold mb-3">2) おみくじ</h2>
          <div className="flex items-center gap-3">
            <button onClick={drawOmikuji} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">引く</button>
            {omikuji && (
              <div>
                <div className="text-lg font-bold">{omikuji.title}</div>
                <div className="opacity-80">{omikuji.msg}</div>
              </div>
            )}
          </div>
          {omikuji && (
            <div className="mt-3">
              <button onClick={shareOmikuji} className="px-3 py-2 rounded-xl border">LINEでシェア</button>
            </div>
          )}
        </section>

        <section className="p-4 rounded-2xl border bg-white">
          <h2 className="font-semibold mb-2">3) デバッグ</h2>
          <pre className="text-xs whitespace-pre-wrap opacity-70">LIFF_ID: {LIFF_ID}</pre>
          <pre className="text-xs whitespace-pre-wrap opacity-70">inClient: {String(liff.isInClient?.() || false)}</pre>
          <pre className="text-xs whitespace-pre-wrap opacity-70">api.shareTargetPicker: {String(liff.isApiAvailable?.("shareTargetPicker") || false)}</pre>
        </section>
      </main>
    </div>
  );
}
