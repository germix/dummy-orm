# Dummy ORM

A dummy/experimental ORM for nodejs with Typescript.

## Dummy Query Language (DQL)

### Select

```
SELECT e FROM Entity e WHERE <condition>
SELECT e{id,name} FROM Entity e WHERE <condition>
SELECT e.id,e.name FROM Entity e WHERE <condition>
```

### Update

```
UPDATE Entity SET column1 = value1, column2 = value2, ... WHERE <condition>
```

### Insert

```
INSERT INTO Entity VALUES(column1=value1, column2=value2, column3=value3, ...)
```

### Delete

```
DELETE FROM Entity e WHERE <condition>
```
