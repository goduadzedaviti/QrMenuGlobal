using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Admin
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [Route("api/admin/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("image")]
        [RequestSizeLimit(30000000)]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            Console.WriteLine($"[Upload] Start: {(file == null ? "NULL" : file.FileName)} size={file?.Length}");
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var webRoot = _environment.WebRootPath;
            var uploadsFolder = Path.Combine(webRoot, "uploads");

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            Console.WriteLine($"[Upload] To: {filePath}");

            try {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                Console.WriteLine($"[Upload] Success: /uploads/{fileName}");
                return Ok(new { imageUrl = $"/uploads/{fileName}" });
            } catch (Exception ex) {
                Console.WriteLine($"[Upload] Error: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }
    }
}
