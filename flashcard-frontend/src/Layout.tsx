import { Outlet } from "react-router-dom"

import "./assets/globals.css";

import { AuthProvider } from "./context/AuthContext";


const Layout = () => {
    return (
        <>
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
                <AuthProvider>
                    <Outlet />
                </AuthProvider>
            </div>
        </>
    );
};

export default Layout;
