import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";

interface Params
{
    entity: string;

    mappedBy: string;
}

export function OrmEntityFieldAsOneToMany(params?: Params)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {} as OrmEntityDefinition;
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
