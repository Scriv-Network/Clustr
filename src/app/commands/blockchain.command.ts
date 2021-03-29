// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";
import {TConfigCoin} from "../config/config.type";

export class BlockchainCommand extends CCommand {
    get name(): string { return 'blockchain'; }
    get hidden(): boolean { return true; }

    get arguments(): TArgument[] { return [
        ['status'],
        ['status', 'coin'],
    ]};

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]

        const allowed = this.allowed(args);

        let coins: TConfigCoin[] = (allowed <= 0) ? this.store.config.coins : this.getCoins(this.arguments[allowed], args);

        switch (true) {
            case ((allowed >= 0) && (coins?.length >= 1)): {
                const e = this.embed(usr);
                for (let intCoin = 0; intCoin < coins.length; intCoin++) {
                    const coin = coins[intCoin];
                    const res = await this.store.rpc.getinfo(coin);
                    const hash = await this.store.rpc.getbestblockhash(coin);

                    e.Field ('command.blockchain.status.coin', [coin.ticker, coin.name],
                        '${0}', [
                            [this.store.tx.get('command.blockchain.status.version', l, [res.version])],
                            [this.store.tx.get('command.blockchain.status.protocolversion', l, [res.protocolversion])],
                            [this.store.tx.get('command.blockchain.status.walletversion', l, [res.walletversion])],
                            [this.store.tx.get('command.blockchain.status.blocks', l, [res.blocks])],
                            [this.store.tx.get('command.blockchain.status.bestblockhash', l, [hash])],
                        ])
                }
                await e.send(usr.snowflake)
                break;
            }
            default: {
                const e = this.embed(usr);
                e.Description('command.error', [this.store.config.prefix, args[0]])
                await e.send(usr.snowflake)
            }
        }
    }
}