using System;
using System.Collections.Generic;

namespace Server.Models;

public partial class Assessment
{
    public int Id { get; set; }

    public int ClassId { get; set; }

    public int LessonId { get; set; }

    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    public string Type { get; set; } = null!;

    public string? Topic { get; set; }

    public virtual ICollection<AssessmentGrade> AssessmentGrades { get; set; } = new List<AssessmentGrade>();

    public virtual Class Class { get; set; } = null!;

    public virtual Lesson Lesson { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;

    public virtual User Teacher { get; set; } = null!;
}
