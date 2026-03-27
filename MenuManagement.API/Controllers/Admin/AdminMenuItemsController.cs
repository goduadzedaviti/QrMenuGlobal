using MenuManagement.Domain;
using MenuManagement.Application.Features.MenuItems.Commands;
using MenuManagement.Application.Features.MenuItems.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Admin
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [Route("api/admin/menu-items")]
    public class AdminMenuItemsController : ApiControllerBase
    {
        [HttpGet("by-menu/{menuId}")]
        public async Task<IActionResult> GetByMenuId(Guid menuId)
        {
            return Ok(await Mediator.Send(new GetMenuItemsByMenuIdQuery
            {
                MenuId = menuId,
                IncludeUnavailable = true
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMenuItemCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateMenuItemCommand command)
        {
            if (id != command.Id) return BadRequest();
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteMenuItemCommand { Id = id }));
        }

        [HttpPut("update-order")]
        public async Task<IActionResult> UpdateOrder(UpdateMenuItemsOrderCommand command)
        {
            return Ok(await Mediator.Send(command));
        }
    }
}
