import { OrmEntity } from "./OrmEntity";

export function OrmAbstractEntity(params?:
{
    discriminatorColumn?: string;
})
{
    return OrmEntity({
        ...params||{},
        isAbstract: true,
        discriminatorColumn: params?.discriminatorColumn || 'discriminator',
    });
}
