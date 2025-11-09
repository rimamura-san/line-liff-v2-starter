import React, { useEffect, useState } from "react";
import liff from "@line/liff";

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [cat, setCat] = useState(null);

  // 猫データ（特徴＋猫種）
  const features = [
    "太っちょの",
    "人なつこい",
    "おっとりした",
    "ちょっと気まぐれな",
    "食いしん坊な",
    "すばしっこい",
    "昼寝が大好きな",
  ];

  const breeds = [
    "スコティッシュフォールド",
    "シャム猫",
    "マンチカン",
    "アメリカンショートヘア",
    "ノルウェージャンフォレストキャット",
    "ベンガル",
    "三毛猫",
    "サバトラ",
    "茶トラ",
    "黒猫",
    "白猫",
  ];

  useEffect(() => {
    (async () => {
      try {
        await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
        setReady(true);
      } catch (e) {
        setError("LIFF init error: " + e);
      }
    })();
  }, []);

  // 占いボタン押下
  const draw = () => {
    const feature = features[Math.floor(Math.random() * features.length)];
    const breed = breeds[Math.floor(Math.random() * breeds.length)];
    setCat({ feature, breed });
  };

  // シェアボタン押下
  const share = async () => {
    if (!cat) return alert("まずは占ってにゃ🐾");
    try {
      if (liff.isApiAvailable("shareTargetPicker")) {
        await liff.shareTargetPicker([
          {
            type: "text",
            text: `🐈‍⬛ ラッキー猫占い 🐾\n今日のあなたのラッキー猫は…\n${cat.feature} ${cat.breed} だにゃ！✨\n#shareTargetPicker() テスト`,
          },
        ]);
      } else {
        alert("この環境では shareTargetPicker は使えにゃい。LINEアプリ内で開いて欲しいにょ。");
      }
    } catch (e) {
      setError("share failed: " + e);
    }
  };

  return (
    <main
      style={{
        padding: 16,
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#fff8f0",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#b45309" }}>🐾 ラッキー猫占い 🐾</h1>

      <p style={{ marginTop: 8, color: "#555" }}>
        このアプリは <strong>shareTargetPicker()</strong> の挙動をテストするためのデモです。
      </p>

      {ready ? (
        <>
          <button
            onClick={draw}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            占う！
          </button>

          {cat && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "white",
                borderRadius: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontSize: 20 }}>今日のラッキー猫は…</p>
              <h2 style={{ fontSize: 26, color: "#b45309" }}>
                {cat.feature} {cat.breed}
              </h2>
              <button
                onClick={share}
                style={{
                  marginTop: 16,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                shareTargetPicker() でシェアする 🐾
              </button>
            </div>
          )}
        </>
      ) : (
        <p>LIFF 初期化中…</p>
      )}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}

