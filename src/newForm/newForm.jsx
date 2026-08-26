import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzB5rbWa--Zm2yBsTQDic5BYvtqF3ClJm09cGFFr7dIur1gt344HVFGaSrMRaVEPqJyBg/exec";

// =========================================================
// HELPERS
// =========================================================

function formatDate(dateValue) {
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
}

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ReceiptField({ label, value }) {
  return (
    <div
      style={{
        padding: 10,
        backgroundColor: "#f8fafc",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 3,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#1e293b",
          wordBreak: "break-word",
        }}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

function ReceiptCell({ value }) {
  return (
    <td
      style={{
        border: "1px solid #cbd5e1",
        padding: 8,
        verticalAlign: "middle",
        textAlign: "center",
      }}
    >
      {value || "N/A"}
    </td>
  );
}

function calculateAge(dateValue) {
  if (!dateValue) return "";

  const birthDate = new Date(dateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
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

  return age >= 0 ? age : "";
}

function calculateYearsInProgram(dateValue) {
  if (!dateValue) return "";

  const registrationDate = new Date(dateValue);

  if (Number.isNaN(registrationDate.getTime())) {
    return "";
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

  return years >= 0 ? years : "";
}

// =========================================================
// EMPTY MEMBER
// =========================================================

const createEmptyMember = () => ({
  NAME: "",
  SEX: "",
  D_BIRTH: "",
  CSTAT: "",
  R_TO_THE_HEAD: "",
  M_CHILD: "",
  E_ATTAIN: "",
  OCCUPATION: "",
  M_INCOME: "",
  DISABILITY: "",
  REMARKS: "",
});

// =========================================================
// COMPONENT
// =========================================================

export default function NewForm() {
  const navigate = useNavigate();

  const initialFormData = {
    HHID: "",
    DATE_REG: "",
    HH_SET: "",
    G_NAME: "",
    SEX: "",
    C_STATS: "",
    DATE_BIRTH: "",
    PLACE_BIRTH: "",
    ADDRESS: "",
    IP_AFFIL: "",
    S_INFO: "",
    CP_NO: "",
    HH_LEVEL_WBEING: "",
    CASE_CAT: "",
    CASE_NO: "",
    RISK_LEVEL: "",
    MEMBERS: [],
  };

  const [formData, setFormData] =
    useState(initialFormData);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
const [receiptData, setReceiptData] = useState(null);

  // =======================================================
  // HANDLE MAIN FORM
  // =======================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =======================================================
  // ADD MEMBER
  // =======================================================

  function addMember() {
    setFormData((prev) => ({
      ...prev,
      MEMBERS: [
        ...prev.MEMBERS,
        createEmptyMember(),
      ],
    }));
  }

  // =======================================================
  // REMOVE MEMBER
  // =======================================================

  function removeMember(index) {
    setFormData((prev) => ({
      ...prev,
      MEMBERS: prev.MEMBERS.filter(
        (_, i) => i !== index
      ),
    }));
  }

  // =======================================================
  // HANDLE MEMBER CHANGE
  // =======================================================

  function handleMemberChange(
    index,
    e
  ) {
    const { name, value } = e.target;

    setFormData((prev) => {
      const members = [...prev.MEMBERS];

      members[index] = {
        ...members[index],
        [name]: value,
      };

      return {
        ...prev,
        MEMBERS: members,
      };
    });
  }

  // =======================================================
  // SUBMIT
  // =======================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.HHID.trim()) {
      setMessage(
        "Household ID is required."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,

        // Automatically calculated values
        AGE: calculateAge(
          formData.DATE_BIRTH
        ),

        YRS_PROGRAM:
          calculateYearsInProgram(
            formData.DATE_REG
          ),

        // Automatically calculate
        // member ages
        MEMBERS: formData.MEMBERS.map(
          (member) => ({
            ...member,
            AGE: calculateAge(
              member.D_BIRTH
            ),
          })
        ),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          action: "add",
          data: payload,
        }),
      });

      const result = await res.json();

   if (result.status === "success") {
  const submittedData = {
    ...payload,
    submittedAt: new Date(),
  };

  setReceiptData(submittedData);
  setShowReceipt(true);

  setMessage("");
  setFormData(initialFormData);
} else {
        setMessage(
          result.message ||
            "Submission failed."
        );
      }
    } catch (error) {
      console.error(
        "Submission error:",
        error
      );

      setMessage(
        "Network or server error."
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // STYLES
  // =======================================================

  const sectionStyle = {
    marginBottom: 25,
    padding: 20,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    backgroundColor: "#fff",
  };

  const sectionTitleStyle = {
    margin: "0 0 18px",
    fontSize: 17,
    fontWeight: 700,
    color: "#1e293b",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  };

  const readonlyStyle = {
    ...inputStyle,
    backgroundColor: "#f1f5f9",
    color: "#475569",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 90,
    resize: "vertical",
    fontFamily: "inherit",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const receiptThStyle = {
  padding: "9px 10px",
  textAlign: "left",
  borderBottom: "1px solid #cbd5e1",
  fontWeight: 700,
  color: "#334155",
};

const receiptTdStyle = {
  padding: "9px 10px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
};

  // =======================================================
  // UI
  // =======================================================

  function formatReceiptDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatReceiptDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 25,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <img
            src="/logo.png"
            width={260}
            height={80}
            alt="Logo"
            style={{
              objectFit: "contain",
            }}
          />

          <h2
            style={{
              margin: "10px 0 0",
              color: "#1e293b",
            }}
          >
            SOCIAL CASE STUDY REPORT
          </h2>
        </div>

     {/* =====================================================
    SUBMISSION RECEIPT MODAL
===================================================== */}

{showReceipt && receiptData && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 10000,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 700,
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      }}
    >
      {/* =================================================
          RECEIPT HEADER
      ================================================= */}

      <div
        style={{
          padding: "25px 30px",
          borderBottom: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 55,
            height: 55,
            margin: "0 auto 10px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <h2
          style={{
            margin: 0,
            color: "#166534",
            fontSize: 22,
          }}
        >
          Submission Successful
        </h2>

        <p
          style={{
            margin: "8px 0 0",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Your Social Case Study Report has been submitted successfully.
        </p>
      </div>

      {/* =================================================
          RECEIPT CONTENT
      ================================================= */}

      <div
        style={{
          padding: 30,
        }}
      >
        {/* RECEIPT INFORMATION */}

        <div
          style={{
            padding: 18,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            backgroundColor: "#f8fafc",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: "0 0 15px",
              fontSize: 16,
              color: "#1e293b",
            }}
          >
            Submission Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 15,
            }}
          >
            <div>
              <strong>Household ID:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.HHID || "N/A"}
              </div>
            </div>

            <div>
              <strong>Grantee's Name:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.G_NAME || "N/A"}
              </div>
            </div>

            <div>
              <strong>Date of Registration:</strong>
              <div style={{ marginTop: 3 }}>
                {formatDate(receiptData.DATE_REG)}
              </div>
            </div>

            <div>
              <strong>Date of Birth:</strong>
              <div style={{ marginTop: 3 }}>
                {formatDate(receiptData.DATE_BIRTH)}
              </div>
            </div>

            <div>
              <strong>Age:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.AGE || "N/A"}
              </div>
            </div>

            <div>
              <strong>HH Set:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.HH_SET || "N/A"}
              </div>
            </div>

            <div>
              <strong>Years in Program:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.YRS_PROGRAM || "N/A"}
              </div>
            </div>

            <div>
              <strong>Number of Members:</strong>
              <div style={{ marginTop: 3 }}>
                {receiptData.MEMBERS?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ADDITIONAL INFORMATION
        ================================================= */}

        <div
          style={{
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 16,
              color: "#1e293b",
            }}
          >
            Submitted Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              fontSize: 14,
            }}
          >
            <div>
              <strong>Sex:</strong>{" "}
              {receiptData.SEX || "N/A"}
            </div>

            <div>
              <strong>Civil Status:</strong>{" "}
              {receiptData.C_STATS || "N/A"}
            </div>

            <div>
              <strong>Place of Birth:</strong>{" "}
              {receiptData.PLACE_BIRTH || "N/A"}
            </div>

            <div>
              <strong>IP Affiliation:</strong>{" "}
              {receiptData.IP_AFFIL || "N/A"}
            </div>

            <div>
              <strong>Contact No.:</strong>{" "}
              {receiptData.CP_NO || "N/A"}
            </div>

            <div>
              <strong>Case Category:</strong>{" "}
              {receiptData.CASE_CAT || "N/A"}
            </div>

            <div>
              <strong>Case No.:</strong>{" "}
              {receiptData.CASE_NO || "N/A"}
            </div>

            <div>
              <strong>Risk Level:</strong>{" "}
              {receiptData.RISK_LEVEL || "N/A"}
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <strong>Address:</strong>{" "}
              {receiptData.ADDRESS || "N/A"}
            </div>
          </div>
        </div>

       {/* =================================================
    HOUSEHOLD MEMBERS
================================================= */}

