import { OrmEntityId } from "./OrmEntityId";

export function OrmEntityIdAsIncremental()
{
    return OrmEntityId({
        type: 'autoincrement'
    });
}
