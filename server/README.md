# yakchat-auth-server

Autorization and Authentication REST server for [yakchat](https://github.com/rebelstackio/yakchat)

## Development

1) Create the vagrant box( could take a while )

	```sh
	cd vagrant
	vagrant up
	```

2) ssh into the vagrant box

	```sh
	vagrant ssh
	```

3) Install dependecies

	```sh
	cd yakchat-auth-server
	npm install
	```

4) Run server

	```sh
	npm start
	```

	Server's URL: 192.168.86.6:8888 on linux. On windows should the same IP


## Endpoints

### `/signup/operator`

*Url*

`POST http://192.168.86.6:8888/api/v1/auth/signup/operator` 

*Headers*:

- `Content-Type: application/json`
- `Accept: application/json`

*Body*:

```json
{
	"displayname": "operator1",
	"email": "op1@email.com",
	"password": "12345"
}
```

### `/signup/client`

*Url*

`POST http://192.168.86.6:8888/api/v1/auth/signup/client` 

*Headers*:

- `Content-Type: application/json`
- `Accept: application/json`

*Body*:

```json
{
	"displayname": "operator1",
	"email": "op1@email.com",
	"password": "12345",
	"webpage":"http://www.test.com
}
```

### `/login`

*Url*

`POST http://192.168.86.6:8888/api/v1/auth/login` 

*Headers*:

- `Content-Type: application/json`
- `Accept: application/json`

*Body*:

```json
{
	"username": "admin",
	"password": "<pass>"
}
```
