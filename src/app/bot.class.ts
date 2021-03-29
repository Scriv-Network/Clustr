// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import { Message } from 'discord.js'
import { CUser } from './user/user.class'
import { CStore } from "./store/store.class"
import { CEmbed } from "./embed/embed.class"
import {RefreshCommand} from "./commands/refresh.command";

export class CBot {
    private store = new CStore()

    public async listen(): Promise<string> {
        this.store.discord.on('message', (m: Message) => {
            if (!this.store.config.prefix) { console.log('Prefix is not defined'); return; }
            if ((m.content.length <= this.store.config.prefix.length) || !m.content.startsWith(this.store.config.prefix) ||
                m.author.bot) return
            const args: string[] = m.content.slice(this.store.config.prefix.length).trim().split(/ +/)
            const command = args.shift()?.toLowerCase() || ''

            const usr = new CUser(this.store, m.author.id)

            usr.load().then((usr) => {
                let found = false
                this.store.commands.forEach(c => {
                    if (c.name === command) {
                        if ((!c.hidden) ||
                            (c.hidden && this.store.config.admins.includes(usr.snowflake))) {
                            found = true
                            c.execute(usr, args)
                        }
                    }
                })
                if (!found) this.store.commands.filter(c => c.name === 'unknown')[0].execute(usr, [command])
            }).catch((err) => {
                this.store.log(`[${usr?.snowflake}] ${this.store.config.prefix+args[0]}: ${this.store.tx.get('system.error.message', usr.record?.language, [err.message])}`)
                const e = new CEmbed(this.store)
                e.Title( 'system.error.title')
                e.Description( 'system.error.message', [err.message])
                e.send(m.author.id)
            })
        })

        this.store.discord.once('ready', () => {
            this.store.discord.user?.setUsername(this.store.config.name)
            const refresh = this.store.commands.filter(c => c.name === 'refresh')[0] as RefreshCommand
            for (let coin of this.store.config.coins)
                if (coin.refresh?.interval)
                    setInterval(() => refresh.coin(coin), coin.refresh.interval)
            if (this.store.config.sos.refresh?.interval)
                setInterval(() => refresh.sos(), this.store.config.sos.refresh.interval)
        })

        return this.store.discord.login(this.store.config.bot)
    }
}