using Microsoft.EntityFrameworkCore;
using MenuManagement.Domain.Entities;
using System.Linq;
using System.Threading.Tasks;

namespace MenuManagement.Persistence.Seed
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(MenuManagementDbContext context, bool includeSampleData = true)
        {
            if (!context.Users.Any())
            {
                var admin = new UserEntity
                {
                    Username = "admin",
                    PasswordHash = "admin123",
                    Role = "SystemAdmin",
                    IsActive = true
                };

                context.Users.Add(admin);
            }
            else
            {
                var existingAdmin = context.Users.FirstOrDefault(u => u.Username == "admin");
                if (existingAdmin != null && existingAdmin.Role == "Admin")
                {
                    existingAdmin.Role = "SystemAdmin";
                    await context.SaveChangesAsync();
                }

                if (existingAdmin != null)
                {
                    var orphanedObjects = await context.Objects
                        .Where(o => o.UserId == null)
                        .ToListAsync();
                    
                    if (orphanedObjects.Any())
                    {
                        foreach (var obj in orphanedObjects)
                        {
                            obj.UserId = existingAdmin.Id;
                        }
                        await context.SaveChangesAsync();
                    }
                }
            }

            // Migration transition: Ensure all existing users are Active
            var inactiveUsers = await context.Users.Where(u => !u.IsActive).ToListAsync();
            if (inactiveUsers.Any())
            {
                foreach (var user in inactiveUsers)
                {
                    user.IsActive = true;
                }
                await context.SaveChangesAsync();
            }

            if (includeSampleData && !context.Objects.Any())
            {
                var obj1 = new ObjectEntity
                {
                    Name = "Sample Restaurant 1",
                    NameEn = "Sample Restaurant 1",
                    NameRu = "Пример ресторана 1",
                    Description = "Modern Italian Cuisine",
                    DescriptionEn = "Modern Italian cuisine",
                    DescriptionRu = "Современная итальянская кухня",
                    Address = "123 Pasta St",
                    AddressEn = "123 Pasta St",
                    AddressRu = "123 Pasta St",
                    Phone = "555-0101",
                    ImageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                };

                var obj2 = new ObjectEntity
                {
                    Name = "Sample Cafe 2",
                    NameEn = "Sample Cafe 2",
                    NameRu = "Пример кафе 2",
                    Description = "Artisan Coffee & Bakery",
                    DescriptionEn = "Artisan coffee and bakery",
                    DescriptionRu = "Авторский кофе и выпечка",
                    Address = "456 Bean Blvd",
                    AddressEn = "456 Bean Blvd",
                    AddressRu = "456 Bean Blvd",
                    Phone = "555-0202",
                    ImageUrl = "https://images.unsplash.com/photo-1554118811-1e0d58224f24"
                };

                context.Objects.AddRange(obj1, obj2);

                var menu1 = new MenuEntity
                {
                    ObjectId = obj1.Id,
                    Name = "Lunch Menu",
                    NameEn = "Lunch Menu",
                    NameRu = "Обеденное меню",
                    Description = "Available 11 AM - 4 PM",
                    DescriptionEn = "Available 11 AM - 4 PM",
                    DescriptionRu = "Доступно с 11:00 до 16:00",
                    SortOrder = 1
                };

                var menu2 = new MenuEntity
                {
                    ObjectId = obj1.Id,
                    Name = "Dinner Menu",
                    NameEn = "Dinner Menu",
                    NameRu = "Ужинное меню",
                    Description = "Available 5 PM - 10 PM",
                    DescriptionEn = "Available 5 PM - 10 PM",
                    DescriptionRu = "Доступно с 17:00 до 22:00",
                    SortOrder = 2
                };

                context.Menus.AddRange(menu1, menu2);

                var item1 = new MenuItemEntity
                {
                    MenuId = menu1.Id,
                    Name = "Carbonara",
                    NameEn = "Carbonara",
                    NameRu = "Карбонара",
                    Description = "Classic pasta with egg, cheese, and guanciale",
                    DescriptionEn = "Classic pasta with egg, cheese, and guanciale",
                    DescriptionRu = "Классическая паста с яйцом, сыром и гуанчале",
                    Price = 14.99m,
                    SortOrder = 1
                };

                var item2 = new MenuItemEntity
                {
                    MenuId = menu1.Id,
                    Name = "Margherita Pizza",
                    NameEn = "Margherita Pizza",
                    NameRu = "Пицца Маргарита",
                    Description = "Tomato, mozzarella, and basil",
                    DescriptionEn = "Tomato, mozzarella, and basil",
                    DescriptionRu = "Томат, моцарелла и базилик",
                    Price = 12.99m,
                    SortOrder = 2
                };

                context.MenuItems.AddRange(item1, item2);
            }

            if (!context.LanguageSettings.Any())
            {
                context.LanguageSettings.AddRange(
                    new LanguageSetting { Code = "ka", Name = "Georgian", IsActive = true },
                    new LanguageSetting { Code = "en", Name = "English", IsActive = true },
                    new LanguageSetting { Code = "ru", Name = "Russian", IsActive = true }
                );
            }

            await context.SaveChangesAsync();
        }
    }
}
