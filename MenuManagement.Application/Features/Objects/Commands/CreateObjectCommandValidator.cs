using FluentValidation;

namespace MenuManagement.Application.Features.Objects.Commands
{
    public class CreateObjectCommandValidator : AbstractValidator<CreateObjectCommand>
    {
        public CreateObjectCommandValidator()
        {
            RuleFor(v => v.Name)
                .MaximumLength(200)
                .NotEmpty();

            RuleFor(v => v.Address)
                .MaximumLength(500);

            RuleFor(v => v.Phone)
                .MaximumLength(20);
        }
    }
}