<div>
  <h3
    style={{
      margin: "0 0 12px",
      fontSize: 16,
      color: "#1e293b",
    }}
  >
    Household Members
  </h3>

  {receiptData.MEMBERS?.length > 0 ? (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 1200,
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f8fafc",
            }}
          >
            <th style={receiptThStyle}>
              Name
            </th>

            <th style={receiptThStyle}>
              Sex
            </th>

            <th style={receiptThStyle}>
              Date of Birth
            </th>

            <th style={receiptThStyle}>
              Age
            </th>

            <th style={receiptThStyle}>
              Civil Status
            </th>

            <th style={receiptThStyle}>
              Relationship to Head
            </th>

            <th style={receiptThStyle}>
              Monitored Child
            </th>

            <th style={receiptThStyle}>
              Educational Attainment
            </th>

            <th style={receiptThStyle}>
              Occupation
            </th>

            <th style={receiptThStyle}>
              Monthly Income
            </th>

            <th style={receiptThStyle}>
              Disability
            </th>

            <th style={receiptThStyle}>
              Remarks
            </th>
          </tr>
        </thead>

        <tbody>
          {receiptData.MEMBERS.map(
            (member, index) => (
              <tr key={index}>
                {/* NAME */}
                <td style={receiptTdStyle}>
                  {member.NAME || "N/A"}
                </td>

                {/* SEX */}
                <td style={receiptTdStyle}>
                  {member.SEX || "N/A"}
                </td>

                {/* DATE OF BIRTH */}
                <td style={receiptTdStyle}>
                  {formatDate(member.D_BIRTH)}
                </td>

                {/* AGE */}
                <td style={receiptTdStyle}>
                  {member.AGE !== "" &&
                  member.AGE !== undefined &&
                  member.AGE !== null
                    ? member.AGE
                    : "N/A"}
                </td>

                {/* CIVIL STATUS */}
                <td style={receiptTdStyle}>
                  {member.CSTAT || "N/A"}
                </td>

                {/* RELATIONSHIP */}
                <td style={receiptTdStyle}>
                  {member.R_TO_THE_HEAD || "N/A"}
                </td>

                {/* MONITORED CHILD */}
                <td style={receiptTdStyle}>
                  {member.M_CHILD || "N/A"}
                </td>

                {/* EDUCATIONAL ATTAINMENT */}
                <td style={receiptTdStyle}>
                  {member.E_ATTAIN || "N/A"}
                </td>

                {/* OCCUPATION */}
                <td style={receiptTdStyle}>
                  {member.OCCUPATION || "N/A"}
                </td>

                {/* MONTHLY INCOME */}
                <td style={receiptTdStyle}>
                  {member.M_INCOME
                    ? `₱${Number(
                        member.M_INCOME
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "N/A"}
                </td>

                {/* DISABILITY */}
                <td style={receiptTdStyle}>
                  {member.DISABILITY || "N/A"}
                </td>

                {/* REMARKS */}
                <td
                  style={{
                    ...receiptTdStyle,
                    minWidth: 180,
                  }}
                >
                  {member.REMARKS || "N/A"}
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
        padding: 15,
        borderRadius: 8,
        backgroundColor: "#f8fafc",
        color: "#64748b",
      }}
    >
      No household members were submitted.
    </div>
  )}
</div>

        {/* =================================================
            SUBMITTED DATE
        ================================================= */}

        <div
          style={{
            marginTop: 20,
            paddingTop: 15,
            borderTop: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Submitted on:{" "}
          <strong>
            {formatDateTime(
              receiptData.submittedAt
            )}
          </strong>
        </div>
      </div>

      {/* =================================================
          BUTTONS
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          padding: "18px 30px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <button
          type="button"
          onClick={() => setShowReceipt(false)}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            backgroundColor: "#fff",
            color: "#334155",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🖨️ Print Receipt
        </button>
      </div>
    </div>
  </div>
)}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              IDENTIFYING INFORMATION
          ================================================= */}

          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              I. IDENTIFYING INFORMATION
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 15,
              }}
            >
              {/* HHID */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Household ID No. *
                </label>

                <input
                  name="HHID"
                  value={formData.HHID}
                  onChange={handleChange}
                  required
                  placeholder="Household ID"
                  style={inputStyle}
                />
              </div>

              {/* DATE REGISTRATION */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Date of Registration
                </label>

                <input
                  type="date"
                  name="DATE_REG"
                  value={formData.DATE_REG}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* HH SET */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  HH Set
                </label>

                <input
                  name="HH_SET"
                  value={formData.HH_SET}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* YEARS IN PROGRAM */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Years in the Program
                </label>

                <input
                  value={calculateYearsInProgram(
                    formData.DATE_REG
                  )}
                  readOnly
                  placeholder="Automatically calculated"
                  style={readonlyStyle}
                />
              </div>

              {/* GRANTEE */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Grantee's Name
                </label>

                <input
                  name="G_NAME"
                  value={formData.G_NAME}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* SEX */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Sex
                </label>

                <select
                  name="SEX"
                  value={formData.SEX}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">
                    -- Select --
                  </option>
                  <option value="MALE">
                    Male
                  </option>
                  <option value="FEMALE">
                    Female
                  </option>
                </select>
              </div>

              {/* CIVIL STATUS */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Civil Status
                </label>

                <select
                  name="C_STATS"
                  value={formData.C_STATS}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">
                    -- Select --
                  </option>
                  <option value="SINGLE">
                    Single
                  </option>
                  <option value="MARRIED">
                    Married
                  </option>
                  <option value="WIDOWED">
                    Widowed
                  </option>
                  <option value="SEPARATED">
                    Separated
                  </option>
                  <option value="LIVE-IN">
                    Live-in
                  </option>
                </select>
              </div>

              {/* DATE BIRTH */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="DATE_BIRTH"
                  value={formData.DATE_BIRTH}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* AGE */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Age
                </label>

                <input
                  value={calculateAge(
                    formData.DATE_BIRTH
                  )}
                  readOnly
                  placeholder="Automatically calculated"
                  style={readonlyStyle}
                />
              </div>

              {/* PLACE BIRTH */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Place of Birth
                </label>

                <input
                  name="PLACE_BIRTH"
                  value={
                    formData.PLACE_BIRTH
                  }
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* IP */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  IP Affiliation
                </label>

                <input
                  name="IP_AFFIL"
                  value={formData.IP_AFFIL}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* SOURCE */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Source of Information
                </label>

                <input
                  name="S_INFO"
                  value={formData.S_INFO}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* CONTACT */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Cellphone Number
                </label>

                <input
                  type="tel"
                  name="CP_NO"
                  value={formData.CP_NO}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* WELL BEING */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  HH Level of Well-being
                </label>

                <input
                  name="HH_LEVEL_WBEING"
                  value={
                    formData.HH_LEVEL_WBEING
                  }
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* CASE CATEGORY */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Case Category
                </label>

                <input
                  name="CASE_CAT"
                  value={formData.CASE_CAT}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* CASE NO */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Case No.
                </label>

                <input
                  name="CASE_NO"
                  value={formData.CASE_NO}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* RISK */}

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Risk Level
                </label>

                <select
                  name="RISK_LEVEL"
                  value={formData.RISK_LEVEL}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">
                    -- Select --
                  </option>
                  <option value="LOW">
                    Low
                  </option>
                  <option value="MODERATE">
                    Moderate
                  </option>
                  <option value="HIGH">
                    High
                  </option>
                  <option value="CRITICAL">
                    Critical
                  </option>
                </select>
              </div>

              {/* ADDRESS */}

              <div
                style={{
                  ...fieldStyle,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={labelStyle}>
                  Present Address
                </label>

                <textarea
                  name="ADDRESS"
                  value={formData.ADDRESS}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              FAMILY COMPOSITION
          ================================================= */}

          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
                gap: 10,
              }}
            >
              <h3
                style={{
                  ...sectionTitleStyle,
                  margin: 0,
                }}
              >
                II. FAMILY COMPOSITION
              </h3>

              {/* PLUS BUTTON */}

              <button
                type="button"
                onClick={addMember}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 400,
                }}
                title="Add household member"
              >
                +
              </button>
            </div>

            {/* EMPTY STATE */}

            {formData.MEMBERS.length === 0 && (
              <div
                style={{
                  padding: 25,
                  textAlign: "center",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 8,
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                }}
              >
                No household members added.
                <br />
                Click the <strong>+</strong> button
                to add a member.
              </div>
            )}

            {/* MEMBER ROWS */}

            {formData.MEMBERS.map(
              (member, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: 15,
                    marginBottom: 15,
                    backgroundColor: "#f8fafc",
                  }}
                >
                  {/* MEMBER HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
                    <strong
                      style={{
                        color: "#334155",
                      }}
                    >
                      Member {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeMember(index)
                      }
                      style={{
                        border: "none",
                        backgroundColor:
                          "#dc2626",
                        color: "#fff",
                        borderRadius: 5,
                        padding:
                          "6px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {/* NAME */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Name
                      </label>

                      <input
                        name="NAME"
                        value={member.NAME}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* SEX */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Sex
                      </label>

                      <select
                        name="SEX"
                        value={member.SEX}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          -- Select --
                        </option>

                        <option value="MALE">
                          Male
                        </option>

                        <option value="FEMALE">
                          Female
                        </option>
                      </select>
                    </div>

                    {/* DATE OF BIRTH */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        name="D_BIRTH"
                        value={
                          member.D_BIRTH
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* AGE */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Age
                      </label>

                      <input
                        value={calculateAge(
                          member.D_BIRTH
                        )}
                        readOnly
                        style={readonlyStyle}
                      />
                    </div>

                    {/* CIVIL STATUS */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Civil Status
                      </label>

                      <select
                        name="CSTAT"
                        value={member.CSTAT}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          -- Select --
                        </option>

                        <option value="SINGLE">
                          Single
                        </option>

                        <option value="MARRIED">
                          Married
                        </option>

                        <option value="WIDOWED">
                          Widowed
                        </option>

                        <option value="SEPARATED">
                          Separated
                        </option>

                        <option value="LIVE-IN">
                          Live-in
                        </option>
                      </select>
                    </div>

                    {/* RELATIONSHIP */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Relationship to Head
                      </label>

                      <input
                        name="R_TO_THE_HEAD"
                        value={
                          member.R_TO_THE_HEAD
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* MONITORED CHILD */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Monitored Child
                      </label>

                      <select
                        name="M_CHILD"
                        value={member.M_CHILD}
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      >
                        <option value="">
                          -- Select --
                        </option>

                        <option value="YES">
                          Yes
                        </option>

                        <option value="NO">
                          No
                        </option>
                      </select>
                    </div>

                    {/* EDUCATION */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Educational Attainment
                      </label>

                      <input
                        name="E_ATTAIN"
                        value={
                          member.E_ATTAIN
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* OCCUPATION */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Occupation
                      </label>

                      <input
                        name="OCCUPATION"
                        value={
                          member.OCCUPATION
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* MONTHLY INCOME */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Monthly Income
                      </label>

                      <input
                        type="number"
                        name="M_INCOME"
                        value={
                          member.M_INCOME
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        min="0"
                        step="0.01"
                        style={inputStyle}
                      />
                    </div>

                    {/* DISABILITY */}

                    <div style={fieldStyle}>
                      <label
                        style={labelStyle}
                      >
                        Disability
                      </label>

                      <input
                        name="DISABILITY"
                        value={
                          member.DISABILITY
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={inputStyle}
                      />
                    </div>

                    {/* REMARKS */}

                    <div
                      style={{
                        ...fieldStyle,
                        gridColumn:
                          "1 / -1",
                      }}
                    >
                      <label
                        style={labelStyle}
                      >
                        Remarks
                      </label>

                      <textarea
                        name="REMARKS"
                        value={
                          member.REMARKS
                        }
                        onChange={(e) =>
                          handleMemberChange(
                            index,
                            e
                          )
                        }
                        style={{
                          ...textareaStyle,
                          minHeight: 60,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div
              style={{
                padding: 12,
                marginBottom: 15,
                borderRadius: 6,
                backgroundColor:
                  message.includes(
                    "success"
                  )
                    ? "#dcfce7"
                    : "#fee2e2",
                color:
                  message.includes(
                    "success"
                  )
                    ? "#166534"
                    : "#991b1b",
                fontWeight: 500,
              }}
            >
              {message}
            </div>
          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 10,
              paddingBottom: 30,
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              disabled={loading}
              style={{
                padding:
                  "10px 18px",
                borderRadius: 6,
                border:
                  "1px solid #cbd5e1",
                backgroundColor:
                  "#fff",
                color:
                  "#334155",
                fontWeight: 600,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding:
                  "10px 22px",
                borderRadius: 6,
                border: "none",
                backgroundColor:
                  loading
                    ? "#94a3b8"
                    : "#16a34a",
                color: "#fff",
                fontWeight: 600,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "Submitting..."
                : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          LOADING OVERLAY
      ===================================================== */}

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor:
                "#fff",
              padding:
                "25px 35px",
              borderRadius: 10,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 35,
                height: 35,
                border:
                  "4px solid #e2e8f0",
                borderTop:
                  "4px solid #16a34a",
                borderRadius:
                  "50%",
                animation:
                  "spin 0.8s linear infinite",
              }}
            />

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Submitting...
            </div>
          </div>
        </div>
      )}

      <style>
  {`
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @media print {
      body {
        background: white !important;
      }

      button {
        display: none !important;
      }

      input,
      textarea,
      select {
        border: none !important;
      }
    }
  `}
</style>
    </div>
  );
}
