import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";

const CreateSchedule = ({ classes, teachers, subjects }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingSchedule, setExistingSchedule] = useState([]);

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setSchedule({}); 
  };

  const handleDateChange = (event) => {
    setStartDate(event.target.value);
  };

  useEffect(() => {
    if (selectedClass && startDate) {
      fetchExistingSchedule();
    }
  }, [selectedClass, startDate]);

  const fetchExistingSchedule = async () => {
    try {
      const response = await fetch(
        `http://localhost:5090/authorization/schedule?classId=${selectedClass}&startDate=${startDate}`
      );
      if (!response.ok) throw new Error("Ошибка при загрузке расписания");
      const data = await response.json();
      
      const formattedSchedule = {};
      data.forEach((lesson) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + (lesson.day - 1));
        const dateKey = currentDate.toISOString().split('T')[0];
        
        const lessonTime = new Date(lesson.date).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace('.', ':');
  
        if (!formattedSchedule[dateKey]) formattedSchedule[dateKey] = {};
        formattedSchedule[dateKey][lessonTime] = {
          subject: lesson.subjectName,
          teacher: lesson.teacherName,
          topic: lesson.topic,
        };
      });
  
      setExistingSchedule(data);
      setSchedule(formattedSchedule);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveSchedule = async () => {
    try {
      setLoading(true);
      const lessons = [];
      const daysOfWeek = [0, 1, 2, 3, 4];
  
      daysOfWeek.forEach((day) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + (day - 1));
        const currentDateISO = currentDate.toISOString().split('T')[0];

        Object.keys(schedule[currentDateISO] || {}).forEach((time) => {
          const lesson = schedule[currentDateISO][time];
          if (lesson.subject && lesson.teacher) {
            const formattedTime = time.split(':')[0];
            const dateTime = `${currentDateISO} ${formattedTime}:00`;
  
            lessons.push({
              classId: selectedClass,
              subjectId: subjects.find((sub) => sub.name === lesson.subject)?.id,
              teacherId: teachers.find(
                (tch) => `${tch.firstName} ${tch.lastName}` === lesson.teacher
              )?.id,
              date: dateTime,
              day: day + 1,
              topic: lesson.topic || "",
            });
          }
        });
      });

      const response = await fetch("http://localhost:5090/authorization/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessons),
      });
  
      if (!response.ok) throw new Error("Ошибка при сохранении расписания");
      alert("Расписание успешно сохранено!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Создание расписания
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Выберите класс</InputLabel>
            <Select value={selectedClass} onChange={handleClassChange}>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Начало недели"
            type="date"
            value={startDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
              
      {selectedClass && startDate && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Расписание для выбранного класса:
          </Typography>
          <Grid container spacing={2}>
            {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"].map((dayName, index) => {
              const currentDate = new Date(startDate);
              currentDate.setDate(currentDate.getDate() + index);
              const dateKey = currentDate.toISOString().split('T')[0];

              return (
                <Grid item xs={12} key={dayName}>
                  <Typography variant="h6">{dayName}</Typography>
                  {["09:00", "10:00", "11:00", "12:00", "13:00"].map((time) => {
                    const existingLesson = schedule[dateKey]?.[time];

                    return (
                      <LessonInput
                        key={`${dateKey}-${time}`}
                        date={dateKey}
                        time={time}
                        day={index + 1}
                        addLesson={(day, time, lesson) => addLesson(day, time, lesson)}
                        teachers={teachers}
                        subjects={subjects}
                        existingLesson={existingLesson}
                      />
                    );
                  })}
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={saveSchedule}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : "Сохранить расписание"}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

const LessonInput = ({ date, time, day, addLesson, teachers, subjects, existingLesson }) => {
  const [subject, setSubject] = useState(existingLesson?.subject || "");
  const [teacher, setTeacher] = useState(existingLesson?.teacher || "");

  const handleSave = () => {
    if (!subject || !teacher) return alert("Выберите предмет и учителя");
    addLesson(date, time, { subject, teacher, day });
  };

  useEffect(() => {
    if (existingLesson) {
      setSubject(existingLesson.subject);
      setTeacher(existingLesson.teacher);
    }
  }, [existingLesson]);

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid item xs={2}>
        <Typography>{time}</Typography>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel>Предмет</InputLabel>
          <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((sub) => (
              <MenuItem key={sub.id} value={sub.name}>
                {sub.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel>Учитель</InputLabel>
          <Select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
            {teachers.map((tch) => (
              <MenuItem key={tch.id} value={`${tch.firstName} ${tch.lastName}`}>
                {tch.firstName} {tch.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" onClick={handleSave}>
          {existingLesson ? "Обновить" : "Добавить"}
        </Button>
      </Grid>
    </Grid>
  );
};

LessonInput.propTypes = {
  day: PropTypes.number.isRequired,
  time: PropTypes.string.isRequired,
  addLesson: PropTypes.func.isRequired,
  teachers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ).isRequired,
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  existingLesson: PropTypes.object,
};

export default CreateSchedule;