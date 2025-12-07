namespace Api.DTOs
{
    public class UpdateUserProfileRequest
    {
        public string? Name { get; set; }
        public string? ProfilePhoto { get; set; }
    }

    public class UserProfileResponse
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string? Name { get; set; }
        public string? ProfilePhoto { get; set; }
    }
}