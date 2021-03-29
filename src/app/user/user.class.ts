import { CStore } from '../store/store.class';
import {TDBUser, TDBAccount, TDBAddress, TDBStatus} from '../db/db.types';

export class CUser {

    private _record: TDBUser | null = null
    public get record(): TDBUser | null { return this._record }

    private _accounts: TDBAccount[] | null = null
    public get accounts(): TDBAccount[] | null { return this._accounts }

    private _addresses: TDBAddress[] | null = null
    public get addresses(): TDBAddress[] | null { return this._addresses }

    private _status: TDBStatus[] | null = null
    public get status(): TDBStatus[] | null { return this._status }

    public async load() {
        const u = await this.store.db.getUser('snowflake', this.snowflake)
        if (u?.length == 1) this._record = u[0];
        else if (u?.length > 1) throw new Error(this.store.tx.get('system.error.user.multiple', this.store.config.languages[0]))
        else this._record = (await this.store.db.newUser(this.snowflake, this.store.config.languages[0]))[0]
        return this
    }

    public async loadAccounts() {
        if (!this.record?.id) throw new Error('No user is loaded')
        this._accounts = await this.store.db.getAccount('user_id', this.record.id)
    }

    public async loadAddresses() {
        if (!this.record?.id) throw new Error('No user is loaded')
        this._addresses = await this.store.db.getAddress('user_id', this.record.id)
    }

    public async loadStatus() {
        if (!this.record?.id) throw new Error('No user is loaded')
        this._status = await this.store.db.getStatus(this.record.id)
    }

    //let statusRecords : TStatusRecord[] = await this.store.db.getStatus(, undefined, undefined, undefined, true)

    constructor(private store: CStore, readonly snowflake: string) {}
}