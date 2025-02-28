import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";

const AddStudentToClass = ({ studentId, onStudentAdded, onClose, classes }) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddStudentToClass = async () => {
    if (!selectedClassId) {
      setError("Выберите класс");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5090/authorization/students/${studentId}/class`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classId: selectedClassId }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      onStudentAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Добавить ученика в класс</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="class-select-label">Класс</InputLabel>
          <Select
            labelId="class-select-label"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            label="Класс"
          >
            {classes.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleAddStudentToClass} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentToClass;