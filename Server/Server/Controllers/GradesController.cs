using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Controllers;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GradesController : ControllerBase
    {
        private readonly SchoolContext _context;

        public GradesController(SchoolContext context)
        {
            _context = context;
        }

        [HttpGet("grades/{lessonId}")]
        public IActionResult GetGrades(int lessonId)
        {
            try
            {
                var grades = _context.Grades
                    .Include(g => g.Student)
                    .Where(g => g.LessonId == lessonId)
                    .Select(g => new
                    {
                        g.Id,
                        StudentId = g.Student.UserId,
                        StudentName = $"{g.Student.User.FirstName} {g.Student.User.LastName}",
                        g.Grade1,
                        g.Comment
                    })
                    .ToList();

                return Ok(grades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки оценок: {ex.Message}");
            }
        }

        [HttpPost("grades")]
        public async Task<IActionResult> AddGrade([FromBody] GradeRequest request)
        {
            try
            {
                var grade = new Grade
                {
                    StudentId = request.StudentId,
                    LessonId = request.LessonId,
                    Grade1 = request.GradeValue,
                    Comment = request.Comment
                };

                _context.Grades.Add(grade);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка добавления оценки: {ex.Message}");
            }
        }

        [HttpPut("grades/{gradeId}")]
        public async Task<IActionResult> UpdateGrade(int gradeId, [FromBody] GradeRequest request)
        {
            try
            {
                var grade = await _context.Grades.FindAsync(gradeId);
                if (grade == null) return NotFound("Оценка не найдена");

                grade.Grade1 = request.GradeValue;
                grade.Comment = request.Comment;

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка обновления оценки: {ex.Message}");
            }
        }

        [HttpDelete("grades/{gradeId}")]
        public async Task<IActionResult> DeleteGrade(int gradeId)
        {
            try
            {
                var grade = await _context.Grades.FindAsync(gradeId);
                if (grade == null) return NotFound("Оценка не найдена");

                _context.Grades.Remove(grade);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка удаления оценки: {ex.Message}");
            }
        }

        [HttpGet("grade/{userId}")]
        public IActionResult GetGrade(int userId)
        {
            try
            {
                var student = _context.Students
                    .FirstOrDefault(s => s.UserId == userId);

                if (student == null)
                {
                    return NotFound("Студент не найден");
                }

                int studentId = student.Id;

                var grades = _context.Grades
                    .Join(
                        _context.Lessons,
                        grade => grade.LessonId,
                        lesson => lesson.Id,
                        (grade, lesson) => new { Grade = grade, Lesson = lesson }
                    )
                    .Join(
                        _context.Subjects,
                        joined => joined.Lesson.SubjectId,
                        subject => subject.Id,
                        (joined, subject) => new { joined.Grade, joined.Lesson, Subject = subject }
                    )
                    .Where(joined => joined.Grade.StudentId == studentId)
                    .Select(joined => new
                    {
                        joined.Grade.Id,
                        joined.Grade.Grade1,
                        SubjectName = joined.Subject.Name
                    })
                    .ToList();

                return Ok(grades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при загрузке оценок: {ex.Message}");
            }
        }
    }
}
