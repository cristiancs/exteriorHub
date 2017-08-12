

// Load Mongoose OS API
load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('ds18b20.js');


// Switchs

let bombaPiscinaPin = 16; // D0
let bombaTinajaPin = 5;  // D1
let luzInteriorPin = 4; // D2
let luzPatioPin = 0;  // D3
let Polaridad = 14; // D5
let GasPin = 13; // D7


GPIO.set_mode(bombaPiscinaPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(bombaTinajaPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(luzInteriorPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(luzPatioPin, GPIO.MODE_OUTPUT);



GPIO.set_mode(Polaridad, GPIO.MODE_INPUT);
GPIO.set_mode(GasPin, GPIO.MODE_INPUT);


GPIO.write(bombaPiscinaPin, 1);
GPIO.write(bombaTinajaPin, 1);
GPIO.write(luzInteriorPin, 1);
GPIO.write(luzPatioPin, 1);

function mensajes(conn, topic, msg){
  
  
  if(topic === "/exterior/bomba_piscina"){
    if(msg == "OFF"){
      GPIO.write(bombaPiscinaPin, 1);
    }
    else{
      GPIO.write(bombaPiscinaPin, 0);
    }

  }
  if(topic === "/exterior/bomba_tinaja"){
    if(msg == "OFF"){
      GPIO.write(bombaTinajaPin, 1);
    }
    else{
      GPIO.write(bombaTinajaPin, 0);
    }

  }
  if(topic === "/exterior/bomba_piscina"){
    if(msg == "OFF"){
      GPIO.write(bombaPiscinaPin, 1);
    }
    else{
      GPIO.write(bombaPiscinaPin, 0);
    }

  }
  if(topic === "/exterior/luz_patio"){
    if(msg == "OFF"){
      GPIO.write(luzPatioPin, 1);
    }
    else{
      GPIO.write(luzPatioPin, 0);
    }

  }
  if(topic === "/exterior/luz_interior"){
    if(msg == "OFF"){
      GPIO.write(luzInteriorPin, 1);
    }
    else{
      GPIO.write(luzInteriorPin, 0);
    }

  }


}


MQTT.sub("/exterior/bomba_piscina", mensajes, null);
MQTT.sub("/exterior/bomba_tinaja", mensajes, null);
MQTT.sub("/exterior/luz_patio", mensajes, null);
MQTT.sub("/exterior/luz_interior", mensajes, null);
MQTT.sub("/exterior/polaridad", mensajes, null);






// Termometros


// Number of sensors found on the 1-Wire bus
let n = 0;
// Sensors addresses
let rom = ['01234567'];

// Search for sensors
let searchSens = function() {
  let i = 0;
  // Setup the search to find the device type on the next call
  // to search() if it is present.
  ow.target_search(DEVICE_FAMILY.DS18B20);

  while (ow.search(rom[i], 0/* Normal search mode */) === 1) {
    // If no devices of the desired family are currently on the bus,
    // then another type will be found. We should check it.
    if (rom[i][0].charCodeAt(0) !== DEVICE_FAMILY.DS18B20) {
      break;
    }
    // Sensor found
    print('Sensor#', i, 'address:', toHexStr(rom[i]));
    rom[++i] = '01234567';
  }
  return i;
};




MQTT.sub("/exterior/temperatura_piscina/read", leerTermometros, null);
MQTT.sub("/exterior/temperatura_exterior/read", leerTermometros, null);
MQTT.sub("/exterior/temperatura_tinaja/read", leerTermometros, null);

function leerTermometros (conn, topic, msg) {
  if(msg === "READ"){
    if (n === 0) {
      if ((n = searchSens()) === 0) {
        print('No device found');
        return;
      }
    }
    if(topic === "/exterior/temperatura_piscina/read"){
      let t = getTemp(rom[0]);
      if (!isNaN(t)) {
        MQTT.pub('/exterior/temperatura_piscina', t, null)
      }
    }
    if(topic === "/exterior/temperatura_exterior/read"){
      let t = getTemp(rom[1]);
      if (!isNaN(t)) {
        MQTT.pub('/exterior/temperatura_exterior', t, null)
      }
    }
    if(topic === "/exterior/temperatura_tinaja/read"){
      let t = getTemp(rom[2]);
      if (!isNaN(t)) {
        MQTT.pub('/exterior/temperatura_tinaja', t, null)
      }
    }
  }
}