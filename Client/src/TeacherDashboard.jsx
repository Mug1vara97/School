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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import HomeworkDialog from "./HomeworkDialog";
import GradeDialog from "./GradeDialog";
import GradesTable from "./GradesTable";
import AssignmentsTable from "./AssignmentsTable"; 
import SearchDialog from "./SearchDialog";

const TeacherDashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showGradesTable, setShowGradesTable] = useState(false);
  const [showAssignmentsTable, setShowAssignmentsTable] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [minGrade, setMinGrade] = useState(0);
  const [maxGrade, setMaxGrade] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState("");
  const navigate = useNavigate();

  const teacherId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (5 - today.getDay()));

        const scheduleResponse = await fetch(
          `http://localhost:5090/schedule/schedulet?teacherId=${teacherId}&startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`
        );
        if (!scheduleResponse.ok) throw new Error("Ошибка при загрузке расписания");

        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData);

        const assignmentsResponse = await fetch(
          `http://localhost:5090/assessments/assignments?teacherId=${teacherId}&startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`
        );
        if (!assignmentsResponse.ok) throw new Error("Ошибка при загрузке заданий");

        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        const allAssignmentsResponse = await fetch(
          `http://localhost:5090/assessments/assignments/teacher/${teacherId}`
        );
        if (!allAssignmentsResponse.ok) throw new Error("Ошибка при загрузке всех заданий");

        const allAssignmentsData = await allAssignmentsResponse.json();
        setAllAssignments(allAssignmentsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);


  const handleCreateAssignment = async () => {
    try {
      if (!selectedLesson || !selectedLesson.id) {
        throw new Error("Урок не выбран или не имеет идентификатора.");
      }

      const response = await fetch("http://localhost:5090/assessments/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          LessonId: selectedLesson.id,
          type: assignmentType,
          title: assignmentTitle,
          description: assignmentDescription,
        }),
      });

      if (!response.ok) throw new Error("Ошибка при создании задания");

      const newAssignment = await response.json();
      setAssignments((prev) => [...prev, newAssignment]);

      setIsAssignmentDialogOpen(false);
      setAssignmentType("");
      setAssignmentTitle("");
      setAssignmentDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:5090/assessments/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Ошибка при удалении задания");

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      const response = await fetch(`http://localhost:5090/assessments/assignments/${selectedAssignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: assignmentType,
          topic: assignmentTitle,
          description: assignmentDescription,
        }),
      });

      if (!response.ok) throw new Error("Ошибка при обновлении задания");

      setAssignments((prev) =>
        prev.map((a) => (a.id === selectedAssignment.id ? { ...a, type: assignmentType, topic: assignmentTitle, description: assignmentDescription } : a))
      );

      setIsAssignmentDialogOpen(false);
      setSelectedAssignment(null);
      setAssignmentType("");
      setAssignmentTitle("");
      setAssignmentDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignmentAction = (lesson, assignment = null) => {
    setSelectedLesson(lesson);
    if (assignment) {
      setSelectedAssignment(assignment);
      setAssignmentType(assignment.type);
      setAssignmentTitle(assignment.title);
      setAssignmentDescription(assignment.description);
    } else {
      setSelectedAssignment(null);
      setAssignmentType("");
      setAssignmentTitle("");
      setAssignmentDescription("");
    }
    setIsAssignmentDialogOpen(true);
  };

  const fetchStudents = async (classId) => {
    try {
      if (!classId) {
        throw new Error("Идентификатор класса не указан.");
      }

      const response = await fetch(`http://localhost:5090/authorization/classes/${classId}/students`);
      if (!response.ok) throw new Error("Ошибка при загрузке учеников");

      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
        setError("Данные учеников не являются массивом");
      }
    } catch (err) {
      setError(err.message);
      setStudents([]);
    }
  };

  const fetchGrades = async (lessonId) => {
    try {
      const response = await fetch(`http://localhost:5090/grades/grades/${lessonId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке оценок");

      const data = await response.json();
      setGrades(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGradeClick = async (lesson) => {
    setSelectedLesson(lesson);
    await fetchStudents(lesson.classId);
    await fetchGrades(lesson.id);
    setIsGradeDialogOpen(true);
  };

  const handleSaveGrade = async (studentId, gradeValue, comment) => {
    try {
      const response = await fetch("http://localhost:5090/grades/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          StudentId: studentId,
          LessonId: selectedLesson.id,
          GradeValue: gradeValue,
          Comment: comment,
        }),
      });

      if (!response.ok) throw new Error("Ошибка сохранения оценки");

      await fetchGrades(selectedLesson.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddHomework = (lesson) => {
    setSelectedLesson(lesson);
    setIsHomeworkDialogOpen(true);
  };

  const handleSaveHomework = async (homeworkText) => {
    try {
      const response = await fetch(
        `http://localhost:5090/homework/lessons/${selectedLesson.id}/homework`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homework: homeworkText }),
        }
      );
      if (!response.ok) throw new Error("Ошибка при сохранении домашнего задания");

      const updatedSchedule = schedule.map((lesson) =>
        lesson.id === selectedLesson.id ? { ...lesson, homework: homeworkText } : lesson
      );
      setSchedule(updatedSchedule);

      setIsHomeworkDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHomework = async () => {
    try {
      const response = await fetch(
        `http://localhost:5090/homework/lessons/${selectedLesson.id}/homework`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Ошибка при удалении домашнего задания");

      const updatedSchedule = schedule.map((lesson) =>
        lesson.id === selectedLesson.id ? { ...lesson, homework: null } : lesson
      );
      setSchedule(updatedSchedule);

      setIsHomeworkDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const daysOfWeek = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
  const numberOfPeriods = 5;

  const timetable = Array.from({ length: daysOfWeek.length }, () =>
    Array(numberOfPeriods).fill(null)
  );

  schedule.forEach((lesson) => {
    const lessonDate = new Date(lesson.date);
    const dayIndex = lesson.day - 1;
    const periodIndex = lessonDate.getHours() - 9;

    if (
      dayIndex < daysOfWeek.length &&
      periodIndex < numberOfPeriods &&
      periodIndex >= 0
    ) {
      timetable[dayIndex][periodIndex] = {
        ...lesson,
        subject: lesson.subjectName,
        className: lesson.className,
      };
    }
  });

  assignments.forEach((assignment) => {
    const assignmentDate = new Date(assignment.date);
    const dayIndex = assignmentDate.getDay() - 1;
    const periodIndex = assignmentDate.getHours() - 9;

    if (
      dayIndex < daysOfWeek.length &&
      periodIndex < numberOfPeriods &&
      periodIndex >= 0
    ) {
      if (!timetable[dayIndex][periodIndex]) {
        timetable[dayIndex][periodIndex] = {
          subject: assignment.type === "independent" ? "Самостоятельная работа" : "Контрольная работа",
          className: assignment.className,
          assignment: {
            id: assignment.id,
            type: assignment.type,
            title: assignment.title,
            description: assignment.description,
          },
        };
      } else {
        timetable[dayIndex][periodIndex].assignment = {
          id: assignment.id,
          type: assignment.type,
          title: assignment.topic,
          description: assignment.description,
        };
      }
    }
  });

  const handleSearch = async (minGrade, maxGrade, selectedSubject) => {
    try {
      const response = await fetch(
         `http://localhost:5090/teachers/students/search?minGrade=${minGrade}&maxGrade=${maxGrade}&subject=${selectedSubject}`
      );
      if (!response.ok) throw new Error("Ошибка при поиске учеников");
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {showGradesTable ? "Таблица оценок" : "Расписание на текущую неделю"}
      </Typography>

      <Button
        onClick={() => setShowGradesTable(!showGradesTable)}
        variant="contained"
        sx={{ mb: 2, mr: 2 }}
      >
        {showGradesTable ? "Показать расписание" : "Показать оценки"}
      </Button>

      <Button
        onClick={() => {
          setShowAssignmentsTable(!showAssignmentsTable);
          setShowGradesTable(false);
        }}
        variant="contained"
        sx={{ mb: 2 }}
      >
        {showAssignmentsTable ? "Показать расписание" : "Показать задания"}
      </Button>

      <Button variant="contained" sx={{ mb: 2, ml: 2 }} onClick={() => setSearchDialogOpen(true)}>
        Поиск учеников
      </Button>

      {showAssignmentsTable ? (
        <AssignmentsTable assignments={allAssignments} teacherId={teacherId} />
      ) : showGradesTable ? (
        <GradesTable teacherId={teacherId} />
      ) : (
        <Grid container spacing={3}>
          {daysOfWeek.map((day, dayIndex) => (
            <Grid item xs={12} key={day}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {day}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2, fontWeight: "bold" }}>
                  <Grid item xs={2}>
                    <Typography variant="body1">Время</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">Предмет</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1">Класс</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body1">Домашнее задание</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body1">Действия</Typography>
                  </Grid>
                </Grid>

                {timetable[dayIndex].map((lesson, periodIndex) => (
                  <Grid container spacing={2} key={`${dayIndex}-${periodIndex}`} sx={{ mb: 1 }}>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {`${9 + periodIndex}:00 - ${10 + periodIndex}:00`}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {lesson ? lesson.subject : "Нет урока"}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1">
                        {lesson ? lesson.className : "Нет урока"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body1">
                        {lesson ? lesson.homework : "Нет домашнего задания"}
                      </Typography>
                      {lesson?.assignment && (
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            {lesson.assignment.type === "independent" ? "Самостоятельная работа" : "Контрольная работа: "}
                            {lesson.assignment.title}
                          </Typography>
                        </div>
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <Button onClick={() => handleAddHomework(lesson)}>
                        {lesson?.homework ? "Изменить ДЗ" : "Добавить ДЗ"}
                      </Button>
                      <Button onClick={() => handleGradeClick(lesson)}>
                        Оценки
                      </Button>
                      <Button
                        onClick={() => handleAssignmentAction(lesson, lesson?.assignment)}
                        variant={lesson?.assignment ? "outlined" : "contained"}
                      >
                        {lesson?.assignment ? "Редактировать задание" : "Назначить задание"}
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <HomeworkDialog
        open={isHomeworkDialogOpen}
        onClose={() => setIsHomeworkDialogOpen(false)}
        homework={selectedLesson?.homework || ""}
        onSaveHomework={handleSaveHomework}
        onDeleteHomework={handleDeleteHomework}
        selectedLesson={selectedLesson}
      />

      <GradeDialog
        open={isGradeDialogOpen}
        onClose={() => setIsGradeDialogOpen(false)}
        students={students}
        grades={grades}
        onSaveGrade={handleSaveGrade}
        selectedLesson={selectedLesson}
      />

      <Dialog open={isAssignmentDialogOpen} onClose={() => setIsAssignmentDialogOpen(false)}>
        <DialogTitle>
          {selectedAssignment ? "Редактировать задание" : "Новое задание"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Тип задания</InputLabel>
            <Select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
            >
              <MenuItem value="independent">Самостоятельная работа</MenuItem>
              <MenuItem value="control">Контрольная работа</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Название задания"
            fullWidth
            sx={{ mt: 2 }}
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
          />

          <TextField
            label="Описание задания"
            multiline
            rows={3}
            fullWidth
            sx={{ mt: 2 }}
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAssignmentDialogOpen(false)}>Отмена</Button>
          {selectedAssignment && (
            <Button
              onClick={() => handleDeleteAssignment(selectedAssignment.id)}
              color="error"
            >
              Удалить
            </Button>
          )}
          <Button
            onClick={selectedAssignment ? handleUpdateAssignment : handleCreateAssignment}
            variant="contained"
          >
            {selectedAssignment ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>

      <SearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSearch={handleSearch}
        searchResults={searchResults}
      />
    </Container>
  );
};

export default TeacherDashboard;