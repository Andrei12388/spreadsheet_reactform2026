const CONFIG = {
  DATABASE_SHEET: "DATABASE",
  MEMBERS_SHEET: "HH_MEMBERS",
};

// =========================================================
// SHEET ACCESS
// =========================================================

function getDatabaseSheet() {
  return SpreadsheetApp
    .getActive()
    .getSheetByName(CONFIG.DATABASE_SHEET);
}

function getMembersSheet() {
  return SpreadsheetApp
    .getActive()
    .getSheetByName(CONFIG.MEMBERS_SHEET);
}

// =========================================================
// RESPONSE
// =========================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

// =========================================================
// DATE HELPERS
// =========================================================

function calculateAge(dateValue) {
  if (!dateValue) return "";

  const birthDate = new Date(dateValue);

  if (isNaN(birthDate.getTime())) {
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
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age >= 0 ? age : "";
}

function calculateYearsInProgram(dateValue) {
  if (!dateValue) return "";

  const registrationDate =
    new Date(dateValue);

  if (
    isNaN(
      registrationDate.getTime()
    )
  ) {
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
    (
      monthDifference === 0 &&
      today.getDate() <
        registrationDate.getDate()
    )
  ) {
    years--;
  }

  return years >= 0 ? years : "";
}

// =========================================================
// GET SHEET DATA
// =========================================================

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp
    .getActive()
    .getSheetByName(sheetName);

  if (!sheet) return [];

  const lastRow =
    sheet.getLastRow();

  const lastCol =
    sheet.getLastColumn();

  if (
    lastRow < 2 ||
    lastCol < 1
  ) {
    return [];
  }

  const headers = sheet
    .getRange(
      1,
      1,
      1,
      lastCol
    )
    .getValues()[0];

  const values = sheet
    .getRange(
      2,
      1,
      lastRow - 1,
      lastCol
    )
    .getValues();

  return values.map(row => {
    const obj = {};

    headers.forEach(
      (header, index) => {
        obj[header] = row[index];
      }
    );

    return obj;
  });
}

// =========================================================
// GET DATABASE + MEMBERS
// =========================================================

function getDatabaseWithMembers() {
  const database =
    getSheetData(
      CONFIG.DATABASE_SHEET
    );

  const members =
    getSheetData(
      CONFIG.MEMBERS_SHEET
    );

  const membersByHHID = {};

  members.forEach(member => {
    const HHID =
      String(member.HHID || "")
        .trim();

    if (!HHID) return;

    if (!membersByHHID[HHID]) {
      membersByHHID[HHID] = [];
    }

    membersByHHID[HHID].push(
      member
    );
  });

  return database.map(entry => {
    const HHID =
      String(entry.HHID || "")
        .trim();

    return {
      ...entry,

      MEMBERS:
        membersByHHID[HHID] || [],
    };
  });
}

// =========================================================
// ADD HOUSEHOLD + MEMBERS
// =========================================================

function addHousehold(data) {
  const databaseSheet =
    getDatabaseSheet();

  const membersSheet =
    getMembersSheet();

  if (!databaseSheet) {
    return {
      status: "error",
      message:
        "DATABASE sheet not found",
    };
  }

  if (!membersSheet) {
    return {
      status: "error",
      message:
        "HH_MEMBERS sheet not found",
    };
  }

  // -------------------------------------------------------
  // VALIDATE HHID
  // -------------------------------------------------------

  const HHID =
    String(data.HHID || "")
      .trim();

  if (!HHID) {
    return {
      status: "error",
      message:
        "HHID is required",
    };
  }

  // -------------------------------------------------------
  // CALCULATED VALUES
  // -------------------------------------------------------

  const AGE =
    calculateAge(
      data.DATE_BIRTH
    );

  const YRS_PROGRAM =
    calculateYearsInProgram(
      data.DATE_REG
    );

  // -------------------------------------------------------
  // DATABASE HEADERS
  // -------------------------------------------------------

  const databaseLastCol =
    databaseSheet.getLastColumn();

  if (databaseLastCol < 1) {
    return {
      status: "error",
      message:
        "DATABASE sheet has no headers",
    };
  }

  const databaseHeaders =
    databaseSheet
      .getRange(
        1,
        1,
        1,
        databaseLastCol
      )
      .getValues()[0];

  // -------------------------------------------------------
  // DATABASE DATA
  // -------------------------------------------------------

  const householdData = {
    ...data,

    HHID,
    AGE,
    YRS_PROGRAM,
  };

  // MEMBERS should NOT be stored
  // inside DATABASE as an array.

  delete householdData.MEMBERS;

  const databaseRow =
    databaseHeaders.map(
      header =>
        householdData[header] ??
        ""
    );

  databaseSheet.appendRow(
    databaseRow
  );

  // -------------------------------------------------------
  // MEMBERS
  // -------------------------------------------------------

  const members =
    Array.isArray(data.MEMBERS)
      ? data.MEMBERS
      : [];

  if (members.length > 0) {
    const membersLastCol =
      membersSheet.getLastColumn();

    const memberHeaders =
      membersSheet
        .getRange(
          1,
          1,
          1,
          membersLastCol
        )
        .getValues()[0];

    const memberRows =
      members.map(member => {
        const memberData = {
          ...member,

          // Make sure every member
          // is connected to household
          HHID,

          // Calculate age from DOB
          AGE: calculateAge(
            member.D_BIRTH
          ),
        };

        return memberHeaders.map(
          header =>
            memberData[header] ??
            ""
        );
      });

    if (memberRows.length > 0) {
      membersSheet
        .getRange(
          membersSheet.getLastRow() + 1,
          1,
          memberRows.length,
          memberHeaders.length
        )
        .setValues(memberRows);
    }
  }

  return {
    status: "success",
    HHID,
    AGE,
    YRS_PROGRAM,
    membersAdded:
      members.length,
  };
}

