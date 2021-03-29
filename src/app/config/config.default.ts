// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {TConfig} from "./config.type";

export const ConfigDefault: TConfig = {
    name: 'Clustr',
    bot: '',
    guild: '',
    log: '',
    prefix: '!',
    admins: [],
    languages: ['en', 'fr'],
    timeout: 300000,
    coins: [],
    sos: {
        baseURL: "api.stackofstake.com",
        refresh: {
            "interval": 60000,
            "records": 20
        }
    },
    db: {
        type: "postgres",
        baseURL: '',
        database: '',
        user: '',
        password: '',
        port: 5432
    },
    embed: {
        color: 0x00ff00
    }
}