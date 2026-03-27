using MenuManagement.Domain;
using MenuManagement.Application.Features.Auth.Commands;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers
{
    public class AuthController : ApiControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Succeeded) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command)
        {
            var result = await Mediator.Send(command);
            if (!result.Succeeded) return BadRequest(result);
            return Ok(result);
        }
    }
}
