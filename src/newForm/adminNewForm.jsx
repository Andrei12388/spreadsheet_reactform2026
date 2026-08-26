import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzB5rbWa--Zm2yBsTQDic5BYvtqF3ClJm09cGFFr7dIur1gt344HVFGaSrMRaVEPqJyBg/exec";

  function calculateAge(dateValue) {
  if (!dateValue) return "N/A";

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return "N/A";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "N/A";
}

function calculateYearsInProgram(dateValue) {
  if (!dateValue) return "N/A";

  const registrationDate = new Date(dateValue);

  if (Number.isNaN(registrationDate.getTime())) {
    return "N/A";
  }

  const today = new Date();

  let years =
    today.getFullYear() -
    registrationDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    registrationDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < registrationDate.getDate())
  ) {
    years--;
  }

  return years >= 0 ? years : "N/A";
}

export default function AdminNewForm() {
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // =========================
  // FETCH DATA
  // =========================

  async function fetchAllEntries() {
    if (!API_URL) {
      setMessage("❌ No API URL configured");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const result = await res.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        console.log("result:", result.data);

        setAllEntries(result.data);
        setMessage(`✅ Loaded ${result.data.length} entries`);
      } else {
        setAllEntries([]);
        setMessage("❌ Failed to load entries");
      }
    } catch (err) {
      console.error(err);
      setAllEntries([]);
      setMessage("❌ Error fetching entries");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // OPEN DATABASE
  // =========================

  function openLink() {
    window.open(
      "https://docs.google.com/spreadsheets/d/16tvOIgfGD7sdDkZNreoDenItWIpAj7Yiae0cdE9Tn_w/edit?usp=sharing",
      "_blank",
      "noopener,noreferrer"
    );
  }

  const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

  // =========================
  // PRINT
  // =========================

  function handlePrint() {
    if (allEntries.length === 0) {
      setMessage("❌ No entries loaded to print");
      return;
    }

    window.print();
  }

// =========================
// EXCEL EXPORT
// SAME FORMAT AS PDF
// =========================

function generateEntriesExcel(entriesToExport) {
  if (!entriesToExport || entriesToExport.length === 0) {
    setMessage("❌ No entries to export");
    return;
  }

  try {
    setMessage("⏳ Generating Excel...");

    const workbook = XLSX.utils.book_new();

    /*
     * We will build the worksheet manually so the
     * Excel layout resembles the PDF.
     */

    const rows = [];

    // =========================================================
    // HELPERS
    // =========================================================

    const value = (val) => {
      if (
        val === null ||
        val === undefined ||
        String(val).trim() === ""
      ) {
        return "N/A";
      }

      return String(val);
    };

    // =========================================================
    // BUILD REPORT
    // =========================================================

    entriesToExport.forEach((entry, entryIndex) => {
      // -------------------------------------------------------
      // PAGE / HOUSEHOLD SEPARATOR
      // -------------------------------------------------------

      if (entryIndex > 0) {
        // Add blank rows between households
        rows.push([]);
        rows.push([]);
      }

      // -------------------------------------------------------
      // HEADER
      // -------------------------------------------------------

      rows.push([
        "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT",
      ]);

      rows.push([
        "Pantawid Pamilyang Pilipino Program",
      ]);

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "CM Form No. 8",
      ]);

      rows.push([
        "DISTRICT 2 ACTION TEAM – 004 QUEZON CITY",
      ]);

      rows.push([
        "SOCIAL CASE STUDY REPORT",
      ]);

      rows.push([
        `Date: ${formatDate(new Date())}`,
      ]);

      rows.push([]);

      // -------------------------------------------------------
      // SECTION I
      // -------------------------------------------------------

      rows.push([
        "I.    IDENTIFYING INFORMATION",
      ]);

      rows.push([]);

      const identifyingFields = [
        [
          "Household ID No",
          value(entry.HHID),
        ],
        [
          "Date of Registration",
          formatDate(entry.DATE_REG),
        ],
        [
          "HH Set",
          value(entry.HH_SET),
        ],
        [
          "Years in the Program",
          `${calculateYearsInProgram(
            entry.DATE_REG
          )} years`,
        ],
        [
          "Grantee's Name",
          value(entry.G_NAME),
        ],
        [
          "Sex",
          value(entry.SEX),
        ],
        [
          "Civil Status",
          value(entry.C_STATS),
        ],
        [
          "Date of Birth",
          formatDate(entry.DATE_BIRTH),
        ],
        [
          "Age",
          calculateAge(entry.DATE_BIRTH),
        ],
        [
          "Place of Birth",
          value(entry.PLACE_BIRTH),
        ],
        [
          "Present Address",
          value(entry.ADDRESS),
        ],
        [
          "IP Affiliation",
          value(entry.IP_AFFIL),
        ],
        [
          "Source of Information",
          value(entry.S_INFO),
        ],
        [
          "Cellphone Number",
          value(entry.CP_NO),
        ],
        [
          "HH Level of Well-being",
          value(entry.HH_LEVEL_WBEING),
        ],
        [
          "Case Category",
          value(entry.CASE_CAT),
        ],
        [
          "Case No",
          value(entry.CASE_NO),
        ],
        [
          "Risk Level",
          value(entry.RISK_LEVEL),
        ],
      ];

      identifyingFields.forEach(
        ([label, fieldValue]) => {
          rows.push([
            label,
            ":",
            fieldValue,
          ]);
        }
      );

      rows.push([]);
      rows.push([]);

      // -------------------------------------------------------
      // SECTION II
      // -------------------------------------------------------

      rows.push([
        "II. FAMILY COMPOSITION:",
      ]);

      rows.push([]);

      // -------------------------------------------------------
      // MEMBER TABLE HEADER
      // -------------------------------------------------------

      rows.push([
        "Name",
        "Sex",
        "Age",
        "Civil Status",
        "Date of Birth",
        "Relationship to the Head",
        "Monitored Child",
        "Edu. Attainment",
        "Occupation",
        "Monthly Income",
        "Disability",
        "Remarks (Living w/ HH Y/N)",
      ]);

      // -------------------------------------------------------
      // MEMBERS
      // -------------------------------------------------------

      const members = Array.isArray(entry.MEMBERS)
        ? entry.MEMBERS
        : [];

      if (members.length > 0) {
        members.forEach((member) => {
          rows.push([
            value(member.NAME),
            value(member.SEX),
            member.AGE ??
              calculateAge(member.D_BIRTH),
            value(member.CSTAT),
            formatDate(member.D_BIRTH),
            value(member.R_TO_THE_HEAD),
            value(member.M_CHILD),
            value(member.E_ATTAIN),
            value(member.OCCUPATION),
            value(member.M_INCOME),
            value(member.DISABILITY),
            value(member.REMARKS),
          ]);
        });
      } else {
        rows.push([
          "No household members found",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
    });

    // =========================================================
    // CREATE WORKSHEET
    // =========================================================

    const worksheet =
      XLSX.utils.aoa_to_sheet(rows);

    // =========================================================
    // COLUMN WIDTHS
    // =========================================================

    worksheet["!cols"] = [
      { wch: 18 }, // Name / labels
      { wch: 5 },  // colon
      { wch: 28 }, // values
      { wch: 10 }, // Sex
      { wch: 10 }, // Age
      { wch: 18 }, // Civil Status
      { wch: 18 }, // DOB
      { wch: 24 }, // Relationship
      { wch: 18 }, // Monitored
      { wch: 24 }, // Education
      { wch: 24 }, // Occupation
      { wch: 18 }, // Income
    ];

    // =========================================================
    // MERGE HEADER CELLS
    // =========================================================

    const merges = [];

    let currentRow = 0;

    entriesToExport.forEach(
      (entry, entryIndex) => {
        if (entryIndex > 0) {
          currentRow += 2;
        }

        // Department title
        merges.push({
          s: {
            r: currentRow,
            c: 0,
          },
          e: {
            r: currentRow,
            c: 11,
          },
        });

        // Program title
        merges.push({
          s: {
            r: currentRow + 1,
            c: 0,
          },
          e: {
            r: currentRow + 1,
            c: 11,
          },
        });

        // CM Form
        merges.push({
          s: {
            r: currentRow + 2,
            c: 0,
          },
          e: {
            r: currentRow + 2,
            c: 11,
          },
        });

        // District
        merges.push({
          s: {
            r: currentRow + 3,
            c: 0,
          },
          e: {
            r: currentRow + 3,
            c: 11,
          },
        });

        // Report title
        merges.push({
          s: {
            r: currentRow + 4,
            c: 0,
          },
          e: {
            r: currentRow + 4,
            c: 11,
          },
        });

        // Date
        merges.push({
          s: {
            r: currentRow + 5,
            c: 0,
          },
          e: {
            r: currentRow + 5,
            c: 11,
          },
        });

        // Section I
        merges.push({
          s: {
            r: currentRow + 7,
            c: 0,
          },
          e: {
            r: currentRow + 7,
            c: 11,
          },
        });

        /*
         * 18 identifying fields
         * Each field takes one row.
         *
         * Section I begins at currentRow + 7
         * Field data starts at currentRow + 9
         */
        const sectionIStart =
          currentRow + 9;

        const sectionIEnd =
          sectionIStart + 17;

        // Section II starts after:
        // 18 fields + 2 blank rows
        const sectionIIStart =
          sectionIEnd + 3;

        merges.push({
          s: {
            r: sectionIIStart,
            c: 0,
          },
          e: {
            r: sectionIIStart,
            c: 11,
          },
        });

        // Move current row to next household
        const members =
          Array.isArray(entry.MEMBERS)
            ? entry.MEMBERS
            : [];

        currentRow =
          sectionIIStart +
          2 +
          Math.max(members.length, 1);
      }
    );

    worksheet["!merges"] = merges;

    // =========================================================
    // STYLING
    // =========================================================

    /*
     * SheetJS Community Edition has limited styling support.
     * We can still set basic cell formatting.
     */

    const range =
      XLSX.utils.decode_range(
        worksheet["!ref"]
      );

    for (
      let row = range.s.r;
      row <= range.e.r;
      row++
    ) {
      for (
        let col = range.s.c;
        col <= range.e.c;
        col++
      ) {
        const cell =
          worksheet[
            XLSX.utils.encode_cell({
              r: row,
              c: col,
            })
          ];

        if (!cell) continue;

        cell.alignment = {
          vertical: "center",
          wrapText: true,
        };
      }
    }

    // =========================================================
    // STYLE REPORT TITLES
    // =========================================================

    entriesToExport.forEach(
      (entry, entryIndex) => {
        let row = 0;

        if (entryIndex > 0) {
          // Find approximate start based on
          // previous entries
          row = 0;

          for (
            let i = 0;
            i < entryIndex;
            i++
          ) {
            const previous =
              entriesToExport[i];

            const previousMembers =
              Array.isArray(
                previous.MEMBERS
              )
                ? previous.MEMBERS
                : [];

            row +=
              1 + // department
              1 + // program
              1 + // CM form
              1 + // district
              1 + // title
              1 + // date
              1 + // blank
              1 + // section I
              1 + // blank
              18 + // fields
              2 + // blanks
              1 + // section II
              1 + // blank
              1 + // table header
              Math.max(
                previousMembers.length,
                1
              ) +
              2;
          }
        }

        const titleCells = [
          row,
          row + 1,
          row + 3,
          row + 4,
          row + 7,
        ];

        titleCells.forEach(
          (rowNumber) => {
            const cell =
              worksheet[
                XLSX.utils.encode_cell({
                  r: rowNumber,
                  c: 0,
                })
              ];

            if (cell) {
              cell.font = {
                bold: true,
              };

              cell.alignment = {
                horizontal: "center",
                vertical: "center",
                wrapText: true,
              };
            }
          }
        );

        // Table header
        const members =
          Array.isArray(entry.MEMBERS)
            ? entry.MEMBERS
            : [];

        const tableHeaderRow =
          row + 7 + 1 + 1 + 18 + 2 + 1 + 1;

        for (
          let col = 0;
          col < 12;
          col++
        ) {
          const cell =
            worksheet[
              XLSX.utils.encode_cell({
                r: tableHeaderRow,
                c: col,
              })
            ];

          if (cell) {
            cell.font = {
              bold: true,
            };

            cell.alignment = {
              horizontal: "center",
              vertical: "center",
              wrapText: true,
            };
          }
        }
      }
    );

    // =========================================================
    // FREEZE PANES
    // =========================================================

    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 0,
    };

    // =========================================================
    // ADD SHEET
    // =========================================================

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Social Case Study Report"
    );

    // =========================================================
    // FILE NAME
    // =========================================================

    const date = new Date()
      .toISOString()
      .split("T")[0];

    const identifier =
      entriesToExport.length === 1
        ? entriesToExport[0]?.HHID ||
          entriesToExport[0]?.G_NAME ||
          "Household"
        : "All_Entries";

    const safeIdentifier =
      String(identifier)
        .replace(/[<>:"/\\|?*]+/g, "_")
        .replace(/\s+/g, "_");

    const filename =
      `Social_Case_Study_Report_${safeIdentifier}_${date}.xlsx`;

    // =========================================================
    // SAVE
    // =========================================================

    XLSX.writeFile(
      workbook,
      filename
    );

    setMessage(
      `✅ Excel generated (${entriesToExport.length} ${
        entriesToExport.length === 1
          ? "entry"
          : "entries"
      })`
    );
  } catch (error) {
    console.error(
      "Excel generation error:",
      error
    );

    setMessage(
      "❌ Failed to generate Excel"
    );
  }
}


// =========================
// EXCEL WRAPPERS
// =========================

function generateAllEntriesExcel() {
  generateEntriesExcel(allEntries);
}

function generateSingleEntryExcel(entry) {
  generateEntriesExcel([entry]);
}

  // =========================
  // PDF EXPORT
  // =========================

 async function generateEntriesPDF(entriesToExport) {
if (!entriesToExport || entriesToExport.length === 0) {
  setMessage("❌ No entries to export");
  return;
}

  try {
    setMessage("⏳ Generating PDF...");

    // =========================================================
    // CONFIGURATION
    // =========================================================

    const DSWD_LOGO = "/dswd-logo.png";
    const FOUR_PS_LOGO = "/4ps-logo.png";

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const marginLeft = 12;
    const marginRight = 12;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // =========================================================
    // LOAD IMAGE HELPER
    // =========================================================

    async function loadImageAsDataURL(src) {
      try {
        const response = await fetch(src);

        if (!response.ok) {
          throw new Error(`Unable to load image: ${src}`);
        }

        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;

          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn(`Logo could not be loaded: ${src}`, error);
        return null;
      }
    }

    // =========================================================
    // LOAD LOGOS
    // =========================================================

    const [dswdLogo, fourPsLogo] = await Promise.all([
      loadImageAsDataURL(DSWD_LOGO),
      loadImageAsDataURL(FOUR_PS_LOGO),
    ]);

    // =========================================================
    // HELPERS
    // =========================================================

    const value = (val) => {
      if (
        val === null ||
        val === undefined ||
        String(val).trim() === ""
      ) {
        return "N/A";
      }

      return String(val);
    };

    const calculateAge = (birthDateValue) => {
  if (!birthDateValue) return "N/A";

  const birthDate = new Date(birthDateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return "N/A";
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "N/A";
};

const calculateYearsInProgram = (registrationDateValue) => {
  if (!registrationDateValue) return "N/A";

  const registrationDate = new Date(registrationDateValue);

  if (Number.isNaN(registrationDate.getTime())) {
    return "N/A";
  }

  const today = new Date();

  let years =
    today.getFullYear() -
    registrationDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    registrationDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < registrationDate.getDate())
  ) {
    years--;
  }

  return years >= 0 ? String(years) : "N/A";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

    const today = new Date();

    const reportDate = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // =========================================================
    // DRAW REPORT HEADER
    // =========================================================

    function drawHeader(entry) {
      let y = 9;

      // -------------------------------------------------------
      // LOGOS
      // -------------------------------------------------------

      if (dswdLogo) {
        try {
          pdf.addImage(
            dswdLogo,
            "PNG",
            marginLeft,
            8,
            15,
            15
          );
        } catch (error) {
          console.warn("Unable to draw DSWD logo", error);
        }
      }

      if (fourPsLogo) {
        try {
          pdf.addImage(
            fourPsLogo,
            "PNG",
            pageWidth - marginRight - 15,
            8,
            15,
            15
          );
        } catch (error) {
          console.warn("Unable to draw 4Ps logo", error);
        }
      }

      // -------------------------------------------------------
      // HEADER TEXT
      // -------------------------------------------------------

      pdf.setTextColor(0, 0, 0);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);

      pdf.text(
        "DEPARTMENT OF SOCIAL WELFARE AND DEVELOPMENT",
        pageWidth / 2,
        y + 2,
        {
          align: "center",
        }
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);

      pdf.text(
        "Pantawid Pamilyang Pilipino Program",
        pageWidth / 2,
        y + 6,
        {
          align: "center",
        }
      );

      // -------------------------------------------------------
      // CM FORM NUMBER
      // -------------------------------------------------------

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);

      pdf.text(
        "CM Form No. 8",
        pageWidth - marginRight,
        25,
        {
          align: "right",
        }
      );

      // -------------------------------------------------------
      // DISTRICT ACTION TEAM
      // -------------------------------------------------------

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);

      pdf.text(
        "DISTRICT 2 ACTION TEAM – 004 QUEZON CITY",
        pageWidth / 2,
        31,
        {
          align: "center",
        }
      );

      // -------------------------------------------------------
      // REPORT TITLE
      // -------------------------------------------------------

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);

      pdf.text(
        "SOCIAL CASE STUDY REPORT",
        pageWidth / 2,
        38,
        {
          align: "center",
        }
      );

      // -------------------------------------------------------
      // DATE
      // -------------------------------------------------------

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);

      pdf.text(
        `Date: ${reportDate}`,
        marginLeft,
        46
      );

      return 53;
    }

    // =========================================================
    // DRAW IDENTIFYING INFORMATION
    // =========================================================

    function drawIdentifyingInformation(entry, startY) {
      let y = startY;

      // -------------------------------------------------------
      // SECTION TITLE
      // -------------------------------------------------------

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);

      pdf.text(
        "I.    IDENTIFYING INFORMATION",
        marginLeft,
        y
      );

      y += 7;

      // -------------------------------------------------------
      // LABEL / VALUE CONFIG
      // -------------------------------------------------------

      const labelX = marginLeft;
      const colonX = marginLeft + 51;
      const valueX = marginLeft + 55;

      const labelFontSize = 7.5;
      const valueFontSize = 7.5;

      const lineHeight = 4.6;

      const fields = [
        [
          "Household ID No",
          value(entry.HHID),
        ],
        [
          "Date of Registration",
        formatDate(entry.DATE_REG),
        ],
        [
          "HH Set",
          value(entry.HH_SET),
        ],
       [
        "Years in the Program",
        `${calculateYearsInProgram(entry.DATE_REG)} years`,
        ],
        [
          "Grantee's Name",
          value(entry.G_NAME),
        ],
        [
          "Sex",
          value(entry.SEX),
        ],
        [
          "Civil Status",
          value(entry.C_STATS),
        ],
        [
          "Date of Birth",
          formatDate(entry.DATE_BIRTH),
        ],
       [
        "Age",
        calculateAge(entry.DATE_BIRTH),
        ],
        [
          "Place of Birth",
          value(entry.PLACE_BIRTH),
        ],
        [
          "Present Address",
          value(entry.ADDRESS),
        ],
        [
          "IP Affiliation",
          value(entry.IP_AFFIL),
        ],
        [
          "Source of Information",
          value(entry.S_INFO),
        ],
        [
          "Cellphone Number",
          value(entry.CP_NO),
        ],
        [
          "HH Level of Well-being",
          value(entry.HH_LEVEL_WBEING),
        ],
        [
          "Case Category",
          value(entry.CASE_CAT),
        ],
        [
          "Case No",
          value(entry.CASE_NO),
        ],
        [
          "Risk Level",
          value(entry.RISK_LEVEL),
        ],
      ];

      pdf.setFontSize(labelFontSize);

      fields.forEach(([label, fieldValue]) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(labelFontSize);

        pdf.text(label, labelX, y);

        pdf.text(":", colonX, y);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(valueFontSize);

        const maxValueWidth =
          pageWidth - valueX - marginRight;

        const wrappedValue = pdf.splitTextToSize(
          fieldValue,
          maxValueWidth
        );

        pdf.text(
          wrappedValue,
          valueX,
          y
        );

        y +=
          Math.max(1, wrappedValue.length) *
          lineHeight;
      });

      return y + 3;
    }

    // =========================================================
    // DRAW FAMILY COMPOSITION
    // =========================================================

    function drawFamilyComposition(entry, startY) {
      let y = startY;

      // -------------------------------------------------------
      // SECTION TITLE
      // -------------------------------------------------------

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);

      pdf.text(
        "II. FAMILY COMPOSITION:",
        marginLeft,
        y
      );

      y += 4;

      // -------------------------------------------------------
      // MEMBERS
      // -------------------------------------------------------

      const members = Array.isArray(entry.MEMBERS)
        ? entry.MEMBERS
        : [];

     const memberTableBody =
  members.length > 0
    ? members.map((member) => [
        value(member.NAME),
        value(member.SEX),
        calculateAge(member.D_BIRTH),
        value(member.CSTAT),
        formatDate(member.D_BIRTH),
        value(member.R_TO_THE_HEAD),
        value(member.M_CHILD),
        value(member.E_ATTAIN),
        value(member.OCCUPATION),
        value(member.M_INCOME),
        value(member.DISABILITY),
        value(member.REMARKS),
      ])
          : [
              [
                "No household members found",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
              ],
            ];

      // -------------------------------------------------------
      // TABLE
      // -------------------------------------------------------

      pdf.autoTable({
        startY: y,

        margin: {
          left: marginLeft,
          right: marginRight,
          top: 12,
          bottom: 15,
        },

        theme: "grid",

        head: [
          [
            "Name",
            "Sex",
            "Age",
            "Civil\nStatus",
            "Date\nof Birth",
            "Relationship\nto the\nHead",
            "Monitored\nChild",
            "Edu.\nAttainment",
            "Occupation",
            "Monthly\nIncome",
            "Disability",
            "Remarks\n(Living w/\nHH Y/N)",
          ],
        ],

        body: memberTableBody,

        styles: {
          font: "helvetica",
          fontSize: 5.8,
          fontStyle: "normal",
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          cellPadding: 1.2,
          overflow: "linebreak",
          valign: "middle",
          halign: "center",
        },

        headStyles: {
          font: "helvetica",
          fontStyle: "bold",
          fontSize: 5.5,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          halign: "center",
          valign: "middle",
          cellPadding: 1.2,
        },

        bodyStyles: {
          fontSize: 5.8,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          valign: "middle",
        },

        columnStyles: {
          // Name
          0: {
            cellWidth: 28,
            halign: "left",
          },

          // Sex
          1: {
            cellWidth: 8,
          },

          // Age
          2: {
            cellWidth: 8,
          },

          // Civil Status
          3: {
            cellWidth: 15,
          },

          // Birth Date
          4: {
            cellWidth: 16,
          },

          // Relationship
          5: {
            cellWidth: 20,
          },

          // Monitored Child
          6: {
            cellWidth: 14,
          },

          // Education
          7: {
            cellWidth: 18,
          },

          // Occupation
          8: {
            cellWidth: 16,
          },

          // Monthly Income
          9: {
            cellWidth: 16,
          },

          // Disability
          10: {
            cellWidth: 15,
          },

          // Remarks
          11: {
            cellWidth: 15,
            halign: "left",
          },
        },

        didParseCell(data) {
          // Make "No household members found"
          // span visually across the table
          if (
            data.section === "body" &&
            members.length === 0 &&
            data.row.index === 0
          ) {
            data.cell.styles.halign =
              data.column.index === 0
                ? "center"
                : "center";
          }
        },

        didDrawPage() {
          // Keep everything black/white
          pdf.setTextColor(0, 0, 0);
        },
      });

      return (
        pdf.lastAutoTable?.finalY ??
        y
      );
    }

    // =========================================================
    // DRAW FOOTER
    // =========================================================

    function drawPageNumbers() {
      const totalPages = pdf.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
      ) {
        pdf.setPage(pageNumber);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);

        pdf.setTextColor(0, 0, 0);

        pdf.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 7,
          {
            align: "center",
          }
        );
      }
    }

    // =========================================================
    // GENERATE EACH HOUSEHOLD
    // =========================================================

    entriesToExport.forEach((entry, index) => {
      // -------------------------------------------------------
      // NEW HOUSEHOLD
      // -------------------------------------------------------

      if (index > 0) {
        pdf.addPage();
      }

      // -------------------------------------------------------
      // HEADER
      // -------------------------------------------------------

      let y = drawHeader(entry);

      // -------------------------------------------------------
      // IDENTIFYING INFORMATION
      // -------------------------------------------------------

      y = drawIdentifyingInformation(
        entry,
        y
      );

      // -------------------------------------------------------
      // FAMILY COMPOSITION
      // -------------------------------------------------------

      drawFamilyComposition(
        entry,
        y
      );
    });

    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    drawPageNumbers();

    // =========================================================
    // SAVE
    // =========================================================

    const date = new Date()
      .toISOString()
      .split("T")[0];

    const householdIdentifier =
  entriesToExport.length === 1
    ? entriesToExport[0]?.HHID ||
      entriesToExport[0]?.G_NAME ||
      "Household"
    : "All_Entries";

