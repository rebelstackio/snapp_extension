# Snapp Extension

## Dev instalation
First we need to set our chrome extension to development mode:

- go to chrome://extensions/
- in the top right corener there is a switch "develper mode"
- now we have new buttons, we need to click the load unpacked
- set the directory the root of this project

and that's it, you have snapp beta on your browser, but we need still to run our server with puppeteer:

```bash
cd server
```
install dependencies
```bash
npm install
```
start the expressif server
```bash
npm start
```

# Extension flow
## Permissions
- storage: this is like a metaflux storage between all the parts in the extension
- activeTab: to get the url from the active tab to take the screenshot
- tabs: use it to dynamicly open/update the viewer in a new tab
- downloads: use download API to download the images
- identity: get the user ID from the user logged in your browser
- identity.email: also get the email.

## Background script
This background script is very basic due to all the work is done in the popup or the viewer:
- Init the storage on installed event.
- Set the user loged to the storage

## Popup
This is the small popup that display when you press the icon for the extension:
- Display Capture button
- Get the URL from the active tab
- Call the capture API from our server: this post user, url and opt
- On server response store the new magnet to storage
- Open/Update tab with viewer when server respond with the magnet


## Viewer
This is a new tab that will spawn when you take a capture, if it's open will listen to update message event from the Popup
- Loop all the magnets in the storage
- Listen to update event
- Add magnet to torrent to start download (this automaticly seed the torrent)
- On download create a URLBlob
- Create img tag with download button, share and expand 
- Download button use chrome download api to download from the URLBlob
- Share button copy to the clipboard the magnet
- Expand is a icon button that expand the image to full size, this button toggles between expand and collapse.
- Add Sared Link input, add magnet to the download queue.

## Server
The server use puppeteer to take a screenshot from a given url.

### API

#### `/capture`

*Url*

`POST http://192.168.86.6:8888/api/v1/capture` 

*Headers*:

- `Content-Type: image/png`
- `Accept: application/json`

*Body*:

```json
{
	"url": "http://site.com",
	"opts": {},
	"user": {
		"id": "<chrome-user-id>",
		"email": "person@gmail.com"
	}
}
```

### Storing Images
the images will be stored under the current base project dir/snapps/
inside every user will create a new folder /google.id-base64(google.email)/
will look something like this:
```
.
.
.
|
+-- snapps/
	+-- 104097526254524980866-b3NtYXJyZXllc3N0QGdtYWlsLmNvbQ==/
		+-- a43258a1cddc16ce92274b472d7c9891.png
		...
	...

```