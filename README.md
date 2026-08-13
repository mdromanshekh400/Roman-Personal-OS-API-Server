
 HEAD
# Roman Personal OS — API Server

This package adds the server that the Android Companion needs.



## What it does

- Serves the Roman Personal OS website.
- Accepts Android Companion syncs at `POST /api/device-sync`.
- Returns the latest device data at `GET /api/device`.
- Provides `GET /api/health`.
- Stores the latest sync in `data/device.json`.
- Uses a Bearer token for device sync.

The website already requests `/api/device`, so serving the website from this same server keeps the browser API URL same-origin.

## 1. Install Node.js


















Use Node.js 18+.

## 2. Install dependencies

In this folder:

```bash
npm install
```

## 3. Start the server

```bash
npm start
```

Default port:

```text
3000
```

Default device token:

```text
roman-device-local
```

For a stronger token, set `DEVICE_TOKEN` before starting the server.

### Windows PowerShell

```powershell
$env:DEVICE_TOKEN="change-this-to-a-long-random-token"
npm start
```

### macOS/Linux

```bash
DEVICE_TOKEN="change-this-to-a-long-random-token" npm start
```

## 4. Find the computer's local IP

The Android phone and the computer must be on the same Wi-Fi for local-network testing.

Example:

```text
192.168.1.100
```

Then the Android Companion API URL is:

```text
http://192.168.1.100:3000
```

Do not add `/api/device-sync` to the Android app's URL field; the app adds that endpoint itself.

## 5. Test from the computer

Open:

```text
http://localhost:3000/api/health
```

You should get JSON containing `"ok": true`.

Open:

```text
http://localhost:3000
```

to use Roman Personal OS.

## 6. Android Companion

Set:

API URL:
```text
http://YOUR-PC-IP:3000
```

Device token:
```text
roman-device-local
```

(or your custom `DEVICE_TOKEN`)

Then grant the requested Android permissions and tap **Connect & Sync**.

## Important

This API can receive sensitive device information such as notifications, call logs and SMS metadata/content if the companion sends them. Keep the server on a trusted network and use a strong token before exposing it beyond your local network.

# Roman-Personal-OS-API-Server
 4d61d541dd959e9709fc5ea6b0f06092953e8d80
