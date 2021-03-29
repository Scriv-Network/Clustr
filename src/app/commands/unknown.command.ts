// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CCommand} from "./command.class";
import {CUser} from "../user/user.class";

export class UnknwonCommand extends CCommand {
    get name(): string { return 'unknown'; }
    get hidden(): boolean { return true; }

    async execute(usr: CUser, args: string[]) {
        const e = this.embed(usr)
        e.Description('command.unknown.message', args.length == 0 ? [this.name] : args)
        await e.send(usr.snowflake)
    }
}