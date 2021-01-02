import { BgGreen, Reset } from "../../bash";
import { entityDefinitions } from "../OrmConfig";
import { camelcaseToUnderscore } from "../utils";

export function OrmEntity(params?)
{
    return function(target)
    {
        params = params||{};
        let entityName = target.prototype.constructor.name;

        console.log(BgGreen + "[ORM ENTITY]:" + Reset + " " + entityName);
        if(entityDefinitions[entityName] === undefined)
        {
            entityDefinitions[entityName] = {};
        }
        entityDefinitions[entityName].isAbstract = params.isAbstract;
        entityDefinitions[entityName].name = entityName;
        entityDefinitions[entityName].tableName = camelcaseToUnderscore(entityName);

        return target;
    }
}
