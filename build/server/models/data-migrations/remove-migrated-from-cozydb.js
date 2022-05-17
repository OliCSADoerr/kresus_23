"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const __1 = require("../");
const helpers_1 = require("../../helpers");
const log = (0, helpers_1.makeLogger)('models/data-migrations');
async function run(userId, manager) {
    log.info('Running data migration: remove unused migrated-from-cozydb');
    const userCondition = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }
    await manager.delete(__1.Setting, { key: 'migrated-from-cozydb', ...userCondition });
    log.info('Finished data migration: remove unused migrated-from-cozydb');
}
exports.run = run;
