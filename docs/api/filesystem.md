# The Pocket Filesystem API
Pocket reads specific files from the Filesystem to define its Router.
All routes reside in the `routes/`-directory.
The pathname-structure of your application will be defined using folders:
```
routes/
 | - contact/
 | - app/
 |    | - profile/
 | - legal/
 | - api/
```
corresponds to an application that has the following routes:
* /
* /contact
* /app
* /app/profile
* /legal
* /api

within this folder structure, a file called `route.ts` in any of the folders will handle the corresponding route. 
In addition to routes, layouts (called `layout.ts`) can be provided in any of the folders.
Layouts apply to the route in the same folder and any subfolders.

[Learn more about routes](./routes.md)
[Learn more about layouts](./layouts.md)