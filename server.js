const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();


const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";


const DEVICE_TOKEN =
  process.env.DEVICE_TOKEN || "roman-device-local";


const DATA_DIR =
  path.join(__dirname, "data");


const DEVICE_FILE =
  path.join(DATA_DIR, "device.json");



fs.mkdirSync(
  DATA_DIR,
  {
    recursive: true
  }
);



app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);



app.use(
  express.json({
    limit: "5mb"
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

  }catch(error){

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
      ? header.slice(7).trim()
      : "";


  return token === DEVICE_TOKEN;

}




function auth(req,res,next){


  if(!authorized(req)){


    return res.status(401).json({

      ok:false,

      error:"Unauthorized",

      message:"Invalid device token"

    });


  }


  next();


}




// Health check

app.get("/api/health",(req,res)=>{


  res.json({

    ok:true,

    service:"Roman Personal OS API",

    time:Date.now()

  });


});





// Get current device data

app.get("/api/device",(req,res)=>{


  const device =
    loadDevice();



  if(!device){


    return res.status(404).json({

      ok:false,

      error:"No device data"

    });


  }



  res.json(device);



});






// Get notifications only

app.get("/api/notifications",(req,res)=>{


  const device =
    loadDevice();



  if(!device){


    return res.json([]);


  }



  res.json(

    device.notifications || []

  );


});
 
// Receive device sync from Android

app.post(
  "/api/device-sync",
  auth,
  (req,res)=>{


    const incoming =
      req.body || {};



    const device = {


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



      online:
        true,



      lastSync:
        Date.now()

    };




    saveDevice(device);



    console.log(
      "Device sync received"
    );


    console.log(
      "Battery:",
      device.battery
    );


    console.log(
      "Notifications:",
      device.notifications.length
    );



    res.json({

      ok:true,

      message:
        "Device sync received",


      lastSync:
        device.lastSync


    });



  }

);






// Direct update API

app.post(
  "/api/update",
  auth,
  (req,res)=>{


    const old =
      loadDevice() || {};



    const updated = {


      ...old,


      ...req.body,



      online:
        true,



      lastSync:
        Date.now()


    };



    saveDevice(updated);



    res.json({

      ok:true,

      message:
        "Direct update successful",


      lastSync:
        updated.lastSync


    });


  }

);
 
// Website files

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);





// Website fallback

app.get(
  "*",
  (req,res,next)=>{


    if(
      req.path.startsWith("/api/")
    ){

      return next();

    }



    res.sendFile(

      path.join(
        __dirname,
        "public",
        "index.html"
      )

    );


  }

);






// Error handler

app.use(
  (err,req,res,next)=>{


    console.error(err);



    res.status(500).json({

      ok:false,

      error:
        "Internal server error"

    });



  }

);







// Start server

app.listen(
  PORT,
  HOST,
  ()=>{


    console.log(
      "Roman Personal OS API"
    );


    console.log(
      `Running on port ${PORT}`
    );


  }

);
