import { CStore } from '../store/store.class';
import {
    TDBAccount,
    TDBAddress,
    TDBBalance,
    TDBCoin,
    TDBPlatform,
    TDBStatus,
    TDBUser
} from "./db.types";
import {randomString} from "../tools/tools";
const pgTypes = require('pg').types

export class CDb {

    async newUser (snowflake: string, language: string, email?: string, salt?: string): Promise<TDBUser[]> {
        return (await this.store.pool.query(
            `INSERT INTO users (snowflake, language${email?', email': ''}${salt?', salt': ''})
             VALUES ('${snowflake}', '${language}' ${email?', \''+email+'\'':''}${salt?', \''+salt+'\'':''})
             RETURNING *`))?.rows
    }

    async getUser (field: string, value: string | bigint): Promise<TDBUser[]> {
        return ((await this.store.pool.query(`SELECT * from users WHERE ${field}=${typeof value === 'string'? '\''+value+'\'' : value}`)))?.rows
    }

    async changeUser (id: bigint, field: string, value: string | bigint) {
        const res = await this.store.pool.query (
            `UPDATE users
             SET ${field}=${typeof value === 'string'? '\''+value+'\'':value}
             WHERE id=${id}
            `)
    }

    async newAccount (user_id: bigint, platform_id: bigint, key?: string, secret?: string): Promise<TDBAccount[]> {
        return (await this.store.pool.query(
            `INSERT INTO accounts (user_id, platform_id ${key?', key':''}${secret?', secret':''}, stamp)
             VALUES (${user_id}, ${platform_id}${key?', \''+key+'\'':''}${secret?', \''+secret+'\'':''}, CURRENT_TIMESTAMP)
             RETURNING *
             `))?.rows
    }

    async getAccount (field: string, value: string | bigint, limit?: number): Promise<TDBAccount[]> {
        return (await this.store.pool.query(`SELECT * from accounts WHERE ${field}=${typeof value === 'string'? '\''+value+'\'' : value} ORDER BY stamp ASC  ${ limit ? 'LIMIT ' + limit : ''}`))?.rows
    }

    async getAddress (field: string, value: string | bigint, user_id?: bigint, platform_id?: bigint): Promise<TDBAddress[]> {
        return (await this.store.pool.query(
            `SELECT * from addresses WHERE ${field}=${typeof value === 'string'? '\''+value+'\'' : value} 
                ${user_id ? ' AND user_id='+user_id : ''}
                ${platform_id ? ' AND platform_id='+platform_id : ''}
            `))?.rows
    }

    async getCoin (field: string, value: string | bigint): Promise<TDBCoin[]> {
        return (await this.store.pool.query(`SELECT * from coins WHERE ${field}=${typeof value === 'string'? '\''+value+'\'' : value}`))?.rows
    }

    async newCoin (name: string, ticker: string): Promise<TDBCoin[]> {
        return (await this.store.pool.query(`INSERT INTO coins (name, ticker) VALUES ('${name}', '${ticker}') RETURNING *`))?.rows
    }

    async getPlatform (field: string, value: string | bigint): Promise<TDBPlatform[]> {
        return (await this.store.pool.query(`SELECT * from platforms WHERE ${field}=${typeof value === 'string' ? '\'' + value + '\'' : value}`))?.rows
    }

    async newAddress (user_id: bigint, coin_id: bigint, platform_id: bigint, address?: string): Promise<TDBAddress[]> {
        return (await this.store.pool.query(
            `INSERT INTO addresses (user_id, coin_id, platform_id${address ? ', address' : ''})
             VALUES (${user_id}, ${coin_id}, ${platform_id}${address ? ', \'' + address + '\'' : ''})
             RETURNING *
             `))?.rows
    }

