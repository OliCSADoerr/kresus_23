"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.destroy = exports.create = exports.loadAlert = void 0;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
async function loadAlert(req, res, nextHandler, alertId) {
    try {
        const { id: userId } = req.user;
        const alert = await models_1.Alert.find(userId, alertId);
        if (!alert) {
            throw new helpers_1.KError('bank alert not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded.alert = alert;
        nextHandler();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when preloading alert');
    }
}
exports.loadAlert = loadAlert;
async function create(req, res) {
    try {
        const { id: userId } = req.user;
        const newAlert = req.body;
        if (!newAlert ||
            typeof newAlert.accountId !== 'number' ||
            typeof newAlert.type !== 'string') {
            throw new helpers_1.KError('missing parameters', 400);
        }
        const validationError = validators_1.checkAlert(newAlert);
        if (validationError) {
            throw new helpers_1.KError(validationError, 400);
        }
        const account = await models_1.Account.find(userId, newAlert.accountId);
        if (!account) {
            throw new helpers_1.KError('bank account not found', 404);
        }
        const alert = await models_1.Alert.create(userId, newAlert);
        res.status(201).json(alert);
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when creating an alert');
    }
}
exports.create = create;
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        await models_1.Alert.destroy(userId, req.preloaded.alert.id);
        res.status(204).end();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when deleting a bank alert');
    }
}
exports.destroy = destroy;
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const { alert } = req.preloaded;
        let newAlert = req.body;
        if (typeof newAlert.type !== 'undefined') {
            throw new helpers_1.KError("can't update an alert type", 400);
        }
        newAlert = Object.assign({}, alert, newAlert);
        const validationError = validators_1.checkAlert(newAlert);
        if (validationError) {
            throw new helpers_1.KError(validationError, 400);
        }
        newAlert = await models_1.Alert.update(userId, alert.id, req.body);
        res.status(200).json(newAlert);
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when updating a bank alert');
    }
}
exports.update = update;
