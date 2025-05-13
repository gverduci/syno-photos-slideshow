# The Project

The purpose of this project is to develop a very simple slideshow web application to create a Photo Frame. Below are the basic requirements:

- **Use the Synology Photos API**: Utilize all the photos stored in the Synology NAS.
- **Lightweight**: The application should be lightweight compared to the Synology Photos slideshow, allowing it to run on a very old Raspberry Pi (first version) through a Chrome browser in kiosk mode.
- **Configurable Delay Time**: Allow configuration of the delay time between photos (unlike Synology Photos slideshow).
- **Run on Synology NAS**: The application should run on the Synology NAS using Node.js 20.

### Secondary Requirements

- Use **Next.js 15**.
- Use **TypeScript**.

---

## Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

1. **Configure the Environment**:
   - Clone the `.env.example` file, rename it to `.env`, and set the required variables.

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

4. **Start Editing**:
   - The application auto-updates as you edit the files.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

---

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.

You can also check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) for feedback and contributions.

---

## Environment Variables (`.env` File)

| Variable                     | Optionality | Description                                                                 | Example                                                                 |
|------------------------------|-------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------|
| `SYNOLOGY_PHOTOS_API_BASE_URL` | Required    | The Synology Photos API URL (*)                                             | `http://192.168.1.18/photo/webapi`                                     |
| `SYNOLOGY_PHOTOS_USERNAME`     | Required    | A Synology Photos user with read-only permission                            | `frameUser`                                                            |
| `SYNOLOGY_PHOTOS_PASSWORD`     | Required    | The user password                                                           | `password`                                                             |
| `SLIDESHOW_TIMING`             | Optional    | The time between slides (default: `20000` ms)                               | `20000`                                                                |
| `DAYS_INTERVAL`                | Optional    | Number of days to create a range for past years (default: `7`)              | `7` (e.g., `now - 7 < x < now + 7`)                                    |
| `PASSPHRASE_SHARED_ALBUM`      | Optional    | The shared album code                                                       | `12ab45` (last part of the shared URL: `https://host.me/photo/mo/sharing/12ab45`) |
| `USE_SHARED_SPACE`             | Required    | `"false"` if using `PASSPHRASE_SHARED_ALBUM`, `"true"` otherwise            | `"false"`                                                              |
| `MIN_STARS`                    | Optional    | Filter photos by stars (from `MIN_STARS` to `5`)                            | `1`                                                                    |
| `TRANSITION`                   | Optional    | Transition between slides (`sliding`, `fading`, `none`)                     | `none`                                                                 |

(*) To avoid DNS configuration issues, you can use the IP address.

---

## Deploy on Synology NAS

### Phase 1: Create a Synology NAS User
- Create a Synology Photos user with read-only permission.

### Phase 2: Configure `.env`
- Set the environment variables as described above.

### Phase 3: Build the Application
- Run:
  ```bash
  npm run build
  ```

### Phase 4: Prepare the Synology NAS to Host the Application
1. Create a Shared Folder on the Synology NAS.
2. Copy this project (excluding the `node_modules` folder) to the Shared Folder.
3. Use SSH to connect to the Synology NAS.
4. Install dependencies:
   ```bash
   npm i
   ```
5. Start the application:
   ```bash
   npm start
   ```
6. Create a Virtual Host (Port-Based, e.g., HTTPS on port `8001`) using the Web Station app.
7. Create a Reverse Proxy (Control Panel → Login Portal → Advanced):
   - **Source**: `mynas.i234.me` (port `8001`)
   - **Destination**: `localhost` (port `3000`)
8. Test the application using the URL (e.g., `https://mynas.i234.me:8001`).

### Phase 5: Stop Node.js
1. Find the PID of the service using:
   ```bash
   sudo netstat -nlp | grep 3000
   ```
2. Kill the process:
   ```bash
   kill -KILL <pid>
   ```

### Phase 6: Install and Configure PM2 on the Synology NAS
1. Install PM2 globally:
   ```bash
   sudo npm install -g pm2
   ```
2. (Optional) Fix permissions:
   ```bash
   sudo find /usr/local/lib/node_modules/pm2 -type f -exec chmod 755 {} +
   ```
3. Create a startup script:
   ```bash
   sudo pm2 startup
   ```

### Phase 7: Create a Daemon for the App
1. Start the app with PM2:
   ```bash
   sudo pm2 start npm --name "syno-photo-slideshow" -- start
   ```
2. Save the PM2 process list:
   ```bash
   sudo pm2 save
   ```

### Phase 8: Manage the App with PM2
- Stop the app:
  ```bash
  sudo pm2 stop syno-photo-slideshow
  ```
- Monitor the app:
  ```bash
  sudo pm2 monit
  ```
- View logs:
  ```bash
  sudo pm2 logs
  ```
- View error logs:
  ```bash
  sudo cat $HOME/.pm2/logs/<app-name>-err.log
  ```

---

## Configure the Raspberry Pi

### Phase 1: Install the Operating System
- Install [DietPi](https://dietpi.com/).

### Phase 2: Configure DietPi
1. Run the configuration tool:
   ```bash
   dietpi-config
   ```
2. Select:
   - **Autostart Options** → **Chromium - dedicated use without desktop**.
3. Add the web app address (e.g., `https://mynas.i234.me:8001`).
4. Select the user `root`.
5. Exit the configuration tool.

---
