# IoTwithGoogleScripts
## A google scripts standalone app that provides services to IoT devices.

Provided in this repo is the basic source for an example Google Scripts standalone app that can recive data from an IoT device.
The data is received through an http POST and logged into a google sheet. However, this could be expanded upon to include processing of the data and easy integration with other google services.

>Please note that google seems to require that the connection be eclusively https, so an https-compliant IoT device like an arduino YUN or an ESP8266 is recomended.
