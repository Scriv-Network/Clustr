import { Message } from 'discord.js'
import { CEmbed } from '../embed/embed.class';
import { CUser } from '../user/user.class';

export type TArgument = ('coin' | 'sos' | 'address' | 'base64' | 'amount' | 'number' | 'uuid' | 'command' | 'language' | 'status') [];

export interface ICommand {
    name: string;
    hidden: boolean;
    arguments: TArgument[];
    help(l: string, short: boolean): string;
    welcome(l: string): string;
    execute(usr: CUser, args: string[]): void;
    embed(usr: CUser, title: boolean, description: boolean): CEmbed;
}
