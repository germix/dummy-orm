import { OrmEntityInterface } from "./OrmEntityInterface";

export function OrmOnPostInsert()
{
    return function(target, name: string, descriptor: PropertyDescriptor)
    {
        (target as OrmEntityInterface).ormOnPostInsert = function()
        {
            descriptor.value();
        }
    }
}
