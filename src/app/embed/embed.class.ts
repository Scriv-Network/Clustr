import {Message, MessageEmbed} from 'discord.js'
import { CStore } from '../store/store.class';
import { CUser } from '../user/user.class';
import {TDBStatus, TDBUser} from "../db/db.types";
import {TConfigCoin} from "../config/config.type";
import {StatusCommand, TCoinStatus} from "../commands/status.command";

export class CEmbed extends MessageEmbed {
    public readonly empty = [null, undefined, "\u200b", ""];

    private addTx(field: string, key: string, args?: string[], force?: boolean) {
        try {
            const t = this.store.tx.get(key, this.usr?.record?.language || this.store.config.languages[0], args, force)
            // @ts-ignore
            if (!this.empty.includes(t))
                // @ts-ignore
                this[field] = (this.empty.includes(this[field]) ? "" : this[field] + "\r\n") + t
        } catch (e) {
            // @ts-ignore
            this[field] = (this.empty.includes(this[field]) ? "" : this[field] + "\r\n") + e.message
        }
    }

    private addText(field: string, text: string, args?: string[]) {
        const tt = this.store.tx.args(text, args)
        // @ts-ignore
        if (!this.empty.includes(tt))
            // @ts-ignore
            this[field] = (this.empty.includes(this[field]) ? "" : this[field] + "\r\n") + tt
    }

    Title(key: string, args?: string[], force: boolean = false): void { this.addTx('title', key, args, force) }
    Description(key: string, args?: string[], force: boolean = false): void { this.addTx('description', key, args, force) }
    Text(t: string, args?: string[]): void { this.addText('description', t, args) }

    Field(keyName: string, argsName: string[] = [],
          keyValues: string = '\u200b', argsValues: string[][] = [],
          force: boolean = false,
          inline: boolean = false): void {
        try {
            let name = this.store.tx.get(keyName, this.usr?.record?.language || this.store.config.languages[0], argsName, force)
            const V: string[] = [];

            for (let intValue = 0; intValue < argsValues.length; intValue++) {
                for (let intArg = 0; intArg < argsValues[intValue].length; intArg++) {
                    const value = this.store.tx.get(keyValues, this.usr?.record?.language || this.store.config.languages[0], [argsValues[intValue][intArg]], false)
                    V.push( !this.empty.includes(value) ? value : '\u200b')
                }
            }

            this.addField(name, V.length == 0 ? ["\u200b"] : V, inline)
        } catch (e) {
            this.addField(e.message, "\u200b")
        }
    }

    async Summary (usr = this.usr) {
        try {
            const commandStatus = this.store.commands.find((c) => c.name === 'status') as StatusCommand
            const statusRecords : TDBStatus[] = await this.store.db.getStatus(usr!.record!.id)
            const coinStatus: TCoinStatus[] = await commandStatus.coinStatuses(usr!, statusRecords)

            for (let s of coinStatus) {
                const coin = s.coin!
                const eligible = s.eligible
                // Return from refresh list granted coin eligibilities only.
                if (eligible.length == 1)
                    // User is eligible for a role
                    for (let j = 0; j < eligible.length; j++) {
                        if (s.nextRoleMin == 1000000000000000)
                            this.Field('summary.eligible.last', [
                                coin.name, coin.ticker, eligible[j].name,
                                s.total.toString(), (s.nextRoleMin-s.total).toString() ])
                        else
                            this.Field('summary.eligible.next', [
                                coin.name, coin.ticker, eligible[j].name,
                                s.total.toString(), (s.nextRoleMin-s.total).toString(),
                                s.nextRoleMin.toString(), s.nextRoleName ])
                    }
                else if (eligible.length > 1) {
                    // User is eligible for multiple roles
                    for (let j = 0; j < eligible.length; j++) {
                        this.Field('summary.eligible.multiple', [
                            coin.name, coin.ticker, eligible[j].name,
                            s.total.toString() ])
                    }
                } else if (coin.eligibilities.length > 0) {
                    // User is not eligible for any role
                    this.Field('summary.eligible.none', [
                        coin.name, coin.ticker,
                        s.total.toString(), (s.nextRoleMin-s.total).toString(),
                        s.nextRoleMin.toString(), s.nextRoleName ])
                } else {
                    // This coin has no eligibilities defined
                    this.Field('summary.eligible.empty', [
                        coin.name, coin.ticker,
                        s.total.toString() ])
                }
            }
        } catch(e) {
            this.addField(`:exclamation: **${e.message}**`, "\u200b")
        }
    }

    async ask(snowflake?: string, timeout: number = 60000): Promise<string> {
        const u = await this.store.discord.users.fetch((snowflake || this.usr?.record?.snowflake) as string)

        const filter = (m: Message) => ![null, undefined, ''].includes(m.content)
        const answer = await u.dmChannel?.awaitMessages(filter, { max: 1, time: timeout, errors: ['time']});

        return (answer!.first() as Message).content
    }

    async send(snowflake?: string) {
        if (!this.usr?.record?.snowflake && !snowflake) throw new Error('User snowflake unknown')
        const u = await this.store.discord.users.fetch((snowflake || this.usr?.record?.snowflake) as string)
        await u.send({ embed: this })
    }

    constructor(private store: CStore, private usr?: CUser) {
        super();
    }
}