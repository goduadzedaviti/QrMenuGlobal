using MenuManagement.Application.Features.Orders.Commands;
using Microsoft.AspNetCore.Mvc;

namespace MenuManagement.API.Controllers.Kitchen
{
    [Route("api/kitchen/devices")]
    public class KitchenDevicesController : ApiControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterKitchenDeviceCommand command)
        {
            Console.WriteLine($"[DEBUG] Kitchen Device Registration Attempt: ObjectId={command.ObjectId}, DeviceId={command.DeviceId}, Platform={command.Platform}");
            try 
            {
                var result = await Mediator.Send(command);
                Console.WriteLine($"[DEBUG] Registration Result: Succeeded={result.Succeeded}, Errors={(result.Errors != null ? string.Join(", ", result.Errors) : "none")}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG] Registration Exception: {ex.Message}");
                throw;
            }
        }
    }
}
