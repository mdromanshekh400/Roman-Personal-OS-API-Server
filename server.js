const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";


const DEVICE_TOKEN =
  process.env.DEVICE_TOKEN || "roman-device-local";


const DATA_DIR =
  path.join(__dirname, "data");


const DEVICE_FILE =
  path.join(DATA_DIR, "device.json");



fs.mkdirSync(DATA_DIR, {
  recursive:true
});



app.use(
  cors({
    origin:true
  })
);


app.use(
  express.json({
    limit:"5mb"
  })
);



function loadDevice(){

  try{

    return JSON.parse(
      fs.readFileSync(
        DEVICE_FILE,
        "utf8"
      )
    );

  }catch(e){

    return null;

  }

}



function saveDevice(data){

  fs.writeFileSync(
    DEVICE_FILE,
    JSON.stringify(
      data,
      null,
      2
    ),
    "utf8"
  );

}



function authorized(req){

  const header =
    req.get("authorization") || "";


  const token =
    header.startsWith("Bearer ")
    ?
    header.slice(7).trim()
    :
    "";


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





// SOCKET CONNECTION

io.on(
"connection",
socket=>{


 console.log(
 "Socket connected:",
 socket.id
 );


 const device =
 loadDevice();


 if(device){

   socket.emit(
    "device-update",
    device
   );

 }


});







// HEALTH

app.get(
"/api/health",
(req,res)=>{


res.json({

 ok:true,

 service:"Roman Personal OS API",

 time:Date.now()

});


});







// GET DEVICE

app.get(
"/api/device",
(req,res)=>{


const device =
loadDevice();


res.json(
 device || {}
);


});








// DEVICE SYNC FROM ANDROID

app.post(
"/api/device-sync",
auth,
(req,res)=>{


const incoming =
req.body || {};



const device={


device:
incoming.device ||
"Unknown device",



android:
incoming.android ||
"",



sdk:
incoming.sdk ?? null,



battery:
incoming.battery ?? null,



location:
incoming.location || null,



notifications:
Array.isArray(
incoming.notifications
)
?
incoming.notifications.slice(-100)
:
[],



calls:
Array.isArray(
incoming.calls
)
?
incoming.calls.slice(0,100)
:
[],



sms:
Array.isArray(
incoming.sms
)
?
incoming.sms.slice(0,100)
:
[],



online:true,


timestamp:
Date.now(),


lastSync:
Date.now()


};



saveDevice(device);



// REAL TIME UPDATE

io.emit(
"device-update",
device
);



console.log(
"Device updated"
);


res.json({

ok:true,

message:
"Sync received",

lastSync:
device.lastSync

});


});









// MANUAL UPDATE

app.post(
"/api/update",
auth,
(req,res)=>{


const updated={


...(loadDevice() || {}),


...req.body,


online:true,


lastSync:
Date.now()


};



saveDevice(updated);



io.emit(
"device-update",
updated
);



res.json({

ok:true,

lastSync:
updated.lastSync

});


});









// WEBSITE

app.use(
express.static(
path.join(
__dirname,
"public"
)
)
);






// FALLBACK

app.get(
"/*",
(req,res)=>{


if(
req.path.startsWith("/api/")
){

return res.sendStatus(404);

}



res.sendFile(

path.join(
__dirname,
"public",
"index.html"
)

);


});









server.listen(
PORT,
HOST,
()=>{


console.log(
`Roman Personal OS running on ${PORT}`
);


});
