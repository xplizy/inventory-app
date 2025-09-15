namespace Backend.Models
{
    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;

        public List<DepartmentInventory> DepartmentInventories { get; set; } = new();
    }
}
