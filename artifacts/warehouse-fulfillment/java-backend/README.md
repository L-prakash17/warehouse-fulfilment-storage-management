# Java backend example

This folder contains the beginner-friendly Java model and service layer for the warehouse project.

## Run the console example

```bash
javac src/*.java
java -cp src Main
```

`WarehouseService` stores products and storage locations in `ArrayList` collections and exposes separate create, read, update, delete, and search methods. The website mirrors the same fields and operations in its browser UI so the project can be demonstrated without a database.