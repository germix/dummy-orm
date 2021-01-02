
export function OrmOnPostInsert()
{
    return function(target, name, descriptor: PropertyDescriptor)
    {
        target.ormOnPostInsert = function()
        {
            descriptor.value();
        }
    }
}
