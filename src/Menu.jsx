import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Menu() {
  // Proxy paths (dev server proxies these to the real Google Apps Script endpoints)
  const API_URL_MILING = "/api/miling";
  const API_URL_DISTRICT4 = "/api/district4";
  const API_URL_DISTRICT3 = "/api/district3";
  const API_URL_HOLYSPIRIT = "/api/holyspirit";

  const navigate = useNavigate();

  // =========================
  // BUTTON STATES
  // =========================
  const [disabledButtons, setDisabledButtons] = useState({
    AS: false,
    AT: false,
    AU: false,
    AV: false,
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD SETTINGS
  // =========================
  async function loadSettings() {
    try {
      const res = await fetch(
        API_URL_DISTRICT3 + "?settings=true"
      );

      const data = await res.json();

      if (data.status === "success") {
        setDisabledButtons(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
        <div className="spinner" />
       
      </div>
    );
  }

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
          CASELOAD ANALYSIS, MONITORING,
          OPERATION REVIEW (CLAMOR)
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
        {/* City Link Form quick access 
        <div style={{ marginTop: 20 }}>
          <button
            style={{ width: 200, height: 40, backgroundColor: "#4b5563", color: "white" }}
            onClick={() => {
              // Use district3 API by default for City Link entries
              sessionStorage.setItem("API_URL", API_URL_DISTRICT3);
              navigate("/citylink", { state: { API_URL: API_URL_DISTRICT3 } });
            }}
          >
            City Link Form
          </button>
        </div>
*/}
        <br />

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            width: "100%",
          }}
        >
       
        {/* DISTRICT II MILING */}
<div style={{ position: "relative" }}>
  {disabledButtons.AS && (
    <label
      style={{
        color: "gray",
        fontSize: 12,
        position: "absolute",
        top: 60,
        left: 0,
      }}
    >
      (Under Maintenance)
    </label>
  )}

  <button
    disabled={disabledButtons.AS}
    style={{
      width: 130,
      height: 50,
      cursor: disabledButtons.AS ? "not-allowed" : "pointer",
    }}
    onClick={() => {
      const isDisabled = !!disabledButtons.AS;

      // 🔥 persist immediately (IMPORTANT FIX)
      sessionStorage.setItem("isDisabled", isDisabled);
      sessionStorage.setItem("district", "DIST. II MILING");
      sessionStorage.setItem("API_URL", API_URL_MILING);

      navigate("/form", {
        state: {
          API_URL: API_URL_MILING,
          district: "DIST. II MILING",
          isDisabled,
        },
      });
    }}
  >
    DIST. II MILING
  </button>
</div>

          {/* HOLY SPIRIT */}
          <div style={{ position: "relative" }}>
  {disabledButtons.AT && (
    <label
      style={{
        color: "gray",
        fontSize: 12,
        position: "absolute",
        top: 60,
        left: 0,
      }}
    >
      (Under Maintenance)
    </label>
  )}

  <button
    disabled={disabledButtons.AT}
    style={{
      backgroundColor: "red",
      width: 130,
      height: 50,
      cursor: disabledButtons.AT
        ? "not-allowed"
        : "pointer",
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
</div>

          {/* DISTRICT III */}
          <div style={{ position: "relative" }}>
  {disabledButtons.AU && (
    <label
      style={{
        color: "gray",
        fontSize: 12,
        position: "absolute",
        top: 60,
        left: 0,
      }}
    >
      (Under Maintenance)
    </label>
  )}

  <button
    disabled={disabledButtons.AU}
    style={{
      backgroundColor: "green",
      width: 130,
      height: 50,
      cursor: disabledButtons.AU
        ? "not-allowed"
        : "pointer",
    }}
    onClick={() =>
      navigate("/form", {
        state: {
          API_URL: API_URL_DISTRICT3,
          district: "DISTRICT III",
          isDisabled: disabledButtons.AU,
        },
      })
    }
  >
    DISTRICT III
  </button>
</div>

          {/* DISTRICT IV */}
          <div style={{ position: "relative" }}>
  {disabledButtons.AV && (
    <label
      style={{
        color: "gray",
        fontSize: 12,
        position: "absolute",
        top: 60,
        left: 0,
      }}
    >
      (Under Maintenance)
    </label>
  )}

  <button
    disabled={disabledButtons.AV}
    style={{
      backgroundColor: "orange",
      width: 130,
      height: 50,
      cursor: disabledButtons.AV
        ? "not-allowed"
        : "pointer",
    }}
    onClick={() =>
      navigate("/form", {
        state: {
          API_URL: API_URL_DISTRICT4,
          district: "DISTRICT IV",
          isDisabled: disabledButtons.AV,
        },
      })
    }
  >
    DISTRICT IV
  </button>
</div>
        </div>
      </div>
    </div>
  );
}

export default Menu;