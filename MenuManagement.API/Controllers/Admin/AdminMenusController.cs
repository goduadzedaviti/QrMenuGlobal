using MenuManagement.Domain;
using MenuManagement.Application.Features.Menus.Commands;
using MenuManagement.Application.Features.Menus.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Admin
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [Route("api/admin/menus")]
    public class AdminMenusController : ApiControllerBase
    {
        [HttpGet("by-object/{objectId}")]
        public async Task<IActionResult> GetByObjectId(Guid objectId)
        {
            return Ok(await Mediator.Send(new GetMenusByObjectIdQuery { ObjectId = objectId }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await Mediator.Send(new GetMenuByIdQuery { Id = id });
            if (!result.Succeeded) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMenuCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateMenuCommand command)
        {
            if (id != command.Id) return BadRequest();
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteMenuCommand { Id = id }));
        }

        [HttpPut("update-order")]
        public async Task<IActionResult> UpdateOrder(UpdateMenusOrderCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
