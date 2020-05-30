# Snapp Server


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
	cd snapp_server
	npm install
	```

4) Run server

	```sh
	npm start
	```

	Server's URL: 192.168.86.6:8888 on linux. On windows should the same IP


## Endpoints


### `/capture`

*Url*

`POST http://192.168.86.6:8888/api/v1/capture` 

*Headers*:

- `Content-Type: image/png`
- `Accept: application/json`

*Body*:

```json
{
	"url": "http://site.com",
	"opts": {}
}
```
