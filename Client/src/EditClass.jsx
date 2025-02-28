import { useState } from "react";
import { Snackbar, TextField, Button, Alert, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const EditClass = ({ classItem, onClassUpdated, onClose, teachers }) => {
  const [name, setName] = useState(classItem.name);
  const [teacherId, setTeacherId] = useState(classItem.teacherId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    const response = await fetch(`http://localhost:5090/classes/classes/${classItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, teacherId }),
    });

    if (response.ok) {
      setSuccess(true);
      onClassUpdated();
      onClose();
    } else {
      const message = await response.text();
      setError(message);
    }
  };

  return (
    <>
      <TextField
        label="Название класса"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Учитель</InputLabel>
        <Select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        >
          {teachers.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.id}>
              {`${teacher.firstName} ${teacher.lastName}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleUpdate}>
        Обновить
      </Button>
      {error && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="success">Класс обновлён успешно</Alert>
        </Snackbar>
      )}
    </>
  );
};

export default EditClass;