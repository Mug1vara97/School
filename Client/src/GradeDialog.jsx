import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

const GradeDialog = ({
  open,
  onClose,
  students,
  grades,
  onSaveGrade,
  selectedLesson,
}) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [comment, setComment] = useState("");

  const handleSave = () => {
    onSaveGrade(selectedStudent, gradeValue, comment);
    setSelectedStudent("");
    setGradeValue("");
    setComment("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Выставление оценок</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Ученик</InputLabel>
          <Select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            {Array.isArray(students) &&
              students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.studentName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          label="Оценка"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={gradeValue}
          onChange={(e) => setGradeValue(e.target.value)}
        />

        <TextField
          label="Комментарий"
          multiline
          rows={3}
          fullWidth
          sx={{ mt: 2 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          Существующие оценки:
        </Typography>
        {grades.map((grade) => (
          <div key={grade.id}>
            <Typography>
              {grade.studentName}: {grade.grade} ({grade.comment})
            </Typography>
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradeDialog;