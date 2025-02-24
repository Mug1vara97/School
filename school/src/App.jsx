import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import TeacherDashboard from "./TeacherDashboard"
import StudentDashboard from "./StudentDashboard"
import "./App.css"

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} /> 
                <Route path="/student-dashboard" element={<StudentDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;