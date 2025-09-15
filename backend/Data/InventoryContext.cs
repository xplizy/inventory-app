using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class InventoryContext : DbContext
    {
        public InventoryContext(DbContextOptions<InventoryContext> opts) : base(opts) { }

        public DbSet<Article> Articles { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<DepartmentInventory> DepartmentInventories { get; set; } = null!;
    }
}