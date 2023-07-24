import { OrmEntity } from "../orm/entity/OrmEntity";
import { OrmEntityFieldAsString } from "../orm/entity/OrmEntityFieldAsString";
import { OrmEntityFieldAsText } from "../orm/entity/OrmEntityFieldAsText";
import { OrmExtends } from "../orm/entity/OrmExtends";
import { Objekt } from "./Objekt";

@OrmEntity()
@OrmExtends({
    base: Objekt,
    discriminatorValue: 'video',
})
export class Video extends Objekt
{
    @OrmEntityFieldAsString()
    title: string;

    @OrmEntityFieldAsText()
    source: string;
}
