# Kong

## Development Environment

To test kong api gateway environment there is a docker-compose file that brings up postgres, kong and a sample api.

Go to the containers folder and create containers:
```bash
$ docker-compose -f docker-compose-kong.yaml up --no-start
```
Once containers are create you have to start postgres 
```bash
$ docker-compose -f docker-compose-kong.yaml up -d postgres
```
and run a very first instance of kong to populate the database and wait for the container executions.
```bash
$ docker-compose -f docker-compose-kong.yaml up kong-migrations
```
Now starts kong and the backend
```bash
$ docker-compose -f docker-compose-kong.yaml up -d kong
$ docker-compose -f docker-compose-kong.yaml up -d petstore
```

![](docs/kong-development.png)

### How we use Kong

The plugin used in kong api gateway are:
- prometheus
- oauth2
- to be continued

To enable plugins
```bash
$ curl -X POST http://localhost:8001/plugins/ --data "name=prometheus"
$ curl -X POST http://localhost:8001/plugins/ --data "name=oauth2&config.enable_client_credentials=true&config.global_credentials=true&config.accept_http_if_already_terminated=true"
```
Create a simple service with route
```bash
$ curl -X POST http://localhost:8001/services \
  --data "name=petstore&url=http://petstore:8080/api"
$ curl -X POST http://localhost:8001/services/petstore/routes  \
  --data "paths[]=/petstore&name=petstore"
```
Crea a consumer\user **using the custom_id field to store the list of enabled siteids for this user**. The custom_id field is forwarded to the API using the header **X-Consumer-Custom-ID**
```bash
$ curl -X POST http://localhost:8001/consumers \
  -d '{"username": "wai-test", "custom_id": "10,20,30,40"}' \
  -H "Content-Type: application/json"
```
and an OAuth2  Client-ID - Client Secret
```bash
$ curl -X POST http://localhost:8001/consumers/wai-test/oauth2 \
  -H "Content-Type: application/x-www-form-urlencoded"  \
  -d "name=wai-test-oauth2"  
```
The output of the call will be something like this:
```json
{
  "created_at": 1606770847,
  "id": "9a56419c-5165-4f85-81a6-6e283929627f",
  "tags": null,
  "name": "wai-test-oauth2",
  "client_secret": "lHUFwKfUyZdK5gZ4YE7W7OBXSmF0S4I2",
  "client_id": "nK7lzfDeLhbiJB7igaIviH0x9kFK0M0V",
  "redirect_uris": null,
  "hash_secret": false,
  "client_type": "confidential",
  "consumer": {
    "id": "a7663c94-186a-46f0-8399-79ba0e66a5c1"
  }
}
```

To get an access token call the token endpoint
```bash
$ curl -X POST https://localhost:8443/petstore/oauth2/token -k \
  -d "client_id=nK7lzfDeLhbiJB7igaIviH0x9kFK0M0V&client_secret=lHUFwKfUyZdK5gZ4YE7W7OBXSmF0S4I2&grant_type=client_credentials"  \
```
The output is something like this
```json
{
  "token_type": "bearer",
  "access_token": "TI2b9XKBeO2aDblCsdZmPx18n4IVxUUr",
  "expires_in": 7200
}
```
And here we are: call the api
```bash
$ curl http://localhost:8000/petstore/store/inventory \
  -H 'Authorization: Bearer TI2b9XKBeO2aDblCsdZmPx18n4IVxUUr' 
```
Below the list of headers sent to the api
```
Authorization: Bearer TI2b9XKBeO2aDblCsdZmPx18n4IVxUUr
X-Consumer-ID: a7663c94-186a-46f0-8399-79ba0e66a5c1
X-Consumer-Custom-ID: 10,20,30,40
X-Consumer-Username: wai-test
X-Credential-Identifier: nK7lzfDeLhbiJB7igaIviH0x9kFK0M0V
```
