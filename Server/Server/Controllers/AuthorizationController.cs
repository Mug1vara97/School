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
       

        [HttpGet("classes/{classId}/students")]
        public IActionResult GetClassStudents(int classId)
        {
            try
            {
                var students = _context.Students
                    .Include(s => s.User)
                    .Where(s => s.ClassId == classId)
                    .Select(s => new
                    {
                        s.Id,
                        s.UserId,
                        StudentName = $"{s.User.FirstName} {s.User.LastName}"
                    })
                    .ToList();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки студентов: {ex.Message}");
            }
        }

       

        [HttpPut("students/{studentId}/class")]
        public async Task<IActionResult> AddStudentToClass(int studentId, [FromBody] AddStudentToClassRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(studentId);
                if (user == null || user.Role != "student")
                {
                    return NotFound("Ученик не найден");
                }

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.UserId == studentId);

                if (student == null)
                {
                    student = new Student
                    {
                        UserId = studentId,
                        ClassId = request.ClassId
                    };
                    _context.Students.Add(student);
                }
                else
                {
                    student.ClassId = request.ClassId;
                    _context.Students.Update(student);
                }

                await _context.SaveChangesAsync();

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
                return StatusCode(500, $"Ошибка при добавлении ученика в класс: {ex.Message}");
            }
        }

        
        [HttpGet("studentId/{userId}")]
        public IActionResult GetStudentIdByUserId(int userId)
        {
            try
            {
                var student = _context.Students
                    .FirstOrDefault(s => s.UserId == userId);

                if (student == null)
                {
                    return NotFound("Студент не найден");
                }

                return Ok(student.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при получении studentId: {ex.Message}");
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

    public class TeacherRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Login { get; set; }
    }

    public class StudentRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Login { get; set; }
    }
    public class ClassRequest
    {
        public string Name { get; set; }
        public int? TeacherId { get; set; }
    }
    public class HomeworkRequest
    {
        public string Homework { get; set; }
    }

    public class GradeRequest
    {
        public int StudentId { get; set; }
        public int LessonId { get; set; }
        public int GradeValue { get; set; }
        public string Comment { get; set; }
    }
    public class AddStudentToClassRequest
    {
        public int ClassId { get; set; }
    }
    public class CreateAssessmentRequest
    {
        public int LessonId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
    }
    public class UpdateAssignmentRequest
    {
        public string Type { get; set; }
        public string Topic { get; set; }
    }
}
