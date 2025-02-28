import { useState } from "react";
import { Snackbar, TextField, Button, Alert } from "@mui/material";

const EditStudent = ({ student, onStudentUpdated, onClose }) => {
  const [firstName, setFirstName] = useState(student.firstName);
  const [lastName, setLastName] = useState(student.lastName);
  const [login, setLogin] = useState(student.login);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    const response = await fetch(`http://localhost:5090/students/students/${student.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, login }),
    });

    if (response.ok) {
      setSuccess(true);
      onStudentUpdated();
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
          <Alert severity="success">Ученик обновлён успешно</Alert>
        </Snackbar>
      )}
    </>
  );
};

export default EditStudent;