using FluentValidation;

namespace MenuManagement.Application.Features.MenuItems.Commands
{
    public class CreateMenuItemCommandValidator : AbstractValidator<CreateMenuItemCommand>
    {
        public CreateMenuItemCommandValidator()
        {
            RuleFor(v => v.Name)
                .MaximumLength(200)
                .NotEmpty();

            RuleFor(v => v.MenuId)
                .NotEmpty();

            RuleFor(v => v.Price)
                .GreaterThanOrEqualTo(0);
        }
    }
}
