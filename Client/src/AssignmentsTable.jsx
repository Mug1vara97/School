import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  Box,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const AssignmentsTable = ({ assignments }) => {
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:5090/assessments/students");
        if (!response.ok) {
          throw new Error("Ошибка при загрузке студентов");
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, []);

  const handleOpen = (assignment) => {
    setSelectedAssignment(assignment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setGrade("");
    setComment("");
    setSelectedStudent("");
    setError("");
  };

  const handleGradeChange = (event) => {
    setGrade(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleStudentChange = (event) => {
    setSelectedStudent(event.target.value);
  };

  const handleSaveGrade = async () => {
    if (!selectedAssignment || !grade || !selectedStudent) {
      setError("Оценка и студент не могут быть пустыми.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5090/assessments/assessments/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          assessmentId: selectedAssignment.id,
          grade: grade,
          comment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении оценки");
      }

      setSuccess(true);
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Задания (Контрольные и самостоятельные работы)
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип задания</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Класс</TableCell>
              <TableCell>Предмет</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  {assignment.type === "independent"
                    ? "Самостоятельная работа"
                    : "Контрольная работа"}
                </TableCell>
                <TableCell>{assignment.topic}</TableCell>
                <TableCell>{assignment.className}</TableCell>
                <TableCell>{assignment.subjectName}</TableCell>
                <TableCell>
                  {new Date(assignment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen(assignment)}
                  >
                    Добавить оценку
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Добавить оценку для {selectedAssignment?.topic}
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="student-label">Студент</InputLabel>
            <Select
              labelId="student-label"
              value={selectedStudent}
              label="Студент"
              onChange={handleStudentChange}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {`${student.firstName} ${student.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Оценка"
            variant="outlined"
            fullWidth
            value={grade}
            onChange={handleGradeChange}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSaveGrade}>
            Сохранить
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Оценка успешно добавлена!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AssignmentsTable;