import { useNavigate } from "react-router-dom"

function Menu() {
  const API_URL_DISTRICT3 =
    "https://script.google.com/macros/s/AKfycbw27WsSfSa1I61vxeScMoejyWLm6CY2QaoFImfjylGyHDgHEwEOaXUujDGWgTSdtzHG/exec";
  
  const API_URL_HOLYSPIRIT = "https://script.google.com/macros/s/AKfycbwmfBWJ44qYo3iAuw73TqQT02USgsytuNJ3VrIi1ddoY0xfgcy35UU9ICaXV4Nc14k40A/exec";
  const navigate = useNavigate();

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

       <button
  style={{
    width: 130,
    height: 50,
  }}
  onClick={() =>
    navigate("/form", {
      state: {
        API_URL:
          "https://script.google.com/macros/s/AKfycbw_miling_url/exec",
          district: "DIST. II MILING"
      }
    })
  }
>
  DIST. II MILING
</button>


<button
  style={{
    backgroundColor: "red",
    width: 130,
    height: 50,
  }}
  onClick={() =>
    navigate("/form", {
      state: {
        API_URL: API_URL_HOLYSPIRIT,
        district: " DIST. II H.SPIRIT"
      }
    })
  }
>
  DIST. II H.SPIRIT
</button>


<button
  style={{
    backgroundColor: "green",
    width: 130,
    height: 50,
  }}
  onClick={() =>
    navigate("/form", {
      state: {
        API_URL: API_URL_DISTRICT3,
        district: "DISTRICT III"
      }
    })
  }
>
  DISTRICT III
</button>


<button
  style={{
    backgroundColor: "orange",
    width: 130,
    height: 50,
  }}
  onClick={() =>
    navigate("/form", {
      state: {
        API_URL:
          "https://script.google.com/macros/s/AKfycbw_district4_url/exec",
          district: "DISTRICT IV"
      }
    })
  }
>
  DISTRICT IV
</button>
        </div>
      </div>
    </div>
  )
}

export default Menu