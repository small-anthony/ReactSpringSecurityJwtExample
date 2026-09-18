import {BASE_URL} from "../components/config/Config";

type RequestMethods = "GET" | "POST";
export class APIError extends Error {}

function request(path: RequestInfo, method: RequestMethods, headers: object, body: object): Promise<Response> {
    return new Promise( (success, failure) => {
        fetch(`${BASE_URL}${path}`, {
            method: method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json;charset=UTF-8',
            },
            body: body ? JSON.stringify(body) : null
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

function toParams(params: object) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => urlParams.set(key, value));
    return urlParams
}

export default class {
    static get = (path: RequestInfo, headers: object, params: object) =>
        request(`${path}?${toParams(params)}`, "GET", headers, null);
    static post = (path: RequestInfo, headers: object, body: object) =>
        request(path, "POST", headers, body);
};