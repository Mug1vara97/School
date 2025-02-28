using System;
using System.Collections.Generic;

namespace Server.Models;

public partial class AssessmentGrade
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int AssessmentId { get; set; }

    public int? Grade { get; set; }

    public virtual Assessment Assessment { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
