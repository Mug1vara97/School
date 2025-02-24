import { useState, useEffect } from "react";

const TeacherDashboard = () => {
    const userId = localStorage.getItem("userId");
    const [classes, setClasses] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(""); 

    const fetchClasses = async () => {
        try {
            const response = await fetch(`http://localhost:5090/authorization/teacher/${userId}`);
            if (!response.ok) {
                throw new Error("Ошибка при загрузке данных классов");
            }
            const data = await response.json();
            setClasses(data);
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [userId]);

    return (
        <div>
            <h2>Список ваших классов</h2>
            {loading ? (
                <p>Загрузка классов...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <ul>
                    {classes.map((classItem) => (
                        <li key={classItem.id}>
                            Класс: {classItem.name} (Классный руководитель: {classItem.teacherName})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TeacherDashboard;