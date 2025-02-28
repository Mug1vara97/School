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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import CreateSchedule from "./CreateSchedule";
import AddTeacher from "./AddTeacher";
import EditTeacher from "./EditTeacher";
import AddStudent from "./AddStudent";
import EditStudent from "./EditStudent";
import AddClass from "./AddClass"; 
import EditClass from "./EditClass"; 
import AddStudentToClass from "./AddStudentToClass";


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
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [openEditStudentDialog, setOpenEditStudentDialog] = useState(false); 
  const [openAddDialog, setOpenAddDialog] = useState(false); 
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false); 
  const [editingClass, setEditingClass] = useState(null);
  const [openEditClassDialog, setOpenEditClassDialog] = useState(false);
  const [openAddClassDialog, setOpenAddClassDialog] = useState(false);
  const [openAddStudentToClassDialog, setOpenAddStudentToClassDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const handleAddStudentToClass = (studentId) => {
    setSelectedStudentId(studentId);
    setOpenAddStudentToClassDialog(true);
  };
  
  const handleStudentAddedToClass = () => {
    fetchStudents();
    setOpenAddStudentToClassDialog(false);
  };

  const handleTeacherAdded = () => {
    fetchTeachers();
    setOpenAddDialog(false);
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setOpenAddStudentDialog(false);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setOpenEditDialog(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setOpenEditStudentDialog(true);
  };

  const handleUpdateTeacher = () => {
    fetchTeachers();
    setOpenEditDialog(false);
  };

  const handleUpdateStudent = () => {
    fetchStudents();
    setOpenEditStudentDialog(false);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
  };

  const handleCloseAdd = () => {
    setOpenAddDialog(false);
  };

  const handleCloseAddStudent = () => {
    setOpenAddStudentDialog(false);
  };

  const handleCloseEditStudent = () => {
    setOpenEditStudentDialog(false);
  };

  const handleClassAdded = () => {
    fetchClasses();
    setOpenAddClassDialog(false);
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setOpenEditClassDialog(true);
  };

  const handleUpdateClass = () => {
    fetchClasses();
    setOpenEditClassDialog(false);
  };

  const handleDeleteClass = async (classId) => {
    const confirm = window.confirm("Вы действительно хотите удалить этот класс?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5090/classes/classes/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        handleClassAdded();
      } else {
        const message = await response.text();
        alert(`Ошибка удаления класса: ${message}`);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    const confirm = window.confirm("Вы действительно хотите удалить этого учителя?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5090/teachers/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        handleTeacherAdded();
      } else {
        const message = await response.text();
        alert(`Ошибка удаления учителя: ${message}`);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirm = window.confirm("Вы действительно хотите удалить этого ученика?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5090/students/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        handleStudentAdded();
      } else {
        const message = await response.text();
        alert(`Ошибка удаления ученика: ${message}`);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:5090/teachers/teachers");
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
      const response = await fetch("http://localhost:5090/students/students");
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
      const response = await fetch("http://localhost:5090/classes/classes");
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
            <Grid item xs={12}>
              <Button onClick={() => setOpenAddDialog(true)} variant="contained" color="primary">
                Добавить учителя
              </Button>
            </Grid>
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
                    <Button onClick={() => handleEditTeacher(teacher)}>Редактировать</Button>
                    <Button onClick={() => handleDeleteTeacher(teacher.id)}>Удалить</Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Dialog open={openEditDialog} onClose={handleCloseEdit}>
          <DialogTitle>Редактирование учителя</DialogTitle>
          <DialogContent>
            {editingTeacher && (
              <EditTeacher 
                teacher={editingTeacher} 
                onTeacherUpdated={handleUpdateTeacher}
                onClose={handleCloseEdit}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openAddDialog} onClose={handleCloseAdd}>
          <DialogTitle>Добавление учителя</DialogTitle>
          <DialogContent>
            <AddTeacher onTeacherAdded={handleTeacherAdded} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAdd}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openAddStudentDialog} onClose={handleCloseAddStudent}>
          <DialogTitle>Добавление ученика</DialogTitle>
          <DialogContent>
            <AddStudent onStudentAdded={handleStudentAdded} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddStudent}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditStudentDialog} onClose={handleCloseEditStudent}>
          <DialogTitle>Редактирование ученика</DialogTitle>
          <DialogContent>
            {editingStudent && (
              <EditStudent
                student={editingStudent}
                onStudentUpdated={handleUpdateStudent}
                onClose={handleCloseEditStudent}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditStudent}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Список учеников
            </Typography>
            <Grid item xs={12}>
              <Button onClick={() => setOpenAddStudentDialog(true)} variant="contained" color="primary">
                Добавить ученика
              </Button>
            </Grid>
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
                      secondary={`Логин: ${student.login}`}
                    />
                     <Box display="flex" flexDirection="column">
                      <Button onClick={() => handleAddStudentToClass(student.id)}>Добавить в класс</Button>
                      <Button onClick={() => handleEditStudent(student)}>Редактировать</Button>
                      <Button onClick={() => handleDeleteStudent(student.id)}>Удалить</Button>
                    </Box>
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
          <Grid item xs={12}>
            <Button onClick={() => setOpenAddClassDialog(true)} variant="contained" color="primary">
              Добавить класс
            </Button>
          </Grid>
          {loadingClasses ? (
            <CircularProgress />
          ) : errorClasses ? (
            <Alert severity="error">{errorClasses}</Alert>
          ) : (
            <List>
              {classes.map((classItem) => (
                <ListItem key={classItem.id}>
                  <ListItemText primary={`Класс: ${classItem.name}`} />
                  <Button onClick={() => handleEditClass(classItem)}>Редактировать</Button>
                  <Button onClick={() => handleDeleteClass(classItem.id)}>Удалить</Button>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Grid>
      <Dialog open={openEditClassDialog} onClose={() => setOpenEditClassDialog(false)}>
        <DialogTitle>Редактирование класса</DialogTitle>
        <DialogContent>
          {editingClass && (
            <EditClass
              classItem={editingClass}
              onClassUpdated={handleUpdateClass}
              onClose={() => setOpenEditClassDialog(false)}
              teachers={teachers} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditClassDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openAddClassDialog} onClose={() => setOpenAddClassDialog(false)}>
        <DialogTitle>Добавление класса</DialogTitle>
        <DialogContent>
          <AddClass onClassAdded={handleClassAdded} teachers={teachers} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddClassDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      </Grid>
      {openAddStudentToClassDialog && (
        <AddStudentToClass
          studentId={selectedStudentId}
          onStudentAdded={handleStudentAddedToClass}
          onClose={() => setOpenAddStudentToClassDialog(false)}
          classes={classes}
        />
      )}
    </Container>
  );
};

export default Dashboard;