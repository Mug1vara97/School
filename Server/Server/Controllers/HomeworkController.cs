using Microsoft.AspNetCore.Mvc;
using School.Controllers;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeworkController : ControllerBase
    {
        private readonly SchoolContext _context;

        public HomeworkController(SchoolContext context)
        {
            _context = context;
        }

        [HttpPost("lessons/{lessonId}/homework")]
        public async Task<IActionResult> AddHomework(int lessonId, [FromBody] HomeworkRequest request)
        {
            try
            {
                var lesson = await _context.Lessons.FindAsync(lessonId);
                if (lesson == null)
                {
                    return NotFound("Урок не найден");
                }

                lesson.Homework = request.Homework;
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка добавления домашнего задания: {ex.Message}");
            }
        }

        [HttpPut("lessons/{lessonId}/homework")]
        public async Task<IActionResult> UpdateHomework(int lessonId, [FromBody] HomeworkRequest request)
        {
            try
            {
                var lesson = await _context.Lessons.FindAsync(lessonId);
                if (lesson == null)
                {
                    return NotFound("Урок не найден");
                }

                lesson.Homework = request.Homework;
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка обновления домашнего задания: {ex.Message}");
            }
        }

        [HttpDelete("lessons/{lessonId}/homework")]
        public async Task<IActionResult> DeleteHomework(int lessonId)
        {
            try
            {
                var lesson = await _context.Lessons.FindAsync(lessonId);
                if (lesson == null)
                {
                    return NotFound("Урок не найден");
                }

                lesson.Homework = null;
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка удаления домашнего задания: {ex.Message}");
            }
        }
    }
}
