import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

const StudentDashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assessmentGrades, setAssessmentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("schedule");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const studentIdResponse = await fetch(
          `http://localhost:5090/authorization/studentId/${userId}`
        );
        if (!studentIdResponse.ok) throw new Error("Ошибка при загрузке studentId");

        const studentIdData = await studentIdResponse.json();
        const studentId = studentIdData;

        const studentResponse = await fetch(
          `http://localhost:5090/students/students/${userId}`
        );
        if (!studentResponse.ok) throw new Error("Ошибка при загрузке данных студента");

        const studentData = await studentResponse.json();
        const classId = studentData.classId;

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const startDate = startOfWeek.toISOString().split('T')[0];

        const scheduleResponse = await fetch(
          `http://localhost:5090/schedule/schedules?classId=${classId}&startDate=${startDate}&userId=${userId}`
        );
        if (!scheduleResponse.ok) throw new Error("Ошибка при загрузке расписания");
        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData);

        const gradesResponse = await fetch(
          `http://localhost:5090/grades/grade/${userId}`
        );
        if (!gradesResponse.ok) throw new Error("Ошибка при загрузке оценок");
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);

        const assignmentsResponse = await fetch(
          `http://localhost:5090/assessments/assignments/student/${studentId}`
        );
        if (!assignmentsResponse.ok) throw new Error("Ошибка при загрузке заданий");
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        const assessmentGradesResponse = await fetch(
          `http://localhost:5090/students/students/${studentId}/assessment-grades`
        );
        if (!assessmentGradesResponse.ok) throw new Error("Ошибка при загрузке оценок заданий");
        const assessmentGradesData = await assessmentGradesResponse.json();
        setAssessmentGrades(assessmentGradesData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateFinalGrade = (subjectGrades) => {
    if (!subjectGrades || subjectGrades.length === 0) return "Нет оценок";
    
    const sum = subjectGrades.reduce((acc, grade) => {
      const value = Number(
        grade.grade1? grade.grade1 : 
        grade.grade ? grade.grade : 
        0
      );
      return acc + value;
    }, 0);
  
    const average = sum / subjectGrades.length;
    return isNaN(average) ? "Нет оценок" : Math.round(average);
  };

  const gradesBySubject = grades.reduce((acc, grade) => {
    const subjectName = grade.subjectName;
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(grade);
    return acc;
  }, {});

  const assessmentGradesBySubject = assessmentGrades.reduce((acc, grade) => {
    const subjectName = grade.subjectName;
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(grade);
    return acc;
  }, {});

  const maxGradesCount = Math.max(...Object.values(gradesBySubject).map(grades => grades.length), 0);

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const numberOfPeriods = 5;
  const timetable = Array.from({ length: daysOfWeek.length }, () => 
    Array(numberOfPeriods).fill(null)
  );

  schedule.forEach(lesson => {
    const lessonDate = new Date(lesson.date);
    const dayIndex = lesson.day - 1;
    const periodIndex = lessonDate.getHours() - 9;

    if (dayIndex < daysOfWeek.length && periodIndex < numberOfPeriods && periodIndex >= 0) {
      timetable[dayIndex][periodIndex] = {
        subject: lesson.subjectName || "Нет урока",
        teacher: lesson.teacherName || "Нет учителя",
        topic: lesson.topic || "Нет темы",
        homework: lesson.homework || "Нет домашнего задания",
        grade: lesson.grade ? lesson.grade.grade1 : "Нет оценки",
      };
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {viewMode === 'schedule' && "Расписание на текущую неделю"}
        {viewMode === 'grades' && "Успеваемость"}
        {viewMode === 'assignments' && "Задания"}
      </Typography>

      <div style={{ marginBottom: 20 }}>
        <Button
          variant="contained"
          color={viewMode === 'schedule' ? "primary" : "inherit"}
          onClick={() => setViewMode('schedule')}
          sx={{ mr: 2 }}
        >
          Расписание
        </Button>
        <Button
          variant="contained"
          color={viewMode === 'grades' ? "primary" : "inherit"}
          onClick={() => setViewMode('grades')}
          sx={{ mr: 2 }}
        >
          Успеваемость
        </Button>
        <Button
          variant="contained"
          color={viewMode === 'assignments' ? "primary" : "inherit"}
          onClick={() => setViewMode('assignments')}
        >
          Задания
        </Button>
      </div>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {viewMode === 'schedule' && (
        <Grid container spacing={3}>
          {daysOfWeek.map((day, dayIndex) => (
            <Grid item xs={12} key={day}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>{day}</Typography>
                <Grid container spacing={2} sx={{ mb: 2, fontWeight: 'bold' }}>
                  <Grid item xs={2}><Typography>Время</Typography></Grid>
                  <Grid item xs={2}><Typography>Предмет</Typography></Grid>
                  <Grid item xs={2}><Typography>Учитель</Typography></Grid>
                  <Grid item xs={3}><Typography>Домашнее задание</Typography></Grid>
                  <Grid item xs={2}><Typography>Оценка</Typography></Grid>
                </Grid>

                {timetable[dayIndex].map((lesson, periodIndex) => (
                  <Grid container spacing={2} key={`${dayIndex}-${periodIndex}`} sx={{ mb: 1 }}>
                    <Grid item xs={2}>{`${9 + periodIndex}:00 - ${10 + periodIndex}:00`}</Grid>
                    <Grid item xs={2}>{lesson?.subject || "Нет урока"}</Grid>
                    <Grid item xs={2}>{lesson?.teacher || "Нет учителя"}</Grid>
                    <Grid item xs={3}>{lesson?.homework || "Нет задания"}</Grid>
                    <Grid item xs={2}>{lesson?.grade || "Нет оценки"}</Grid>
                  </Grid>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {viewMode === 'grades' && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Предмет</TableCell>
                <TableCell>Обычные оценки</TableCell>
                <TableCell>Самостоятельные работы</TableCell>
                <TableCell>Контрольные работы</TableCell>
                <TableCell>Итоговая</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(gradesBySubject).map(([subject, grades]) => {
                const regularGrades = grades.filter(g => !g.type);
                const independentGrades = assessmentGradesBySubject[subject]?.filter(ag => ag.assessmentType === "Самостоятельная работа") || [];
                const controlGrades = assessmentGradesBySubject[subject]?.filter(ag => ag.assessmentType === "Контрольная работа") || [];

                return (
                  <TableRow key={subject}>
                    <TableCell>{subject}</TableCell>
                    <TableCell>
                      {regularGrades.map((g, i) => (
                        <span key={i}>{g.grade1} </span>
                      ))}
                      {regularGrades.length === 0 && "—"}
                    </TableCell>
                    <TableCell>
                      {independentGrades.map((g, i) => (
                        <span key={i}>{g.grade} </span>
                      ))}
                      {independentGrades.length === 0 && "—"}
                    </TableCell>
                    <TableCell>
                      {controlGrades.map((g, i) => (
                        <span key={i}>{g.grade} </span>
                      ))}
                      {controlGrades.length === 0 && "—"}
                    </TableCell>
                    <TableCell>
                      {calculateFinalGrade([...regularGrades, ...independentGrades, ...controlGrades])}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {viewMode === 'assignments' && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип работы</TableCell>
                <TableCell>Предмет</TableCell>
                <TableCell>Тема</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Оценка</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map(assignment => {
                const grade = assessmentGrades.find(
                  ag => ag.assessmentId === assignment.id
                );

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {assignment.type === 'independent' 
                        ? 'Самостоятельная работа' 
                        : 'Контрольная работа'}
                    </TableCell>
                    <TableCell>{assignment.subjectName}</TableCell>
                    <TableCell>{assignment.topic}</TableCell>
                    <TableCell>
                      {new Date(assignment.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      {grade ? grade.grade : "Нет оценки"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default StudentDashboard;