import {CStore} from "../store/store.class";
import {TConfigCoin} from "../config/config.type";

export class RpcService {
    private _counter: number = 0

    private async rpc (coin: TConfigCoin, body: any) {
        const res = await this.store.api.POST(coin, '',{ body })
        const t = res?.response?.body;
        if (!t) throw new Error('Verify returned an invalid response')
        else if (!t.result && t.error?.message) throw new Error(t.error.message)
        else if (!t.result) throw new Error ('Verify returned an invalid response')
        else return t?.result;
    }

    public async verify (coin: TConfigCoin, coin_address: string, signature: string, sign_message: string): Promise<boolean> {
        return await this.rpc(coin, {
            "id": ++this._counter,
            "method": "verifymessage",
            "params": [ `${coin_address}`, `${signature}`, `${sign_message}`]
        })
    }

    public async balance (coin: TConfigCoin, coin_address: string): Promise<number> {
        const r = await this.rpc(coin, {
            "id": ++this._counter,
            "method": "getaddressbalance",
            "params": [{ addresses: [ `${ coin_address }` ]}]
        })
        return r.balance / Math.pow(10, 8)
    }

    public async getinfo (coin: TConfigCoin): Promise<any> {
        return this.rpc(coin, {
            "id": ++this._counter,
            "method": "getinfo",
            "params": [ ]
        })
    }

    public async getbestblockhash (coin: TConfigCoin): Promise<any> {
        return this.rpc(coin, {
                "id": ++this._counter,
                "method": "getbestblockhash",
                "params": [ ]
            })
    }

    constructor(protected store: CStore) {}
}