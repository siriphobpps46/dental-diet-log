/**
 * Dental Diet Log — Google Apps Script backend
 *
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Sheet "Entries" columns (row 1 = header, created automatically on first run):
 *   id | date | time | mealType | description | water | photoUrls | note | createdAt | updatedAt
 *
 * Client sends POST with Content-Type: text/plain to avoid CORS preflight.
 * Body is a JSON string, parsed manually from e.postData.contents.
 *
 * doGet(?photo=FILE_ID) returns a photo as base64 JSON instead of the raw
 * drive.google.com link — Chrome's Opaque Response Blocking rejects hotlinked
 * Drive URLs in <img> tags since Drive doesn't send CORS/CORP headers, and
 * Web Apps can't return a raw Blob from doGet ("unsupported result type"),
 * so the client fetches this and renders it as a data: URL (see lib/api.ts).
 */

var SHEET_NAME = 'Entries';
var PHOTO_FOLDER_PROP = 'PHOTO_FOLDER_ID';
var PHOTO_FOLDER_NAME = 'Dental Diet Log Photos';
var HEADERS = ['id', 'date', 'time', 'mealType', 'description', 'water', 'photoUrls', 'note', 'createdAt', 'updatedAt'];

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};

    if (params.photo) {
      return servePhoto_(params.photo);
    }

    var sheet = getSheet_();
    var rows = readAllRows_(sheet);
    var entries = rows.map(rowToEntry_);

    if (params.date) {
      entries = entries.filter(function (entry) { return entry.date === params.date; });
    } else if (params.from || params.to) {
      var from = params.from || '0000-00-00';
      var to = params.to || '9999-99-99';
      entries = entries.filter(function (entry) { return entry.date >= from && entry.date <= to; });
    }

    entries.sort(function (a, b) {
      var da = a.date + ' ' + a.time;
      var db = b.date + ' ' + b.time;
      return da < db ? -1 : da > db ? 1 : 0;
    });

    return jsonResponse_({ ok: true, entries: entries });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function servePhoto_(fileId) {
  try {
    var blob = DriveApp.getFileById(fileId).getBlob();
    return jsonResponse_({
      ok: true,
      mimeType: blob.getContentType(),
      base64: Utilities.base64Encode(blob.getBytes())
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Missing request body');
    }
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'create') {
      return jsonResponse_({ ok: true, entry: createEntry_(body.entry) });
    } else if (action === 'update') {
      return jsonResponse_({ ok: true, entry: updateEntry_(body.entry) });
    } else if (action === 'delete') {
      deleteEntry_(body.entry.id);
      return jsonResponse_({ ok: true });
    } else {
      throw new Error('Unknown action: ' + action);
    }
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

// ---------- Entry CRUD ----------

function createEntry_(input) {
  var sheet = getSheet_();
  var now = new Date().toISOString();
  var photoUrls = uploadPhotos_(input.photos);

  var entry = {
    id: Utilities.getUuid(),
    date: input.date || '',
    time: input.time || '',
    mealType: input.mealType || '',
    description: input.description || '',
    water: input.water || '',
    photoUrls: photoUrls.join(','),
    note: input.note || '',
    createdAt: now,
    updatedAt: now
  };

  sheet.appendRow(HEADERS.map(function (key) { return entry[key]; }));
  return rowToEntry_(entry);
}

function updateEntry_(input) {
  if (!input || !input.id) throw new Error('Missing entry id');
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var idCol = HEADERS.indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === input.id) {
      var existing = rowToEntry_(rowArrayToObject_(data[i]));
      var newPhotoUrls = uploadPhotos_(input.photos);
      var keptUrls = input.existingPhotoUrls || existing.photoUrls;
      var photoUrls = keptUrls.concat(newPhotoUrls);

      var updated = {
        id: existing.id,
        date: input.date != null ? input.date : existing.date,
        time: input.time != null ? input.time : existing.time,
        mealType: input.mealType != null ? input.mealType : existing.mealType,
        description: input.description != null ? input.description : existing.description,
        water: input.water != null ? input.water : existing.water,
        photoUrls: photoUrls.join(','),
        note: input.note != null ? input.note : existing.note,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      };

      var rowValues = HEADERS.map(function (key) { return updated[key]; });
      sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([rowValues]);
      return rowToEntry_(updated);
    }
  }
  throw new Error('Entry not found: ' + input.id);
}

function deleteEntry_(id) {
  if (!id) throw new Error('Missing entry id');
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var idCol = HEADERS.indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error('Entry not found: ' + id);
}

// ---------- Sheet helpers ----------

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function readAllRows_(sheet) {
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i].join('') === '') continue;
    rows.push(rowArrayToObject_(data[i]));
  }
  return rows;
}

function rowArrayToObject_(row) {
  var obj = {};
  HEADERS.forEach(function (key, i) { obj[key] = row[i]; });
  return obj;
}

function rowToEntry_(obj) {
  return {
    id: String(obj.id),
    date: formatDateValue_(obj.date),
    time: formatTimeValue_(obj.time),
    mealType: String(obj.mealType),
    description: String(obj.description),
    water: String(obj.water),
    photoUrls: obj.photoUrls ? String(obj.photoUrls).split(',').filter(Boolean) : [],
    note: String(obj.note),
    createdAt: String(obj.createdAt),
    updatedAt: String(obj.updatedAt)
  };
}

// Sheets auto-converts strings like "2026-07-09" or "08:00" into real Date
// cells on write, so reads must convert back to the plain YYYY-MM-DD /
// HH:mm strings the client expects instead of stringifying the Date object.
function formatDateValue_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '');
}

function formatTimeValue_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(value || '');
}

// ---------- Drive photo upload ----------

function uploadPhotos_(photos) {
  if (!photos || !photos.length) return [];
  var folder = getPhotoFolder_();
  return photos.map(function (photo) {
    var mimeType = photo.mimeType || 'image/jpeg';
    var name = photo.name || ('photo-' + new Date().getTime() + '.jpg');
    var bytes = Utilities.base64Decode(photo.base64);
    var blob = Utilities.newBlob(bytes, mimeType, name);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/uc?id=' + file.getId();
  });
}

function getPhotoFolder_() {
  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty(PHOTO_FOLDER_PROP);
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (err) {
      // fall through and recreate
    }
  }
  var folder = DriveApp.createFolder(PHOTO_FOLDER_NAME);
  props.setProperty(PHOTO_FOLDER_PROP, folder.getId());
  return folder;
}

// ---------- Response helper ----------

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
