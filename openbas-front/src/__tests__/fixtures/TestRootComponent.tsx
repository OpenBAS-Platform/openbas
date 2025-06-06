import {store} from "../../store";
import React from 'react';
import ConnectedIntlProvider from "../../components/AppIntlProvider";
import ConnectedThemeProvider from "../../components/AppThemeProvider";
import {CssBaseline} from "@mui/material";
import { Provider } from 'react-redux';

// @ts-ignore
const TestRootComponent = ({children}) => {
    return (<Provider store={store}>
        <ConnectedIntlProvider>
            <ConnectedThemeProvider>
                <CssBaseline />
                {children}
            </ConnectedThemeProvider>
        </ConnectedIntlProvider>
    </Provider>);
};

export default TestRootComponent;