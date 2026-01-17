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
| `OPENHAB_BASE_URL`             | Optional    | OpenHab base URL for media player info                                      | `http://192.168.1.19:8080`                                           |
| `OPENHAB_CURRENT_TITLE_ITEM`   | Optional    | OpenHab item name for current media title                                   | `livingroom_chromecast_title`                                          |
| `OPENHAB_CURRENT_ARTIST_ITEM`  | Optional    | OpenHab item name for current media artist                                  | `livingroom_chromecast_artist`                                         |
| `OPENHAB_ROOMS_JSON`           | Optional    | JSON array of rooms with temperature/humidity items                         | `[{"name":"living room","temperatureItem":"temp_living","humidityItem":"hum_living"},{"name":"bedroom","temperatureItem":"temp_bed","humidityItem":"hum_bed"}]` |

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

  sudo cat /root/.pm2/logs/nextjs-out.log
  
  sudo cat /root/.pm2/logs/nextjs-error.log
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

In my case, with Reasberry Pi 1, I had to install chromium manually following the steps indicated [here](https://github.com/MichaIng/DietPi/issues/3364#issuecomment-581158357).

---

## Openhab Integration

If you want to integrate with OpenHab to show the current playing media title and artist, you need to set the following environment variables in the `.env` file:

- `OPENHAB_BASE_URL`
- `OPENHAB_CURRENT_TITLE_ITEM`
- `OPENHAB_CURRENT_ARTIST_ITEM`

Optionally, you can also set:
- `OPENHAB_ROOMS_JSON` (if you want to show temperature and humidity from different rooms)

### Rooms information 

The json array in the .env file must contains the name of the groups (the rooms) that contains items temperature, humidity, etc.

For example:

```
[{"itemname":"gLiving"},{"itemname":"gVeranda"}]
```

Openhab must contains:

```
Group gLiving "Living   room" <sofa> (gIndoor) ["LivingRoom", "Indoor"]
Group gVeranda "Veranda" <veranda> (gOutdoor) ["Veranda", "Outdoor"]
```

Tags "Indoor" and "Outdoor" are important because `synology photo frame app` will use them to distinguish between different outdoor and indoor areas.

For each group (room) `syno photo frame app` will try to get the items tagged with:
- Temperature: `Temperature`
- Humidity: `Humidity`
- Disconfort index: `disconfortidx`
- Disconfort: `disconfort`
- Disconfort color: `disconfortcolor`
- Dew point: `dewpoint`
- Mold risk: `moldrisk`
- Mold risk color: `moldriskcolor`

For example, for the group `gLiving`, you can have:

```
Number temp_living "Temperature [%.1f °C]" <temperature> (gTemperature, gLiving) ["Temperature"]
Number hum_living "Humidity [%.1f %%]" <humidity> (gHumidity, gLiving) ["Humidity"]
Number dev_point_living "Dew point Living [%.1f °C]" <temperature> (gDewPoint, gLiving) ["dewpoint"]
String mold_risk_living "Mold risk living" (gDewPoint, gLiving) ["moldrisk"]
Color mold_risk_color_living "Mold risk color living" (gDewPoint, gLiving) ["moldriskcolor"]
Number disconfort_index_living "Disconfort index Living" (gDisconfort, gLiving) ["disconfortidx"]
String disconfort_living "Disconfort Living" (gDisconfort, gLiving) ["disconfort"]
Color disconfort_color_living "Disconfort color Living" (gDisconfort, gLiving) ["disconfortcolor"]
```

This is the script that openhab uses to update the disconfort and mold risk items:

```javascript

// Import delle API di openHAB JS
const { rules, triggers, items } = require('openhab');

const dewPointCalculation = (temperature, humidity) => {
  // Magnus formula for dew point calculation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return parseFloat(dewPoint.toFixed(2));
};

const classjfyDewPoint = (dewPoint) => {
    if (dewPoint < 10) {
        return 'Low';
    } else if (dewPoint > 14) {
        return 'High';
    } else {
        return 'Moderate';
    }
};

const getDevPointColor = (dewPoint) => {
    if (dewPoint < 10) {
        return '158, 100, 100'; // #00ffa2ff Blue for low dew point
    } else if (dewPoint >= 10 && dewPoint <= 14) {
        return '60, 100, 100'; // #FFFF00 Yellow for moderate dew point
    } else {
        return '16, 100, 100'; // #FF4500 Red for high dew point
    }
}

const disconfortAssessment = (temperature, humidity) => {
    const discomfortIndex = temperature - (0.55 - 0.0055 * humidity) * (temperature - 14.5);
    let diEffects = 0;
    switch(true) {
      case discomfortIndex <= 10.0:
        diEffects = 0
        break;
      case discomfortIndex>10.0 && discomfortIndex<=15.0:
        diEffects = 1
        break;
      case discomfortIndex>15.0  &&  discomfortIndex<=18.0:
        diEffects = 2
        break;
      case discomfortIndex>18.0  &&  discomfortIndex<=21.0:
        diEffects = 3
        break;
      case discomfortIndex>21.0  &&  discomfortIndex<=24.0:
        diEffects = 4
        break;
      case discomfortIndex>24.0  &&  discomfortIndex<=27.0:
        diEffects = 5
        break;
      case discomfortIndex>27.0  &&  discomfortIndex<=29.0:
        diEffects = 6
        break;
      case discomfortIndex>29.0  &&  discomfortIndex<=32.0:
        diEffects = 7
        break;
      case discomfortIndex>32.0:
        diEffects = 8
        break;
    }
    return diEffects
};

const getDisconfortColor = (diLevel) => {
  const disconfortColorLevels = [
    '207, 100, 100', // '#008cffff'
    '184, 100, 100', // '#00eeffff'
    '156, 100, 100', // '#00ff99ff'
    '135, 100, 100', // '#00ff40ff'
    '74, 100, 100', // '#c3ff00ff'
    '55, 100, 100', // '#ffea00ff'
    '34, 100, 100', // '#ff9100ff'
    '20, 100, 100', // '#ff5500ff'
    '0, 100, 100'    // '#FF0000'
  ];
  
  return disconfortColorLevels[diLevel];
};

const getDisconfortLabel = (diLevel) => {
  const disconfortLabelLevels = [
    "Extremely Uncomfortable",
    "Moderately Uncomfortable",
    "Relatively Comfortable",
    "Comfortable",
    "Less than 50% of the population feel uncomfortable",
    "More than 50% of the population feel uncomfortable",
    "Most of population feels uncomfortable",
    "Everyone feels severe stress",
    "State of medical emergency"
  ];
  
  return disconfortLabelLevels[diLevel];
}

const sendResultDewMold = (dewItem, moldRiskItem, moldRiskColorItem, dew, moldRisk, color) => {
  dewItem.postUpdate(dew);
  moldRiskItem.postUpdate(moldRisk);
  moldRiskColorItem.postUpdate(color);

  if (moldRisk === 'High') {
    console.warn(`High Mold Risk detected in Salotto! Dew Point: ${dew} °C`);
    const telegram = actions.get('telegram', 'telegram:telegramBot:Telegram_Bot');
    telegram.sendTelegram(`Dew Point Salotto: ${dew} °C, Mold Risk: ${moldRisk}`);
  }
}

const sendResultDisconfort = (disconfortIndexItem, disconfortLabelItem, disconfortColorItem, disconfortIndex, disconfortLabel, disconfortColor) => {
  disconfortIndexItem.postUpdate(disconfortIndex);
  disconfortLabelItem.postUpdate(disconfortLabel);
  disconfortColorItem.postUpdate(disconfortColor);

  if (disconfortIndex >= 6 || disconfortIndex <= 1) {
    console.warn(`High Disconfort Index detected in Salotto! Index: ${disconfortIndex}, Condition: ${disconfortLabel}`);
    const telegram = actions.get('telegram', 'telegram:telegramBot:Telegram_Bot');
    telegram.sendTelegram(`Disconfort Index Salotto: ${disconfortIndex}, Condition: ${disconfortLabel}`);
  }
}

rules.when()
  .item('temp_living').changed()
  .or()
  .item('hum_living').changed()
  .then(event => {
    const tempItem = items.getItem('temp_living');
    const humItem  = items.getItem('hum_living');

    const temp = tempItem.numericState;   // temperatura in °C
    const hum  = humItem.numericState;    // umidità in %

    if (temp == null || hum == null) {
      console.warn('Dew point Living: not numeric values, skipping calculation');
      return;
    }

    const dew = dewPointCalculation(temp, hum);
    const color = getDevPointColor(dew);
    const moldRisk = classjfyDewPoint(dew);
    const disconfortIndex = disconfortAssessment(temp, hum);
    const disconfortLabel = getDisconfortLabel(disconfortIndex);
    const disconfortColor = getDisconfortColor(disconfortIndex);
    const dewItem = items.getItem('dev_point_living');
    const moldRiskItem= items.getItem('mold_risk_living');
    const moldRiskColorItem= items.getItem('mold_risk_color_living');
    const disconfortIndexItem = items.getItem('discomfort_index_living');
    const disconfortLabelItem = items.getItem('discomfort_label_living');
    const disconfortColorItem = items.getItem('discomfort_color_living');
    const dewRounded = Math.round(dew * 10) / 10;

    sendResultDewMold(dewItem, moldRiskItem, moldRiskColorItem, dewRounded, moldRisk, color);
    sendResultDisconfort(disconfortIndexItem, disconfortLabelItem, disconfortColorItem, disconfortIndex, disconfortLabel, disconfortColor);
  })
  .build(
    'Dew Point/Disconfort Calculation Rule for Living Room',
    'Calculate dew point and discomfort when temperature or humidity in the living room changes'
  );

```