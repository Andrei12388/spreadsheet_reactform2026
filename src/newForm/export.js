export async function generateEntriesPDF(entriesToExport) {
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
      if (!dateValue) return "";

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
          value(entry.DATE_REG),
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
          value(entry.DATE_BIRTH),
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
        value(member.D_BIRTH),
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
            cellWidth: 20,
          },

          // Occupation
          8: {
            cellWidth: 20,
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
            cellWidth: "auto",
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