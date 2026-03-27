using MenuManagement.Application.Features.Orders.Commands;
using MenuManagement.Application.Features.Orders.Queries;
using Microsoft.AspNetCore.Mvc;

namespace MenuManagement.API.Controllers.Kitchen
{
    [Route("api/kitchen/objects/{objectId:guid}/orders")]
    public class KitchenOrdersController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetQueue(Guid objectId, [FromQuery] bool showCompleted = false)
        {
            return Ok(await Mediator.Send(new GetKitchenOrdersQuery { ObjectId = objectId, ShowCompleted = showCompleted }));
        }

        [HttpGet("{orderId:guid}")]
        public async Task<IActionResult> GetById(Guid objectId, Guid orderId)
        {
            return Ok(await Mediator.Send(new GetKitchenOrderByIdQuery { ObjectId = objectId, OrderId = orderId }));
        }

        [HttpPost("{orderId:guid}/{orderAction}")]
        public async Task<IActionResult> UpdateStatus(Guid objectId, Guid orderId, string orderAction)
        {
            return Ok(await Mediator.Send(new UpdateOrderStatusCommand
            {
                ObjectId = objectId,
                OrderId = orderId,
                Action = orderAction
            }));
        }
    }
}
