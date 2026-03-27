using MediatR;
using MenuManagement.Application.Features.LanguageSettings.Commands.UpdateLanguageSetting;
using MenuManagement.Application.Features.LanguageSettings.Queries.GetLanguageSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Admin
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [ApiController]
    [Route("api/admin/language-settings")]
    public class AdminLanguageSettingsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await Mediator.Send(new GetLanguageSettingsQuery()));
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateLanguageSettingCommand command)
        {
            await Mediator.Send(command);
            return NoContent();
        }
    }
}
