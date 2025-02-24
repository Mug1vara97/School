using System;
using System.Collections.Generic;

namespace Server.Models;

public partial class Grade
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int LessonId { get; set; }

    public int? Grade1 { get; set; }

    public string? Comment { get; set; }

    public virtual Student Student { get; set; } = null!;
}
