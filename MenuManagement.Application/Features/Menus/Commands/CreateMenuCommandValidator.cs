using FluentValidation;

namespace MenuManagement.Application.Features.Menus.Commands
{
    public class CreateMenuCommandValidator : AbstractValidator<CreateMenuCommand>
    {
        public CreateMenuCommandValidator()
        {
            RuleFor(v => v.Name)
                .MaximumLength(200)
                .NotEmpty();

            RuleFor(v => v.ObjectId)
                .NotEmpty();
        }
    }
}
