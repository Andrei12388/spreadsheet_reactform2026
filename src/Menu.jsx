import { useNavigate } from "react-router-dom"

function Menu() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh" // full screen height
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px"
        }}
      >
        <img src="/logo.png" width={260} height={80} style={{
  display: "block",
}}></img>
        <h2 style={{
          textAlign: "center"
        }}>CASELOAD ANALYSIS, MONITORING, OPERATION REVIEW (CLAMOR)</h2>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
        <h2>↓</h2><p>Please click or tap your destination.</p>
        </div>
        <br></br>
        <div style={{
          display: "flex",
          gap: 10,
        }}>

        <button style={{
          width: 130,
          height: 50,
        }} onClick={() => navigate("/form")}>
          DIST. II MILING
        </button>
        <button style={{
          backgroundColor: "red",
           width: 130,
          height: 50,
        }} onClick={() => navigate("/form")}>
          DIST. II H.SPIRIT
        </button>
        <button style={{
          backgroundColor: "green",
           width: 130,
          height: 50,
        }} onClick={() => navigate("/form")}>
          DISTRICT III
        </button>
        <button style={{
          backgroundColor: "orange",
           width: 130,
          height: 50,
        }} onClick={() => navigate("/form")}>
          DISTRICT IV
        </button>
        </div>
      </div>
    </div>
  )
}

export default Menu