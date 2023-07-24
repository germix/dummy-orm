import { OrmEntityInterface } from "./OrmEntityInterface";

export function OrmOnPreInsert()
{
    return function(target, name: string, descriptor: PropertyDescriptor)
    {
        (target as OrmEntityInterface).ormOnPreInsert = function()
        {
            descriptor.value();
        }
    }
}
