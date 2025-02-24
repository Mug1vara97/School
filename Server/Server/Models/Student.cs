using System;
using System.Collections.Generic;

namespace Server.Models;

public partial class Student
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? ParentId { get; set; }

    public int? ClassId { get; set; }

    public virtual Class? Class { get; set; }

    public virtual ICollection<Grade> Grades { get; set; } = new List<Grade>();

    public virtual User? Parent { get; set; }

    public virtual User User { get; set; } = null!;
}
