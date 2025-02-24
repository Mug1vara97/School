import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5090/authorization/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Invalid login or password");
            }

            const data = await response.json(); 
            localStorage.setItem("role", data.role); 
            localStorage.setItem("userId", data.userId); 
            if (data.role === "admin") {
                navigate("/dashboard"); 
            } else if (data.role === "teacher") {
                navigate("/teacher-dashboard"); 
            } else if (data.role === "student") {
                navigate("/student-dashboard");
            } else {
                throw new Error("Unknown role"); 
            }
        } catch (err) {
            setError(err.message); 
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Login:</label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;