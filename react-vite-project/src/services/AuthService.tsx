import React, {useEffect} from "react";
import {createContext, useState} from "react";
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
    return {Authorization: `Bearer ${token}`}
}

export const AuthServiceContext = createContext<IAuthService>(undefined);
const AuthService = ({children}) => {
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);

    const authService: IAuthService = {
        isAuthed(): boolean { return sessionToken != null; },
        getAuth(): string { return sessionToken; },
        buildAuthHeader(): object { return makeAuthHeader(sessionToken); },

        getUserData() {
            useEffect(() => {
                if(sessionToken === null) {
                    return;
                }

                if(userData) {
                    return;
                }

                const fetchData = async () => {
                    const requestResult = await APIHelper.get('/user/me', makeAuthHeader(sessionToken), {});
                    if(!requestResult.ok) {
                        throw new AuthError(await requestResult.text());
                    }

                    setUserData(await requestResult.json());
                }

                fetchData();
            }, [sessionToken]);

            return userData;
        },

        async login(email: string, password: string) {
            const loginResult = await APIHelper.post('/user/login', {}, {email: email.toLowerCase(), password: password});
            if(!loginResult.ok) {
                throw new AuthError(await loginResult.text());
            }
            const loginData = await loginResult.json();

            setSessionToken(loginData.accessToken);
            return loginResult;
        },

        async logout() {
            if(!this.isAuthed()) {
                return;
            }

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

export class AuthError extends Error {}

export default AuthService