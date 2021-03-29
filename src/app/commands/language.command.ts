import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";

export class LanguageCommand extends CCommand {
    get name(): string { return 'language'; }

    get arguments(): TArgument[] { return [
        [],
        ['language']
    ]};

    async execute(usr: CUser, args: string[]) {
        let l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args);

        switch (allowed) {
            case 0: {
                const e = this.embed(usr)
                const language = this.store.tx.get('language', l)
                const flag = this.store.tx.get('flag', l)
                e.Description('command.language.current', [l, language, flag])
                await e.send(usr.snowflake)
                break
            }
            case 1: {
                const e = this.embed(usr)
                const n = this.store.config.languages.filter((l) => ((l.toLowerCase() === args[0].toLowerCase()) || (this.store.tx.get('language', l).toLowerCase() === args[0].toLowerCase())))
                if ((n.length == 1) && usr.record) {
                    const change = n[0].toLowerCase() !== l.toLowerCase()
                    l = n[0].toLowerCase()
                    const language = this.store.tx.get('language', l)
                    const flag = this.store.tx.get('flag', l)
                    if (change) {
                        this.store.db.changeUser(usr.record.id, 'language', l)
                        e.description = (e.description ? e.description : '') +
                                        this.store.tx.get('command.language.updated', l,[l, language, flag])
                    } else {
                        e.Description('command.language.identical', [l, language, flag])
                    }
                } else {
                    // This should never occur
                    throw new Error(`Language ${l} or user ${usr.snowflake} not found`)
                }
                await e.send(usr.snowflake)
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