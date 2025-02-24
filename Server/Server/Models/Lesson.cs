using System;
using System.Collections.Generic;

namespace Server.Models;

public partial class Lesson
{
    public int Id { get; set; }

    public int ClassId { get; set; }

    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    public DateTime Date { get; set; }

    public int Day { get; set; }

    public string? Topic { get; set; }

    public string? Homework { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;

    public virtual User Teacher { get; set; } = null!;
}
