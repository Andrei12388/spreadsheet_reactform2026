import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbwyMl6M_Rkv-0fCwj0-N8YRYONY2TqP8-D4Qiazi_0_cYpu_RYb89ToVLPEEtoR71Pg/exec";

export default function JMCMainPage() {
    useEffect(() => {
    document.title = "JMC Report 2026";
  }, []);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const sheetName = location.state?.sheetName;

  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    address: "",
    gender: "",
    intervention: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

async function handleSubmit(e) {
  e.preventDefault();

  console.log("Submitting to sheet:", sheetName);

  if (!sheetName) {
    alert("No sheet selected.");
    return;
  }

  // Prevent duplicate submissions
  if (submitting) return;

  setSubmitting(true);

  const payload = {
    sheetName,
    ...formData,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === "success") {
      alert(`Saved successfully! ID: ${result.data.id}`);

      setFormData({
        name: "",
        birthday: "",
        address: "",
        gender: "",
        intervention: "",
      });
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to submit data");
  } finally {
    // Always enable the button again
    setSubmitting(false);
  }
}
  if (!sheetName) {
    return (
      <div className="jmc-page">
        <div className="jmc-container">
          <div className="jmc-header">
            <div className="jmc-logo">JOINT MEMORANDUM CIRCULAR TOOL</div>
            <h1>JOINT MEMORANDUM CIRCULAR TOOL</h1>
          </div>

          <div className="section-card empty-card">
            <h2>No sheet selected</h2>
            <p>Please return and select a sheet before continuing.</p>

            <button
              className="btn btn-back"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jmc-page">
      <div className="jmc-container">

        {/* HEADER */}
        <div className="jmc-header">
         

          <h1>JOINT MEMORANDUM CIRCULAR TOOL</h1>

          <h2>{sheetName}</h2>
        </div>

        {/* TOP CONTROLS */}
        <div className="top-controls">
          <button
            className="btn btn-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <span className="sheet-badge">
            Sheet: {sheetName}
          </span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* PERSONAL INFORMATION */}
          <div className="section-card">
            <div className="section-header">
              <h3>PERSONAL INFORMATION</h3>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthday">
                  Birthday
                </label>

                <input
                  id="birthday"
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

            </div>
          </div>

          {/* INTERVENTION */}
          <div className="section-card">
            <div className="section-header">
              <h3>INTERVENTION</h3>
            </div>

            <div className="form-group">
              <label htmlFor="intervention">
                Intervention Details
              </label>

              <textarea
                id="intervention"
                name="intervention"
                placeholder="Enter intervention details"
                value={formData.intervention}
                onChange={handleChange}
                rows={6}
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="submit-section">
            <button
  disabled={submitting}
  type="submit"
  className="btn btn-submit"
>
  {submitting ? "Submitting..." : "Submit"}
</button>
          </div>

        </form>
      </div>
    </div>
  );
}