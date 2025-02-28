import { useState } from "react";
import { Snackbar, TextField, Button, Alert } from "@mui/material";

const AddStudent = ({ onStudentAdded }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5090/students/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, login }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении ученика");
      }

      setSuccess(true);
      setFirstName("");
      setLastName("");
      setLogin("");
      onStudentAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Имя"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <TextField
        label="Фамилия"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <TextField
        label="Логин"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Добавить ученика
      </Button>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Ученик успешно добавлен!
        </Alert>
      </Snackbar>
    </form>
  );
};

export default AddStudent;