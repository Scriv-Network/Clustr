import { CCommand } from "./command.class";
import {TArgument} from "./command.interface";
import {Message} from "discord.js";
import {CUser} from "../user/user.class";
import {CEmbed} from "../embed/embed.class";

export class HelpCommand extends CCommand {
    get name(): string { return 'help'; }
    get arguments(): TArgument[] { return [
        [],
        ['command']
    ]};
    async execute(usr: CUser, args: string[]) {
        const l = usr?.record?.language || this.store.config.languages[0]
        const allowed = this.allowed(args);

        switch (allowed) {
            case 0: {
                const commands = this.store.commands
                    .sort((c1, c2) => (c1.name > c2.name ? 1 : -1))
                    .filter((command) => !command.hidden)
                const e = this.embed(usr)
                e.Description('command.help.communities')
                e.Field('command.help.icons', [],
                        'command.help.icon', [this.store.config.coins.map((coin) => `:${coin.ticker.toLowerCase()}:` )],
                        false, true)
                e.Field('command.help.tickers', [],
                        'command.help.ticker', [this.store.config.coins.map((coin) => `:${coin.ticker.toLowerCase()}:` )],
                        false, true)
                e.Field('command.help.coins', [],
                        'command.help.coin', [this.store.config.coins.map((coin) => coin.name )],
                        false, true)
                e.Field('command.help.commands', [],
                        'command.help.command', commands.map(c => [c.help(l, true)])
                    )
                e.Field('command.help.links.docs', [],
                        'command.help.links.doc', [['']],
                        false, true)
                e.Field('command.help.links.communities', [],
                        'command.help.links.community', [['']],
                        false, true)
                e.Field('command.help.links.terms', [],
                        'command.help.links.term', [['']],
                        false, true)
                await e.send(usr.snowflake)
                break;
            }
            case 1: {
                let commands = this.store.commands
                    .filter((command) => !command.hidden && (command.name === args[0].trim().toLowerCase()));
                if (commands.length != 1) { commands = this.store.commands.filter((command) => command.name === 'unknown'); };
                const e = this.embed(usr)

                e.Field('command.help.command.name', [commands[0].name.toUpperCase()],
                        'command.help.command.long', [[commands[0].help(l, false)]],
                        false, false)

                e.Field('command.help.links.docs', [],
                    'command.help.links.doc', [['']],
                    false, true)
                e.Field('command.help.links.communities', [],
                    'command.help.links.community', [['']],
                    false, true)
                e.Field('command.help.links.terms', [],
                    'command.help.links.term', [['']],
                    false, true)

                e.send(usr.snowflake)
                break;
            }
            default: {
                const e = this.embed(usr);
                e.Description('command.error', [this.store.config.prefix, args[0]])
                await e.send(usr.snowflake)
            }
        }

    };
}