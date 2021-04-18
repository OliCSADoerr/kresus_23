"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const banks_20200414_1 = require("./banks-20200414");
const remove_migrated_from_cozydb_1 = require("./remove-migrated-from-cozydb");
const MIGRATIONS = [banks_20200414_1.updateBanks, remove_migrated_from_cozydb_1.run];
async function runDataMigrations(userId) {
    const manager = typeorm_1.getManager();
    for (const migration of MIGRATIONS) {
        await migration(userId, manager);
    }
}
exports.default = runDataMigrations;
