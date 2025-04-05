import { Outlet } from "react-router-dom"

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import "./assets/globals.css";


const darkTheme = createTheme({
    colorSchemes: {
        light: true
    },
});

const Layout = () => {

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />

            <title>Flashcards</title>
            <meta name="description" content="For brushing up on team knowledge" />

            {/* Preload the fonts */}
            <link
                rel="preload"
                href="/assets/fonts/GeistVF.woff"
                as="font"
                type="font/woff"
                crossOrigin="anonymous"
            />
            <link
                rel="preload"
                href="/assets/fonts/GeistMonoVF.woff"
                as="font"
                type="font/woff"
                crossOrigin="anonymous"
            />
            
            <div className="geistSans geistMono antialiased">
                <Outlet />
            </div>
        </ThemeProvider>
    );
};

export default Layout;
