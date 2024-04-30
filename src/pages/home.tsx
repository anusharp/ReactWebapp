/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { BasicUserInfo, Hooks, useAuthContext } from "@asgardeo/auth-react";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { default as authConfig } from "../config.json";
import REACT_LOGO from "../images/react-logo.png";
import { DefaultLayout } from "../layouts/default";
import { AuthenticationResponse, HolidayResponse } from "../components";
import { useLocation } from "react-router-dom";
import { LogoutRequestDenied } from "../components/LogoutRequestDenied";
import { USER_DENIED_LOGOUT } from "../constants/errors";

interface DerivedState {
    authenticateResponse: BasicUserInfo,
    idToken: string[],
    decodedIdTokenHeader: string,
    decodedIDTokenPayload: Record<string, string | number | boolean>;
}

/**
 * Home page for the Sample.
 *
 * @param props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const HomePage: FunctionComponent = (): ReactElement => {

    const {
        state,
        signIn,
        signOut,
        getBasicUserInfo,
        getIDToken,
        getDecodedIDToken,
        on
    } = useAuthContext();

    const [derivedAuthenticationState, setDerivedAuthenticationState] = useState<DerivedState>(null);
    const [hasAuthenticationErrors, setHasAuthenticationErrors] = useState<boolean>(false);
    const [hasLogoutFailureError, setHasLogoutFailureError] = useState<boolean>();

    const search = useLocation().search;
    const stateParam = new URLSearchParams(search).get('state');
    const errorDescParam = new URLSearchParams(search).get('error_description');
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('');
    const [id, setId] = useState(10);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const handleOpenForm = () => {
        setShowForm(true);
    };

    useEffect(() => {

        if (!state?.isAuthenticated) {
            return;
        }

        (async (): Promise<void> => {
            const basicUserInfo = await getBasicUserInfo();
            const idToken = await getIDToken();
            const decodedIDToken = await getDecodedIDToken();

            const derivedState: DerivedState = {
                authenticateResponse: basicUserInfo,
                idToken: idToken.split("."),
                decodedIdTokenHeader: JSON.parse(atob(idToken.split(".")[0])),
                decodedIDTokenPayload: decodedIDToken
            };

            setDerivedAuthenticationState(derivedState);
        })();
    }, [state.isAuthenticated, getBasicUserInfo, getIDToken, getDecodedIDToken]);

    useEffect(() => {
        if (stateParam && errorDescParam) {
            if (errorDescParam === "End User denied the logout request") {
                setHasLogoutFailureError(true);
            }
        }
    }, [stateParam, errorDescParam]);

    const handleLogin = useCallback(() => {
        setHasLogoutFailureError(false);
        signIn()
            .catch(() => setHasAuthenticationErrors(true));
    }, [signIn]);

    /**
      * handles the error occurs when the logout consent page is enabled
      * and the user clicks 'NO' at the logout consent page
      */
    useEffect(() => {
        on(Hooks.SignOut, () => {
            setHasLogoutFailureError(false);
        });

        on(Hooks.SignOutFailed, () => {
            if (!errorDescParam) {
                handleLogin();
            }
        })
    }, [on, handleLogin, errorDescParam]);

    const handleLogout = () => {
        signOut();
    };

    // If `clientID` is not defined in `config.json`, show a UI warning.
    if (!authConfig?.clientID) {

        return (
            <div className="content">
                <h2>You need to update the Client ID to proceed.</h2>
                <p>Please open &quot;src/config.json&quot; file using an editor, and update
                    the <code>clientID</code> value with the registered application&apos;s client ID.</p>
                <p>Visit repo <a
                    href="https://github.com/anusharp/asgardeo-react-app/">README</a> for
                    more details.</p>
            </div>
        );
    }

    if (hasLogoutFailureError) {
        return (
            <LogoutRequestDenied
                errorMessage={USER_DENIED_LOGOUT}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
            />
        );
    }

    const handleSubmit = async () => {
        const data = {
            id,
            date,
            category,
            description,
        };
        console.log('Request*********', JSON.stringify(data));
        try {
            const response = await fetch(process.env.HOLIDAY_SERVICE_BACKEND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                 },
                body: JSON.stringify(data),
            });
            console.log('Response*************************:', response);          
        } catch (error) {
            console.error('Error submitting data:', error);
        }
        finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    return (
        <DefaultLayout
            isLoading={state.isLoading}
            hasErrors={hasAuthenticationErrors}
        >
            {
                state.isAuthenticated
                    ? (
                        <div className="content">
                            <br></br>
                            <br></br>
                            <br></br>
                            <br></br>
                            <br></br>
                            <br></br>
                            <button
                                className="btn btn-primary"
                                onClick={handleOpenForm}>Add Holiday Data</button>
                            {showForm && (
                                <form onSubmit={() => {
                                    handleSubmit();
                                }} >
                                    <label htmlFor="date">Date:</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={date}
                                        className="form-control"
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <label htmlFor="category">Category:</label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        className="form-control"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    />
                                    <label htmlFor="description">Description:</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <br></br>
                                    <button type="submit" className="btn btn-primary" >Submit</button>
                                </form>
                            )}
                            <HolidayResponse />
                            <AuthenticationResponse
                                derivedResponse={derivedAuthenticationState}
                            />
                            <br></br>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    handleLogout();
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )
                    : (
                        <div className="content">
                            <div className="home-image">
                                <br></br>
                                <br></br>
                                <br></br>
                                <br></br>
                            </div>
                            <h2 className={"spa-app-description"}>
                            Stress-free Holidays: Let us handle the planning, so you can enjoy the fun!
                            </h2>
                            <br></br>
                            <br></br>
                            <br></br>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    handleLogin();
                                }}
                            >
                                Login
                            </button>
                        </div>
                    )
            }
        </DefaultLayout>
    );
};
