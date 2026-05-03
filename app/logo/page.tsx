"use client"

export default function LogoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 760, width: "100%", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>
          ÉTS Hub — Logo
        </h1>
        <p style={{ margin: "10px 0 18px", opacity: 0.8 }}>
          Fichier: <code>/public/logo.png</code>
        </p>

        <div
          style={{
            background: "#000",
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <img
            src="/logo.png"
            alt="ÉTS Hub logo"
            style={{
              width: "min(520px, 100%)",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>

        <p style={{ margin: "18px 0 0", opacity: 0.8 }}>
          Téléchargement direct:{" "}
          <a href="/logo.png" download>
            logo.png
          </a>
        </p>
      </div>
    </main>
  )
}

