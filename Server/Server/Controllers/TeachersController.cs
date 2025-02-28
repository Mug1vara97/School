using Microsoft.AspNetCore.Mvc;
using School.Controllers;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly SchoolContext _context;

        public TeachersController(SchoolContext context)
        {
            _context = context;
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

        [HttpPost("teachers")]
        public async Task<IActionResult> AddTeacher([FromBody] TeacherRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(request.Login))
            {
                return BadRequest("Неверные данные учителя");
            }

            var teacher = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Login = request.Login,
                Password = "123",
                Role = "teacher"
            };

            _context.Users.Add(teacher);
            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpPut("teachers/{id}")]
        public async Task<IActionResult> UpdateTeacher(int id, [FromBody] TeacherRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(request.Login))
            {
                return BadRequest("Неверные данные учителя");
            }

            var teacher = await _context.Users.FindAsync(id);
            if (teacher == null || teacher.Role != "teacher")
            {
                return NotFound("Учитель не найден");
            }

            teacher.FirstName = request.FirstName;
            teacher.LastName = request.LastName;
            teacher.Login = request.Login;

            _context.Users.Update(teacher);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("teachers/{id}")]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            var teacher = await _context.Users.FindAsync(id);
            if (teacher == null || teacher.Role != "teacher")
            {
                return NotFound("Учитель не найден");
            }

            _context.Users.Remove(teacher);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
