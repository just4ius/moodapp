using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models
{
    [Table("mood_entries")]
    public class MoodEntry
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public string MoodLabel { get; set; }

        public string? Note { get; set; }

        public string? GeneratedAdvice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}