import { logOrmField } from "../../testing/log";
import { entityDefinitions } from "../OrmConfig";
import { makeGetMethod } from "../utils";
import { OrmEntityDefinition } from "./OrmEntityDefinition";
import { OrmEntityFieldParams } from "./OrmEntityFieldParams";

export function OrmEntityField(params?: OrmEntityFieldParams|object)
{
    return function(target, fieldName)
    {
        let entityName = target.constructor.name;

        logOrmField(entityName + "." + fieldName);

        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {} as OrmEntityDefinition;
        }
        if(entityDefinitions[entityName].ormFields === undefined)
        {
            entityDefinitions[entityName].ormFields = {};
        }

        entityDefinitions[entityName].ormFields[fieldName] = params;

        target[makeGetMethod(fieldName)] = function()
        {
            return this[fieldName];
        }
    }
}
