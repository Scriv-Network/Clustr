// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import { TArgument, ICommand } from './command.interface';
import { CEmbed } from '../embed/embed.class';
import { CStore } from '../store/store.class';
import { TConfigCoin } from '../config/config.type';
import { CUser } from '../user/user.class';

export class CCommand implements ICommand {
    get name(): string { return 'unknown'; }
    get hidden(): boolean { return false; }
    get arguments(): TArgument[] { return [] };

    help(l: string, short: boolean): string { return this.store.tx.get(`command.${this.name}.help.${short?'short':'long'}`, l) }

    welcome(l: string): string { return this.store.tx.get(`command.${this.name}.welcome`, l) }
    async execute(usr: CUser, args: string[]) {};

    public embed(usr: CUser, title = true, welcome = true): CEmbed {
        let e = Object.assign(
            new CEmbed(this.store, usr),
            this.store.config.embed
        )
        if (title) e.Title( `command.${this.name}.title`)
        if (welcome) e.Description( `command.${this.name}.welcome`)
        return e;
    }

    protected getCoins (a: TArgument, args: string[]): TConfigCoin[] {
        const r: TConfigCoin[] = [];
        for (let intX = 0; intX < a.length; intX++) {
            if ((a[intX] === 'coin') && (args.length > intX)) {
                const coin = this.store.config.coins.filter((c: TConfigCoin) => c.ticker.toLowerCase() === args[intX].toLowerCase());
                if (coin.length === 1) r.push(coin[0]);
            }
        }
        return r;
    }

    protected allowed (args: string[]): number {
        let r = -1;
        this.arguments.forEach((p: TArgument, iPossibility) => {
            if (p.length == args.length) {
                let valid = true;
                const coins = this.getCoins(p, args);
                try {
                    p.forEach((pArg, iArg) => {
                        switch (pArg) {
                            case "coin": {
                                const coins = this.store.config.coins.filter((c: TConfigCoin) => c.ticker.toLowerCase() === args[iArg].toLowerCase());
                                if (coins.length < 1) { valid = false; throw new Error(); }
                                break;
                            }
                            case "sos": {
                                if (!['sos', 'stackofstake', 'stake', 'platform'].includes(args[iArg].toLowerCase()))
                                { valid = false; throw new Error(); }
                                break;
                            }
                            case "address": {
                                if ((coins.length != 1) ||
                                    ((args[iArg][0] !== coins[0].prefix) || (args[iArg].length != coins[0].length)))
                                    { valid = false; throw new Error(); }
                                break;
                            }
                            case "base64": {
                                const regex = RegExp('^[A-Za-z0-9+\\/=]{3,44}$');
                                if (!regex.test(args[iArg])) { valid = false; throw new Error(); }
                                break;
                            }
                            case "amount": {
                                if (coins.length != 1) { valid = false; throw new Error(); }

                                const parsed = parseInt(args[iArg]);
                                if (isNaN(parsed)) { valid = false; throw new Error(); }

                                const amount = args[iArg].split('.');
                                if (amount.length = 1) amount.push('0');

                                if ((amount[0].length > (coins[0].length-coins[0].decimals)) ||
                                    (amount[1].length > (coins[0].decimals)))
                                    { valid = false; throw new Error(); }
                                break;
                            }
                            case "number": {
                                const parsed = parseInt(args[iArg]);
                                if (isNaN(parsed)) { valid = false; throw new Error(); }
                                break;
                            }
                            case "uuid": {
                                const regex = RegExp('(^([0-9A-Fa-f]{8}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{12})$)');
                                if (!regex.test(args[iArg])) { valid = false; throw new Error(); }
                                break;
                            }
                            case "command": {
                                let found = false;
                                this.store.commands.forEach((c) => {
                                    if (!c.hidden || (c.name === args[iArg])) { found = true; }
                                });
                                if (!found) { valid = false; throw new Error(); }
                                break;
                            }
                            case "language": {
                                if (!this.store.config.languages.includes(args[0].toLowerCase()) &&
                                    (!this.store.config.languages.map((l: string) => this.store.tx.get('language', l).toLowerCase()).includes(args[0].toLowerCase())))
                                    { valid = false; throw new Error(); }
                                break;
                            }
                            case "status": {
                                if (args[iArg].toLowerCase() !== 'status') { valid = false; throw new Error(); }
                            }
                        }
                    })
                    r = iPossibility;
                    return;
                } catch(err) {}
            }
        })
        return r;
    }

    constructor(protected store: CStore) {}
}
