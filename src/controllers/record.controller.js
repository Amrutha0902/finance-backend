const recordService = require("../services/record.service");
const { success, paginated } = require("../utils/response");

function listRecords(req, res, next) {
  try {
    const { data, pagination } = recordService.listRecords(req.query);
    return paginated(res, data, pagination, "Records retrieved.");
  } catch (err) {
    next(err);
  }
}

function getRecordById(req, res, next) {
  try {
    const record = recordService.getRecordById(req.params.id);
    return success(res, record, "Record retrieved.");
  } catch (err) {
    next(err);
  }
}

function createRecord(req, res, next) {
  try {
    const record = recordService.createRecord(req.body, req.user.id);
    return success(res, record, "Record created successfully.", 201);
  } catch (err) {
    next(err);
  }
}

function updateRecord(req, res, next) {
  try {
    const record = recordService.updateRecord(req.params.id, req.body);
    return success(res, record, "Record updated successfully.");
  } catch (err) {
    next(err);
  }
}

function deleteRecord(req, res, next) {
  try {
    recordService.deleteRecord(req.params.id);
    return success(res, null, "Record deleted successfully.");
  } catch (err) {
    next(err);
  }
}

module.exports = { listRecords, getRecordById, createRecord, updateRecord, deleteRecord };
