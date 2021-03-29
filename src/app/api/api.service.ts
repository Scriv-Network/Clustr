import {TConfigCoin, TConfigSos} from "../config/config.type";
import {CStore} from "../store/store.class";
import {createHmac} from "crypto";
import {b64Decode, emptyPromise} from "../tools/tools";
import {RxHR, RxHttpRequestResponse} from "@akanass/rx-http-request";
import {Observable, of} from "rxjs";

const utf8 = require('utf8');

export class IRestParams {
    params?: any;
    body?: any;
}

type TSrv = TConfigCoin | TConfigSos

export class ApiService {
    private endpoint(srv: TSrv, e: string): string {
        return (srv.protocol ? srv.protocol : 'http').toLowerCase() + '://' +
            (srv.user ? srv.user : '' ) +
            (srv.user && srv.password ? `:${srv.password}` : '') +
            (srv.user ? '@' : '') +
            (`${srv.baseURL}`+ (srv.port ? `:${srv.port}` : '') + e).toLowerCase();
    }

    private SOSQuery (q: any) {
        const normalizedQuery: { key: string, value: string } [] = [];
        if (q) {
            for (var k in q)
                if (Array.isArray(q[k]))
                    q[k].forEach((l: string) => normalizedQuery.push({ key: k.toLowerCase(), value: l }));
                else normalizedQuery.push({ key: k, value: q[k]});
            normalizedQuery.sort((a, b) => {
                if (a.key < b.key) return -1;
                else if (a.key === b.key) {
                    if (a.value < b.value) return -1;
                    else if (a.value === b.value) return 0;
                    else return 1;
                } return 1;
            });
        }

        let r = '';
        normalizedQuery.forEach((n) => r += (r === '' ? '' : '&') + `${n.key}=${n.value}`);

        return r;
    }

    public SOSSignature (nonce: bigint, endpoint: string, restParams: IRestParams = {}, APISecretB64: string) {
        const p = endpoint;
        const q = this.SOSQuery(restParams.params);
        const b = restParams.body ? utf8.encode(JSON.stringify( restParams.body)) : '';
        const signatureBase = [nonce, p, q, b].join(';');

        const signature =
            createHmac('sha256', b64Decode(APISecretB64))
                .update(signatureBase).digest("base64");

        return signature;
    }

    private headers(method: string, srv: TSrv, endpoint: string,
                    restParams: IRestParams, APIKey?: string, APISecretB64?: string): any {
        let h: any = {
            'Access-Control-Allow-Origin': 'Allow'
        }

        if ((['POST', 'PUT', 'PATCH'].indexOf(method) > -1) && (typeof restParams.body !== 'undefined')) {
            h = {
                ...h,
                'Content-Type': 'application/json',
                Accept: 'text/plain; charset=utf-8'
            };
        }

        if (!('prefix' in srv) && APIKey && APISecretB64) {
            h.Authorization = `Bearer ${APIKey}`
            const nonce: bigint = BigInt(Date.now())

            h["X-Nonce"] = ''+nonce;
            h["X-Signature"] = this.SOSSignature(nonce, endpoint, restParams, APISecretB64)
        }
        return h
    }

    public REST( method: string,
                 srv: TSrv,
                 endpoint: string = '',
                 restParams: IRestParams = {},
                 APIKey?: string,
                 APISecretB64?: string): Observable<RxHttpRequestResponse<any>> {

        const headers = this.headers(method, srv, endpoint, restParams, APIKey, APISecretB64)

        switch (method) {
            case 'GET': return RxHR.get<any>(this.endpoint(srv, endpoint), {json: true, headers, qs: restParams.params })
            case 'POST': return RxHR.post<any>(this.endpoint(srv, endpoint), {json: true, body: restParams.body, headers, qs: restParams.params })
            case 'PUT': return RxHR.put<any>(this.endpoint(srv, endpoint), { json: true, body: restParams.body, headers, qs: restParams.params })
            case 'DELETE': return RxHR.delete<any>(this.endpoint(srv, endpoint), { json: true, headers, qs: restParams.params})
            case 'PATCH': return RxHR.patch<any>(this.endpoint(srv, endpoint), { json: true, headers, body: restParams.body, qs: restParams.params})
            default: return of()
        }
    }

    public GET(srv: TSrv, endpoint: string, restParams: IRestParams = {}, APIKey?: string, APISecretB64?: string): Promise<any> { return this.REST('GET', srv, endpoint, restParams, APIKey, APISecretB64).toPromise(); }
    public POST(srv: TSrv, endpoint: string, restParams: IRestParams = {}, APIKey?: string, APISecretB64?: string): Promise<any> { return this.REST('POST', srv, endpoint, restParams, APIKey, APISecretB64).toPromise(); }
    public PUT(srv: TSrv, endpoint: string, restParams: IRestParams = {}, APIKey?: string, APISecretB64?: string): Promise<any> { return this.REST('PUT', srv, endpoint, restParams, APIKey, APISecretB64).toPromise(); }
    public DELETE(srv: TSrv, endpoint: string, restParams: IRestParams = {}, APIKey?: string, APISecretB64?: string): Promise<any> { return this.REST('DELETE', srv, endpoint, restParams, APIKey, APISecretB64).toPromise(); }
    public PATCH(srv: TSrv, endpoint: string, restParams: IRestParams = {}, APIKey?: string, APISecretB64?: string): Promise<any> { return this.REST('PATCH', srv, endpoint, restParams, APIKey, APISecretB64).toPromise(); }

    constructor(protected store: CStore) {}
}