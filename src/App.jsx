import { useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwkxaVGrRBLN1lEi6VB1giE_3vytql_qk-C_4b9703mWkVWU11z_mpOXycPMxe4xanVvw/exec";

export default function App() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [zoom, setZoom] = useState(1);

  // =========================
  // CHECKBOX RULES (must match GAS)
  // =========================
  const checkboxMap = {
    Q: ["R"],
    S: ["T"],
    U: ["V"],
    W: ["X", "Y"],
    Z: ["AA"],
    AJ: ["AK"],
    AL: ["AM"],
    AT: ["AU"],
    AV: ["AW", "AX"],
    AY: ["AZ", "BA"],
    BD: ["BE"],
    BG: ["BH"]
  };

  // =========================
// LABEL MAPS (from old HTML)
// =========================

const checkboxLabels = {
  // BDM
  Q: "PYCIS ID",
  S: "SOLO PARENT",
  U: "SENIOR ID",
  W: "PWD",
  Z: "QC ID",
  AB: "OFW",

  // CASE FOLDER
  AH: "GIS",
  AI: "FRVA",
  AJ: "SCSR",
  AL: "HIP",
  AN: "HIP.1 HEALTH",
  AO: "HIP.2 EDUC",
  AP: "HIP.3 EMPLOYMENT",
  AQ: "HIP.4 LIVELIHOOD",
  AR: "HIP: OTHERS",
  AT: "TALAAN NG PAGBABAGO",
  AV: "PINALAKAS FDS PACKAGE",
  AY: "PTEMS",
  BB: "TALAARAWAN",
  BC: "EDUC REC",
  BD: "IDS",
  BE: "FAM REC",

  // EXIT
  BG: "TAF",
  BH: "PUGAY TOPIC",
  BI: "KATIBAYAN",
  BJ: "SOI"
};

const textLabels = {
  // BDM
  R: "PYCIS ID Number",
  T: "Solo Parent Number",
  V: "Senior ID Number",
  X: "PWD Type",
  Y: "PWD ID Number",
  AA: "QC ID Number",

  // CASE FOLDER
  AK: "SCSR LINK",
  AM: "HIP LINK",
  AU: "DATE",
  AW: "PINALAKAS FDS PACKAGE LINK",
  AX: "DATE",
  AZ: "PTEMS LINK",
  BA: "DATE",

  AS: "Specific Needs",

  // CASE MANAGEMENT
  AC: "SWDI LOWB 2025",
  AD: "SWDI SCORE",
  AE: "NATURAL ATTRITION",
  AF: "MANDATORY EXIT",
  AG: "TARGET FOR PUGAY SA TAGUMPAY MAY 2026"
};


  // =========================
  // INPUT HANDLER
  // =========================
  function handleChange(e) {
    const { id, type, checked, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  }

  // =========================
  // SAFE CHECKBOX CHECKER
  // =========================
  function isChecked(value) {
    return value === true || value === "TRUE" || value === 1 || value === "1";
  }

  // =========================
  // FIELD VISIBILITY
  // =========================
function isVisible(field) {
  for (const [chk, targets] of Object.entries(checkboxMap)) {
    if (targets.includes(field)) {
      const val = formData[chk];
      return val === true || val === "TRUE" || val === "true" || val === 1 || val === "1";
    }
  }
  return true;
}

  // =========================
  // UI CONTROLS
  // =========================
  function zoomIn() {
    setZoom(z => z + 0.1);
  }

  function zoomOut() {
    setZoom(z => Math.max(0.7, z - 0.1));
  }

  function clearForm() {
    setFormData({});
    setScanResult(null);
    setMessage("");
  }
  

  // =========================
  // SUBMIT (FIXED FOR GAS)
  // =========================
 async function submitForm() {
  setLoading(true);

  try {
    const params = new URLSearchParams();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    const res = await fetch(API_URL, {
      method: "POST",
      body: params
    });

    const result = await res.json();

    if (result.status !== "success") {
      setMessage("❌ Failed");
      setLoading(false);
      return;
    }

    setMessage("✅ Submitted!");

    // =========================
    // AUTO-REFETCH AFTER SAVE
    // =========================
    const id = formData.entryIdInput;

    if (id) {
      const res2 = await fetch(`${API_URL}?id=${id}`);
      const result2 = await res2.json();

      if (result2.status === "FOUND") {
        const entry = result2.data;

        setFormData(prev => ({
          ...prev,
          ...entry
        }));

        setScanResult(entry);
        setMessage("✅ Saved & Refreshed");
      }
    }

  } catch (err) {
    console.error(err);
    setMessage("❌ Error submitting");
  }

  setLoading(false);
}

  // =========================
  // SCAN (FIXED RESPONSE HANDLING)
  // =========================
  async function goToId() {
    const id = formData.entryIdInput;
    if (!id) return setMessage("❗ Enter ID");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}?id=${id}`);
      const result = await res.json();

      if (result.status !== "FOUND") {
        setMessage("❌ Not Found");
        setScanResult(null);
        return;
      }

      // backend now returns OBJECT (not array)
      const entry = result.data;

      setFormData(prev => ({
        ...prev,
        ...entry
      }));

      setScanResult(entry);
      setMessage("✅ Found");
    } catch (err) {
      console.error(err);
      setMessage("❌ Scan error");
    }

    setLoading(false);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
        width: "100vw",
        maxWidth: "100%",
        overflowX: "hidden",
        padding: 15,
        fontFamily: "Arial",
        boxSizing: "border-box",
        background: "lightblue"
      }}
    >
      {/* CONTROLS */}
      <button onClick={zoomIn}>➕ Zoom</button>
      <button onClick={zoomOut}>➖ Zoom</button>

      <h3>Check Form City Link</h3>

      <input
        placeholder="Enter ID"
        id="entryIdInput"
        value={formData.entryIdInput || ""}
        onChange={handleChange}
      />
      <button onClick={goToId}>Search ID</button>
      <button onClick={clearForm}>Clear</button>

      <span>{message}</span>

      {/* SCAN RESULT */}
      {scanResult && (
        <div style={{ background: "#e6f0ff", padding: 10, marginTop: 10 }}>
          <div>ID: {scanResult.id}</div>
          <div>Name: {scanResult.fullname}</div>
          <div>Folders: {scanResult.folders}%</div>
          <div>Pugay: {scanResult.pugay}%</div>
        </div>
      )}

      {/* ========================= */}
      {/* BDM */}
      {/* ========================= */}
      <h3>BENEFICIARY DATA MANAGEMENT (BDM)</h3>

     {["Q", "S", "U", "W", "Z", "AB"].map(id => (
  <label key={id} style={{ display: "block" }}>
    <input
      type="checkbox"
      id={id}
      checked={isChecked(formData[id])}
      onChange={handleChange}
    />
    {id}: {checkboxLabels[id]}
  </label>
))}

      {isVisible("R") && (
        <label>
  {textLabels["R"]}
  <input
    id="R"
    placeholder="R"
    value={formData.R || ""}
    onChange={handleChange}
  />
</label>
      )}

      {isVisible("T") && (
         <label>
  {textLabels["T"]}
        <input
          placeholder="T"
          id="T"
          value={formData.T || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("V") && (
         <label>
  {textLabels["V"]}
        <input
          placeholder="V"
          id="V"
          value={formData.V || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("X") && (
         <label>
  {textLabels["X"]}
        <input
          placeholder="X"
          id="X"
          value={formData.X || ""}
          onChange={handleChange}
        />
        </label>
      )}

       {isVisible("Y") && (
         <label>
  {textLabels["Y"]}
        <input
          placeholder="Y"
          id="Y"
          value={formData.Y || ""}
          onChange={handleChange}
        />
        </label>
      )}

       {isVisible("AA") && (
         <label>
  {textLabels["AA"]}
        <input
          placeholder="AA"
          id="AA"
          value={formData.AA || ""}
          onChange={handleChange}
        />
        </label>
      )}

       

      {/* ========================= */}
      {/* CASE FOLDER */}
      {/* ========================= */}
      <h3>CASE FOLDER</h3>

      {["AH", "AI", "AJ", "AL", "AN", "AO", "AP", "AQ", "AR", "AT", "AV", "AY", "BB", "BC", "BD", "BE"].map(id => (
        <label key={id} style={{ display: "block" }}>
          <input
            type="checkbox"
            id={id}
            checked={isChecked(formData[id])}
            onChange={handleChange}
          />
          {id}: {checkboxLabels[id]}
        </label>
      ))}

      

       {isVisible("AK") && (
         <label>
  {textLabels["AK"]}
        <input
          placeholder="AK"
          id="AK"
          value={formData.AK || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("AM") && (
         <label>
  {textLabels["AM"]}
        <input
          placeholder="AM"
          id="AM"
          value={formData.AM || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("AU") && (
         <label>
  {textLabels["AU"]}
        <input
          placeholder="AU"
          id="AU"
          value={formData.AU || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("AW") && (
         <label>
  {textLabels["AW"]}
        <input
          placeholder="AW"
          id="AW"
          value={formData.AW || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("AX") && (
         <label>
  {textLabels["AX"]}
        <input
          placeholder="AX"
          id="AX"
          value={formData.AX || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("AZ") && (
         <label>
  {textLabels["AZ"]}
        <input
          placeholder="AZ"
          id="AZ"
          value={formData.AZ || ""}
          onChange={handleChange}
        />
        </label>
      )}

      {isVisible("BA") && (
         <label>
  {textLabels["BA"]}
        <input
          placeholder="BA"
          id="BA"
          value={formData.BA || ""}
          onChange={handleChange}
        />
        </label>
      )}
       <label>
   {textLabels["AS"]}
      <input
        placeholder="Specific Needs"
        id="AS"
        value={formData.AS || ""}
        onChange={handleChange}
      />
      </label>

      {/* ========================= */}
      {/* EXIT */}
      {/* ========================= */}
      <h3>EXIT / GRADUATION</h3>

      {["BG", "BH", "BI", "BJ"].map(id => (
        <label key={id}>
          <input
            type="checkbox"
            id={id}
            checked={isChecked(formData[id])}
            onChange={handleChange}
          />
           {id}: {checkboxLabels[id]}
        </label>
      ))}

      {/* ========================= */}
      {/* CASE MANAGEMENT */}
      {/* ========================= */}
      <h3>CASE MANAGEMENT</h3>

      {["AC", "AD", "AE", "AF", "AG"].map(id => (
         <label>
       {textLabels[id]}
        <input
          key={id}
          placeholder={id}
          id={id}
          value={formData[id] || ""}
          onChange={handleChange}
          style={{ display: "block", marginBottom: 5 }}
        />
        </label>
      ))}

      {/* ========================= */}
      {/* TABLE */}
      {/* ========================= */}
     <h3>CITY LINK COMPLIANCE</h3>

<table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
  <thead>
    <tr>
      <th>Period</th>
      <th>Educ</th>
      <th>Health</th>
      <th>FDS</th>
    </tr>
  </thead>

  <tbody>
    {[
      ["Period 1", "BM", "BN", "BO"],
      ["Period 2", "BP", "BQ", "BR"],
      ["May", "BS", "BT", "BU"],
      ["June", "BV", "BW", "BX"],
      ["July", "BY", "BZ", "CA"],
      ["August", "CB", "CC", "CD"],
      ["September", "CE", "CF", "CG"]
    ].map(([label, a, b, c]) => (
      <tr key={label}>
        <td>{label}</td>

        {[a, b, c].map(id => (
          <td key={id}>
            <input
              type="checkbox"
              id={id}
              checked={isChecked(formData[id])}
              onChange={handleChange}
            />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>

      {/* SUBMIT */}
      <button onClick={submitForm}>Submit</button>
       <span>{message}</span>

      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(255,255,255,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          Loading...
        </div>
      )}
    </div>
  );
}