# Manual

## Generate Secret Key

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

### Start Services

docker-compose -f docker-compose.yml -f docker-compose.database.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml -f docker-compose.logging.yml up --build

### Remove Services

docker-compose -f docker-compose.yml -f docker-compose.database.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml -f docker-compose.logging.yml down -v

### Restart A Particular Service(s)

docker-compose -f docker-compose.yml -f docker-compose.database.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml -f docker-compose.logging.yml restart <SERVICE_NAME>
