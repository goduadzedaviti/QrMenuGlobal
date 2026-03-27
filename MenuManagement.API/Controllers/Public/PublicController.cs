using MenuManagement.Application.Features.MenuItems.Queries;
using MenuManagement.Application.Features.Menus.Queries;
using MenuManagement.Application.Features.Orders.Commands;
using MenuManagement.Domain;
using MenuManagement.Application.Features.Objects.Queries;
using MenuManagement.Application.Features.LanguageSettings.Queries.GetActiveLanguages;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Public
{
    [Route("api/public")]
    public class PublicController : ApiControllerBase
    {
        [HttpGet("objects")]
        public async Task<IActionResult> GetObjects([FromQuery] GetObjectsPagedQuery query)
        {
            return Ok(await Mediator.Send(query));
        }

        [HttpGet("objects/{id}")]
        public async Task<IActionResult> GetObjectById(Guid id)
        {
            return Ok(await Mediator.Send(new GetObjectByIdQuery { Id = id }));
        }

        [HttpGet("objects/{objectId}/menus")]
        public async Task<IActionResult> GetMenusByObjectId(Guid objectId)
        {
            return Ok(await Mediator.Send(new GetMenusByObjectIdQuery { ObjectId = objectId }));
        }

        [HttpGet("menus/{menuId}/items")]
        public async Task<IActionResult> GetItemsByMenuId(Guid menuId)
        {
            return Ok(await Mediator.Send(new GetMenuItemsByMenuIdQuery { MenuId = menuId }));
        }

        [HttpPost("objects/{objectId}/orders")]
        public async Task<IActionResult> CreateOrder(Guid objectId, [FromBody] CreateOrderCommand command)
        {
            command.ObjectId = objectId;
            return Ok(await Mediator.Send(command));
        }

        [HttpPost("objects/{objectId}/waiter")]
        public async Task<IActionResult> CallWaiter(Guid objectId, [FromBody] CallWaiterCommand command)
        {
            command.ObjectId = objectId;
            return Ok(await Mediator.Send(command));
        }

        [HttpGet("languages")]
        public async Task<IActionResult> GetActiveLanguages()
        {
            return Ok(await Mediator.Send(new GetActiveLanguagesQuery()));
        }
    }
}
