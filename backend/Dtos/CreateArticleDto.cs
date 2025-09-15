namespace Backend.Dtos
{
    public class CreateArticleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string? ImageUrl { get; set; }
        public int Threshold { get; set; } = 10;
    }
}
