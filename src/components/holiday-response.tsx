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

import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import axios, { Method } from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
/**
 * Decoded ID Token Response component Prop types interface.
 */
interface HolidayResponsePropsInterface {

}

/**
 * Displays the derived Holiday Response from the SDK.
 *
 * @param {HolidayResponsePropsInterface} props - 
 *
 * @return {React.ReactElement}
 */
export const HolidayResponse: FunctionComponent<HolidayResponsePropsInterface> = (
    props: HolidayResponsePropsInterface
): ReactElement => {

    const [holidayData, setHolidayData] = useState<any>(null);


    useEffect(() => {
        fetchData();
    }, []);
    const columnDefs = [
        { headerName: 'Date', field: 'date' },
        { headerName: 'Local Name', field: 'localName' },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Country Code', field: 'countryCode' },
    ];

    const fetchData = async () => {
        try {
            const response = await axios.get('https://public-holiday.p.rapidapi.com/2024/US', {
                headers: {
                    'X-RapidAPI-Host': 'public-holiday.p.rapidapi.com',
                    'X-RapidAPI-Key': 'cb1776c146msh7dbe437f7308b71p1be0aajsnaab1efd1636f',
                },
            });
            console.log('Response:', response.data);
            setHolidayData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <>
            <h2>Public Holidays</h2>
            {holidayData && (

                <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
                    <AgGridReact
                        rowData={holidayData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div>
            )}
            
        </>
    );
};
