import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"

export default function Form() {

  const location = useLocation();
  const navigate = useNavigate();


const isDistrictDisabled =
  location.state?.isDisabled ??
  sessionStorage.getItem("isDisabled") === "true";

// Get API from navigation OR storage
const API_URL =
  location.state?.API_URL ||
  sessionStorage.getItem("API_URL") ||
  "";

// Save API if coming from menu
if (location.state?.API_URL) {
  sessionStorage.setItem(
    "API_URL",
    location.state.API_URL
  );
}



const district =
  location.state?.district ||
  sessionStorage.getItem("district") ||
  "";

if (location.state?.district) {
  sessionStorage.setItem(
    "district",
    location.state.district
  );
}

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [zoom, setZoom] = useState(1);

  if (!API_URL) {
  return (
    <div style={{ padding: 20 }}>
      ❌ No district selected.<br />
      Please return to Menu.
    </div>
  );
}



  // CHECKBOX RULES (must match GAS)

  const checkboxMap = {
    Q: ["R"],
    S: ["T"],
    U: ["V"],
    W: ["X", "Y"],
    Z: ["AA"],
   
    //CASE FOLDER
    AM: ["AN"],
    AO: ["AP"],
    AU: ["AV"],
    AY: ["AZ"],
    BA: ["BB", "BC"],
    BD: ["BE", "BF"],
    BJ: ["BK"],
    
  };


// LABEL MAPS (from old HTML)


const checkboxLabels = {
  // BDM
  Q: "PYCIS ID",
  S: "SOLO PARENT",
  U: "SENIOR ID",
  W: "PWD",
  Z: "QC ID",
  AB: "OFW",

  // CASE FOLDER
  AK: "GIS",
  AL: "FRVA",
  AM: "SCSR",
  AO: "FIP",
  AQ: "FIP.1 HEALTH",
  AR: "FIP.2 EDUC",
  AS: "FIP.3 EMPLOYMENT",
  AT: "FIP.4 LIVELIHOOD",
  AU: "FIP: OTHERS",
  AW: "CSR",
  AX: "HTP",
  AY: "TALAAN NG PAGBABAGO",
  BA: "PINALAKAS FDS PACKAGE",
  BD: "PTEMS",
  BG: "TALAARAWAN",
  BH: "EDUC REC",
  BI: "IDS",
  BJ: "FAMILY REC",

  // EXIT
  BL: "TAF",
  BM: "PUGAY TOPIC",
  BN: "KATIBAYAN",
  BO: "SOI"
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
  AN: "SCSR LINK",
  AP: "FIP LINK",
  AV: "Specific Needs",
  AW: "CSR",
  AX: "HTP",
  AZ: "TALAAN DATE",
  BB: "PINALAKAS FDS PACKAGE LINK",
  BC: "PINALAKAS DATE",
  BE: "PTEMS LINK",
  BF: "PTEMS DATE",
  BK: "HOUSEHOLD FOLDER LINK",


  // CASE MANAGEMENT
  AC: "SWDI LOWB 2025",
  AD: "SWDI 2025 SCORE",
  AE: "2025 NATURAL ATTRITION",
  AF: "SWDI LOWB 2026",
  AG: "SWDI 2026 SCORE",
  AH: "2026 NATURAL ATTRITION",
  AI: "CANDIDACY STATUS",
  AJ: "TARGET FOR PUGAY SA TAGUMPAY"
};

const bdmFields = ["Q", "S", "U", "W", "Z", "AB"];
const caseFolderFields = [
  // Core checkbox-driven fields (from checkboxMap)
  "AM",
  "AO",
  "AU",
  "AW",
  "AX",
  "AY",
  "BA",
  "BD",
  "BJ",

  // Standalone / text-linked / extra fields
  "AK",
  "AL",
  "AQ",
  "AR",
  "AS",
  "AT",
  "BG",
  "BH",
  "BI"
];
const exitFields = ["BL", "BM", "BN", "BO"];
const caseManagementFields = ["AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ"];



  // INPUT HANDLER

  function handleChange(e) {

  const { id, type, checked, value } = e.target;

  setFormData(prev => {

    let updated = {
      ...prev,
      [id]: type === "checkbox" ? checked : value
    };

    // If checkbox unchecked — clear linked fields
    if (type === "checkbox" && !checked) {

      const targets = checkboxMap[id];

      if (targets) {
        targets.forEach(t => {
          updated[t] = ""; // force clear
        });
      }

    }

    return updated;

  });

}

  // SAFE CHECKBOX CHECKER

  function isChecked(value) {
    return value === true || value === "TRUE" || value === 1 || value === "1";
  }


  // FIELD VISIBILITY

function isVisible(field) {
  for (const [chk, targets] of Object.entries(checkboxMap)) {
    if (targets.includes(field)) {
      const val = formData[chk];
      return val === true || val === "TRUE" || val === "true" || val === 1 || val === "1";
    }
  }
  return true;
}


  // UI CONTROLS

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
  


  // SUBMIT (FIXED FOR GAS)

 async function submitForm() {
   if (isDistrictDisabled) {
    setMessage("⛔ This form is disabled from Menu");
    return;
  }
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

  
    // AUTO-REFETCH AFTER SAVE
  
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


  // SCAN (FIXED RESPONSE HANDLING)

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
        setLoading(false);
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


// PROGRESS CALCULATION
// =========================

function calculateProgress() {

const checkboxFields = [
  "Q","S","U","W","Z","AB",

  "AL","AO","AQ","AR",

  "AT","AY","BD",

  "BG","BH","BI","BJ", "BL", "BM", "BN", "BO",

  // City Link Table
  "BR","BS","BT",
  "BU","BV","BW",
  "BX","BY","BZ",
  "CA","CB","CC",
  "CD","CE","CF",
  "CG","CH","CI"
];

const textFields = [
  "R","T","V","X","Y","AA", "AH","AI","AJ",

  "AN","AP","AV","AW","AX","AZ",

  "BB","BC","BE","BF","BK",

  "AC","AD","AE","AF","AG",

  "AK","AM","AU","BA","AS"
];

  let filled = 0;
  let total = 0;

  // Count checkboxes
  checkboxFields.forEach(id => {
    total++;
    if (isChecked(formData[id])) filled++;
  });

  // Count text inputs
  textFields.forEach(id => {

    // only count visible fields
    if (isVisible(id)) {

      total++;

      if (formData[id] && formData[id].toString().trim() !== "") {
        filled++;
      }

    }

  });

  const percent =
    total === 0 ? 0 : Math.round((filled / total) * 100);

  return percent;
}

const progress = calculateProgress();

const missingFields = getMissingFields();

const isSubmitDisabled =
  isDistrictDisabled || missingFields.length > 0;

function getMissingFields() {

  const missing = [];

  for (const [checkboxId, targets] of Object.entries(checkboxMap)) {

    const checked = isChecked(formData[checkboxId]);

    if (checked) {

      targets.forEach(textId => {

        if (isVisible(textId)) {

          const value = formData[textId];

          if (!value || value.toString().trim() === "") {

            missing.push(textLabels[textId] || textId);

          }

        }

      });

    }

  }

  return missing;

}


  // RENDER

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
      {isDistrictDisabled && (
  <div style={{ color: "red", fontWeight: "bold" }}>
    This district is currently disabled.
  </div>
)}

      {/* CONTROLS 
      <button onClick={zoomIn}>➕ Zoom</button>
      <button onClick={zoomOut}>➖ Zoom</button>
      */}
      <button onClick={() =>
    navigate("/")
  } style={{
        backgroundColor: "orange",
        textAlign: "center",
       
      }}>← Back to Menu</button>
      <div style={{
        display: "flex",
        justifyItems: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
        
<img src="/logo.png" width={260} height={80} style={{
  display: "block",
 
}}></img>
      <h3 style={{
 textAlign: "center",
 marginBottom: 5,

}}>CASELOAD ANALYSIS, MONITORING, OPERATION REVIEW (CLAMOR)</h3>
<h3 style={{
  color: "red",
}}>{district}</h3>
</div>

      <div style={{
      
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        justifyItems: "center",
        alignContent: "center"
      }}>
      <input
        placeholder="Enter ID"
        id="entryIdInput"
        value={formData.entryIdInput || ""}
        onChange={handleChange}
        
      />
      <button onClick={goToId}>Search ID</button>
      <button onClick={clearForm}>Clear</button>

      <span>{message}</span>
      </div>
      

{/* PROGRESS BAR */}


<div style={{
  background: "#e5e7eb",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 10,
  height: 22
}}>

  <div style={{
    width: `${progress}%`,
    background: progress === 100
      ? "#16a34a"
      : "#2563eb",
    height: "100%",
    transition: "width 0.3s ease"
  }} />

</div>

<div style={{
  fontWeight: "bold",
  marginTop: 4
}}>
  Form Completion: {progress}%
</div>

      {/* SCAN RESULT */}
      {scanResult && (
        <div style={{ background: "#e6f0ff", padding: 10, marginTop: 10 }}>
          <div>ID: {scanResult.id}</div>
          <div>Name: {scanResult.fullname}</div>
          <div>Case Folder: {scanResult.folders}%</div>
          <div>Pugay: {scanResult.pugay}%</div>
        </div>
      )}

      <br></br>

     <div className="top-sections">

  
  {/* BDM */}
  
  <div className="section-card">
    <h3>BENEFICIARY DATA MANAGEMENT (BDM)</h3>

   {bdmFields.map(id => (
  <div key={id} style={{ marginBottom: 10 }}>
    
    <label>
      <input
        type="checkbox"
        id={id}
        checked={isChecked(formData[id])}
        onChange={handleChange}
      />
      {checkboxLabels[id]}
    </label>

    {checkboxMap[id]?.map(textId => (
      isVisible(textId) && (
        <label key={textId} style={{ marginLeft: 20 }}>
          {textLabels[textId]}
          <input
            id={textId}
            value={formData[textId] || ""}
            onChange={handleChange}
          />
        </label>
      )
    ))}
  </div>
))}

  </div>


  
  {/* CASE FOLDER */}

<div className="section-card">
  <h3>CASE FOLDER</h3>

  {caseFolderFields.map(id => (

    <div key={id} style={{ marginBottom: 10 }}>

      {/* CHECKBOX */}
      <label style={{ display: "block" }}>
        <input
          type="checkbox"
          id={id}
          checked={isChecked(formData[id])}
          onChange={handleChange}
        />
        {checkboxLabels[id]}
      </label>

      {/* RELATED TEXT INPUTS */}
      {checkboxMap[id]?.map(textId => (

        isVisible(textId) && (

          <label
            key={textId}
            style={{
              display: "block",
              marginLeft: 20,
              marginTop: 4
            }}
          >

            {textLabels[textId]}

            <input
              id={textId}
              value={formData[textId] || ""}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                border: missingFields.includes(textLabels[textId])
    ? "2px solid red"
    : "1px solid #ccc"
              }}
            />

          </label>

        )

      ))}

    </div>
  ))}

  {/* NON-CHECKBOX TEXT FIELDS */}


</div>


  
  {/* CASE MANAGEMENT */}
  
  <div className="section-card" style={{
    display: "flex",
    flexDirection: "column"
  }}>
      <h3>CASE MANAGEMENT</h3>

      {caseManagementFields.map(id => (
         <label>
       {textLabels[id]}
        <input
          key={id}
         
          id={id}
          value={formData[id] || ""}
          onChange={handleChange}
          style={{ display: "block", marginBottom: 5 }}
        />
        </label>
      ))}
      
  </div>

   
  {/* EXIT GRAD */}
  
  <div className="section-card" style={{
    display: "flex",
    flexDirection: "column"
  }}>
 
   <h3>EXIT / GRADUATION</h3>

    {exitFields.map(id => (
      <label key={id}>
        <input
          type="checkbox"
          id={id}
          checked={isChecked(formData[id])}
          onChange={handleChange}
        />
        {checkboxLabels[id]}
      </label>
    ))}
    </div>

</div>

      
      {/* TABLE */}
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "white",
        marginTop: 30,
        borderRadius: 10,
        marginBottom: 10,
      }}>
        
     <h3 >COMPLIANCE MONITORING</h3>

