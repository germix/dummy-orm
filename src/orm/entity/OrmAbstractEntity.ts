import { OrmEntity } from "./OrmEntity";

export function OrmAbstractEntity(params?)
{
    return OrmEntity({
        ...params||{},
        isAbstract: true
    });
}
