
# The project

The purpose is to develop a very simple slideshow web application to realize a Photo Frame. These are some basic requirements:

- using the Synology Photos API: I would like to use all the photos stored in the Synology NAS
- lightweight compared to the Synology Photos slideshow: I would like to use this web application through a Chrome browser in kiosk mode running on a very old Raspberry Pi (first version) 
- ability to configure the delay time between photos: Synology Photos slideshow doesn't allow to configure this time
- running on the Synology NAS: it is possible to use nodejs 20

Secondary requirements:

- use nextjs 14
- use typescriptch"

# Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, configure the environment: clone the .env.example file, rename it in .env and set the variables.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the application. The application auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Environment variable (.env file)

Variable                     | Optionality | Description                                                           | Example
-----------------------------|-------------|-----------------------------------------------------------------------|--------------------------------------------------------------------------
SYNOLOGY_PHOTOS_API_BASE_URL | required    | the Synology Photos API URL (*)                                       | http://192.168.1.18/photo/webapi
SYNOLOGY_PHOTOS_USERNAME     | required    | a Synology Photos user with read-only permission                      | frameUser
SYNOLOGY_PHOTOS_PASSWORD     | required    | the user password                                                     | password
SLIDESHOW_TIMING             | optional    | the time between slides (default 20000)                               | 20000
DAYS_INTERVAL                | optional    | number used to create a range of days for the past years (default 7)  | 7 (now - 7 &lt; x &lt; now + 7)
PASSPHRASE_SHARED_ALBUM      | optional    | the shared album code                                                 | 12ab45 (the last part of the shared url https://host.me/photo/mo/sharing/12ab45)
USE_SHARED_SPACE             | required    | "false" if you use a PASSPHRASE_SHARED_ALBUM<br>"true" if you don't use PASSPHRASE_SHARED_ALBUM<br>and if your photos are in the shared space | "false"
MIN_STARS                    | optional    | filter by stars (form MIN_STARS to 5)                                 | 1
TRANSITION                   | optional    | transition between slides (sliding, fading, none)                       | none

(*) To avoid DNS configuration, you can use the ip address

## Deploy on Synology NAS

Phase 1 - create a Synology NAS new user

- create a Synology Photos user with read-only permission

Phase 2 - configure .env 

- set the environment variables

Phase 3 - build the application

- `npm run build`

Phase 4 - prepare the Synology NAS to host the application

- create a Shared Folder on the Synology NAS
- copy this project without the node_modules folder
- use SSH to connect to the Synology NAS
- install dependencies: `npm i`
- `npm start`
- create a Virtual Host Port Based (8001 HTTPS) using the Web Station app
- create a Reverse Proxy (Control Panel -> Login Portal -> Advanced). Source: mynas.i234.me (port 8001) -> Destination localhost (port 3000)
- test usign this url (ex: https://mynas.i234.me:8001)

Phase 5 - stop node
- `sudo netstat -nlp | grep 3000` to find the pid of the service and the pid that uses port 3000
- then `kill -KILL pid`

Phase 6 - install and configure pm2 on the Synology NAS using SSH

- `sudo npm install -g pm2` (install pm2)
- (optional) `sudo find /usr/local/lib/node_modules/pm2 -type f -exec chmod 755 {} +`
- `sudo pm2 startup` (create startup script)

Phase 7 - create a daemon for the app (ex: syno-photo-slideshow)
- `sudo pm2 start npm --name "syno-photo-slideshow" -- start ()`
- `sudo pm2 start syno-photo-slideshow`
- `sudo pm2 save`

Phase 8 - manage the app daemon with pm2

- `sudo pm2 stop syno-photo-slideshow`
- `sudo pm2 monit`
- `sudo pm2 logs`
- `sudo cat $HOME/.pm2/logs/XXX-err.log`

## Configure the Raspberry Pi

Phase 1 - install the operating system

- install [DietPi](https://dietpi.com/)

Phase 2 - configure DietPi

- run `dietpi-config`
- select Autostart Options -> Chromium - dedicated use without desktop
- add the web app address (ex https://mynas.i234.me:8001)
- select the user root
- exit from the config
