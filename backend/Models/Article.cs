namespace Backend.Models
{
    public class Article
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public int Threshold { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public List<DepartmentInventory> DepartmentInventories { get; set; } = new();
}
}