    async newBalance (address_id: bigint, balance: number, history: boolean): Promise<TDBBalance[]> {
        let res;
        if (!history) {
            res = await this.store.pool.query(`
                UPDATE balances
                SET balance=${balance}, stamp=CURRENT_TIMESTAMP
                FROM BALANCES
                WHERE address_id=${address_id}
                RETURNING *
            `)
        }
        if (history || (res?.rowsUpdated < 1)) {
            return (await this.store.pool.query(`
                INSERT INTO balances (address_id, balance, stamp)
                VALUES (${address_id}, ${balance}, CURRENT_TIMESTAMP)
                RETURNING *
            `))?.rows
        } else return res?.rows
    }

    /*async addPlatforms (description: string, account: boolean): Promise<TPlatformsRecord[]> {
        return (await this.store.pool.query(
            `INSERT INTO platforms (description, account)
             VALUES ('${description}', ${account})
             RETURNING *`))?.rows
    }

    async delPlatforms (id: bigint) {
        const res = await this.store.pool.query(`DELETE platforms WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`Platform ${id} not found`)
    }

    async getPlatforms (id?: bigint): Promise<TPlatformsRecord[]> {
        return (await this.store.pool.query(`SELECT * from platforms ${id?'WHERE id='+id:''}`))?.rows
    }

    async addCoins (name: string, ticker: string): Promise<TCoinsRecord[]> {
        return await this.store.pool.query(`INSERT INTO coins (name, ticker) VALUES ('${name}', ${ticker}) RETURNING *`)
    }

    async delCoins (id: bigint) {
        const res = await this.store.pool.query(`DELETE coins WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`Coin ${id} not found`)
    }

    async getCoins (id?: bigint): Promise<TCoinsRecord[]> {
        return (await this.store.pool.query(`SELECT * from coins ${id?'WHERE id='+id:''}`))?.rows
    }




    async delUsers (id: bigint) {
        const res = await this.store.pool.query(`DELETE users WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`User ${id} not found`)
    }

    async getUsers (id?: bigint): Promise<TUsersRecord[]> {
        return (await this.store.pool.query(`SELECT * from users ${id?'WHERE id='+id:''}`))?.rows
    }







    async delAccounts (id: bigint) {
        const res = await this.store.pool.query(`DELETE accounts WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`Account ${id} not found`)
    }

    async getAccounts (id?: bigint): Promise<TAccountsRecord[]> {
        return (await this.store.pool.query(`SELECT * from accounts ${id?'WHERE id='+id:''}`))?.rows
    }

    async changeAccounts (id: bigint, field: string, value: string | bigint) {
        const res = await this.store.pool.query (
            `UPDATE accounts
             SET ${field}=${typeof value === 'string'? '\''+value+'\'':value}
             WHERE id=${id}
            `)
    }


    async delAddresses (id: bigint) {
        const res = await this.store.pool.query(`DELETE addresses WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`Address ${id} not found`)
    }

    async getAddresses (id?: bigint): Promise<TAddressesRecord[]> {
        return (await this.store.pool.query(`SELECT * from addresses ${id?'WHERE id='+id:''}`))?.rows
    }





    async delBalances (id: bigint) {
        const res = await this.store.pool.query(`DELETE balances WHERE id=${id}`)
        if (res.rowCount <= 0) throw new Error(`Balance ${id} not found`)
    }

    async delAddressBalances (address_id: bigint) {
        const res = await this.store.pool.query(`DELETE balances WHERE address_id=${address_id}`)
        if (res.rowCount <= 0) throw new Error(`No balance found for address ${address_id}`)
    }

    async getBalances (id: bigint): Promise<TBalancesRecord[]> {
        return (await this.store.pool.query(`SELECT * from balances WHERE id=${id}`))?.rows
    }

    async getAddressBalances (address_id: bigint): Promise<TBalancesRecord[]> {
        return (await this.store.pool.query(`SELECT * from balances WHERE address_id=${address_id}`))?.rows
    }*/

    public normalizeTypes() {
        // select typname, oid, typarray from pg_type order by oid
        pgTypes.setTypeParser(1700, (val: string) => parseFloat(val))
        pgTypes.setTypeParser(20, (val: string) => parseInt(val))
    }

