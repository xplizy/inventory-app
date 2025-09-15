using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Dtos;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly InventoryContext _db;
        public ArticlesController(InventoryContext db) => _db = db;

// GET /api/articles
[HttpGet]
public async Task<IActionResult> GetAll()
{
    var list = await _db.Articles
        .Where(a => a.IsActive)  // Endast aktiva artiklar
        .Include(a => a.DepartmentInventories)
            .ThenInclude(di => di.Department)
        .Select(a => new
        {
            a.Id,
            a.Name,
            a.Unit,
            a.Stock,
            a.ImageUrl,
            a.Threshold,
            a.IsActive,
            DepartmentInventories = a.DepartmentInventories.Select(di => new
            {
                di.DepartmentId,
                DepartmentName = di.Department.Name,
                di.Quantity
            })
        })
        .ToListAsync();

    return Ok(list);
}

        // GET /api/articles/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var a = await _db.Articles
                .Include(a => a.DepartmentInventories)
                    .ThenInclude(di => di.Department)
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Unit,
                    a.Stock,
                    a.ImageUrl,
                    a.Threshold,
                    DepartmentInventories = a.DepartmentInventories.Select(di => new {
                        di.DepartmentId,
                        DepartmentName = di.Department.Name,
                        di.Quantity
                    })
                })
                .FirstOrDefaultAsync();

            if (a == null) return NotFound();
            return Ok(a);
        }

        // POST /api/articles
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateArticleDto createDto)
        {
            if (createDto == null) return BadRequest("Payload required");

            var imageUrl = string.IsNullOrEmpty(createDto.ImageUrl)
                ? "http://localhost:5000/images/bildsaknas.png"
                : createDto.ImageUrl;

            var article = new Article
            {
                Name = createDto.Name,
                Unit = createDto.Unit,
                Stock = createDto.Stock,
                ImageUrl = imageUrl,
                Threshold = createDto.Threshold
            };

            _db.Articles.Add(article);
            await _db.SaveChangesAsync();

            // Lägg till DepartmentInventory för alla avdelningar
            var departments = await _db.Departments.ToListAsync();
            foreach (var d in departments)
            {
                _db.DepartmentInventories.Add(new DepartmentInventory
                {
                    ArticleId = article.Id,
                    DepartmentId = d.Id,
                    Quantity = 0
                });
            }
            await _db.SaveChangesAsync();

            // Hämta tillbaka artikeln med DepartmentInventories
            var created = await _db.Articles
                .Include(a => a.DepartmentInventories).ThenInclude(di => di.Department)
                .Where(a => a.Id == article.Id)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Unit,
                    a.Stock,
                    a.ImageUrl,
                    a.Threshold,
                    DepartmentInventories = a.DepartmentInventories.Select(di => new {
                        di.DepartmentId,
                        DepartmentName = di.Department.Name,
                        di.Quantity
                    })
                })
                .FirstAsync();

            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        // PUT /api/articles/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateArticleDto updateDto)
        {
            var article = await _db.Articles.FindAsync(id);
            if (article == null) return NotFound();

            article.Name = updateDto.Name ?? article.Name;
            article.Unit = updateDto.Unit ?? article.Unit;
            article.Stock = updateDto.Stock > 0 ? updateDto.Stock : article.Stock;
            article.ImageUrl = string.IsNullOrEmpty(updateDto.ImageUrl)
                ? article.ImageUrl
                : updateDto.ImageUrl;
            article.Threshold = updateDto.Threshold;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DTOs för orders
        public class OrderItem { public int DepartmentId { get; set; } public int Quantity { get; set; } }
        public class MultiOrder { public List<OrderItem> Orders { get; set; } = new(); }

        // POST /api/articles/{id}/orders
        [HttpPost("{id}/orders")]
        public async Task<IActionResult> OrderMultiple(int id, [FromBody] MultiOrder payload)
        {
            if (payload?.Orders == null || !payload.Orders.Any())
                return BadRequest("No orders provided");

            var article = await _db.Articles.FindAsync(id);
            if (article == null) return NotFound();

            var total = payload.Orders.Sum(o => o.Quantity);
            if (total <= 0) return BadRequest("Total quantity must be > 0");
            if (article.Stock < total) return BadRequest("Not enough stock");

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                article.Stock -= total;

                foreach (var o in payload.Orders)
                {
                    var di = await _db.DepartmentInventories
                        .FirstOrDefaultAsync(x => x.ArticleId == id && x.DepartmentId == o.DepartmentId);

                    if (di == null)
                    {
                        di = new DepartmentInventory
                        {
                            ArticleId = id,
                            DepartmentId = o.DepartmentId,
                            Quantity = o.Quantity
                        };
                        _db.DepartmentInventories.Add(di);
                    }
                    else
                    {
                        di.Quantity += o.Quantity;
                    }
                }

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                var updatedArticle = await _db.Articles
                    .Include(a => a.DepartmentInventories).ThenInclude(di => di.Department)
                    .Where(a => a.Id == id)
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        a.Unit,
                        a.Stock,
                        a.ImageUrl,
                        a.Threshold,
                        DepartmentInventories = a.DepartmentInventories.Select(di => new {
                            di.DepartmentId,
                            DepartmentName = di.Department.Name,
                            di.Quantity
                        })
                    })
                    .FirstAsync();

                return Ok(updatedArticle);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // DTO för restock
        public class RestockDto { public int Quantity { get; set; } }

        // POST /api/articles/{id}/restock
        [HttpPost("{id}/restock")]
        public async Task<IActionResult> Restock(int id, [FromBody] RestockDto payload)
        {
            var article = await _db.Articles.FindAsync(id);
            if (article == null) return NotFound();
            if (payload.Quantity <= 0) return BadRequest("Quantity must be > 0");

            article.Stock += payload.Quantity;
            await _db.SaveChangesAsync();
            return Ok(article);
        }

        // GET /api/departments
        [HttpGet("/api/departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var deps = await _db.Departments
                .Include(d => d.DepartmentInventories)
                .ThenInclude(di => di.Article)
                .Select(d => new {
                    d.Id,
                    d.Name,
                    Articles = d.DepartmentInventories.Select(di => new {
                        di.ArticleId,
                        di.Article.Name,
                        di.Article.Unit,
                        di.Article.ImageUrl,
                        di.Quantity
                    })
                })
                .ToListAsync();

            return Ok(deps);
        }

// DELETE /api/articles/{id} (soft-delete)
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    var article = await _db.Articles.FindAsync(id);
    if (article == null) return NotFound();

    article.IsActive = false; // Soft delete
    await _db.SaveChangesAsync();

    return NoContent();
}


        // DTO för använd artikel
        public class UseArticleDto { public int Quantity { get; set; } }

        // PUT /api/departments/{departmentId}/articles/{articleId}/use
        [HttpPut("/api/departments/{departmentId}/articles/{articleId}/use")]
        public async Task<IActionResult> UseArticle(int departmentId, int articleId, [FromBody] UseArticleDto payload)
        {
            if (payload.Quantity <= 0)
                return BadRequest("Quantity must be > 0");

            var depInv = await _db.DepartmentInventories
                .FirstOrDefaultAsync(di => di.DepartmentId == departmentId && di.ArticleId == articleId);

            if (depInv == null) return NotFound("Produkten finns inte på avdelningen.");

            if (depInv.Quantity < payload.Quantity)
                return BadRequest("Det finns inte tillräckligt många i lagret på avdelningen.");

            depInv.Quantity -= payload.Quantity;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                depInv.ArticleId,
                depInv.DepartmentId,
                depInv.Quantity
            });
        }
    }
}
