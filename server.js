
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DEVICE_TOKEN = process.env.DEVICE_TOKEN || "roman-device-local";

const DATA_DIR = path.join(__dirname, "data");
const DEVICE_FILE = path.join(DATA_DIR, "device.json");

fs.mkdirSync(DATA_DIR, { recursive: true });


app.use(cors({
  origin: true,
  methods:["GET","POST","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization"]
}));

app.use(express.json({
  limit:"5mb"
}));


function loadDevice(){
  try{
    return JSON.parse(
      fs.readFileSync(DEVICE_FILE,"utf8")
    );
  }catch{
    return null;
  }
}


function saveDevice(data){

  fs.writeFileSync(
    DEVICE_FILE,
    JSON.stringify(data,null,2),
    "utf8"
  );

}


function authorized(req){

  const header =
    req.get("authorization") || "";

  const token =
    header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : "";

  return token === DEVICE_TOKEN;

}


function auth(req,res,next){

  if(!authorized(req)){

    return res.status(401).json({
      ok:false,
      error:"Unauthorized"
    });

  }

  next();

}



// Health

app.get("/api/health",(req,res)=>{

  res.json({
    ok:true,
    service:"Roman Personal OS API",
    time:Date.now()
  });

});




// Device data

app.get("/api/device",(req,res)=>{

  const device = loadDevice();

  if(!device){

    return res.status(404).json({
      ok:false,
      error:"No device sync"
    });

  }

  res.json(device);

});




// Notifications API  ✅

app.get("/api/notifications",(req,res)=>{

  const device = loadDevice();

  if(!device){

    return res.json([]);

  }

  res.json(
    device.notifications || []
  );

});




// Android sync

app.post("/api/device-sync",auth,(req,res)=>{


  const incoming = req.body || {};


  const device = {
  device: incoming.device || "Unknown",
  android: incoming.android || "",
  sdk: incoming.sdk || null,
  battery: incoming.battery ?? 0,
  location: incoming.location || null,
  usageAccess: Boolean(incoming.usageAccess),

  notifications: Array.isArray(incoming.notifications)
    ? incoming.notifications.slice(0,100)
    : [],

  calls: Array.isArray(incoming.calls)
    ? incoming.calls.slice(0,100)
    : [],

  sms: Array.isArray(incoming.sms)
    ? incoming.sms.slice(0,100)
    : [],

  timestamp: Date.now()
};


  saveDevice(device);


  console.log("=== NOTIFICATIONS ===");

  device.notifications.forEach((n,i)=>{

    console.log(
      `${i+1}. ${n.app || n.package} | ${n.title} | ${n.text}`
    );

  });


  console.log("====================");


  res.json({

    ok:true,

    notifications:
      device.notifications.length

  });


});




// Website

app.use(
 express.static(
  path.join(__dirname,"public")
 )
);


app.get("*",(req,res)=>{

 res.sendFile(
  path.join(
   __dirname,
   "public",
   "index.html"
  )
 );

});



app.listen(PORT,HOST,()=>{

 console.log("");
 console.log("Roman Personal OS API");
 console.log("Local: http://localhost:"+PORT);
 console.log("Token:",DEVICE_TOKEN);
 console.log("");

});
