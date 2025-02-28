import { useState } from "react";
import {
  Snackbar,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const EditTeacher = ({ teacher, onTeacherUpdated, onClose }) => {
  const [firstName, setFirstName] = useState(teacher.firstName);
  const [lastName, setLastName] = useState(teacher.lastName);
  const [login, setLogin] = useState(teacher.login);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    const response = await fetch(`http://localhost:5090/teachers/teachers/${teacher.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, login }),
    });

    if (response.ok) {
      setSuccess(true);
      onTeacherUpdated();
      onClose();
    } else {
      const message = await response.text();
      setError(message);
    }
  };

  return (
    <>
      <TextField
        label="Имя"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Фамилия"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Логин"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        fullWidth
        margin="normal"
      />
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
          <Alert severity="success">Учитель обновлен успешно</Alert>
        </Snackbar>
      )}
    </>
  );
};

export default EditTeacher;