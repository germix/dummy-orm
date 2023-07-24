import { OrmAbstractEntity } from "../orm/entity/OrmAbstractEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmEntityIdAsIncremental } from "../orm/entity/OrmEntityIdAsIncremental";

@OrmAbstractEntity({
    discriminatorColumn: 'type',
})
export abstract class Objekt
{
    @OrmEntityIdAsIncremental()
    id: number;

    @OrmEntityFieldAsString()
    type: string;
}
