import { useNavigate } from "react-router-dom";

function Menu() {
  const API_URL_MILING =
    "https://script.google.com/macros/s/AKfycbz18QOGPgVMXpwpVDeEwrNlJJeHpsVJTJjj8DpA4UDo4XSEsaVSunqIcPSPSlldjWwNcw/exec";

  const API_URL_DISTRICT4 =
    "https://script.google.com/macros/s/AKfycbyjHGpyAaeBVmV1Kd9AUJX4WULiqaDY05HWph6e97zFGyn64gqqkd7ra77IUX2w-BXW/exec";

  const API_URL_DISTRICT3 =
    "https://script.google.com/macros/s/AKfycbw27WsSfSa1I61vxeScMoejyWLm6CY2QaoFImfjylGyHDgHEwEOaXUujDGWgTSdtzHG/exec";

  const API_URL_HOLYSPIRIT =
    "https://script.google.com/macros/s/AKfycbwmfBWJ44qYo3iAuw73TqQT02USgsytuNJ3VrIi1ddoY0xfgcy35UU9ICaXV4Nc14k40A/exec";

  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {/* Logo */}
        <img
          src="/logo.png"
          width={260}
          height={80}
          style={{
            display: "block",
            marginBottom: "10px",
          }}
          alt="logo"
        />

        {/* Title */}
        <h2>
          CASELOAD ANALYSIS, MONITORING, OPERATION REVIEW (CLAMOR)
        </h2>

        {/* Arrow + Text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <h2>↓</h2>
          <p>Please click or tap your destination.</p>
        </div>

        <br />

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap", // allows wrapping on small screens
            gap: 10,
            width: "100%",
          }}
        >
          <button
            style={{
              width: 130,
              height: 50,
            }}
            onClick={() =>
              navigate("/form", {
                state: {
                  API_URL: API_URL_MILING,
                  district: "DIST. II MILING",
                },
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
                  district: "DIST. II H.SPIRIT",
                },
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
                  district: "DISTRICT III",
                },
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
                  API_URL: API_URL_DISTRICT4,
                  district: "DISTRICT IV",
                },
              })
            }
          >
            DISTRICT IV
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;