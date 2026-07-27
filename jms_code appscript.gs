const CONFIG = {
  SPREADSHEET_ID: "1wo-9vLB286CeTCUScpIr9RjuXjVQJntBfL4pEsmoqwc",
  DASHBOARD: "DASHBOARD",
};

const ALLOWED_SHEETS = [
  "BCRD",
  "CCESD",
  "GADC",
  "PESO",
  "QCDRRMO",
  "QCG",
  "QCHD",
  "SSDD",
  "YDO",
];

const HEADERS = [
  "id",
  "name",
  "birthday",
  "address",
  "gender",
  "intervention",
];

// =========================
// POST
// =========================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const {
      sheetName,
      name,
      birthday,
      address,
      gender,
      intervention,
    } = data;

    // =========================
    // CLEAN SHEET NAME
    // =========================
    const cleanSheetName = String(sheetName || "").trim();

    // =========================
    // VALIDATE SHEET
    // =========================
    if (!ALLOWED_SHEETS.includes(cleanSheetName)) {
      return jsonResponse({
        status: "error",
        message: "Invalid sheet name",
        receivedSheetName: cleanSheetName,
        allowedSheets: ALLOWED_SHEETS,
      });
    }

    // =========================
    // VALIDATE REQUIRED FIELD
    // =========================
    if (!name || String(name).trim() === "") {
      return jsonResponse({
        status: "error",
        message: "Name is required",
      });
    }

    // =========================
    // OPEN SPREADSHEET
    // =========================
    const ss = SpreadsheetApp.openById(
      CONFIG.SPREADSHEET_ID
    );

    const sheet = ss.getSheetByName(cleanSheetName);

    if (!sheet) {
      return jsonResponse({
        status: "error",
        message: `Sheet "${cleanSheetName}" does not exist`,
      });
    }

    // =========================
    // LOCK
    // Prevent duplicate IDs
    // =========================
    const lock = LockService.getScriptLock();

    lock.waitLock(30000);

    try {
      // =========================
      // ENSURE HEADERS
      // =========================
      if (sheet.getLastRow() === 0) {
        sheet
          .getRange(1, 1, 1, HEADERS.length)
          .setValues([HEADERS]);
      }

      // =========================
      // GENERATE AUTO ID
      // =========================
      const lastRow = sheet.getLastRow();

      let newId = 1;

      if (lastRow > 1) {
        const ids = sheet
          .getRange(2, 1, lastRow - 1, 1)
          .getValues()
          .flat()
          .map(Number)
          .filter((id) => !isNaN(id));

        if (ids.length > 0) {
          newId = Math.max(...ids) + 1;
        }
      }

      // =========================
      // SAVE DATA
      // =========================
      sheet.appendRow([
        newId,
        name,
        birthday || "",
        address || "",
        gender || "",
        intervention || "",
      ]);

      // =========================
      // RESPONSE
      // =========================
      return jsonResponse({
        status: "success",
        message: "Data saved successfully",
        data: {
          id: newId,
          sheetName: cleanSheetName,
          name,
          birthday,
          address,
          gender,
          intervention,
        },
      });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.message,
    });
  }
}

// =========================
// JSON RESPONSE
// =========================
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}