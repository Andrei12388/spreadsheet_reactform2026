import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL =
  "https://script.google.com/macros/s/AKfycbysXQn2HtAnUpqKEjU2l-2XhYqZxdrIk2J1o0YwsQQPlcFQdQhoC7uISMLfTpV_JmU3Cg/exec";

export default function AdminCityLinkEntries() {
  const navigate = useNavigate();
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchAllEntries() {
    if (!API_URL) return setMessage("No API URL configured");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_URL);
      const result = await res.json();

      if (result.status === "success" && result.data) {
        setAllEntries(result.data);
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

  function openLink() {
  window.open("https://docs.google.com/spreadsheets/d/1QmCbvUmbwztsIFzdf8KDML5y_kzA42rlD8NEe4_DGpc/", "_blank", "noopener,noreferrer");
}

  function handlePrint() {
    if (allEntries.length === 0) {
      setMessage("No entries loaded to print");
      return;
    }

    window.print();
  }

  function generateAllEntriesPDF() {
    if (allEntries.length === 0) {
      setMessage("No entries to export");
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;

    allEntries.forEach((entry, index) => {
      if (index > 0) pdf.addPage();

      let y = margin;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("FAMILY INTERVENTION PLAN (FIP)", pageWidth / 2, y, { align: "center" });
      y += 10;

      pdf.setFont("helvetica", "normal");

      const goalTable = [["Overall Goal", entry.OVERALL_GOAL || "__________________________"]];
      autoTable(pdf, {
        body: goalTable,
        startY: y,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0,
          overflow: "linebreak",
        },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: "bold" },
          1: { cellWidth: pageWidth - margin * 2 - 30 },
        },
        theme: "grid",
      });

      y += 15;

      const tableHead = [[
        "Specific Objectives",
        "Specific Activity",
        "Responsible Person",
        "Timeframe",
        "Expected Result",
        "Remarks",
      ]];

      const tableBody = [[
        entry.SPE_OBJ || "",
        entry.SPE_ACT || "",
        entry.RES_PER || "",
        entry.TF || "",
        entry.EXP_RES || "",
        entry.REMARKS || "",
      ]];

      autoTable(pdf, {
        head: tableHead,
        body: tableBody,
        startY: y,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: "top",
          overflow: "linebreak",
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        bodyStyles: { fillColor: false, textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: false },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: "auto" },
          2: { cellWidth: "auto" },
          3: { cellWidth: "auto" },
          4: { cellWidth: "auto" },
          5: { cellWidth: "auto" },
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.2,
      });

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
      pdf.setFont("helvetica", "normal");
    });

    pdf.save(`FIP_${new Date().toISOString().split("T")[0]}.pdf`);
    setMessage(`✅ FIP PDF generated (${allEntries.length} entries)`);
  }

  useEffect(() => {
    fetchAllEntries();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => navigate(-1)}>← Back</button>
        <button
          onClick={fetchAllEntries}
          disabled={loading}
          style={{ backgroundColor: "#8b5cf6", color: "white" }}
        >
          📋 Refresh Entries
        </button>
        <button
          onClick={generateAllEntriesPDF}
          disabled={loading || allEntries.length === 0}
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          📥 Export All to PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={loading || allEntries.length === 0}
          style={{ backgroundColor: "#f59e0b", color: "white" }}
        >
          🖨️ Print List
        </button>
        <button
  onClick={openLink}
  style={{ backgroundColor: "#34880e", color: "white" }}
>
  🔗 Open SpreadSheet Database
</button>
      </div>

      <h3>Admin: City Link Entries</h3>
      <div style={{ marginBottom: 10, color: message.includes("success") ? "green" : "red" }}>
        {message}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Total entries:</strong> {allEntries.length}
      </div>

      {allEntries.length === 0 ? (
        <div style={{ color: "#64748b" }}>No entries loaded yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {allEntries.map((entry, index) => (
            <div
              key={index}
              style={{
                padding: 14,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <strong>Entry {index + 1}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <strong>HHID:</strong> {entry.HHID}
                </div>
                <div>
                  <strong>HH_GRANTEE:</strong> {entry.HH_GRANTEE}
                </div>
                <div>
                  <strong>CITY_LINK:</strong> {entry.CITY_LINK}
                </div>
                <div>
                  <strong>OVERALL_GOAL:</strong> {entry.OVERALL_GOAL}
                </div>
                <div>
                  <strong>SPE_OBJ:</strong> {entry.SPE_OBJ}
                </div>
                <div>
                  <strong>SPE_ACT:</strong> {entry.SPE_ACT}
                </div>
                <div>
                  <strong>RES_PER:</strong> {entry.RES_PER}
                </div>
                <div>
                  <strong>TF:</strong> {entry.TF}</div>
                <div>
                  <strong>EXP_RES:</strong> {entry.EXP_RES}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>REMARKS:</strong> {entry.REMARKS}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
