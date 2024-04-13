This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Deploy on Synology NAS

- set local ip address in the .env with http schema (ex: http://192.168.1.18/photo/webapi)
- `npm run build`
- create a Shared Folder on the Synology NAS
- copy this project (exclude node modules folder)
- use ssh to connect to the nas
- install dependencies: `npm i`
- `npm start`
- create a virtual host port based (8001 https)
- create a reverse proxy. Source: mynas.i234.me (port 8001) -> Destination localhost (port 3000)

- `sudo netstat -nlp | grep 3000` to find the name of the service and the pid that uses port 3000
- then `kill -KILL pid`

- sudo npm install -g pm2
- sudo find /usr/local/lib/node_modules/pm2 -type f -exec chmod 755 {} +
- sudo pm2 startup (create startup script)
- sudo pm2 start npm --name "nextjs" -- start
- sudo pm2 start / stop

- sudo pm2 save
