using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Controllers;
using Server.Models;
using System.Globalization;

namespace Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly SchoolContext _context;

        public ScheduleController(SchoolContext context)
        {
            _context = context;
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

        [HttpGet("schedule")]
        public IActionResult GetSchedule(int classId, string startDate)
        {
            try
            {
                var startDateTime = DateTime.ParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var endDateTime = startDateTime.AddDays(5);

                var schedule = _context.Lessons
                   .Where(l => l.ClassId == classId && l.Date >= startDateTime && l.Date <= endDateTime)
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
                        Homework = l.Homework
                    })
                    .ToList();

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки расписания: {ex.Message}");
            }
        }

        [HttpGet("schedules")]
        public IActionResult GetSchedule(int classId, string startDate, int? userId = null)
        {
            try
            {
                var startDateTime = DateTime.ParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var endDateTime = startDateTime.AddDays(5);

                var schedule = _context.Lessons
                    .Where(l => l.ClassId == classId && l.Date >= startDateTime && l.Date <= endDateTime)
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
                        Homework = l.Homework,
                        Grade = userId.HasValue
                            ? _context.Grades
                                .Include(g => g.Student)
                                .Where(g => g.LessonId == l.Id && g.Student.UserId == userId)
                                .Select(g => new
                                {
                                    Grade1 = g.Grade1,
                                    g.Comment
                                })
                                .FirstOrDefault()
                            : null
                    })
                    .ToList();

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки расписания: {ex.Message}");
            }
        }

        [HttpGet("schedulet")]
        public IActionResult GetScheduleByTeacher(int teacherId, string startDate, string endDate)
        {
            try
            {
                var startDateTime = DateTime.ParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var endDateTime = startDateTime.AddDays(5);

                var schedule = _context.Lessons
                    .Where(l => l.TeacherId == teacherId && l.Date >= startDateTime && l.Date <= endDateTime)
                    .Select(l => new
                    {
                        Id = l.Id,
                        ClassId = l.ClassId,
                        SubjectId = l.SubjectId,
                        TeacherId = l.TeacherId,
                        Date = l.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                        Topic = l.Topic,
                        l.Day,
                        SubjectName = l.Subject.Name,
                        ClassName = l.Class.Name,
                        Homework = l.Homework
                    })
                    .ToList();

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка загрузки расписания: {ex.Message}");
            }
        }
    }
}
