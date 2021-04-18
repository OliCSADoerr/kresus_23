"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class SessionManager {
    constructor() {
        // A map to store session information attached to an access (cookies, last
        // visited URL...).  The access' id is the key to get the session
        // information.
        this.map = new Map();
    }
    async save(access, session) {
        // Save it as is in the in-memory cache.
        this.map.set(access.id, session);
        // Serialize it in the database.
        const serializedSession = JSON.stringify(session);
        await models_1.Access.update(access.userId, access.id, {
            session: serializedSession,
        });
    }
    async reset(access) {
        this.map.delete(access.id);
        await models_1.Access.update(access.userId, access.id, { session: null });
    }
    async read(access) {
        if (this.map.has(access.id)) {
            // It was in the cache!
            return this.map.get(access.id);
        }
        // If it's not in the cache, try to read it from the database first,
        // and save it into the in-memory cache.
        const serialized = access.session;
        if (serialized !== null) {
            try {
                const asObject = JSON.parse(serialized);
                this.map.set(access.id, asObject);
                return asObject;
            }
            catch (err) {
                // Do nothing.
            }
        }
        // Explicitly return nothing, for TypeScript.
        // eslint-disable-next-line no-useless-return
        return;
    }
}
exports.default = SessionManager;
