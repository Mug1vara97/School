using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Controllers;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly SchoolContext _context;

        public StudentsController(SchoolContext context)
        {
            _context = context;
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

        [HttpPost("students")]
        public async Task<IActionResult> AddStudent([FromBody] StudentRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(request.Login))
            {
                return BadRequest("Неверные данные ученика");
            }

            var student = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Login = request.Login,
                Password = "123",
                Role = "student"
            };

            _context.Users.Add(student);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("students/{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] StudentRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(request.Login))
            {
                return BadRequest("Неверные данные ученика");
            }

            var student = await _context.Users.FindAsync(id);
            if (student == null || student.Role != "student")
            {
                return NotFound("Ученик не найден");
            }

            student.FirstName = request.FirstName;
            student.LastName = request.LastName;
            student.Login = request.Login;

            _context.Users.Update(student);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("students/{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Users.FindAsync(id);
            if (student == null || student.Role != "student")
            {
                return NotFound("Ученик не найден");
            }

            _context.Users.Remove(student);
            await _context.SaveChangesAsync();
            return NoContent();
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
}
