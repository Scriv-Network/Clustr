// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import {CStore} from "../store/store.class";

export type TSosStatus = 'Active' | 'Preparing';

export type TSosCoin = {
    id: bigint;
    name: string,
    ticker: string,
    serviceFeePortion: number,
    referralPortion: number,
    status: TSosStatus,
    statusEndDate: null,
    isPossiblyForked: boolean,
    isFeatured: boolean,
    isMasternodeEnabled: boolean,
    isPoSEnabled: boolean,
    isZPoSEnabled: boolean,
    oneCoinValue: { btcAmount: number, usdAmount: number },
    oneCoinValueMultiplier: number,
    oneCoinBtcChange: number,
    oneCoinFiatChange: number,
    projectScore: number,
    amountDecimalPlaces: number
}

export type TSosAmount = {
    amount: number;
    btcAmount: number;
    usdAmount: number;
    decimalPlaces: number;
}

export type TSosCost = {
    btcAmount: number;
    usdAmount: number;
}

export type TSosCoinSummary = {
    coinId: bigint,
    balance: TSosAmount,
    dailyProfit: TSosAmount,
    totalProfit: TSosAmount,
    netCost: TSosCost,
    monthlyEstimation: TSosAmount,
    yearlyEstimation: TSosAmount,
    pendingDeposits: TSosAmount,
    pendingWithdrawals: TSosAmount,
    serviceFeeDiscountPortion: number
}

export type TSosCoinSummaries = {
    email: string;
    coinSummaries: TSosCoinSummary[]
}

export class SosService {
    private _counter: number = 0

    public async getCoins(): Promise<TSosCoin[]> {
        const res = await this.store.api.GET(this.store.config.sos, '/api/v1/coins', {} )
        if (res?.body && Array.isArray(res.body)) return res.body.filter((coin: TSosCoin) => coin.status === 'Active')
        throw new Error(`${res.response.statusCode} - ${res.response.statusMessage}`)
    }


    public async getCoinsSummaries(APIKey: string, APISecretB64: string): Promise<TSosCoinSummaries> {
        const res = await this.store.api.GET(this.store.config.sos, '/api/v1/coins/summary', {}, APIKey, APISecretB64 )
        if (res?.body?.coinSummaries && Array.isArray(res.body.coinSummaries))
            return {
                email: res.body.email,
                coinSummaries: res.body.coinSummaries
            }
        throw new Error(`${res.response.statusCode} - ${res.response.statusMessage}`)
    }

    constructor(private store: CStore) {
    }
}