using FluentValidation;

namespace MenuManagement.Application.Features.Orders.Commands
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.ObjectId).NotEmpty();
            RuleFor(x => x.TableLabel).NotEmpty().MaximumLength(64);
            RuleFor(x => x.CustomerName).MaximumLength(128);
            RuleFor(x => x.Notes).MaximumLength(500);
            RuleFor(x => x.Items).NotEmpty();

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.MenuItemId).NotEmpty();
                item.RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(20);
                item.RuleFor(x => x.Notes).MaximumLength(500);
            });
        }
    }
}
