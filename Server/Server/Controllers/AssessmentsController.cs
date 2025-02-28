using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Controllers;
using Server.Models;
using System.Globalization;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AssessmentsController : ControllerBase
    {
        private readonly SchoolContext _context;

        public AssessmentsController(SchoolContext context)
        {
            _context = context;
        }

        [HttpPost("assessments")]
        public async Task<IActionResult> CreateAssessment([FromBody] CreateAssessmentRequest request)
        {
            try
            {
                var lesson = await _context.Lessons
                    .Include(l => l.Class)
                    .Include(l => l.Subject)
                    .Include(l => l.Teacher)
                    .FirstOrDefaultAsync(l => l.Id == request.LessonId);

                if (lesson == null)
                {
                    return NotFound("Урок с указанным LessonId не найден.");
                }

                var assessment = new Assessment
                {
                    ClassId = lesson.ClassId,
                    LessonId = request.LessonId,
                    SubjectId = lesson.SubjectId,
                    TeacherId = lesson.TeacherId,
                    Type = request.Type,
                    Topic = request.Title,
                };

                _context.Assessments.Add(assessment);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    assessment.Id,
                    assessment.LessonId,
                    assessment.Type,
                    assessment.Topic,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при создании задания: {ex.Message}");
            }
        }
        [HttpGet("lessons/{lessonId}/assessments")]
        public IActionResult GetAssessmentsByLesson(int lessonId)
        {
            try
            {
                var assessments = _context.Assessments
                    .Where(a => a.LessonId == lessonId)
                    .Select(a => new
                    {
                        a.Id,
                        a.Type,
                        a.Topic,
                        ClassName = a.Class.Name,
                        SubjectName = a.Subject.Name,
                        TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
                    })
                    .ToList();

                return Ok(assessments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при загрузке заданий: {ex.Message}");
            }
        }
        [HttpGet("assignments")]
        public IActionResult GetAssignments(int teacherId, string startDate, string endDate)
        {
            try
            {
                var startDateTime = DateTime.ParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var endDateTime = startDateTime.AddDays(5);

                var assignments = _context.Assessments
                    .Include(a => a.Lesson)
                    .Include(a => a.Class)
                    .Where(a => a.TeacherId == teacherId &&
                               a.Lesson.Date >= startDateTime &&
                               a.Lesson.Date <= endDateTime)
                    .Select(a => new
                    {
                        a.Id,
                        a.Type,
                        a.Topic,
                        Date = a.Lesson.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                        ClassName = a.Class.Name,
                        SubjectName = a.Lesson.Subject.Name
                    })
                    .ToList();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при загрузке заданий: {ex.Message}");
            }
        }
        [HttpDelete("assignments/{assignmentId}")]
        public async Task<IActionResult> DeleteAssignment(int assignmentId)
        {
            try
            {
                var assignment = await _context.Assessments.FindAsync(assignmentId);
                if (assignment == null)
                {
                    return NotFound("Задание не найдено");
                }

                _context.Assessments.Remove(assignment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при удалении задания: {ex.Message}");
            }
        }
        [HttpPut("assignments/{assignmentId}")]
        public async Task<IActionResult> UpdateAssignment(int assignmentId, [FromBody] UpdateAssignmentRequest request)
        {
            try
            {
                var assignment = await _context.Assessments.FindAsync(assignmentId);
                if (assignment == null)
                {
                    return NotFound("Задание не найдено");
                }

                assignment.Type = request.Type;
                assignment.Topic = request.Topic;

                _context.Assessments.Update(assignment);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при обновлении задания: {ex.Message}");
            }
        }
        [HttpGet("assignments/student/{studentId}")]
        public IActionResult GetAssignmentsByStudent(int studentId)
        {
            try
            {
                var student = _context.Students
                    .Include(s => s.Class)
                    .FirstOrDefault(s => s.Id == studentId);

                if (student == null)
                {
                    return NotFound("Ученик не найден");
                }

                var assignments = _context.Assessments
                    .Include(a => a.Lesson)
                    .Include(a => a.Subject)
                    .Where(a => a.ClassId == student.ClassId)
                    .Select(a => new
                    {
                        a.Id,
                        a.Type,
                        a.Topic,
                        Date = a.Lesson.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                        SubjectName = a.Subject.Name
                    })
                    .ToList();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при загрузке заданий: {ex.Message}");
            }
        }
    }
}
