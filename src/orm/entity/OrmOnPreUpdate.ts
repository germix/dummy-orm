import { OrmEntityInterface } from "./OrmEntityInterface";

export function OrmOnPreUpdate()
{
    return function(target, name: string, descriptor: PropertyDescriptor)
    {
        (target as OrmEntityInterface).ormOnPreUpdate = function()
        {
            descriptor.value();
        }
    }
}
