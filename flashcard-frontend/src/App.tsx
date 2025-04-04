import { Routes, Route } from 'react-router-dom'

import './App.css'

import Layout from './Layout'

import { AuthProvider } from '@contexts/AuthContext'

import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'

function App() {

    return (
        <>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />} >
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </>
    )
}

export default App
