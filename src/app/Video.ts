import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmExtends } from "../orm/entity/OrmExtends";
import { Objekt } from "./Objekt";

@OrmEntity()
@OrmExtends({ base: Objekt })
export class Video extends Objekt
{
    @OrmEntityFieldAsString()
    title;
}
