export type TConfigRefresh = {
    "interval": number;
    "records": number;
}

export type TConfigEligibility = {
    "name": string;
    "role": string;
    "min"?: number;
    "max"?: number;
}

export type TConfigCoin = {
    "prefix": string;
    "name": string;
    "ticker": string;
    "length": number;
    "decimals": number;
    "history": boolean;
    "refresh": TConfigRefresh;
    "protocol": "http" | "https",
    "baseURL": string,
    "port": number,
    "user": string,
    "password": string,
    "eligibilities": TConfigEligibility[],
    "sos": boolean
}

export type TConfigSos = {
    "history"?: boolean;
    "protocol"?: "https" | "https";
    "baseURL": string;
    "port"?: number,
    "user"?: string,
    "password"?: string,
    "refresh": TConfigRefresh;
}

export type TConfigDb = {
    "type": "postgres"
    "baseURL": string;
    "database": string;
    "user": string;
    "password": string;
    "port": number;
}

export type TConfigEmbed = {
    color: number;
}

export interface TConfig {
    name: string;
    bot: string;
    guild: string;
    log: string;
    prefix: string;
    admins: string[];
    languages: string[];
    timeout: number;
    coins: TConfigCoin[];
    sos: TConfigSos;
    db: TConfigDb;
    embed: TConfigEmbed;
}