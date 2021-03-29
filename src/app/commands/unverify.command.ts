// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {Message} from "discord.js";
import {CUser} from "../user/user.class";
import {TDBCoin} from "../db/db.types";

export class UnverifyCommand extends CCommand {
    get name(): string {
        return 'unverify'
    }

    get arguments(): TArgument[] {
        return [
            [],
            ['sos'],
            ['coin'],
            ['coin', 'address']
        ]
    }

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args)

        if (!usr.record) throw new Error(this.store.tx.get('system.error.user.unknown', l))

        try {
            await this.store.db.startTransaction();
            const YES = this.store.tx.get('yes', l)

            switch (allowed) {
                case 0: {
                    let e = this.embed(usr)
                    e.Description('command.unverify.all.confirm')
                    await e.send()
                    const response = await e.ask()

                    if ([YES[0].toLowerCase(), YES.toLowerCase()].includes(response.toLowerCase())) {
                        const r = await this.store.db.unverifyUser(usr.record!.id)
                        if (r) await this.store.db.commit(); else await this.store.db.rollback()

                        const e = this.embed(usr)
                        e.Description(`command.unverify.all.${r?'success':'failure'}`)
                        await e.Summary()
                        await e.send()
                    } else {
                        const e = this.embed(usr)
                        e.Description('command.unverify.all.cancel')
                        await e.Summary()
                        await e.send()
                    }
                    break
                }
                case 1: {
                    let e = this.embed(usr)
                    e.Description('command.unverify.sos.confirm')
                    await e.send()
                    const response = await e.ask()

                    if ([YES[0].toLowerCase(), YES.toLowerCase()].includes(response.toLowerCase())) {
                        const DBPlatform = (await this.store.db.getPlatform('description', 'SOS'))[0]
                        const r = await this.store.db.unverifyAccount(usr.record!.id, DBPlatform.id)
                        if (r) await this.store.db.commit(); else await this.store.db.rollback()

                        const e = this.embed(usr)
                        e.Description(`command.unverify.sos.${r?'success':'failure'}`)
                        await e.Summary()
                        await e.send()
                    } else {
                        const e = this.embed(usr)
                        e.Description('command.unverify.sos.cancel')
                        await e.Summary()
                        await e.send()
                    }
                    break
                }
                case 2: {
                    const ConfigCoin = this.getCoins(this.arguments[allowed], args)[0]
                    const DBCoin: TDBCoin = (await this.store.db.getCoin('ticker', ConfigCoin.ticker))[0]

                    let e = this.embed(usr)
                    e.Description('command.unverify.rpc.confirm', [DBCoin.name, DBCoin.ticker])
                    await e.send()
                    const response = await e.ask()

                    if ([YES[0].toLowerCase(), YES.toLowerCase()].includes(response.toLowerCase())) {
                        const DBPlatform = (await this.store.db.getPlatform('description', 'RPC'))[0]

                        const r = await this.store.db.unverifyCoin(usr.record!.id, DBPlatform.id, DBCoin.id)
                        if (r) await this.store.db.commit(); else await this.store.db.rollback()

                        const e = this.embed(usr)
                        e.Description(`command.unverify.rpc.${r?'success':'failure'}`, [DBCoin.name, DBCoin.ticker])
                        await e.Summary()
                        await e.send()
                    } else {
                        const e = this.embed(usr)
                        e.Description('command.unverify.rpc.cancel', [DBCoin.name, DBCoin.ticker])
                        await e.Summary()
                        await e.send()
                    }
                    break
                }
                case 3: {
                    const ConfigCoin = this.getCoins(this.arguments[allowed], args)[0]
                    const DBCoin: TDBCoin = (await this.store.db.getCoin('ticker', ConfigCoin.ticker))[0]

                    let e = this.embed(usr)
                    e.Description('command.unverify.address.confirm', [DBCoin.name, DBCoin.ticker, args[1]])
                    await e.send()
                    const response = await e.ask()

                    if ([YES[0].toLowerCase(), YES.toLowerCase()].includes(response.toLowerCase())) {
                        const DBPlatform = (await this.store.db.getPlatform('description', 'RPC'))[0]
                        const r = await this.store.db.unverifyAddress(usr.record!.id, DBPlatform.id, DBCoin.id, args[1])
                        if (r) await this.store.db.commit(); else await this.store.db.rollback()

                        const e = this.embed(usr)
                        e.Description(`command.unverify.address.${r?'success':'failure'}`, [DBCoin.name, DBCoin.ticker, args[1]])
                        await e.Summary()
                        await e.send()
                    } else {
                        const e = this.embed(usr)
                        e.Description('command.unverify.rpc.cancel', [DBCoin.name, DBCoin.ticker, args[1]])
                        await e.Summary()
                        await e.send()
                    }
                    break
                }
                default: {
                    await this.store.db.rollback()

                    const e = this.embed(usr)
                    e.Description('command.error', [this.store.config.prefix, args[0]])
                    await e.Summary(usr)
                    await e.send()
                    break
                }
            }
        } catch (err) {
            await this.store.db.rollback()
            throw new Error(err.message)
        }
    }
}