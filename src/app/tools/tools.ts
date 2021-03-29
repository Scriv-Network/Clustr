// Copyright (c) 2021 Olivier Ragheb
// Copyright (c) 2021 The Scriv Network developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

export function randomString (l: number, allowed?: string) {
    if (!allowed) allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let r = '';
    for ( var i = 0; i < l; i++ )
        r += allowed.charAt(Math.floor(Math.random() * allowed.length));
    return r;
}

export function b64Decode (data: string): Uint8Array {
    let buf = Buffer.from(data, 'base64');
    return buf;
}

export const emptyPromise = function() {}