const safeIdentifier = String(
  householdIdentifier
)
  .replace(/[<>:"/\\|?*]+/g, "_")
  .replace(/\s+/g, "_");

const filename =
  `Social_Case_Study_Report_${safeIdentifier}_${date}.pdf`;

 pdf.save(filename);

setMessage(
  `✅ PDF generated (${entriesToExport.length} ${
    entriesToExport.length === 1 ? "entry" : "entries"
  })`
);
  } catch (error) {
    console.error(
      "PDF generation error:",
      error
    );

    setMessage(
      "❌ Failed to generate PDF"
    );
  }
}

async function generateAllEntriesPDF() {
  await generateEntriesPDF(allEntries);
}

async function generateSingleEntryPDF(entry) {
  await generateEntriesPDF([entry]);
}

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchAllEntries();
  }, []);

  // =========================
  // UI
  // =========================

  const filteredEntries = allEntries.filter((entry) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return true;

  const searchableFields = [
    entry.HHID,
    entry.DATE_REG,
    entry.HH_SET,
    entry.G_NAME,
    entry.SEX,
    entry.C_STATS,
    entry.DATE_BIRTH,
    entry.PLACE_BIRTH,
    entry.ADDRESS,
    entry.IP_AFFIL,
    entry.S_INFO,
    entry.CP_NO,
    entry.HH_LEVEL_WBEING,
    entry.CASE_CAT,
    entry.CASE_NO,
    entry.RISK_LEVEL,
  ];

  return searchableFields.some((field) =>
    String(field ?? "")
      .toLowerCase()
      .includes(query)
  );
});

  return (
  <div
    style={{
      padding: 20,
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    }}
  >
    {/* =========================================
        ACTION BAR
    ========================================= */}

    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
    >
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <button
        onClick={fetchAllEntries}
        disabled={loading}
        style={{
          backgroundColor: "#8b5cf6",
          color: "white",
        }}
      >
        📋 Refresh Entries
      </button>

      <button
  onClick={generateAllEntriesExcel}
  disabled={
    loading || allEntries.length === 0
  }
  style={{
    backgroundColor: "#16a34a",
    color: "white",
  }}
>
  📊 Export All to Excel
</button>

      <button
        onClick={generateAllEntriesPDF}
        disabled={loading || allEntries.length === 0}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
        }}
      >
        📥 Export All to PDF
      </button>

      <button
        onClick={handlePrint}
        disabled={loading || allEntries.length === 0}
        style={{
          backgroundColor: "#f59e0b",
          color: "white",
        }}
      >
        🖨️ Print List
      </button>

      <button
        onClick={openLink}
        style={{
          backgroundColor: "#34880e",
          color: "white",
        }}
      >
        🔗 Open Spreadsheet Database
      </button>
    </div>

    {/* =========================================
        TITLE
    ========================================= */}

    <h3>Admin: Social Case Study Report</h3>

    {/* =========================================
        MESSAGE
    ========================================= */}

    {message && (
      <div
        style={{
          marginBottom: 15,
          padding: "10px 12px",
          borderRadius: 6,
          backgroundColor: message.startsWith("✅")
            ? "#dcfce7"
            : message.startsWith("⏳")
            ? "#fef3c7"
            : "#fee2e2",
          color: message.startsWith("✅")
            ? "#166534"
            : message.startsWith("⏳")
            ? "#92400e"
            : "#991b1b",
          border: `1px solid ${
            message.startsWith("✅")
              ? "#86efac"
              : message.startsWith("⏳")
              ? "#fcd34d"
              : "#fca5a5"
          }`,
        }}
      >
        {message}
      </div>
    )}

    {/* =========================================
        SEARCH
    ========================================= */}

    <div
      style={{
        marginBottom: 15,
        padding: 14,
        backgroundColor: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 18,
          }}
        >
          🔍
        </span>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search HHID, grantee, address, case no., risk level..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 14,
            outline: "none",
          }}
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              padding: "8px 12px",
              backgroundColor: "#e2e8f0",
              color: "#334155",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>

    {/* =========================================
        ENTRY COUNT
    ========================================= */}

    <div
      style={{
        marginBottom: 20,
        color: "#475569",
      }}
    >
      <strong>
        {searchQuery
          ? `Showing ${filteredEntries.length} of ${allEntries.length} entries`
          : `Total entries: ${allEntries.length}`}
      </strong>
    </div>

    {/* =========================================
        ENTRIES
    ========================================= */}

    {allEntries.length === 0 ? (
      <div
        style={{
          padding: 20,
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          color: "#64748b",
        }}
      >
        No entries loaded yet.
      </div>
    ) : filteredEntries.length === 0 ? (
      <div
        style={{
          padding: 30,
          textAlign: "center",
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          color: "#64748b",
        }}
      >
        <div
          style={{
            fontSize: 32,
            marginBottom: 10,
          }}
        >
          🔍
        </div>

        <strong>No matching entries found</strong>

        <div
          style={{
            marginTop: 5,
            fontSize: 14,
          }}
        >
          Try searching by HHID, grantee name, address,
          case number, or another household detail.
        </div>
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        {filteredEntries.map((entry, index) => (
          <div
            key={entry.HHID || index}
            style={{
              padding: 14,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {/* =========================================
                ENTRY HEADER
            ========================================= */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 15,
                paddingBottom: 10,
                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: 16,
                  }}
                >
                  Entry {index + 1}
                </strong>

                {entry.HHID && (
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    HHID: {entry.HHID}
                  </span>
                )}
              </div>

              {/* =====================================
                  INDIVIDUAL PDF EXCEL BUTTON
              ===================================== */}

             <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <button
    onClick={() =>
      generateSingleEntryPDF(entry)
    }
    disabled={loading}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 12px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
      whiteSpace: "nowrap",
    }}
    title="Export this household to PDF"
  >
    📥 Export PDF
  </button>

  <button
    onClick={() =>
      generateSingleEntryExcel(entry)
    }
    disabled={loading}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 12px",
      backgroundColor: "#16a34a",
      color: "#ffffff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
      whiteSpace: "nowrap",
    }}
    title="Export this household to Excel"
  >
    📊 Export Excel
  </button>
</div>
            </div>

            {/* =========================================
                IDENTIFYING INFORMATION
            ========================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <div>
                <strong>HHID:</strong>{" "}
                {entry.HHID}
              </div>

              <div>
                <strong>
                  Registration Date:
                </strong>{" "}
                {formatDate(entry.DATE_REG)}
              </div>

              <div>
                <strong>HH Set:</strong>{" "}
                {entry.HH_SET}
              </div>

              <div>
                <strong>
                  Years in Program:
                </strong>{" "}
                {calculateYearsInProgram(
                  entry.DATE_REG
                )}
              </div>

              <div>
                <strong>Grantee Name:</strong>{" "}
                {entry.G_NAME}
              </div>

              <div>
                <strong>Sex:</strong>{" "}
                {entry.SEX}
              </div>

              <div>
                <strong>Civil Status:</strong>{" "}
                {entry.C_STATS}
              </div>

              <div>
                <strong>Date of Birth:</strong>{" "}
                {formatDate(entry.DATE_BIRTH)}
              </div>

              <div>
                <strong>Age:</strong>{" "}
                {calculateAge(
                  entry.DATE_BIRTH
                )}
              </div>

              <div>
                <strong>Place of Birth:</strong>{" "}
                {entry.PLACE_BIRTH}
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <strong>Address:</strong>{" "}
                {entry.ADDRESS}
              </div>

              <div>
                <strong>
                  IP Affiliation:
                </strong>{" "}
                {entry.IP_AFFIL}
              </div>

              <div>
                <strong>
                  Source of Information:
                </strong>{" "}
                {entry.S_INFO}
              </div>

              <div>
                <strong>Contact No.:</strong>{" "}
                {entry.CP_NO}
              </div>

              <div>
                <strong>
                  HH Level of Well-being:
                </strong>{" "}
                {entry.HH_LEVEL_WBEING}
              </div>

              <div>
                <strong>Case Category:</strong>{" "}
                {entry.CASE_CAT}
              </div>

              <div>
                <strong>Case No.:</strong>{" "}
                {entry.CASE_NO}
              </div>

              <div>
                <strong>Risk Level:</strong>{" "}
                {entry.RISK_LEVEL}
              </div>
            </div>

            {/* =========================================
                HOUSEHOLD MEMBERS
            ========================================= */}

            <div
              style={{
                marginTop: 15,
                paddingTop: 12,
                borderTop:
                  "1px solid #e2e8f0",
              }}
            >
              <strong>
                Household Members (
                {entry.MEMBERS?.length || 0}
                )
              </strong>

              {entry.MEMBERS?.length > 0 ? (
                <div
                  style={{
                    marginTop: 8,
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Sex</th>
                        <th>Age</th>
                        <th>
                          Civil Status
                        </th>
                        <th>
                          Date of Birth
                        </th>
                        <th>
                          Relationship
                        </th>
                        <th>
                          Monitored
                        </th>
                        <th>
                          Education
                        </th>
                        <th>
                          Occupation
                        </th>
                        <th>Income</th>
                        <th>
                          Disability
                        </th>
                        <th>Remarks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {entry.MEMBERS.map(
                        (
                          member,
                          memberIndex
                        ) => (
                          <tr
                            key={`${entry.HHID}-${memberIndex}`}
                          >
                            <td>
                              {member.NAME}
                            </td>
                            <td>
                              {member.SEX}
                            </td>
                            <td>
                              {member.AGE ??
                                calculateAge(
                                  member.D_BIRTH
                                )}
                            </td>
                            <td>
                              {member.CSTAT}
                            </td>
                            <td>
                              {formatDate(member.D_BIRTH)}
                            </td>
                            <td>
                              {
                                member.R_TO_THE_HEAD
                              }
                            </td>
                            <td>
                              {member.M_CHILD}
                            </td>
                            <td>
                              {member.E_ATTAIN}
                            </td>
                            <td>
                              {
                                member.OCCUPATION
                              }
                            </td>
                            <td>
                              {member.M_INCOME}
                            </td>
                            <td>
                              {
                                member.DISABILITY
                              }
                            </td>
                            <td>
                              {member.REMARKS}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 8,
                    color: "#64748b",
                  }}
                >
                  No household members found.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
