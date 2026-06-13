import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CityLinkForm() {
  const location = useLocation();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", data: formData }),
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
      <button onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>
        ← Back
      </button>

      <h3>City Link - Data Entry</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>HHID</label>
          <input name="HHID" value={formData.HHID} onChange={handleChange} />
        </div>

        <div>
          <label>HH_GRANTEE</label>
          <input name="HH_GRANTEE" value={formData.HH_GRANTEE} onChange={handleChange} />
        </div>

        <div>
          <label>CITY_LINK</label>
          <input name="CITY_LINK" value={formData.CITY_LINK} onChange={handleChange} />
        </div>

        <div>
          <label>OVERALL_GOAL</label>
          <input name="OVERALL_GOAL" value={formData.OVERALL_GOAL} onChange={handleChange} />
        </div>

        <div>
          <label>SPE_OBJ</label>
          <select name="SPE_OBJ" value={formData.SPE_OBJ} onChange={handleChange}>
            <option value="">-- select --</option>
            <option value="OBJ_A">Objective A</option>
            <option value="OBJ_B">Objective B</option>
            <option value="OBJ_C">Objective C</option>
          </select>
        </div>

        <div>
          <label>SPE_ACT</label>
          <select name="SPE_ACT" value={formData.SPE_ACT} onChange={handleChange}>
            <option value="">-- select action --</option>
            <option value="ACT_1">Action 1</option>
            <option value="ACT_2">Action 2</option>
            <option value="ACT_3">Action 3</option>
          </select>
        </div>

        <div>
          <label>RES_PER</label>
          <input name="RES_PER" value={formData.RES_PER} onChange={handleChange} />
        </div>

        <div>
          <label>TF</label>
          <input name="TF" value={formData.TF} onChange={handleChange} />
        </div>

        <div>
          <label>EXP_RES</label>
          <input name="EXP_RES" value={formData.EXP_RES} onChange={handleChange} />
        </div>

        <div>
          <label>REMARKS</label>
          <textarea name="REMARKS" value={formData.REMARKS} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <span style={{ marginLeft: 10 }}>{message}</span>
        </div>
      </form>
    </div>
  );
}
