import {Channel, Client, TextChannel} from 'discord.js'
import { CDb } from '../db/db.class'
import { CTx } from '../tx/tx.class'
import { TConfig } from '../config/config.type'
import { ConfigDefault } from '../config/config.default'
const { Pool } = require('pg')

import { CCommand} from '../commands/command.class'
import { HelpCommand } from '../commands/help.command'
import { UnknwonCommand } from "../commands/unknown.command"
import { LanguagesCommand } from "../commands/languages.command"
import { LanguageCommand } from "../commands/language.command"
import {BlockchainCommand} from "../commands/blockchain.command";
import {ApiService} from "../api/api.service";
import {RpcService} from "../api/rpc.service";
import {SosService} from "../api/sos.service";
import {VerifyCommand} from "../commands/verify.command";
import {RolesService} from "../api/roles.service";
import {StatusCommand} from "../commands/status.command";
import {UnverifyCommand} from "../commands/unverify.command";
import {RefreshCommand} from "../commands/refresh.command";

export class CStore {
    public readonly config: TConfig
    public readonly tx: CTx
    public readonly discord: Client
    public readonly pool: any
    public readonly commands: CCommand[]
    public readonly db: CDb
    public readonly api: ApiService
    public readonly rpc: RpcService
    public readonly sos: SosService
    public readonly roles: RolesService

    constructor() {
        this.config = {
        ...ConfigDefault,
        ...require(`../../assets/config.json`)
        }
        this.tx = new CTx(this.config)
        this.discord = new Client()
        this.pool = new Pool({
            user: this.config.db.user,
            host: this.config.db.baseURL,
            database: this.config.db.database,
            password: this.config.db.password,
            port: this.config.db.port || 5432
        })

        this.commands = [
            new BlockchainCommand(this),
            new HelpCommand(this),
            new LanguageCommand(this),
            new LanguagesCommand(this),
            new VerifyCommand(this),
            new RefreshCommand(this),
            new StatusCommand(this),
            new UnknwonCommand(this),
            new UnverifyCommand(this)
        ]
        this.db = new CDb(this)

        this.api = new ApiService(this)
        this.rpc = new RpcService(this)
        this.sos = new SosService(this)
        this.roles = new RolesService(this)
    }

    public async log (t: string) {
        const c: Channel = await this.discord.channels.fetch(this.config.log);
        if (c.type === 'text') await (c as TextChannel).send(t);
    }
}