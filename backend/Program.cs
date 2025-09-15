using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Backend BaseUrl
var backendBaseUrl = "http://localhost:5000";

// Connection string
builder.Configuration["ConnectionStrings:DefaultConnection"] = "Data Source=inventory.db";

// Lägg till DbContext
builder.Services.AddDbContext<InventoryContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Lägg till controllers och konfigurera JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// MIGRATE & SEED
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InventoryContext>();
    db.Database.Migrate();

    // Seed Departments
    var departmentNames = new[] { "Humlan", "Lejonet", "Bävling" };
    foreach (var depName in departmentNames)
    {
        if (!db.Departments.Any(d => d.Name == depName))
        {
            db.Departments.Add(new Department { Name = depName });
        }
    }
    db.SaveChanges();

    // Seed Articles (namn + bild-url)
    var allArticles = new List<(string Name, string Image)>
    {
        ("Munskydd", $"{backendBaseUrl}/images/munskydd.jpg"),
        ("Sax", $"{backendBaseUrl}/images/sax.jpg"),
        ("Plåster", $"{backendBaseUrl}/images/plaster.jpg"),
        ("Handsprit", $"{backendBaseUrl}/images/handsprit.jpg"),
        ("Desinfektionsservett", $"{backendBaseUrl}/images/Des-servett.jpg"),
        ("Sårtejp", $"{backendBaseUrl}/images/sartejp.jpg"),
        ("Bandage", $"{backendBaseUrl}/images/Bandage.jpg"),
        ("Pincett", $"{backendBaseUrl}/images/pincett.jpg"),
        ("Handskar", $"{backendBaseUrl}/images/handskar.jpg")
    };

    foreach (var (name, image) in allArticles)
    {
        var existing = db.Articles.FirstOrDefault(a => a.Name == name);
        if (existing == null)
        {
            // Skapa ny artikel
            db.Articles.Add(new Article
            {
                Name = name,
                Unit = "st",
                Stock = 100,
                ImageUrl = image,
                Threshold = 10,
                IsActive = true
            });
        }
        else
        {
            // Återställ befintlig artikel
            existing.IsActive = true;
            existing.Stock = 100;
            existing.ImageUrl = image;
            existing.Threshold = 10;
            existing.Unit = "st";
        }
    }
    db.SaveChanges();

    // Skapa DepartmentInventory för alla kombinationer (artiklar × avdelningar)
    var articles = db.Articles.Where(a => a.IsActive).ToList();
    var departments = db.Departments.ToList();

    foreach (var a in articles)
    {
        foreach (var d in departments)
        {
            if (!db.DepartmentInventories.Any(di => di.ArticleId == a.Id && di.DepartmentId == d.Id))
            {
                db.DepartmentInventories.Add(new DepartmentInventory
                {
                    ArticleId = a.Id,
                    DepartmentId = d.Id,
                    Quantity = 0
                });
            }
        }
    }
    db.SaveChanges();
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.Run();
