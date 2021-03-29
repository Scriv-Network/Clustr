import {CCommand} from "./command.class";
import {TArgument} from "./command.interface";
import {CUser} from "../user/user.class";

export class LanguagesCommand extends CCommand {
    get name(): string { return 'languages'; }
    get hidden(): boolean { return true; }

    get arguments(): TArgument[] { return [
        [],
    ]};

    async execute(usr: CUser, args: string[]) {
        const l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args);

        switch (allowed) {
            case 0: {
                const e = this.embed(usr)
                e.Field('command.languages.languages', [],
                        'command.languages.language', this.store.config.languages.map((lang) => [lang, this.store.tx.get('language', lang), this.store.tx.get('flag', lang)])
                    )
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