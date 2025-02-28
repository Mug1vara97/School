import { useState } from "react";
import { Snackbar, TextField, Button, Alert, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const AddClass = ({ onClassAdded, teachers }) => {
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState(""); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5090/classes/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          teacherId: teacherId || null 
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении класса");
      }

      setSuccess(true);
      setName("");
      setTeacherId(""); 
      onClassAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderTeachers = () => {
    if (!teachers || teachers.length === 0) {
      return <MenuItem disabled>Учителя не найдены</MenuItem>;
    }

    return teachers.map((teacher) => (
      <MenuItem key={teacher.id} value={teacher.id}>
        {`${teacher.firstName} ${teacher.lastName}`}
      </MenuItem>
    ));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Название класса"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth>
        <InputLabel>Классный руководитель</InputLabel>
        <Select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
        >
          <MenuItem value="">Не назначен</MenuItem>
          {renderTeachers()}
        </Select>
      </FormControl>
      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        sx={{ mt: 2 }}
      >
        Добавить класс
      </Button>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError("")}>
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          Класс успешно добавлен!
        </Alert>
      </Snackbar>
    </form>
  );
};

export default AddClass;