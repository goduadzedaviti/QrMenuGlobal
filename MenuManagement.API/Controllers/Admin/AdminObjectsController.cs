using MenuManagement.Domain;
using MenuManagement.Application.Features.Objects.Commands;
using MenuManagement.Application.Features.Objects.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MenuManagement.API.Controllers.Admin
{
    [Authorize(Roles = "Admin,SystemAdmin")]
    [Route("api/admin/objects")]
    public class AdminObjectsController : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetObjectsPagedQuery query)
        {
            return Ok(await Mediator.Send(query));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await Mediator.Send(new GetObjectByIdQuery { Id = id });
            if (!result.Succeeded) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateObjectCommand command)
        {
            return Ok(await Mediator.Send(command));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateObjectCommand command)
        {
            if (id != command.Id) return BadRequest();
            return Ok(await Mediator.Send(command));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            return Ok(await Mediator.Send(new DeleteObjectCommand { Id = id }));
        }
    }
}
