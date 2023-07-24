import { OrmEntityInterface } from "./OrmEntityInterface";

export function OrmOnPostUpdate()
{
    return function(target, name: string, descriptor: PropertyDescriptor)
    {
        (target as OrmEntityInterface).ormOnPostUpdate = function()
        {
            descriptor.value();
        }
    }
}
