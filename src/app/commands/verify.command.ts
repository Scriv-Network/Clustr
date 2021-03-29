import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";
import {TSosCoin, TSosCoinSummary} from "../api/sos.service";
import {TDBAccount, TDBAddress, TDBBalance, TDBCoin, TDBPlatform} from "../db/db.types";
import {platform} from "os";
import {TConfigCoin} from "../config/config.type";
import {randomString} from "../tools/tools";
import {sign} from "crypto";

export class VerifyCommand extends CCommand {
    get name(): string { return 'verify' }

    get arguments(): TArgument[] { return [
        ['sos', 'uuid', 'base64'],
        ['coin', 'address']
    ]}

    private async signAttempt (usr: CUser, i: number, max: number, sign_message: string): Promise<string> {
        let e = this.embed(usr, false, false)
        e.Field('command.verify.rpc.attempt', [i.toString(), max.toString()])
        e.Field(i === 1 ? 'command.verify.rpc.sign' : 'command.verify.rpc.sign', [sign_message])
        await e.send(usr.snowflake)

        e = this.embed(usr)
        try {
            return await e.ask(usr.snowflake, 300000) // this.store.config.timeout)
        } catch (e) {
            throw new Error(this.store.tx.get('command.verify.rpc.timeout', usr.record?.language))
        }
    }

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args)

        if (!usr.record) throw new Error(this.store.tx.get('system.error.user.unknown', l))
        switch (allowed) {
            case 0: {
                try {
                    const DBAccounts = await this.store.db.getAccount('user_id', usr.record.id)
                    await this.store.db.startTransaction();

                    if (DBAccounts.length > 1) throw new Error (this.store.tx.get('command.verify.sos.error.multiple', l))
                    if (DBAccounts.length == 1) throw new Error (this.store.tx.get('command.verify.sos.error.registered', l))

                    const SosCoinSummaries = (await this.store.sos.getCoinsSummaries(args[1], args[2]))!
                    const SosCoins = (await this.store.sos.getCoins())!
                    const DBPlatform = (await this.store.db.getPlatform('description', 'SOS'))[0]

                    const DBAccount: TDBAccount = (await this.store.db.newAccount(usr.record.id, BigInt(1), args[1], args[2]))[0]

                    for (let i = 0; i < SosCoinSummaries.coinSummaries.length; i++) {
                        const SosCoinSummary: TSosCoinSummary = SosCoinSummaries.coinSummaries[i]
                        const SosCoin: TSosCoin = SosCoins.find((c) => c.id === SosCoinSummary.coinId)!
                        const ConfigCoin: TConfigCoin | undefined = this.store.config.coins.find((c) => c.ticker === SosCoin?.ticker)

                        if (SosCoin && ConfigCoin) {
                            const t = await this.store.db.getCoin('ticker', ConfigCoin.ticker)
                            let CoinRecord: TDBCoin =
                                (t.length == 1) ? t[0] : (await this.store.db.newCoin(ConfigCoin.name, ConfigCoin.ticker))[0]

                            const Address: TDBAddress = (await this.store.db.newAddress(usr.record.id, CoinRecord.id, DBPlatform.id))[0]!
                            const Balance: TDBBalance = (await this.store.db.newBalance(Address.id, SosCoinSummary.balance.amount, ConfigCoin.history))![0]
                        }
                    }

                    const e = this.embed(usr)
                    e.Description('command.verify.sos.success', [SosCoinSummaries.email])
                    await e.Summary(usr)
                    await e.send(usr.snowflake)

                    await this.store.db.commit()

                    await this.store.log(`[${usr.snowflake}] ${this.store.tx.get('command.verify.sos.success', l, [SosCoinSummaries.email])}`)
                } catch (err) {
                    await this.store.db.rollback()

                    await this.store.log(`[${usr.snowflake}] ${this.store.config.prefix+args[0]}: :exclamation: ${err.message}`)

                    switch (err.message) {
                        case '401 - Unauthorized': err.message = this.store.tx.get('command.verify.sos.error.failure', l); break
                    }

                    const e = this.embed(usr)
                    e.Text(`\r\n**:exclamation: ${err.message}**`)
                    await e.Summary(usr)
                    await e.send(usr.snowflake)
                }
                break
            }
            case 1: {
                try {
                    if ((await this.store.db.getAddress('address', args[1], usr.record.id)).length > 0)
                        throw new Error (this.store.tx.get('command.verify.rpc.error.multiple', l))
                    else if ((await this.store.db.getAddress('address', args[1])).length > 0)
                        throw new Error (this.store.tx.get('command.verify.rpc.error.registered', l))

                    const Coin = this.getCoins(this.arguments[allowed], args)[0]

                    const e = this.embed(usr)
                    e.Description('command.verify.rpc.test', [Coin.name, Coin.ticker, args[1]])
                    e.send(usr.snowflake)

                    const sign_message: string = randomString(64)
                    for (let i = 1; i <= 3; i++) {
                        const answer = await this.signAttempt(usr, i, 3, sign_message)
                        try {
                            await this.store.db.startTransaction();

                            if (!(await this.store.rpc.verify(Coin, args[1], answer, sign_message)))
                                throw new Error('Signature is invalid')

                            const Platform = (await this.store.db.getPlatform('description', 'RPC'))[0]

                            const t = await this.store.db.getCoin('ticker', Coin.ticker)
                            let CoinRecord: TDBCoin =
                                (t.length == 1) ? t[0] : (await this.store.db.newCoin(Coin.name, Coin.ticker))[0]

                            const balance = await this.store.rpc.balance(Coin, args[1])

                            const Address: TDBAddress = (await this.store.db.newAddress(usr.record.id, CoinRecord.id, Platform.id, args[1]))[0]!
                            const Balance: TDBBalance = (await this.store.db.newBalance(Address.id, balance, Coin.history))![0]

                            const e = this.embed(usr)

                            await e.Field('command.verify.rpc.success', [new Date().toUTCString(), balance.toString(), Coin.ticker, args[1]])
                            await e.Summary(usr)
                            await e.send(usr.snowflake)

                            await this.store.db.commit()

                            await this.store.log(`[${usr.snowflake}] ${this.store.tx.get('command.verify.rpc.success', l, [new Date().toUTCString(), balance.toString(), Coin.ticker, args[1]])}`)

                            break
                        } catch (err) {
                            await this.store.db.rollback()

                            await this.store.log(`[${usr.snowflake}] ${this.store.config.prefix+args[0]}: :exclamation: ${err.message}`)

                            const e = this.embed(usr)

                            switch (err.message) {
                                case 'Malformed base64 encoding': err.message = this.store.tx.get('command.verify.rpc.error.malformed', l); break
                                case 'Verify returned an invalid response': err.message = this.store.tx.get('command.verify.rpc.error.invalid', l); break
                            }

                            e.Description('command.verify.rpc.failure', [err.message])
                            if (i === 3) await e.Summary(usr)
                            await e.send(usr.snowflake)
                        }
                    }
                } catch (err) {
                    await this.store.log(`[${usr.snowflake}] ${this.store.config.prefix+args[0]}: :exclamation: ${err.message}`)
                    const e = this.embed(usr)
                    e.Text(`**:exclamation: ${err.message}**`)
                    await e.Summary(usr)
                    await e.send(usr.snowflake)
                }
                break
            }
            default: {
                const e = this.embed(usr);
                e.Description('command.error', [this.store.config.prefix, args[0]])
                await e.send(usr.snowflake)
            }
        }
    }
}