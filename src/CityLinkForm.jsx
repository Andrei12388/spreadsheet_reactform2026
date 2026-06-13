import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CityLinkForm() {
  const navigate = useNavigate();

  const API_URL =
    "https://script.google.com/macros/s/AKfycbysXQn2HtAnUpqKEjU2l-2XhYqZxdrIk2J1o0YwsQQPlcFQdQhoC7uISMLfTpV_JmU3Cg/exec";

  const [formData, setFormData] = useState({
    HHID: "",
    HH_GRANTEE: "",
    CITY_LINK: "",
    OVERALL_GOAL: "",
    SPE_OBJ: "",
    SPE_ACT: "",
    RES_PER: "",
    TF: "",
    EXP_RES: "",
    REMARKS: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!API_URL) return setMessage("No API URL configured");

    if (!formData.HHID) return setMessage("HHID is required");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify({
          action: "add",
          data: formData
        })
      });

      const result = await res.json();
      if (result.status === "success") {
        setMessage("Submitted successfully");
        setFormData({
          HHID: "",
          HH_GRANTEE: "",
          CITY_LINK: "",
          OVERALL_GOAL: "",
          SPE_OBJ: "",
          SPE_ACT: "",
          RES_PER: "",
          TF: "",
          EXP_RES: "",
          REMARKS: "",
        });
      } else {
        setMessage(result.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network or server error");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
       {/*  <button onClick={() => navigate(-1)}>← Back</button> */}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
<img src="/logo.png" width={260} height={80} style={{
  display: "block",
 
}}></img>
      <h2>FAMILY INTERVENTION PLAN FORM</h2>
      </div>
      

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
          <div>
            <label>House Hold ID *</label>
            <input 
              name="HHID" 
              value={formData.HHID} 
              onChange={handleChange} 
              required
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>House Hold Grantee</label>
            <input 
              name="HH_GRANTEE" 
              value={formData.HH_GRANTEE} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
   
          <div>
            <label>City Link Name</label>
            <input 
              name="CITY_LINK" 
              value={formData.CITY_LINK} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
            <br></br>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>OVERALL GOAL</label> 
            <textarea 
              name="OVERALL_GOAL" 
              value={formData.OVERALL_GOAL} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4, minHeight: 80 }}
            />
          </div>

          <div>
            <label>SPECIFIC OBJECTIVE</label>
            <select 
              name="SPE_OBJ" 
              value={formData.SPE_OBJ} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            >
              <option value="">-- select --</option>
              <option value="OBJ_A">Objective A</option>
              <option value="OBJ_B">Objective B</option>
              <option value="OBJ_C">Objective C</option>
            </select>
          </div>
<br></br>
<div>
          <div>
            <label>SPECIFIC ACTION</label>
            <select 
              name="SPE_ACT" 
              value={formData.SPE_ACT} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            >
              <option value="">-- select action --</option>
              <option value="ACT_1">Action 1</option>
              <option value="ACT_2">Action 2</option>
              <option value="ACT_3">Action 3</option>
            </select>
          </div>
<br></br>
          <div>
            <label>RESPONSIBLE PERSON</label>
            <input 
              name="RES_PER" 
              value={formData.RES_PER} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
<br></br>
          <div>
            <label>TIME FRAME</label>
            <input 
              name="TF" 
              value={formData.TF} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
<br></br>
          <div>
            <label>EXPECTED RESULTS</label>
            <input 
              name="EXP_RES" 
              value={formData.EXP_RES} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
</div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>REMARKS</label>
            <textarea 
              name="REMARKS" 
              value={formData.REMARKS} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4, minHeight: 80 }}
            />
          </div>

        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: "#16a34a", color: "white", padding: 10, borderRadius: 4, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div style={{ marginTop: 10, color: message.includes("success") ? "green" : "red" }}>
          {message}
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="spinner" />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              Submitting...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
