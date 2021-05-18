import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";

export function OrmEntityFieldAsManyToOne(params?)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        if(entityDefinitions[entityName].ormManyToOne === undefined)
        {
            entityDefinitions[entityName].ormManyToOne = {};
        }
        entityDefinitions[entityName].ormManyToOne[fieldName] = params;

        target[makeGetMethod(fieldName)] = async function()
        {
            return this[fieldName];
        }
    };
}
