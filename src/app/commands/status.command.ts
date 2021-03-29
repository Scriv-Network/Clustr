// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";
import {TDBBalance, TDBStatus} from "../db/db.types";
import {TConfigCoin, TConfigEligibility} from "../config/config.type";

export type TCoinStatus = {
    coin?: TConfigCoin;
    eligible: TConfigEligibility[];
    status: TDBStatus[];
    total: number;
    nextRoleName: string;
    nextRoleMin: number;
}

const defaulCoinStatus: TCoinStatus = {
    eligible: [],
    status: [],
    total: 0,
    nextRoleName: 'N/A',
    nextRoleMin: 1000000000000000
}


export class StatusCommand extends CCommand {
    get name(): string {
        return 'status'
    }

    get arguments(): TArgument[] { return [
        [],
        ['coin'],
        ['sos']
    ]}

    public async coinStatuses (usr: CUser, DBStatuses: TDBStatus[]): Promise<TCoinStatus[]> {
        const r: TCoinStatus[] = []

        const granted = await this.store.roles.refreshUser(usr.record!.id)

        for (const g of granted) {
            const coinStatus: TCoinStatus = {
                ...defaulCoinStatus,
                coin: this.store.config.coins.find((c) => c.ticker === g.ticker),
                eligible: g.eligibilities
            }
            DBStatuses.map((s) => { if (s.ticker === g.ticker) coinStatus.total += s.balance })

            coinStatus.coin!.eligibilities.forEach((e) => {
                if (e.min && (e.min < coinStatus.nextRoleMin) && (coinStatus.total < e.min)) {
                    coinStatus.nextRoleMin = e.min;
                    coinStatus.nextRoleName = e.name
                }
            })
            r.push(coinStatus)
        }
        r.sort((a: TCoinStatus, b: TCoinStatus) => {
            if (a.coin!.name < b.coin!.name) return -1
            else if (a.coin!.name > b.coin!.name) return 1
            return 0
        })
        return r
    }

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args)

        if (!usr.record) throw new Error(this.store.tx.get('system.error.user.unknown', l))

        try {
            //const commandStatus = this.store.commands.find((c) => c.name === 'status') as StatusCommand
            let DBStatuses : TDBStatus[] = await this.store.db.getStatus(usr.record!.id)
            DBStatuses.sort((a, b) => {
                if (a.name < b.name) return -1
                else if (a.name > b.name) return 1
                else if (a.balance < b.balance) return 1
                else if (a.balance > b.balance) return -1
                return 0
            })

            switch (allowed) {
                case 1: {
                    DBStatuses = DBStatuses.filter((a) => a.ticker.toLowerCase() === args[0].toLowerCase())
                    break
                }
                case 2: {
                    const platform = (await this.store.db.getPlatform('description', 'SOS'))[0]
                    DBStatuses = DBStatuses.filter((a) => a.platform_id === platform.id)
                    break
                }
            }

            const coinStatus: TCoinStatus[] = await this.coinStatuses(usr, DBStatuses)

            const e = this.embed(usr)
            for (let s of coinStatus) {
                const r = DBStatuses.filter((r) => r.ticker === s.coin!.ticker)
                const addresses: string[] = []
                for (let a of r) {
                    const platform = (await this.store.db.getPlatform('id', a.platform_id))[0]
                    switch (platform.description) {
                        case 'SOS': addresses.push('StackOfStake')
                                    break
                        case 'RPC': addresses.push(a.address! as string)
                                    break
                    }
                }
                addresses.push(this.store.tx.get('command.status.coin.total', usr?.record?.language || this.store.config.languages[0]))

                const balances = r.map((a) => { return (a.balance! as number).toString()} )
                balances.push(`**${s.total} ${s.coin?.ticker}**`)

                e.Field( 'command.status.coin.header', [s.coin!.name, s.coin!.ticker.toLowerCase(), s.coin!.ticker],
                        'command.status.coin.address', [addresses], false, true)
                e.Field('', [],
                        'command.status.coin.balance', [balances], false, true)
            }
            await e.Summary(usr)
            await e.send(usr.snowflake)
        } catch (err) {
            await this.store.log(`[${usr.snowflake}] ${this.store.config.prefix+args[0]}: :exclamation: ${err.message}`)
            const e = this.embed(usr)
            e.Text(`**:exclamation: ${err.message}**`)
            await e.Summary(usr)
            await e.send(usr.snowflake)
        }
    }
}
