import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



function JMCMenu() {
  console.log("JMC Report");

  // =========================
  // API URLS
  // =========================
const API_URL = "https://script.google.com/macros/s/AKfycbwyMl6M_Rkv-0fCwj0-N8YRYONY2TqP8-D4Qiazi_0_cYpu_RYb89ToVLPEEtoR71Pg/exec";

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

  function handleButtonClick(button) {
  navigate("/jmcForm", {
    state: {
      sheetName: button.sheetName,
    },
  });
}

  // =========================
  // LOAD SETTINGS
  // =========================
  async function loadSettings() {
    try {
      const res = await fetch(`${API_URL}?settings=true`);

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

  // =========================
  // BUTTON CONFIGURATION
  // =========================
  const JMC_BUTTONS = [
  {
    key: "AS",
    label: "BCRD",
    sheetName: "BCRD",
    image: "/jmc/bcrd.png",
  },
  {
    key: "AT",
    label: "CCESD",
    sheetName: "CCESD",
    image: "/jmc/ccesd.png",
  },
  {
    key: "AU",
    label: "GADC",
    sheetName: "GADC",
    image: "/jmc/gadc.png",
  },
  {
    key: "AV",
    label: "PESO",
    sheetName: "PESO",
    image: "/jmc/peso.png",
  },
  {
    key: "AW",
    label: "QCDRRMO",
    sheetName: "QCDRRMO",
    image: "/jmc/qcdrrmo.png",
  },
  {
    key: "AX",
    label: "QCG",
    sheetName: "QCG",
    image: "/jmc/qcg.png",
  },
  {
    key: "AY",
    label: "QCHD",
    sheetName: "QCHD",
    image: "/jmc/qchd.png",
  },
  {
    key: "AZ",
    label: "SSDD",
    sheetName: "SSDD",
    image: "/jmc/ssdd.png",
  },
  {
    key: "BA",
    label: "YDO",
    sheetName: "YDO",
    image: "/jmc/ydo.png",
  },
];

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
        {/*  <img
          src="/logo.png"
          width={260}
          height={80}
          style={{
            display: "block",
            marginBottom: "10px",
          }}
          alt="logo"
        />
        */}
         <h2>JOINT MEMORANDUM CIRCULAR TOOL</h2>
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
        {/* Title */}
        <h2>JOINT MEMORANDUM CIRCULAR TOOL</h2>

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

        {/* Dynamic Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            width: "100%",
          }}
        >
     {JMC_BUTTONS.map((button) => {
  const isDisabled = !!disabledButtons[button.key];

  return (
    <button
      key={button.key}
      disabled={isDisabled}
      style={{
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "scale(1.08)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onClick={() => handleButtonClick(button)}
    >
      <img
        src={button.image}
        alt={button.label}
        style={{
          width: 130,
          height: 130,
          objectFit: "contain",
        }}
      />
    </button>
  );
})}
        </div>
      </div>
    </div>
  );
}

export default JMCMenu;