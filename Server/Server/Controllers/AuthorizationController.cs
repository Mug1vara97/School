using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using System.Globalization;

namespace School.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthorizationController : ControllerBase
    {
        private readonly SchoolContext _context;

        public AuthorizationController(SchoolContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Login == request.Login && u.Password == request.Password);

            if (user == null)
            {
                return Unauthorized("Invalid login or password");
            }

            return Ok(new { Role = user.Role, UserId = user.Id });
        }

        [HttpGet("teachers")]
        public IActionResult GetTeachers()
        {
            var teachers = _context.Users
                .Where(u => u.Role == "teacher")
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Login
                })
                .ToList();

            return Ok(teachers);
        }

        [HttpGet("students")]
        public IActionResult GetStudents()
        {
            var students = _context.Users
                .Where(u => u.Role == "student")
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Login
                })
                .ToList();

            return Ok(students);
        }

        [HttpGet("classes")]
        public IActionResult GetClasses()
        {
            var classes = _context.Classes
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    TeacherName = c.Teacher != null ? $"{c.Teacher.FirstName} {c.Teacher.LastName}" : "Не назначен"
                })
                .ToList();

            return Ok(classes);
        }

        [HttpGet("teacher/{teacherId}")]
        public IActionResult GetClassesByTeacher(int teacherId)
        {
            var classes = _context.Classes
                .Where(c => c.TeacherId == teacherId)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    TeacherName = c.Teacher != null ? $"{c.Teacher.FirstName} {c.Teacher.LastName}" : "Не назначен"
                })
                .ToList();

            return Ok(classes);
        }
        [HttpPost("schedule")]
        public async Task<IActionResult> SaveSchedule([FromBody] List<LessonDto> lessons)
        {
            try
            {
                var newLessons = lessons.Select(l => new Lesson
                {
                    ClassId = l.ClassId,
                    SubjectId = l.SubjectId,
                    TeacherId = l.TeacherId,
                    Date = DateTime.ParseExact(l.Date, "yyyy-MM-dd H:mm", CultureInfo.InvariantCulture),
                    Day = l.Day,
                    Topic = l.Topic
                });

                await _context.Lessons.AddRangeAsync(newLessons);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка сохранения: {ex.Message}");
            }
        }

        [HttpGet("subjects")]
        public IActionResult GetSubjects()
        {
            var subjects = _context.Subjects
                .Select(s => new
                {
                    s.Id,
                    s.Name
                })
                .ToList();

            return Ok(subjects);
        }
        [HttpGet("schedule")]
        public IActionResult GetSchedule(int classId, string startDate)
        {
            try
            {
                var startDateTime = DateTime.ParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var endDateTime = startDateTime.AddDays(4);

                var schedule = _context.Lessons
                    .Where(l => l.ClassId == classId && l.Date >= startDateTime && l.Date < endDateTime)
                    .Select(l => new
                    {
                        Id = l.Id,
                        SubjectId = l.SubjectId,
                        TeacherId = l.TeacherId,
                        Date = l.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                        Topic = l.Topic,
                        l.Day,
                        SubjectName = l.Subject.Name,
                        TeacherName = l.Teacher.FirstName + " " + l.Teacher.LastName,
                    })
                    .ToList();

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки расписания: {ex.Message}");
            }
        }

        [HttpGet("students/{studentId}")]
        public IActionResult GetStudent(int studentId)
        {
            try
            {
                var student = _context.Students
                    .Include(s => s.Class)
                    .FirstOrDefault(s => s.UserId == studentId);

                if (student == null)
                {
                    return NotFound("Студент не найден");
                }

                return Ok(new
                {
                    student.Id,
                    student.UserId,
                    student.ClassId,
                    ClassName = student.Class?.Name
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки данных студента: {ex.Message}");
            }
        }

    }

    public class LessonDto
    {
        public int ClassId { get; set; }
        public int SubjectId { get; set; }
        public int TeacherId { get; set; }
        public string Date { get; set; }
        public int Day { get; set; }
        public string Topic { get; set; }
    }
    public class LoginRequest
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }
}
