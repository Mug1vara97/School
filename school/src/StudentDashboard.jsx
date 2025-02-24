import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";

const StudentDashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const studentResponse = await fetch(
          `http://localhost:5090/authorization/students/${studentId}`
        );
        if (!studentResponse.ok) throw new Error("Ошибка при загрузке данных студента");

        const studentData = await studentResponse.json();
        const classId = studentData.classId;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); 
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (5 - today.getDay()));

        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];

        const scheduleResponse = await fetch(
          `http://localhost:5090/authorization/schedule?classId=${classId}&startDate=${startDate}&endDate=${endDate}`
        );
        const scheduleData = await scheduleResponse.json();
        console.log(scheduleData);
        setSchedule(scheduleData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [studentId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const numberOfPeriods = 5;

  const timetable = Array.from({ length: daysOfWeek.length }, () => Array(numberOfPeriods).fill(null));

  schedule.forEach(lesson => {
    const lessonDate = new Date(lesson.date);
    const dayIndex = lesson.day - 1;
    const periodIndex = lessonDate.getHours() - 9;

    if (dayIndex < daysOfWeek.length && periodIndex < numberOfPeriods && periodIndex >= 0) {
      timetable[dayIndex][periodIndex] = `${lesson.subjectName} (${lesson.teacherName})`;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Расписание на текущую неделю
      </Typography>

      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>День</TableCell>
                <TableCell>1 Урок</TableCell>
                <TableCell>2 Урок</TableCell>
                <TableCell>3 Урок</TableCell>
                <TableCell>4 Урок</TableCell>
                <TableCell>5 Урок</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {daysOfWeek.map((day, dayIndex) => (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  {timetable[dayIndex].map((lesson, periodIndex) => (
                    <TableCell key={`${dayIndex}-${periodIndex}`}>
                      {lesson ? lesson : "Нет урока"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default StudentDashboard;