
# Compare postgreSQL @string and @varchar(n) performance

This is a simple test to compare the performance of @string and @varchar(n) in postgreSQL.

### Database Setup

```
npm run db:migrate:dev
npm run db:seed 
```

## String schema - Varchar schema

### Cache

Grafikonok és teljes összehasonlítás a [MultiRun.xlsx](MultiRun.xlsx) fájlban találhatóak

Varchar esetén átlagosan `~11%`-al lassabba az első futtatás
String esetén átlagosan `~6%`-al lassabb az első futtatás

### Hogyan változik a teljesítmény, több / kevesebb rekorddal

### Indexelt string mezők

Elhanyagolható sebesség különbség, a string és a varchar között

### Postgre tud-e? varchar() -> a rövid mezők varchar, a hosszúak string

A rendszer automatikusan tömöríti a hosszú stringeket, 
így a lemez fizikai igénye lehet kevesebb. Nagyon hosszú értékeket 
háttér-táblákban is tárolnak, hogy ne zavarják az egyéb, 
rövidebb oszlopértékekhez való gyors hozzáférést. 
Mindenesetre a leghosszabb lehetséges karakterlánc, 
amely tárolható, körülbelül 1 GB.

### Postgre specifikáció varchar max méret?

Van 10_485_760 karakteres lehet maximum

varchar(n) -> Ha `n` nincs megadva, bármilyen hosszú lehet (PostgreSQL) 

### Postgre dokumentáció ajánlás

There is no performance difference among these three types, apart from increased storage
space when using the blank-padded type, and a few extra CPU cycles to check the length
when storing into a length-constrained column. While character(n) has performance advantages in some other database systems, there is no such advantage in PostgreSQL; in fact
character(n) is usually the slowest of the three because of its additional


```mermaid
erDiagram
  User {
    Int id
    String email
    String name  
  }
  


  Post {
    Int id
    String title
    String content      
  }
  


  Comment {
    Int id
    String content      
  }
  

Post o{--|| User : "author"
Comment o{--|| Post : "post"

  User2 {
    Int id
    Varchar email
    Varchar name  
  }


  Post2 {
    Int id
    Varchar title
    Varchar content  
  }


  Comment2 {
    Int id
    Varchar content  
  }

Post2 o{--|| User2 : "author"
Comment2 o{--|| Post2 : "post"
```

### Queries ran

User's posts total count query
```sql
select count(*) from "Post" inner join "User" on "Post"."authorId" = "User".id
```
String Time: 2219 ms

Varchar(n) Time: 1475 ms

Percentage Gain: 150,4%


---
User's posts order by title asc LIMIT 50
```sql
select * from "Post" order by "title" asc LIMIT 50
```
String Time: 1148 ms

Varchar(n) Time: 1092 ms

Percentage Gain: 105,1%


---
User's posts where title = 'ABC'
```sql
select * from "Post" where "title" = 'A ab beatae.'
```
String Time: 676 ms

Varchar(n) Time: 564 ms

Percentage Gain: 119,9%


---
User's posts where title != 'ABC'
```sql
select * from "Post" where "title" != 'A ab beatae.' LIMIT 50
```
String Time: 11 ms

Varchar(n) Time: 10 ms

Percentage Gain: 110,0%


---
User's posts where title LIKE 'ABC%'
```sql
select * from "Post" where "title" LIKE 'A ab beatae%'
```
String Time: 730 ms

Varchar(n) Time: 623 ms

Percentage Gain: 117,2%


---
User's posts where title IN array
```sql
select * from "Post" where "title" IN ('A ab beatae.', 'A ab beatae delectus.', 'Culpa debitis ut.', 'Molestias ipsum vero.')
```
String Time: 921 ms

Varchar(n) Time: 900 ms

Percentage Gain: 102,3%


---
User's posts group by title having
```sql
select "title", count(*) from "Post" group by "title" having count(*) > 2
```
String Time: 9326 ms

Varchar(n) Time: 9022 ms

Percentage Gain: 103,4%

---

Average percentage Gain: 115,4%