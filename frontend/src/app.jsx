function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7f6",
        color: "#0B3D2E",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          NER Sentinel AI
        </h1>

        <p style={{ color: "#64748b", fontSize: "18px" }}>
          Predicting Disruptions. Protecting Lifeline Logistics.
        </p>

        <p
          style={{
            marginTop: "25px",
            color: "#16a34a",
            fontWeight: "600",
          }}
        >
          System Initialization Successful ✓
        </p>
      </div>
    </div>
  );
}

export default App;