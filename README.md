#

### Generate Secret Key

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"