import { OrmAbstractEntity } from "../../orm/entity/OrmAbstractEntity";
import { OrmEntity } from "../../orm/entity/OrmEntity";
import { OrmEntityField } from "../../orm/entity/OrmEntityField";
import { OrmEntityFieldAsString } from "../../orm/entity/OrmEntityFieldAsString";
import { OrmEntityId } from "../../orm/entity/OrmEntityId";
import { OrmEntityIdAsIncremental } from "../../orm/entity/OrmEntityIdAsIncremental";
import { OrmExtends } from "../../orm/entity/OrmExtends";
import { OrmOnPostInsert } from "../../orm/entity/OrmOnPostInsert";
import { OrmOnPreInsert } from "../../orm/entity/OrmOnPreInsert";

@OrmEntity()
export class Test
{
    @OrmEntityId()
    id;

    @OrmEntityFieldAsString({
        length: 10,
        nullable: true,
    })
    fieldAsString;

    @OrmEntityField({ type: 'boolean' })
    fieldAsBoolean;

    @OrmEntityField({ type: 'text' })
    fieldAsText;

    @OrmEntityField({ type: 'date' })
    fieldAsDate;

    @OrmEntityField({ type: 'datetime' })
    fieldAsDatetime;

    @OrmEntityField({ type: 'time' })
    fieldAsTime;

    @OrmEntityField({ type: 'decimal' })
    fieldAsDecimal;

    @OrmEntityField({ type: 'double' })
    fieldAsDouble;

    @OrmEntityField({ type: 'float' })
    fieldAsFloat;

    @OrmEntityField({ type: 'integer' })
    fieldAsInteger;

    @OrmEntityField({ type: 'mediumint' })
    fieldAsMediumInt;

    @OrmEntityField({ type: 'smallint' })
    fieldAsSmallInt;

    @OrmEntityField({ type: 'tinyint' })
    fieldAsTinyInt;

    @OrmEntityField({ type: 'bigint' })
    fieldAsBigInt;

    @OrmEntityField({ type: 'json' })
    fieldAsCustomJson;
}

@OrmAbstractEntity()
export abstract class Objekt
{
    @OrmEntityId()
    id;

    @OrmEntityFieldAsString()
    type;
}

@OrmEntity()
@OrmExtends({base: Objekt})
export class Box extends Objekt
{
    @OrmEntityFieldAsString()
    name;
}

@OrmAbstractEntity()
@OrmExtends({base: Objekt})
export abstract class Person extends Objekt
{
    @OrmEntityFieldAsString()
    name;
}

@OrmEntity()
@OrmExtends({base: Person})
export class Customer extends Person
{
    @OrmEntityFieldAsString()
    customerField;

}

@OrmEntity()
@OrmExtends({base: Person})
export class Employee extends Person
{
    @OrmEntityFieldAsString()
    employeeField;
}

@OrmEntity()
export class User
{
    @OrmEntityIdAsIncremental()
    id;

    @OrmEntityFieldAsString()
    username;

    @OrmEntityFieldAsString()
    password;

    @OrmOnPreInsert()
    onPreInsert()
    {
        console.log('User.onPreInsert()')
    }

    @OrmOnPostInsert()
    onPostInsert()
    {
        console.log('User.onPreInsert()')
    }
}
