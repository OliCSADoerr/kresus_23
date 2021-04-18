import { EntityManager } from 'typeorm';

import { Setting } from '../';
import { makeLogger } from '../../helpers';

const log = makeLogger('models/data-migrations');

export async function run(userId: number | null, manager: EntityManager): Promise<void> {
    log.info('Running data migration: remove unused migrated-from-cozydb');

    const userCondition: { userId?: number } = {};
    if (userId !== null) {
        userCondition.userId = userId;
    }

    await manager.delete(Setting, { key: 'migrated-from-cozydb', ...userCondition });

    log.info('Finished data migration: remove unused migrated-from-cozydb');
}
