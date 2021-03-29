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