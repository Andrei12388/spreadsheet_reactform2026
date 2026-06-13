import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [allEntries, setAllEntries] = useState([]);
  const [showAllEntries, setShowAllEntries] = useState(false);

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

  async function fetchAllEntries() {
    if (!API_URL) return setMessage("No API URL configured");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (result.status === "success" && result.data) {
        setAllEntries(result.data);
        setShowAllEntries(true);
        setMessage(`✅ Loaded ${result.data.length} entries`);
      } else {
        setMessage("Failed to load entries");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching entries");
    }

    setLoading(false);
  }

  async function generateAllEntriesPDF() {
  if (allEntries.length === 0) {
    setMessage("No entries to export");
    return;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;

  allEntries.forEach((entry, index) => {
    if (index > 0) pdf.addPage();

    let y = margin;

    // ================= HEADER =================
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("FAMILY INTERVENTION PLAN (FIP)", pageWidth / 2, y, { align: "center" });

    y += 10;

    // Overall Goal label + underline style
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Overall Goal:", margin, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(entry.OVERALL_GOAL || "__________________________", margin + 35, y);

    y += 10;

    // long underline line (visual spacing like your template)
   // pdf.line(margin, y, pageWidth - margin, y);
    //y += 10;

    // ================= TABLE =================
    const tableHead = [[
      "Specific Objectives",
      "Specific Activity",
      "Responsible Person",
      "Timeframe",
      "Expected Result",
      "Remarks"
    ]];

    const tableBody = [[
      entry.SPE_OBJ || "",
      entry.SPE_ACT || "",
      entry.RES_PER || "",
      entry.TF || "",
      entry.EXP_RES || "",
      entry.REMARKS || ""
    ]];

    autoTable(pdf, {
  head: tableHead,
  body: tableBody,
  startY: y,
  margin: { left: margin, right: margin },

  // ================= BASE STYLE =================
  styles: {
    fontSize: 8,
    cellPadding: 2,
    valign: "top",
    overflow: "linebreak",
    textColor: [0, 0, 0],        // black text
    lineColor: [0, 0, 0],        // BLACK borders
    lineWidth: 0.2               // thin Word-like border
  },

  // ================= HEADER (NO COLOR, ONLY BOLD) =================
  headStyles: {
    fillColor: false,            // no background color
    textColor: [0, 0, 0],        // black text
    fontStyle: "bold",
    halign: "center",
    lineColor: [0, 0, 0],
    lineWidth: 0.2
  },

  // ================= BODY =================
  bodyStyles: {
    fillColor: false,            // no shading
    textColor: [0, 0, 0]
  },

  // ================= REMOVE STRIPES =================
  alternateRowStyles: {
    fillColor: false
  },

  // ================= COLUMN WIDTHS =================
columnStyles: {
  0: { cellWidth: "auto" },
  1: { cellWidth: "auto" },
  2: { cellWidth: "auto" },
  3: { cellWidth: "auto" },
  4: { cellWidth: "auto" },
  5: { cellWidth: "auto" }
},

  // ================= OUTER BORDER STYLE =================
  tableLineColor: [0, 0, 0],
  tableLineWidth: 0.2


     /* didDrawPage: function () {
        pdf.setFontSize(9);
        pdf.text(
          `Page ${pdf.internal.getNumberOfPages()}`,
          pageWidth / 2,
          285,
          { align: "center" }
        );
      }
        */
    });

 // ================= FOOTER SECTION =================
    let footerY = pdf.lastAutoTable.finalY + 15;

    pdf.setFontSize(10);
    pdf.text("Prepared by:", margin, footerY);
    pdf.text("Facilitated and Reviewed by:", pageWidth - 80, footerY);
    footerY += 8;

    pdf.text(entry.HH_GRANTEE, margin, footerY);
    pdf.text(entry.CITY_LINK, pageWidth - 80, footerY);

    footerY += 8;
pdf.setFontSize(9);
pdf.setFont("helvetica", "bold");
    pdf.text("NAME OF 4Ps MEMBER", margin, footerY);
    pdf.text("NAME OF CITY LINK", pageWidth - 80, footerY);

// reset to normal
pdf.setFont("helvetica", "normal");
  });

  pdf.save(`FIP_${new Date().toISOString().split("T")[0]}.pdf`);
  setMessage(`✅ FIP PDF generated (${allEntries.length} entries)`);
}

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <button 
          onClick={fetchAllEntries} 
          style={{ backgroundColor: "#8b5cf6", color: "white" }}
          disabled={loading}
        >
          📋 View All Entries
        </button>
        <button 
          onClick={generateAllEntriesPDF} 
          disabled={allEntries.length === 0 || loading}
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          📥 Export All to PDF
        </button>
      </div>

      {showAllEntries && allEntries.length > 0 && (
        <div style={{ backgroundColor: "#f0f9ff", padding: 15, borderRadius: 8, marginBottom: 20, border: "1px solid #0284c7" }}>
          <h4>Total Entries: {allEntries.length}</h4>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {allEntries.map((entry, i) => (
              <div key={i} style={{ padding: 8, borderBottom: "1px solid #ccc", fontSize: 12 }}>
                <strong>Entry {i + 1}:</strong> {entry.HHID} - {entry.HH_GRANTEE}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3>City Link - Data Entry</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
          <div>
            <label>HHID *</label>
            <input 
              name="HHID" 
              value={formData.HHID} 
              onChange={handleChange} 
              required
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>HH_GRANTEE</label>
            <input 
              name="HH_GRANTEE" 
              value={formData.HH_GRANTEE} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>CITY_LINK</label>
            <input 
              name="CITY_LINK" 
              value={formData.CITY_LINK} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>OVERALL_GOAL</label>
            <input 
              name="OVERALL_GOAL" 
              value={formData.OVERALL_GOAL} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>SPE_OBJ</label>
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

          <div>
            <label>SPE_ACT</label>
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

          <div>
            <label>RES_PER</label>
            <input 
              name="RES_PER" 
              value={formData.RES_PER} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>TF</label>
            <input 
              name="TF" 
              value={formData.TF} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <div>
            <label>EXP_RES</label>
            <input 
              name="EXP_RES" 
              value={formData.EXP_RES} 
              onChange={handleChange}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
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
            style={{ backgroundColor: "#16a34a", color: "white", padding: 10, borderRadius: 4 }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div style={{ marginTop: 10, color: message.includes("success") ? "green" : "red" }}>
          {message}
        </div>
      </form>
    </div>
  );
}
