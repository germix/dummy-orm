
export function OrmOnPreInsert()
{
    return function(target, name, descriptor: PropertyDescriptor)
    {
        target.ormOnPreInsert = function()
        {
            descriptor.value();
        }
    }
}
