using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpGet("students/search")]
        public IActionResult GetStudentsByAverageGrade(
        [FromQuery] string subject,
        [FromQuery] int minGrade,
        [FromQuery] int maxGrade)
        {
            if (string.IsNullOrEmpty(subject))
                return BadRequest("Subject is required");

            if (minGrade < 0 || maxGrade > 5 || minGrade > maxGrade)
                return BadRequest("Invalid grade range");

            var result = (from grade in _context.Grades
                          join lesson in _context.Lessons on grade.LessonId equals lesson.Id
                          join subjectEntity in _context.Subjects on lesson.SubjectId equals subjectEntity.Id
                          join student in _context.Students on grade.StudentId equals student.Id
                          join user in _context.Users on student.UserId equals user.Id
                          where subjectEntity.Name == subject
                          group grade by new { grade.StudentId, user.FirstName, user.LastName } into g
                          select new
                          {
                              StudentId = g.Key.StudentId,
                              AverageGrade = g.Average(x => x.Grade1),
                              StudentName = $"{g.Key.FirstName} {g.Key.LastName}"
                          })
                          .Where(g => g.AverageGrade >= minGrade && g.AverageGrade <= maxGrade)
                          .ToList();

            return Ok(result);
        }

        [HttpGet("{userId}/subjects")]
        public async Task<IActionResult> GetSubjectsByTeacherId(string userId)
        {
            if (!int.TryParse(userId, out int teacherId))
            {
                return BadRequest("Некорректный ID учителя");
            }

            var teacher = await _context.Users
                .Include(u => u.Subjects)
                .FirstOrDefaultAsync(u => u.Id == teacherId && u.Role == "teacher");

            if (teacher == null)
            {
                return NotFound("Учитель не найден");
            }
            var subjects = teacher.Subjects.Select(s => new { Id = s.Id, Name = s.Name });
            return Ok(subjects);
        }

        [HttpGet("classes")]
        public async Task<ActionResult<IEnumerable<Class>>> GetClassesByTeacherId(int teacherId)
        {
            var classes = await _context.Classes
                .Where(c => c.TeacherId == teacherId)
                .Select(c => new
                {
                    c.Id,
                    c.Name
                })
                .ToListAsync();

            return Ok(classes);
        }

        [HttpGet("grades")]
        public async Task<ActionResult<IEnumerable<object>>> GetGradesBySubjectAndClass(int subjectId, int classId)
        {
            var grades = await _context.Grades
                .Join(
                    _context.Lessons,
                    grade => grade.LessonId,
                    lesson => lesson.Id,
                    (grade, lesson) => new { Grade = grade, Lesson = lesson }
                )
                .Join(
                    _context.Students,
                    joined => joined.Grade.StudentId,
                    student => student.Id,
                    (joined, student) => new { joined.Grade, joined.Lesson, Student = student }
                )
                .Join(
                    _context.Users,
                    joined => joined.Student.UserId,
                    user => user.Id,
                    (joined, user) => new { joined.Grade, joined.Lesson, joined.Student, User = user }
                )
                .Where(joined => joined.Lesson.SubjectId == subjectId && joined.Lesson.ClassId == classId)
                .Select(joined => new
                {
                    joined.Grade.Id,
                    StudentName = $"{joined.User.FirstName} {joined.User.LastName}",
                    GradeValue = joined.Grade.Grade1,
                    joined.Grade.Comment,
                    joined.Lesson.Date,
                    AssessmentGrades = _context.AssessmentGrades
                        .Include(ag => ag.Assessment)
                        .ThenInclude(a => a.Lesson)
                        .Where(ag => ag.StudentId == joined.Student.Id && ag.Assessment.Lesson.SubjectId == subjectId)
                        .Select(ag => new
                        {
                            ag.Id,
                            AssessmentType = ag.Assessment.Type == "independent" ? "Самостоятельная работа" : "Контрольная работа",
                            ag.Assessment.Topic,
                            SubjectName = ag.Assessment.Lesson.Subject.Name,
                            ag.Grade,
                            Date = ag.Assessment.Lesson.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(grades);
        }

        [HttpGet("subject")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjectsByTeacherId(int teacherId)
        {
            var subjects = await _context.Subjects
                .Where(s => s.TeacherId == teacherId)
                .Select(s => new
                {
                    s.Id,
                    s.Name
                })
                .ToListAsync();

            return Ok(subjects);
        }
    }
}
