import { Routes, Route } from "react-router-dom"

import './App.css'

import Layout from './Layout'

import { AuthProvider } from './context/AuthContext'

import Login from './pages/Login'
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import GroupInfo from "./pages/GroupInfo"
import Flashcard from "./pages/Flashcard"

function App() {

    return (
        <>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/groups/:groupId" element={<GroupInfo />} />
                        <Route path="/flashcard" element={<Flashcard />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </>
    )
}

export default App
