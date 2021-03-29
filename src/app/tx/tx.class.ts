// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import { TTxFile } from './tx.type';

// Necessary only otherwise not copied to /dist
import * as en from '../../assets/en.tx.json';
import * as fr from '../../assets/fr.tx.json';

import { deepCopy } from '../vendor/deepcopy'
import { TConfig } from '../config/config.type';

export class CTx {
    private _default: TTxFile;
    private _tx: TTxFile;

    Load (l: string) {
        this._tx = deepCopy(this._default);

        if (l !== this.config.languages[0]) {
            const n = require(`../../assets/${l}.tx.json`) as TTxFile;
            //@ts-ignore
            for (let key in n) if (n[key]) this._tx[key] = n[key];
        }
    }

    args (s: string, args?: string []): string {
        if (args) args.forEach((a, index) => s = s.split('${' + index + '}').join(a))
        return s
    }

    get (key: string, l?: string, args?: string[], force: boolean = true) : string {
        if (!l) l = this.config.languages[0] || 'en'
        this.Load(l as string)

        //@ts-ignore
        if (force && !this._tx[key]) throw new Error(`Translation key not found : ${key}`)

        //@ts-ignore
        return this._tx[key] ? this.args(Array.isArray(this._tx[key]) ? this._tx[key][Math.floor(Math.random() * this._tx[key].length)] : this._tx[key], args) : ((args && (args.length > 0)) ? args[0] : '\u200b')
    }

    constructor (private config: TConfig) {
        this._tx = this._default = deepCopy(require(`../../assets/${config.languages[0]}.tx.json`) as TTxFile);
    }
}
