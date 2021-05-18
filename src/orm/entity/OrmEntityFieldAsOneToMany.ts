import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";

export class Collection<T>
{
    async load()
    {
    }
}

export function OrmEntityFieldAsOneToMany(params?)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;
        console.log(target)
        console.log(fieldName)

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        if(entityDefinitions[entityName].ormOneToMany === undefined)
        {
            entityDefinitions[entityName].ormOneToMany = {};
        }
        entityDefinitions[entityName].ormOneToMany[fieldName] = params;

        target[makeGetMethod(fieldName)] = async function()
        {
            return this[fieldName];
        }
    };
}
