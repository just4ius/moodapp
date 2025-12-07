namespace Api.DTOs
{
    public class AdviceRequest
    {
        public int UserId { get; set; }
        public string CurrentMood { get; set; }
        public string? Note { get; set; }
    }
}