    async getStatus (user_id?: bigint, coin_id?: bigint, platform_id?: bigint, limit?: number, last: boolean = true): Promise<TDBStatus[]> {
        return (await this.store.pool.query(
            `SELECT user_id, address_id, address, coin_id, name, ticker, platform_id, balance_id, balance, stamp
             FROM (
                SELECT
                    ROW_NUMBER() OVER (PARTITION BY address_id ORDER BY stamp desc),
                    USERS.id as user_id,
                    ADDRESSES.id as address_id, ADDRESSES.address,
                    COINS.id as coin_id, COINS.name, COINS.ticker,
                    PLATFORMS.id as platform_id,
                    BALANCES.id as balance_id, BALANCES.balance, BALANCES.stamp
                FROM BALANCES
                JOIN ADDRESSES ON (
                    ADDRESSES.id = BALANCES.address_id
                    ${user_id ? 'AND ADDRESSES.user_id='+user_id : ''}
                    ${coin_id ? 'AND ADDRESSES.coin_id='+coin_id : ''}
                    ${platform_id ? 'AND ADDRESSES.platform_id='+platform_id : ''}
                )
                JOIN USERS ON (USERS.id = ADDRESSES.user_id)
                JOIN COINS ON (COINS.id = ADDRESSES.coin_id)
                JOIN PLATFORMS ON (PLATFORMS.id = ADDRESSES.platform_id)
                ) as STATUS
             WHERE (1=1) 
                ${last ? 'AND row_number=1 ' : ''}
             ORDER BY name ASC, platform_id ASC, balance DESC
                ${ limit ? 'LIMIT ' + limit : ''}
        `))?.rows
    }

    async unverifyUser (user_id: bigint): Promise<boolean> {
        const res = await this.store.pool.query(`
            DELETE FROM balances WHERE address_id IN (SELECT id FROM addresses WHERE user_id=${user_id});
            DELETE FROM addresses WHERE user_id=${user_id};
            DELETE FROM accounts WHERE user_id=${user_id};
            DELETE FROM users WHERE id=${user_id};
        `)
        return (res.length == 4) && (res[3].rowCount > 0)
    }

    async unverifyAccount (user_id: bigint, platform_id: bigint): Promise<boolean> {
        const res = await this.store.pool.query(`
             DELETE FROM balances WHERE address_id IN (SELECT id FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id});
             DELETE FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id};
             DELETE FROM accounts WHERE user_id=${user_id} AND platform_id=${platform_id};
        `)
        return (res.length == 3) && (res[2].rowCount > 0)
    }

    async unverifyCoin (user_id: bigint, platform_id: bigint, coin_id: bigint): Promise<boolean> {
        const res = await this.store.pool.query(`
            DELETE FROM balances WHERE address_id IN (SELECT id FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id} AND coin_id=${coin_id});
            DELETE FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id} AND coin_id=${coin_id};
        `)
        return (res.length == 2) && (res[1].rowCount > 0)
    }

    async unverifyAddress (user_id: bigint, platform_id: bigint, coin_id: bigint, address: string): Promise<boolean> {
        const res = await this.store.pool.query(`
            DELETE FROM balances WHERE address_id IN (SELECT id FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id} AND coin_id=${coin_id} AND address='${address}');
            DELETE FROM addresses WHERE user_id=${user_id} AND platform_id=${platform_id} AND coin_id=${coin_id} AND address='${address}' ;
        `)
        return (res.length == 2) && (res[1].rowCount > 0)
    }

    async startTransaction() { return await this.store.pool.query('BEGIN TRANSACTION') }
    async commit() { return await this.store.pool.query('END TRANSACTION') }
    async rollback() { return await this.store.pool.query('ROLLBACK') }

    constructor(private store: CStore) {
        this.normalizeTypes()
    }
}