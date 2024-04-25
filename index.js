const diymodelsel = document.getElementById('diymodelsel');
const connectButton = document.getElementById('connectButton');
const bootButton = document.getElementById('bootButton');
const btprogressBar = document.getElementById('bootloaderprogress');
const btprogressBarLbl = document.getElementById('bootloaderprogresslbl');
const otaprogressBar = document.getElementById('otaprogress');
const otaprogressBarLbl = document.getElementById('otaprogresslbl');
const ptprogressBar = document.getElementById('partitiontableprogress');
const ptprogressBarLbl = document.getElementById('partitiontableprogresslbl');
const jadeprogressBar = document.getElementById('jadeprogress');
const jadeprogressBarLbl = document.getElementById('jadeprogresslbl');
const lbldiymodels = document.getElementById('lbldiymodels');

// import { Transport } from './cp210x-webusb.js'
import * as esptooljs from "./bundle.js";
const ESPLoader = esptooljs.ESPLoader;
const Transport = esptooljs.Transport;

let device = null;
let transport;
let chip = null;
let esploader;

const version = "fw0.1.48";

// Boot Button

bootButton.onclick = async () => {

  if (device === null) {
    device = await navigator.serial.requestPort({});
    transport = new Transport(device);
  }

  var baudrate = 921600;

  try {
    esploader = new ESPLoader(transport, baudrate, null);
    chip = await esploader.main_fn();
  } catch (e) {
    console.error(e);
    console.log("Failure");
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(true);

  const addressesAndFiles = [
        {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
        {address: '0x9000', fileName: 'partition-table.bin', progressBar: ptprogressBar},
        {address: '0xE000', fileName: 'ota_data_initial.bin', progressBar: otaprogressBar},
        {address: '0x10000', fileName: 'jade.bin', progressBar: jadeprogressBar},
    ];

  let fileArray = [];

  for (const item of addressesAndFiles) {

      console.log(`Address: ${item.address}, File Name: ${item.fileName}`);
      const response = await fetch("assets/" + version + "/" + diymodelsel.value + "/" + item.fileName);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fileBlob = await response.blob();
      const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsBinaryString(fileBlob);
      });
      fileArray.push({
          data: fileData,
          address: item.address
      });
  }
  try {
      await esploader.write_flash(
          fileArray,
          'keep',
          'keep',
          'keep',
          false,
          true,
          (fileIndex, written, total) => {
            addressesAndFiles[fileIndex].progressBar.value = (written / total) * 100;
          },
          null
      );
  } catch (e) {
      console.error(e);
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(true);
  document.getElementById("success").innerHTML = "Successfully flashed Jade DIY " + version.slice(2) + " on " + diymodelsel.options[diymodelsel.selectedIndex].text;
};

// Connect Button

connectButton.onclick = async () => {
  connectButton.style.display = 'none';
  lbldiymodels.style.display = 'none';
  diymodelsel.style.display = 'none';
  if (device === null) {
    device = await navigator.serial.requestPort({});
    transport = new Transport(device);
  }

  btprogressBar.style.display = 'block';
  otaprogressBar.style.display = 'block';
  ptprogressBar.style.display = 'block';
  jadeprogressBar.style.display = 'block';

  btprogressBarLbl.style.display = 'block';
  otaprogressBarLbl.style.display = 'block';
  ptprogressBarLbl.style.display = 'block';
  jadeprogressBarLbl.style.display = 'block';

  var baudrate = 921600;

  if (diymodelsel.value == "m5stickcplus") {
      baudrate = 115200;
  }

  try {
    esploader = new ESPLoader(transport, baudrate, null);
    chip = await esploader.main_fn();
  } catch (e) {
    console.error(e);
  }

  const addressesAndFiles = [
        {address: '0x1000', fileName: 'bootloader.bin', progressBar: btprogressBar},
        {address: '0x9000', fileName: 'partition-table.bin', progressBar: ptprogressBar},
        {address: '0xE000', fileName: 'ota_data_initial.bin', progressBar: otaprogressBar},
        {address: '0x10000', fileName: 'jade.bin', progressBar: jadeprogressBar},
    ];

  let fileArray = [];

  for (const item of addressesAndFiles) {

      console.log(`Address: ${item.address}, File Name: ${item.fileName}`);
      const response = await fetch("assets/" + version + "/" + diymodelsel.value + "/" + item.fileName);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fileBlob = await response.blob();
      const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsBinaryString(fileBlob);
      });
      fileArray.push({
          data: fileData,
          address: item.address
      });
  }
  try {
      await esploader.write_flash(
          fileArray,
          'keep',
          'keep',
          'keep',
          false,
          true,
          (fileIndex, written, total) => {
            addressesAndFiles[fileIndex].progressBar.value = (written / total) * 100;
          },
          null
      );
  } catch (e) {
      console.error(e);
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(false);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await transport.setDTR(true);
  document.getElementById("success").innerHTML = "Successfully flashed Jade DIY " + version.slice(2) + " on " + diymodelsel.options[diymodelsel.selectedIndex].text;
};


document.getElementById('jadediyversion').innerHTML = "Jade DIY TAG " + version.slice(2);
