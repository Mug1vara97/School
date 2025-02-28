import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const HomeworkDialog = ({
  open,
  onClose,
  homework,
  onSaveHomework,
  onDeleteHomework,
  selectedLesson,
}) => {
  const [homeworkText, setHomeworkText] = useState(homework);

  const handleSave = () => {
    onSaveHomework(homeworkText);
  };

  const handleDelete = () => {
    onDeleteHomework();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Домашнее задание</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={homeworkText}
          onChange={(e) => setHomeworkText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave}>Сохранить</Button>
        {selectedLesson?.homework && (
          <Button onClick={handleDelete} color="error">
            Удалить
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HomeworkDialog;