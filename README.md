# 🏥 VGR Medical Inventory

Ett webb-baserat inventeringssystem för att hantera medicinska produkter på olika avdelningar inom vården.  
Byggt med **ASP.NET Core (backend)** och **React (frontend)**.

---

## 🚀 Funktioner

- Hantera produkter (lägga till, redigera, ta bort via soft-delete).
- Koppla produkter till olika avdelningar.
- Använd produkter från avdelningar (minskar lagersaldo).
- Admin-sida för produktadministration.
- Avdelningssida där personal kan se och använda tilldelade produkter.

---

## 📂 Projektstruktur

```bash
medical-inventory/
│── backend/        # ASP.NET Core API (C#/.NET 8)
│── frontend/       # React-app (Vite/CRA)
│── README.md       # Dokumentation

---

🛠️ Installation
1. Klona projektet
git clone https://github.com/xplizy/inventory-app.git
cd inventory-app

2. Backend (ASP.NET Core)

Gå till backend-mappen:

cd backend


Installera beroenden (paket återställs automatiskt via .NET):

dotnet restore


Kör migreringar och skapa databasen:

dotnet ef database update


Starta API:t:

dotnet run


API:t körs som standard på:
👉 http://localhost:5000

3. Frontend (React)

Gå till frontend-mappen:

cd frontend


Installera beroenden:

npm install


Starta utvecklingsservern:

npm run dev


Frontend körs som standard på:
👉 http://localhost:5173

⚙️ Konfiguration

Connection string för databasen kan ändras i backend/appsettings.json.

API-URL för frontend (om annan port används) kan ändras i frontend/src/config.js.

✅ Antaganden

Projektet används lokalt för utveckling och demo.

Admin kan lägga till/ta bort produkter men "borttagning" är en soft-delete (produkten finns kvar i databasen men är inaktiv).

Databasfilen inventory.db används som SQLite och genereras lokalt via EF Core migrationer.

bin/, obj/ och node_modules/ exkluderas i .gitignore eftersom de genereras automatiskt.

👨‍💻 Utvecklare

Projektägare: xplizy

Teknikstack: .NET 8, Entity Framework Core, React, Axios
