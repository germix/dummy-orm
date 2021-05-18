import { OrmConfig } from "../orm/OrmConfig";
import { OrmManager } from "../orm/OrmManager";
import { Box, Customer, Employee, User } from "./entity/Test";

export async function test_0(cfg: OrmConfig)
{
    let omgr = new OrmManager(cfg);

    for(let i = 1; i <= 5; i++)
    {
        let user = new User();
        user.id = 'u'+i;
        user.username = 'user'+i;
        user.password = '123';
        await omgr.persistAndFlush(user)
    }

    let personId = 1;
    for(let i = 1; i <= 5; i++, personId++)
    {
        let p = new Customer();
        p.id = 'p'+personId;
        p.type = 'customer';
        p.name = 'person'+personId;
        p.customerField = 'customer-' + i;
        await omgr.persistAndFlush(p)
    }
    for(let i = 1; i <= 5; i++, personId++)
    {
        let p = new Employee();
        p.id = 'p'+personId;
        p.type = 'employee';
        p.name = 'person'+personId;
        p.employeeField = 'employee-' + i;
        await omgr.persistAndFlush(p)
    }

    {
        let user = new User();
        user.id = 'u2';
        await omgr.deleteAndFlush(user);
    }
    
    let box = new Box();
    box.id = 'box1';
    box.type = 'box';
    box.name = 'Wooden box';
    await omgr.persistAndFlush(box);

    console.log(await omgr.findBy(User, {}));
    console.log(await omgr.findBy(Box, {}));
    console.log(await omgr.findBy(Customer, {
    }));
    console.log(await omgr.findOneBy(Customer, {
        id: 'p1'
    }));
}
