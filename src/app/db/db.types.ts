export type TDBAccount = {
    id: bigint;
    platform_id: bigint;
    user_id: bigint;
    key: string;
    secret: string;
    stamp: Date;
}

export type TDBAddress = {
    id: bigint;
    user_id: bigint;
    coin_id: bigint;
    platform_id: bigint;
    address?: string;
}

export type TDBBalance = {
    id: bigint;
    address_id: bigint;
    balance: number;
    stamp: Date;
}

export type TDBCoin = {
    id: bigint;
    name: string;
    ticker: string;
}

export type TDBPlatform = {
    id: bigint;
    description: string;
    account: boolean;
}

export type TDBUser = {
    id: bigint;
    snowflake: string;
    language: string;
    email?: string;
    salt?: string;
}

export type TDBStatus = {
    user_id: bigint;
    address_id: bigint;
    address?: string;
    coin_id: bigint;
    name: string;
    ticker: string;
    platform_id: bigint;
    balance_id: bigint;
    balance: number;
    stamp: Date;
}