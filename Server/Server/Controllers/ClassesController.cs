using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Controllers;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly SchoolContext _context;

        public ClassesController(SchoolContext context)
        {
            _context = context;
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _context.Classes
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    TeacherName = c.Teacher != null ? $"{c.Teacher.FirstName} {c.Teacher.LastName}" : "Не назначен"
                })
                .ToListAsync();

            return Ok(classes);
        }

        [HttpPost("classes")]
        public async Task<IActionResult> AddClass([FromBody] ClassRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Название класса не может быть пустым.");
            }

            var classItem = new Class
            {
                Name = request.Name,
                TeacherId = request.TeacherId
            };

            _context.Classes.Add(classItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClasses), new { id = classItem.Id }, classItem);
        }

        [HttpPut("classes/{id}")]
        public async Task<IActionResult> UpdateClass(int id, [FromBody] ClassRequest request)
        {
            var classItem = await _context.Classes.FindAsync(id);

            if (classItem == null)
            {
                return NotFound("Класс не найден.");
            }

            classItem.Name = request.Name;
            classItem.TeacherId = request.TeacherId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("classes/{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            var classItem = await _context.Classes.FindAsync(id);

            if (classItem == null)
            {
                return NotFound("Класс не найден.");
            }

            _context.Classes.Remove(classItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
