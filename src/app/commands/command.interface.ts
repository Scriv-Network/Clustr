// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

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
