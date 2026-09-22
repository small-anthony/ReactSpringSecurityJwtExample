import React, { useEffect } from "react";
import { createContext, useState } from "react";
import APIHelper from "../utils/APIHelper";

export enum UserRole {
    Gestionnaire = "ROLE_GESTIONNAIRE",
    Employeur = "ROLE_EMPLOYEUR",
    Etudiant = "ROLE_ETUDIANT",
    Professeur = "ROLE_PROFESSEUR",
}

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    hasCv?: boolean;
}

interface IAuthService {
    isAuthed(): boolean;
    getAuth(): string;
    buildAuthHeader(): object;

    getUserData(): UserData;

    login(email: string, password: string): Promise<Response>;
    logout(): Promise<void>;
}

function makeAuthHeader(token: string) {
    return { Authorization: `Bearer ${token}` }
}

function clearTokenCookie() {
    setTokenCookie(null, new Date(0));
    try { localStorage.removeItem("token"); } catch (_) { }
}

function setTokenCookie(value: string | null, expires?: Date) {
    const expirationDate = !expires ? "" : expires.toUTCString();
    document.cookie = `token=${value != null ? value : ""};${expirationDate + ';'}path=/`;
    try {
        if (value) {
            localStorage.setItem("token", value);
        } else {
            localStorage.removeItem("token");
        }
    } catch (_) { }
}

export function getTokenCookie(): string | null {
    const tokenIdent = "token=";

    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiePos = decodedCookie.indexOf(tokenIdent);
    if (cookiePos <= -1) {
        try {
            return localStorage.getItem("token");
        } catch (_) {
            return null;
        }
    }

    let endPos = decodedCookie.indexOf(';', cookiePos);
    if (endPos <= -1) {
        endPos = decodedCookie.indexOf(' ', cookiePos);
    }
    if (endPos <= -1) {
        endPos = decodedCookie.length;
    }

    const token = decodedCookie.substring(cookiePos + tokenIdent.length, endPos).trim();
    if (token.length === 0) {
        try {
            return localStorage.getItem("token");
        } catch (_) {
            return null;
        }
    }
    return token;
}

export const AuthServiceContext = createContext<IAuthService>(undefined);
const AuthService = ({ children }) => {
    const [sessionToken, setSessionToken] = useState<string | null>(getTokenCookie());
    const [userData, setUserData] = useState<UserData | null>(null);

    const authService: IAuthService = {
        isAuthed(): boolean { return sessionToken != null; },
        getAuth(): string { return sessionToken; },
        buildAuthHeader(): object { return makeAuthHeader(sessionToken); },

        getUserData() {
            useEffect(() => {
                if (sessionToken === null) {
                    return;
                }

                if (userData) {
                    return;
                }

                const fetchData = async () => {
                    const requestResult = await APIHelper.get('/user/me', makeAuthHeader(sessionToken), {});
                    if (!requestResult.ok) {
                        if (requestResult.status == 401) { // bad token
                            return this.logout();
                        }

                        throw new AuthError(await requestResult.json());
                    }

                    setUserData(await requestResult.json());
                }

                fetchData();
            }, [sessionToken]);

            return userData;
        },

        async login(email: string, password: string) {
            const loginResult = await APIHelper.post('/user/login', {}, { email: email.toLowerCase(), password: password });
            if (!loginResult.ok) {
                if (loginResult.status == 401) {
                    const err = new LoginError()
                    err.message = await loginResult.json();
                    throw err;
                }
                throw new AuthError(await loginResult.text());
            }
            const loginData = await loginResult.json();

            setTokenCookie(loginData.accessToken);
            setSessionToken(loginData.accessToken);
            return loginResult;
        },

        async logout() {
            if (!this.isAuthed()) {
                return;
            }

            clearTokenCookie();
            setSessionToken(null);
            setUserData(null);
            return null;
        },
    }

    return (
        <AuthServiceContext.Provider value={authService}>
            {children}
        </AuthServiceContext.Provider>
    );
}

export class AuthError extends Error { }
export class LoginError extends AuthError { }

export default AuthService