<table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
  <thead>
    <tr>
      <th>Period</th>
      <th>Education</th>
      <th>Health</th>
      <th>FDS</th>
    </tr>
  </thead>

  <tbody>
    {[
      ["Period 1", "BR", "BS", "BT"],
      ["Period 2", "BU", "BV", "BW"],
      ["Period 3", "BX", "BY", "BZ"],
      ["Period 4", "CA", "CB", "CC"],
      ["Period 5", "CD", "CE", "CF"],
      ["Period 6", "CG", "CH", "CI"],
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
<br></br>

      </div>

      {/* SUBMIT */}
      <button
  onClick={submitForm}
  disabled={isSubmitDisabled}
  style={{
    background: isSubmitDisabled ? "#9ca3af" : "#16a34a",
    color: "white",
    cursor: isSubmitDisabled ? "not-allowed" : "pointer",
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    marginTop: 10
  }}
>
  Submit
</button>

{isSubmitDisabled && (

  <span style={{
    color: "red",
    marginLeft: 10,
    fontWeight: "bold"
  }}>

    Missing: {missingFields.join(", ")}

  </span>

)}
       <span>{message}</span>

     {loading && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(255,255,255,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: 9999
    }}
  >
    <div className="spinner" />
    <h3>Loading...</h3>
  </div>
)}

{loading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: "#3498db",
      animation: "loadingBar 1s linear infinite",
      zIndex: 9999
    }}
  >
    <style>
      {`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}
    </style>
  </div>
)}

    </div>
  );
}