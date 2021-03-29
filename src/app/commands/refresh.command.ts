import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";
import {TConfigCoin} from "../config/config.type";
import {StatusCommand} from "./status.command";
import {TDBAccount, TDBAddress, TDBBalance, TDBCoin, TDBPlatform, TDBStatus, TDBUser} from "../db/db.types";
import {TSosCoin, TSosCoinSummary} from "../api/sos.service";

export class RefreshCommand extends CCommand {
    get name(): string { return 'refresh' }
    get hidden(): boolean { return true }
    get arguments(): TArgument[] {
        return [
            [], ['number'],
            ['coin'], ['coin', 'number'],
            ['sos'], ['sos', 'number'],
        ]
    }

    public async coin (ConfigCoin: TConfigCoin, usr?: CUser, limit?: number) {
        const DBPlatform: TDBPlatform = (await this.store.db.getPlatform('description', 'RPC'))[0]
        const DBCoin: TDBCoin = (await this.store.db.getCoin('ticker', ConfigCoin.ticker))[0]
        const DBStatuses: TDBStatus[] = (await this.store.db.getStatus(usr?.record?.id, DBCoin.id, DBPlatform.id, limit ? limit : (usr?.record ?  undefined : ConfigCoin.refresh.records)))
        for (let DBStatus of DBStatuses) {
            const balance: number = await this.store.rpc.balance(ConfigCoin, DBStatus.address!)
            const DBBalance: TDBBalance = (await this.store.db.newBalance(DBStatus.address_id, balance, ConfigCoin.history))![0]

            await this.store.roles.refreshUser(DBStatus.user_id)
        }
    }

    public async sos (usr?: CUser, limit?: number) {
        const DBPlatform = (await this.store.db.getPlatform('description', 'SOS'))[0]
        const SosCoins = (await this.store.sos.getCoins())!
        const DBAccounts: TDBAccount[] =
            await this.store.db.getAccount(
                usr ? 'id' : '1',
                usr ? usr.record!.id : '1',
                limit ? limit : (usr ? 1 : this.store.config.sos.refresh.records))
        for (let DBAccount of DBAccounts) {
            const SosCoinSummaries = (await this.store.sos.getCoinsSummaries(DBAccount.key, DBAccount.secret)).coinSummaries
            const DBUser = (await this.store.db.getUser('id', DBAccount.user_id))[0]

            for (let SosCoin of SosCoins) {
                const DBCoin = (await this.store.db.getCoin('ticker', SosCoin.ticker))[0]
                const SosCoinSummary = SosCoinSummaries.find((c) => c.coinId === SosCoin.id)

                if (DBCoin && SosCoinSummary) {
                    const DBStatuses = (await this.store.db.getStatus(DBUser.id, DBCoin.id, DBPlatform.id ))
                    const ConfigCoin = this.store.config.coins.find((c) => c.ticker === DBCoin.ticker)

                    let DBAddress: TDBAddress =
                        (await this.store.db.getAddress('coin_id', DBCoin.id, DBUser.id, DBPlatform.id))[0] ||
                        (await this.store.db.newAddress(DBUser.id, DBCoin.id, DBPlatform.id))[0]
                    await this.store.db.newBalance(DBAddress.id, SosCoinSummary!.balance.amount, ConfigCoin!.history)

                    await this.store.roles.refreshUser(DBUser.id)
                }
            }
        }
    }

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args)

        if (!usr.record) throw new Error(this.store.tx.get('system.error.user.unknown', l))
        try {
            switch (allowed) {
                case 0:
                case 1: {
                    for (const coin of this.store.config.coins) {
                        await this.coin(coin, usr, allowed == 1 ? +args[0] : undefined)
                        await this.store.log(`[${usr.snowflake}] Refreshed coin: ${coin.name}${allowed == 1 ? ' (records: ' + args[0] + ')' : ''}`)
                    }
                    await this.sos(usr, allowed == 1 ? +args[0] : undefined)
                    await (this.store.commands.find((c) => c.name === 'status') as StatusCommand).execute(usr, [])
                    await this.store.log(`[${usr.snowflake}] Refreshed sos${allowed == 1 ? ' (records: ' + args[0] + ')' : ''}`)
                    break
                }
                case 2:
                case 3: {
                    const coin = this.getCoins(this.arguments[allowed], args)[0]
                    await this.coin(coin, usr, allowed == 3 ? +args[1] : undefined)
                    await (this.store.commands.find((c) => c.name === 'status') as StatusCommand).execute(usr, [])
                    await this.store.log(`[${usr.snowflake}] Refreshed coin: ${coin.name}${allowed == 3 ? ' (records: ' + args[1] + ')' : ''}`)
                    break
                }
                case 4:
                case 5: {
                    await this.sos(usr, allowed == 5 ? +args[0] : undefined)
                    await (this.store.commands.find((c) => c.name === 'status') as StatusCommand).execute(usr, [])
                    await this.store.log(`[${usr.snowflake}] Refreshed sos${allowed == 5 ? ' (records: ' + args[1] + ')' : ''}`)
                    break
                }
            }
        } catch (err) {
            await this.store.log(`[${usr.snowflake}] ${this.store.config.prefix+args[0]}: :exclamation: ${err.message}`)
            const e = this.embed(usr)
            e.Text(`**:exclamation: ${err.message}**`)
            await e.Summary(usr)
            await e.send(usr.snowflake)
        }
    }
}