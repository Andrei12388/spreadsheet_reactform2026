const CONFIG = {
  SHEET_NAME: "MasterList",
  DASHBOARD: "DASHBOARD"
};

const CHECKBOX_MAP = {
  Q: ["R"],
  S: ["T"],
  U: ["V"],
  W: ["X", "Y"],
  Z: ["AA"],
  AJ: ["AK"],
  AL: ["AM"],
  AT: ["AU"],
  AV: ["AW", "AX"],
  AY: ["AZ", "BA"]
};

// =========================
// SHEET CACHE
// =========================
function getSheet(name = CONFIG.SHEET_NAME) {
  return SpreadsheetApp.getActive().getSheetByName(name);
}

// =========================
// RESPONSE
// =========================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================
// GET
// =========================
function doGet(e) {
  if (e.parameter.settings === "true") {
  return jsonResponse({
    status: "success",
    data: getButtonSettings()
  });
}
  try {
    const entryId = e.parameter.id;

    if (!entryId) {
      return jsonResponse({ status: "ready" });
    }

    return jsonResponse(goToIdAndScan(entryId));

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// =========================
// POST (React SAFE)
// =========================
function doPost(e) {
  try {
    let data = {};

    // =========================
    // SAFE JSON PARSE
    // =========================
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    Logger.log(data);

    // =========================
    // UPDATE BUTTON SETTINGS
    // =========================
    if (
      data.settingUpdate === true ||
      data.settingUpdate === "true"
    ) {

      const sheet = SpreadsheetApp
        .getActive()
        .getSheetByName(CONFIG.DASHBOARD);

      // force TRUE/FALSE boolean
      const value =
        data.value === true ||
        data.value === "true";

      sheet
        .getRange(data.column + "2")
        .setValue(value);

      SpreadsheetApp.flush();

      return jsonResponse({
        status: "success",
        updated: data.column,
        value: value
      });
    }

    // =========================
    // NORMAL FORM SAVE
    // =========================
    fillSheetForm(data);

    return jsonResponse({
      status: "success"
    });

  } catch (err) {

    Logger.log(err);

    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

// =========================
// FIND ROW
// =========================
function findRowById(entryId) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const target = String(entryId).trim();

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === target) {
      return i + 2;
    }
  }
  return null;
}

// =========================
// GET SETTINGS
// =========================
function getButtonSettings() {
  const sheet = SpreadsheetApp.getActive()
    .getSheetByName(CONFIG.DASHBOARD);

  return {
    AS: String(sheet.getRange("AS2").getValue()).toUpperCase() === "TRUE",
    AT: String(sheet.getRange("AT2").getValue()).toUpperCase() === "TRUE",
    AU: String(sheet.getRange("AU2").getValue()).toUpperCase() === "TRUE",
    AV: String(sheet.getRange("AV2").getValue()).toUpperCase() === "TRUE"
  };
}

// =========================
// SCAN ENTRY
// =========================
function goToIdAndScan(entryId) {
  const row = findRowById(entryId);

  if (!row) {
    return { status: "NOT_FOUND" };
  }

  return {
    status: "FOUND",
    data: getScanEntry(row)
  };
}

// =========================
// FIX: COLUMN LETTER TO INDEX
// (handles AA, AB, etc)
// =========================
function colToIndex(col) {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index - 1;
}

function getColNumber(col) {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num;
}

// =========================
// GET FULL ROW DATA (FIXED)
// =========================
function getScanEntry(row) {
  const sheet = getSheet();
  if (!row || row < 2) return null;

  const rowData = sheet
    .getRange(row, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const data = {
    id: rowData[0],
    entryId: rowData[6],
    fullname: [rowData[7], rowData[8], rowData[9]].filter(Boolean).join(" "),
    folders: +(rowData[62] * 100).toFixed(2),
    pugay: +(rowData[63] * 100).toFixed(2)
  };

  // =========================
  // FIXED COLUMN READING (NO INDEX GUESSING)
  // =========================

  const allFields = [
    // BDM
    "Q","S","U","W","Z","AB",
    "R","T","V","X","Y","AA","AK","AM","AU",
    "AW","AX","AZ","BA",

    // CASE FOLDER
    "AH","AI","AJ","AL","AN","AO","AP","AQ","AR","AS","AT","AV","AY","BB","BC","BD","BE","BF",

    // EXIT
    "BG","BH","BI","BJ",

    // CASE MANAGEMENT
    "AC","AD","AE","AF","AG",

    // CITY LINK
    "BM","BN","BO","BP","BQ","BR",
    "BS","BT","BU","BV","BW","BX",
    "BY","BZ","CA","CB","CC","CD","CE","CF","CG"
  ];

  // ✅ SAFE direct sheet reading
  allFields.forEach(col => {
    data[col] = sheet.getRange(col + row).getValue();
  });

  return data;
}

// =========================
// FILL FORM
// =========================
function fillSheetForm(data) {
  const sheet = getSheet();
  const entryId = data.entryIdInput;

  if (!entryId) return;

  const row = findRowById(entryId);
  if (!row) return;

  const checkboxCols = [
    "Q","S","U","W","Z","AB",
    "AH","AI","AJ","AL","AN","AO","AQ","AP","AR","AT","AV","AY","BB",
    "BC","BD","BE","BG","BH","BI","BJ",
    "BM","BN","BO","BP","BQ","BR",
    "BS","BT","BU","BV","BW","BX",
    "BY","BZ","CA","CB","CC","CD","CE","CF","CG"
  ];

  const textCols = [
    "R","T","V","X","Y","AA","AC",
    "AD","AE","AF","AG","AK",
    "AM","AS","AU","AW","AX","AZ","BA","BF"
  ];

  // =========================
  // UPDATE FIELDS
  // =========================
  [...checkboxCols, ...textCols].forEach(col => {
    if (data[col] !== undefined) {
      sheet.getRange(col + row).setValue(data[col]);
    }
  });

  // =========================
  // CHECKBOX LOGIC
  // =========================
  Object.entries(CHECKBOX_MAP).forEach(([chk, targets]) => {
    const checked =
  data[chk] === true ||
  data[chk] === "true" ||
  data[chk] === "TRUE" ||
  data[chk] === 1 ||
  data[chk] === "1" ||
  String(data[chk]).toUpperCase() === "TRUE";

    if (!checked) {
      targets.forEach(col => {
        sheet.getRange(col + row).clearContent();
      });
    }
  });
}

// =========================
// DASHBOARD LOOKUP
// =========================
function SHEET_LOOKUP() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName(CONFIG.DASHBOARD);
  const sheetName = ss.getSheetByName(CONFIG.SHEET_NAME).getName();

  const lastRow = dashboard.getLastRow();
  if (lastRow < 8) return "Not Found";

  const sheetNames = dashboard.getRange(8, 3, lastRow - 7).getValues().flat();
  const values = dashboard.getRange(8, 2, lastRow - 7).getValues().flat();

  const index = sheetNames.indexOf(sheetName);
  return index === -1 ? "Not Found" : values[index];
}