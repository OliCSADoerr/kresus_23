import {
    In,
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    Column,
    ManyToOne,
    Repository
} from 'typeorm';
import moment from 'moment';

import User from './users';
import Access from './accesses';
import Transaction from './transactions';
import Setting from './settings';

import {
    currency,
    currencyFormatter,
    UNKNOWN_ACCOUNT_TYPE,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    makeLogger,
    unwrap
} from '../../helpers';
import { ForceNumericColumn, DatetimeType } from '../helpers';

const log = makeLogger('models/entities/accounts');

@Entity()
export default class Account {
    @PrimaryGeneratedColumn()
    id!: number;

    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Access instance containing the account.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => Access, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    access!: Access;

    @Column('integer')
    accessId!: number;

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    @Column('varchar')
    vendorId!: string;

    // Account number provided by the source. Acts as an id for other models.
    @Column('varchar')
    vendorAccountId!: string;

    // external (backend) type id or UNKNOWN_ACCOUNT_TYPE.
    @Column('varchar', { default: UNKNOWN_ACCOUNT_TYPE })
    type: string = UNKNOWN_ACCOUNT_TYPE;

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    @Column({ type: DatetimeType })
    importDate!: Date;

    // Balance on the account, at the date at which it has been imported.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    initialBalance!: number;

    // Date at which the account has been polled for the last time.
    @Column({ type: DatetimeType })
    lastCheckDate!: Date;

    // Label describing the account provided by the source.
    @Column('varchar')
    label!: string;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel: string | null = null;

    // IBAN provided by the source (optional).
    @Column('varchar', { nullable: true, default: null })
    iban: string | null = null;

    // Currency used by the account.
    @Column('varchar', { nullable: true, default: null })
    currency: string | null = null;

    // If true, this account is not used to eval the balance of an access.
    @Column('boolean', { default: false })
    excludeFromBalance = false;

    // Methods.

    computeBalance = async (): Promise<number> => {
        const ops = await Transaction.byAccount(this.userId, this);
        const today = moment();
        const s = ops
            .filter(op => shouldIncludeInBalance(op, today, this.type))
            .reduce((sum, op) => sum + op.amount, this.initialBalance);
        return Math.round(s * 100) / 100;
    };

    computeOutstandingSum = async (): Promise<number> => {
        const ops = await Transaction.byAccount(this.userId, this);
        const s = ops
            .filter(op => shouldIncludeInOutstandingSum(op))
            .reduce((sum, op) => sum + op.amount, 0);
        return Math.round(s * 100) / 100;
    };

    getCurrencyFormatter = async (): Promise<Function> => {
        let checkedCurrency;
        if (currency.isKnown(this.currency)) {
            checkedCurrency = this.currency;
        } else {
            checkedCurrency = (await Setting.findOrCreateDefault(this.userId, 'default-currency'))
                .value;
        }
        return currencyFormatter(checkedCurrency);
    };

    // Static methods
    static renamings = {
        initialAmount: 'initialBalance',
        bank: 'vendorId',
        lastChecked: 'lastCheckDate',
        bankAccess: 'accessId',
        accountNumber: 'vendorAccountId',
        title: 'label'
    };

    static async byVendorId(userId, bank): Promise<Account[]> {
        if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
            log.warn('Account.byVendorId misuse: bank must be a Bank instance');
        }
        return await repo().find({ userId, vendorId: bank.uuid });
    }

    static async findMany(userId, accountIds): Promise<Account[]> {
        if (!(accountIds instanceof Array)) {
            log.warn('Account.findMany misuse: accountIds must be an Array');
        }
        if (accountIds.length && typeof accountIds[0] !== 'number') {
            log.warn('Account.findMany misuse: accountIds must be a [Number]');
        }
        return await repo().find({ userId, id: In(accountIds) });
    }

    static async byAccess(userId, access): Promise<Account[]> {
        if (typeof access !== 'object' || typeof access.id !== 'number') {
            log.warn('Account.byAccess misuse: access must be an Access instance');
        }
        return await repo().find({ userId, accessId: access.id });
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Account>): Account {
        return repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Account>): Promise<Account> {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    static async find(userId, accessId): Promise<Account | undefined> {
        return await repo().findOne({ where: { userId, id: accessId } });
    }

    static async all(userId): Promise<Account[]> {
        return await repo().find({ userId });
    }

    static async exists(userId, accessId): Promise<boolean> {
        const found = await repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }

    static async destroy(userId, accessId): Promise<void> {
        await repo().delete({ userId, id: accessId });
    }

    static async destroyAll(userId): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(userId, accountId, attributes): Promise<Account> {
        await repo().update({ userId, id: accountId }, attributes);
        return unwrap(await Account.find(userId, accountId));
    }
}

let REPO: Repository<Account> | null = null;
function repo(): Repository<Account> {
    if (REPO === null) {
        REPO = getRepository(Account);
    }
    return REPO;
}
