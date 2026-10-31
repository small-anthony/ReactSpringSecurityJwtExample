import {BASE_URL} from "../components/config/Config";

type RequestMethods = "GET" | "POST";
export class APIError extends Error {}

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json;charset=UTF-8',
};

function shouldSendRaw(data: object): boolean {
    if(data instanceof Blob) {
        return true;
    }
    return false;
}

function request(path: RequestInfo, method: RequestMethods, headers: Record<string, string>, body: object|string): Promise<Response> {
    return new Promise( (success, failure) => {
        fetch(`${BASE_URL}${path}`, {
            method: method,
            headers: headers,
            body: !body ? null : (body as any),
        }).then((response) => {
            success(response);
        }).catch((reason) => {
            if(reason instanceof Error) {
                const error = new APIError(reason.message)
                error.stack = reason.stack;
                error.cause = reason.cause;
                return failure(error);
            }
            return failure(reason);
        });
    });
}

function toParams(params?: object) {
    const urlParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => urlParams.set(key, String(value)));
    }
    return urlParams;
}

export default class {
    static get = (path: RequestInfo, headers: object = {}, params?: object) => {
        const query = params && Object.keys(params).length > 0 ? `?${toParams(params)}` : "";
        return request(`${path}${query}`, "GET", {...headers, ...DEFAULT_HEADERS}, null);
    };
    static post = (path: RequestInfo, headers: object = {}, body?: object) =>
        request(path, "POST", {...headers, ...DEFAULT_HEADERS}, JSON.stringify(body || {}));

    /// Variant de post qui ne convertie pas le body en JSON.
    static post_raw = (path: RequestInfo, headers: object = {}, body?: object) =>
        request(path, "POST", {...headers}, body || {});
};