// =========================================================
// EDIT HOUSEHOLD
// =========================================================

function editHousehold(
  HHID,
  data
) {
  const databaseSheet =
    getDatabaseSheet();

  if (!databaseSheet) {
    return {
      status: "error",
      message:
        "DATABASE sheet not found",
    };
  }

  const values =
    databaseSheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {
    return {
      status: "error",
      message:
        "No household records found",
    };
  }

  const headers =
    values[0];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    if (
      String(values[i][0])
        .trim() ===
      String(HHID).trim()
    ) {
      const updatedData = {
        ...data,

        AGE: calculateAge(
          data.DATE_BIRTH
        ),

        YRS_PROGRAM:
          calculateYearsInProgram(
            data.DATE_REG
          ),
      };

      headers.forEach(
        (header, j) => {
          if (
            updatedData[header] !==
            undefined
          ) {
            databaseSheet
              .getRange(
                i + 1,
                j + 1
              )
              .setValue(
                updatedData[
                  header
                ]
              );
          }
        }
      );

      return {
        status: "success",
        message:
          "Updated successfully",
      };
    }
  }

  return {
    status: "error",
    message:
      "HHID not found",
  };
}

// =========================================================
// DELETE HOUSEHOLD + MEMBERS
// =========================================================

function deleteHousehold(
  HHID
) {
  const databaseSheet =
    getDatabaseSheet();

  const membersSheet =
    getMembersSheet();

  if (!databaseSheet) {
    return {
      status: "error",
      message:
        "DATABASE sheet not found",
    };
  }

  // -------------------------------------------------------
  // DELETE HOUSEHOLD
  // -------------------------------------------------------

  const databaseValues =
    databaseSheet
      .getDataRange()
      .getValues();

  let householdDeleted =
    false;

  for (
    let i =
      databaseValues.length - 1;
    i >= 1;
    i--
  ) {
    if (
      String(
        databaseValues[i][0]
      ).trim() ===
      String(HHID).trim()
    ) {
      databaseSheet.deleteRow(
        i + 1
      );

      householdDeleted = true;
      break;
    }
  }

  // -------------------------------------------------------
  // DELETE MEMBERS
  // -------------------------------------------------------

  if (membersSheet) {
    const memberValues =
      membersSheet
        .getDataRange()
        .getValues();

    for (
      let i =
        memberValues.length - 1;
      i >= 1;
      i--
    ) {
      if (
        String(
          memberValues[i][0]
        ).trim() ===
        String(HHID).trim()
      ) {
        membersSheet.deleteRow(
          i + 1
        );
      }
    }
  }

  if (!householdDeleted) {
    return {
      status: "error",
      message:
        "HHID not found",
    };
  }

  return {
    status: "success",
    message:
      "Household and members deleted successfully",
  };
}

// =========================================================
// SEARCH
// =========================================================

function searchMember(query) {
  const data =
    getDatabaseWithMembers();

  const q =
    String(query || "")
      .toLowerCase()
      .trim();

  const result =
    data.filter(row =>
      JSON.stringify(row)
        .toLowerCase()
        .includes(q)
    );

  return {
    status: "success",
    data: result,
  };
}

// =========================================================
// GET API
// =========================================================

function doGet() {
  try {
    return jsonResponse({
      status: "success",

      data:
        getDatabaseWithMembers(),
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message:
        err.toString(),
    });
  }
}

// =========================================================
// POST API
// =========================================================

function doPost(e) {
  try {
    let body = {};

    // -----------------------------------------------------
    // JSON
    // -----------------------------------------------------

    if (
      e.postData &&
      e.postData.contents
    ) {
      const contents =
        e.postData.contents
          .trim();

      if (contents) {
        try {
          body =
            JSON.parse(contents);
        } catch (parseError) {
          body = {};
        }
      }
    }

    // -----------------------------------------------------
    // FALLBACK FORM PARAMETERS
    // -----------------------------------------------------

    if (
      Object.keys(body).length ===
      0
    ) {
      if (
        e.parameter &&
        Object.keys(
          e.parameter
        ).length > 0
      ) {
        body = e.parameter;
      }
    }

    // -----------------------------------------------------
    // ACTION
    // -----------------------------------------------------

    const action =
      String(
        body.action || ""
      ).toLowerCase();

    // =====================================================
    // ADD
    // =====================================================

    if (action === "add") {
      const data =
        body.data || body;

      return jsonResponse(
        addHousehold(data)
      );
    }

    // =====================================================
    // EDIT
    // =====================================================

    if (action === "edit") {
      const HHID =
        body.HHID ||
        (body.data &&
          body.data.HHID);

      const data =
        body.data || body;

      if (!HHID) {
        return jsonResponse({
          status: "error",
          message:
            "HHID is required",
        });
      }

      return jsonResponse(
        editHousehold(
          HHID,
          data
        )
      );
    }

    // =====================================================
    // DELETE
    // =====================================================

    if (action === "delete") {
      const HHID =
        body.HHID ||
        (body.data &&
          body.data.HHID);

      if (!HHID) {
        return jsonResponse({
          status: "error",
          message:
            "HHID is required",
        });
      }

      return jsonResponse(
        deleteHousehold(HHID)
      );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (action === "search") {
      return jsonResponse(
        searchMember(
          body.query ||
            body.q ||
            ""
        )
      );
    }

    // =====================================================
    // INVALID
    // =====================================================

    return jsonResponse({
      status: "error",
      message:
        "Invalid action",
    });

  } catch (err) {
    console.error(err);

    return jsonResponse({
      status: "error",
      message:
        err.toString(),
    });
  }
}
