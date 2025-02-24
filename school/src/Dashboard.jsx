import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import CreateSchedule from "./CreateSchedule";

const Dashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]); 
  const [classes, setClasses] = useState([]); 
  const [subjects, setSubjects] = useState([]); 
  const [loadingTeachers, setLoadingTeachers] = useState(true); 
  const [loadingStudents, setLoadingStudents] = useState(true); 
  const [loadingClasses, setLoadingClasses] = useState(true); 
  const [loadingSubjects, setLoadingSubjects] = useState(true); 
  const [errorTeachers, setErrorTeachers] = useState(""); 
  const [errorStudents, setErrorStudents] = useState(""); 
  const [errorClasses, setErrorClasses] = useState(""); 
  const [errorSubjects, setErrorSubjects] = useState(""); 

  // Функция для получения списка учителей
  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:5090/authorization/teachers");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных учителей");
      }
      const data = await response.json();
      setTeachers(data); 
    } catch (err) {
      setErrorTeachers(err.message);
    } finally {
      setLoadingTeachers(false); 
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:5090/authorization/students");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных учеников");
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setErrorStudents(err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:5090/authorization/classes");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных классов");
      }
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setErrorClasses(err.message);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5090/authorization/subjects");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных предметов");
      }
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setErrorSubjects(err.message); 
    } finally {
      setLoadingSubjects(false); 
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchClasses();
    fetchSubjects();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Панель администратора школьного дневника
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CreateSchedule classes={classes} teachers={teachers} subjects={subjects} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Список учителей
            </Typography>
            {loadingTeachers ? (
              <CircularProgress />
            ) : errorTeachers ? (
              <Alert severity="error">{errorTeachers}</Alert>
            ) : (
              <List>
                {teachers.map((teacher) => (
                  <ListItem key={teacher.id}>
                    <ListItemText
                      primary={`${teacher.firstName} ${teacher.lastName}`}
                      secondary={`Логин: ${teacher.login}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Список учеников
            </Typography>
            {loadingStudents ? (
              <CircularProgress />
            ) : errorStudents ? (
              <Alert severity="error">{errorStudents}</Alert>
            ) : (
              <List>
                {students.map((student) => (
                  <ListItem key={student.id}>
                    <ListItemText
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={`Логин: {student.login}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Список классов
            </Typography>
            {loadingClasses ? (
              <CircularProgress />
            ) : errorClasses ? (
              <Alert severity="error">{errorClasses}</Alert>
            ) : (
              <List>
                {classes.map((classItem) => (
                  <ListItem key={classItem.id}>
                    <ListItemText
                      primary={`Класс: ${classItem.name}`}
                      secondary={`Классный руководитель: ${classItem.teacherName}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
