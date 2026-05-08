import { useEffect, useState } from "react";

function Setting() {
  const API_URL_DISTRICT3 =
    "https://script.google.com/macros/s/AKfycbx7F6orQ9zDvg-314xaXPQrOYzYqXgj2w_UK7NaJ6Dje2jff-TUg8sb9uRX__pOovT5MA/exec";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // TRUE = DISABLED
  // FALSE = ENABLED
  const [buttons, setButtons] = useState({
    AS: false,
    AT: false,
    AU: false,
    AV: false,
  });

  // =========================
  // LOAD SETTINGS
  // =========================
  async function loadSettings() {
    try {
      setLoading(true);

      const response = await fetch(
        API_URL_DISTRICT3 + "?settings=true"
      );

      const result = await response.json();

      if (result.status === "success") {
        setButtons({
          AS: Boolean(result.data.AS),
          AT: Boolean(result.data.AT),
          AU: Boolean(result.data.AU),
          AV: Boolean(result.data.AV),
        });
      }
    } catch (error) {
      console.error("LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // TOGGLE DISABLE
  // =========================
  async function toggleButton(column) {
    try {
      setSaving(true);

      // Toggle current value
      const newValue = !buttons[column];

      // Instant UI update
      setButtons((prev) => ({
        ...prev,
        [column]: newValue,
      }));

      // Save to Apps Script
      const response = await fetch(API_URL_DISTRICT3, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingUpdate: true,
          column: column,
          value: newValue,
        }),
      });

      const result = await response.json();

      // rollback if failed
      if (result.status !== "success") {
        setButtons((prev) => ({
          ...prev,
          [column]: !newValue,
        }));
      }
    } catch (error) {
      console.error("SAVE ERROR:", error);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const buttonStyle = {
    width: 240,
    height: 65,
    fontSize: 14,
    fontWeight: "bold",
    border: "none",
    borderRadius: 10,
    cursor: saving ? "wait" : "pointer",
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Loading Settings...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 400,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          width={260}
          height={80}
          alt="logo"
          style={{ margin: "0 auto" }}
        />

        <h2>BUTTON CONTROLLER</h2>

        <p>
          Click a button to enable or disable it
          from Menu.jsx
        </p>

        {/* MILING */}
        <button
          disabled={saving}
          style={{
            ...buttonStyle,
            backgroundColor: buttons.AS
              ? "gray"
              : "white",
          }}
          onClick={() => toggleButton("AS")}
        >
          DIST. II MILING
          <br />
          {buttons.AS
            ? "CURRENTLY DISABLED"
            : "CURRENTLY ENABLED"}
        </button>

        {/* HOLY SPIRIT */}
        <button
          disabled={saving}
          style={{
            ...buttonStyle,
            backgroundColor: buttons.AT
              ? "gray"
              : "red",
            color: "white",
          }}
          onClick={() => toggleButton("AT")}
        >
          DIST. II H.SPIRIT
          <br />
          {buttons.AT
            ? "CURRENTLY DISABLED"
            : "CURRENTLY ENABLED"}
        </button>

        {/* DISTRICT III */}
        <button
          disabled={saving}
          style={{
            ...buttonStyle,
            backgroundColor: buttons.AU
              ? "gray"
              : "green",
            color: "white",
          }}
          onClick={() => toggleButton("AU")}
        >
          DISTRICT III
          <br />
          {buttons.AU
            ? "CURRENTLY DISABLED"
            : "CURRENTLY ENABLED"}
        </button>

        {/* DISTRICT IV */}
        <button
          disabled={saving}
          style={{
            ...buttonStyle,
            backgroundColor: buttons.AV
              ? "gray"
              : "orange",
          }}
          onClick={() => toggleButton("AV")}
        >
          DISTRICT IV
          <br />
          {buttons.AV
            ? "CURRENTLY DISABLED"
            : "CURRENTLY ENABLED"}
        </button>

        {saving && (
          <p style={{ color: "gray" }}>
            Saving changes...
          </p>
        )}
      </div>
    </div>
  );
}

export default Setting;