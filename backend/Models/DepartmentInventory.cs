using Backend.Models;

namespace Backend.Models
{
    public class DepartmentInventory
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public Article? Article { get; set; }
        public int DepartmentId { get; set; }
        public Department? Department { get; set; }
        public int Quantity { get; set; }
    }

}