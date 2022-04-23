
# Restaurant Reservation Multi-tenant System

This Repo is a simple restaurant reservation backend solution. The system support multi-tanency which means it can serve more that one restaurant.



## Overview

The system consists of 4 modules:
- Authorization module: login and registration
- Users module: Creating and retrieving users
- Tables module: creating, retrieving, and deleting tables.
- Reservations module: lovely Algorithmic stuff :D
## Tech Stack

**Server:** Node, Express, TypeScript, Prisma, Postgresql, Redis, Docker, and Docker compose

# API References
both postman collection and environment are included in the root of this repository.
## Installation
All you have to do is run the following command 
```bash
docker-compose up
```

This command will run the lint check, initiate and migrate the testing database to the latest version, execute the integration test suit. If all these steps are passed, then it will migrate the main database to the latest version and the server will start listening on port ```8080``` on your localhost. To turn the server off please run 
```bash
docker-compose down
```
or press `Control + C`. All scripts used to lint, build, test, and migrate are defined under package.hs
### Notes:
- Testing uses ```.env.test``` to build. Currently, that will work only if it is run by docker compose. If you wish to make it work outside you need to modify the ```DB_URL``` inside the file to the Database you're targeting. Afterwards, running ```npm run test``` will execute the test cases on your desired database
- the main ```.env``` file is committed here for ease of setup and convenience. DO NOT DO THAT IN PRODUCTION :D
## Algorithm Diagram
Most of the functionalities very straight forward validation and CRUDs. I didn't feed the need to develop for any functionalty except for `getting the available time slot reservation of the day`. So I included a picture of the diagram in the root of the repo.
## Closing Thoughts
This project allowed me to put a lot of technologies I knew but didn't have time or ideas to put them into practice. I believe it was a good practice through this weekend to break the pace. For all of that, I am quite grateful. And who knows, maybe this repo is the next MENA unicorn :D