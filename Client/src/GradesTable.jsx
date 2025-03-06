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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const GradesTable = ({ teacherId }) => {
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsResponse = await fetch(`http://localhost:5090/teachers/subject?teacherId=${teacherId}`);
        if (!subjectsResponse.ok) throw new Error("Ошибка при загрузке предметов");
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);

        const classesResponse = await fetch(`http://localhost:5090/teachers/classes?teacherId=${teacherId}`);
        if (!classesResponse.ok) throw new Error("Ошибка при загрузке классов");
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  useEffect(() => {
    if (selectedSubject && selectedClass) {
      const fetchGrades = async () => {
        try {
          const response = await fetch(
            `http://localhost:5090/teachers/grades?subjectId=${selectedSubject}&classId=${selectedClass}`
          );
          if (!response.ok) throw new Error("Ошибка при загрузке оценок");
          const data = await response.json();
          setGrades(data);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchGrades();
    }
  }, [selectedSubject, selectedClass]);

  const groupedGrades = groupGradesByStudent(grades);

  const uniqueDates = [...new Set(grades.map((grade) => grade.date))].sort();

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Таблица оценок
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Предмет</InputLabel>
        <Select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Класс</InputLabel>
        <Select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classes.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ученик</TableCell>
              {uniqueDates.map((date) => (
                <TableCell key={date}>{new Date(date).toLocaleDateString()}</TableCell>
              ))}
              <TableCell>Самостоятельные работы</TableCell>
              <TableCell>Контрольные работы</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedGrades).map(([studentName, studentData]) => (
              <TableRow key={studentName}>
                <TableCell>{studentName}</TableCell>
                {uniqueDates.map((date) => (
                  <TableCell key={date}>
                    {studentData.gradesByDate[date] ? (
                      <>
                        <div>Оценка: {studentData.gradesByDate[date].gradeValue}</div>
                      </>
                    ) : (
                      "Нет оценки"
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {studentData.assessmentGrades && studentData.assessmentGrades.length > 0
                    ? studentData.assessmentGrades
                        .filter((ag) => ag.assessmentType === "Самостоятельная работа")
                        .map((ag) => (
                          <div key={ag.id}>
                            {ag.topic}: {ag.grade}
                          </div>
                        ))
                    : "-"}
                </TableCell>
                <TableCell>
                  {studentData.assessmentGrades && studentData.assessmentGrades.length > 0
                    ? studentData.assessmentGrades
                        .filter((ag) => ag.assessmentType === "Контрольная работа")
                        .map((ag) => (
                          <div key={ag.id}>
                            {ag.topic}: {ag.grade}
                          </div>
                        ))
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const groupGradesByStudent = (grades) => {
  const grouped = {};

  grades.forEach((grade) => {
    if (!grouped[grade.studentName]) {
      grouped[grade.studentName] = {
        assessmentGrades: grade.assessmentGrades || [], 
        gradesByDate: {},
      };
    }
    grouped[grade.studentName].gradesByDate[grade.date] = {
      gradeValue: grade.gradeValue,
    };
  });

  return grouped;
};

export default GradesTable;