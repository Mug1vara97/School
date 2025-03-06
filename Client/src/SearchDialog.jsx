import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";

const SearchDialog = ({ open, onClose, onSearch, searchResults }) => {
  const [minGrade, setMinGrade] = useState(0);
  const [maxGrade, setMaxGrade] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const userId = localStorage.getItem("userId"); 
        const response = await fetch(`http://localhost:5090/teachers/${userId}/subjects`);
        if (!response.ok) throw new Error("Ошибка при загрузке предметов");
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (open) {
      fetchSubjects(); 
    }
  }, [open]); 

  const handleSearch = async () => {
    await onSearch(minGrade, maxGrade, selectedSubject);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Найти учеников по оценкам</DialogTitle>
      <DialogContent>
        <TextField
          label="Минимальная оценка"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={minGrade}
          onChange={(e) => setMinGrade(e.target.value)}
        />
        <TextField
          label="Максимальная оценка"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={maxGrade}
          onChange={(e) => setMaxGrade(e.target.value)}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Предмет</InputLabel>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.name}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {searchResults.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Имя ученика</TableCell>
                  <TableCell>Средняя оценка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.averageGrade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button onClick={handleSearch} variant="contained">
          Поиск
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;