/*
	Author: Matthew Bradley
	Modified: July 21, 2016
	
	A script to implement a simple sort of 'app' fromework for
	providing services to IoT devices capable of sending POST requests.
	Note that google typically requires HTTPS connections.
	
	I have found that in order for this to work, you have to set up the
	script as a standalone script, and allow it to run as you and allow
	anonymous users to use it (unless your IoT device is capable of
	logging in as a google user).
*/
//The url of your google script.
var scriptURL = "https://script.google.com/macros/s/edit_to_match_your_google_scripts_url/exec";

//The API key that must be included in a POST message
var APIKey = "<your API key here>";

//return an error message on a failed POST of the form Error.html
//This can potentially present a security risk, for example telling
//somone when the API key is wrong (which could then brute-force).
var showError = false;

//email you with a debug message when an error is caught in the script
var emailError = true;

//where to send debug messages when an error is caught
var debugEmail = "yourEmail@example.com";

//Return a page containing a testing form instead of the hello page.
var showDevPage = false;

//temperature logging 'app' settings
var loggingSheet = "docs.google.com/spreadsheets/d/edit_to_match_your_spreadsheet_url/edit"; //the URL of the spreadsheet
var loggingSheetPage = 0; //the sheet in the spreadsheet to log the data in (default is the first sheet)

var errorMessage = "No Error";

//Serve debug page on GET request
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//Process a received POST request
function doPost(e) {  
  var error = false;
  
  //processing returned post data
  if(e)
  {   
    if("parameter" in e)
    {
      if("key" in e.parameter)
      {
        if(e.parameter.key == APIKey)//don't care about strictly being the same type (ie numeric key)
        {
          if("app" in e.parameter)
          {
			//Send a message to the debug email notifying of a new POST received
            //sendNotification("New POST with key: " + e.parameter.key + "and app: " + e.parameter.app);
            
            if(e.parameter.app === "Temperature Logging") //basic demo 'app'
            {
              //Logs temperature and humidity data to a spreadsheet
              
              var spreadSheetURL = loggingSheet;//Logging Spread Sheet URL
              
              if(e.parameter.Temperature)
              {
                if(e.parameter.Humidity)
                {
                  var temperature = e.parameter.Temperature;
                  var humidity = e.parameter.Humidity;
              
                  var spreadSheet = SpreadsheetApp.openByUrl(spreadSheetURL);
                  if(spreadSheet)
                  {
                    var sheet = spreadSheet.getSheets()[loggingSheetPage];
                    if(sheet)
                    {
                      var now = new Date();
                      sheet.appendRow([now.toString(), temperature, humidity]);
					  
					  //optionally send a notification when data is logged
                      /*
                      sendNotification(
                        "Row added to SpreadSheet: " + spreadSheetURL
                        + "\n\rData:"
                        + "\n\r  Date: " + now.toString() + " (aprox)"
                        + "\n\r  Temperature: " + temperature
                        + "\n\r  Humidity: " + humidity
                      );
                      */
                    }
                    else
                    {
                      error = true;
                      errorMessage = "An error occured openeing the sheet in the spreadsheet.";
                      //showError = true;
                    }
                  }
                  else
                  {
                    error = true;
                    errorMessage = "Speadsheet could be opened: " + spreadSheetURL;
                    //showError = true;
                  }
                }
                else
                {
                  error = true;
                  errorMessage = "Humidity parameter not found.";
                  //showError = true;
                }
              }
              else
              {
                error = true;
                errorMessage = "Temperature parameter not found.";
                //showError = true;
              }
            }
            else
            {
              error = true;
              errorMessage = "Unrecognised app specified.";
              //showError = true;
            }

          }
          else
          {
            error = true;
            errorMessage = "No app specified.";
            //showError = true;
          }
        }
        else
        {
          error = true;
          errorMessage = "Wrong key provided: \"" + e.parameter.key + "\"";
          //showError = true;
        }
      }
      else
      {
        error = true;
        errorMessage = "No key provided.";
        //showError = true;
      }
    }
    else
    {
      error = true;
      errorMessage = "e.parameter does not exist.";
    }
  }
  else
  {
    error = true;
    errorMessage = "Event object 'e' is null.";
  }
  
  if(error)
  {
    //print error message to debug email
	if(emailError)
		sendErrorNotification(errorMessage);  
    
    //return error page
    if(showError)
      return HtmlService.createTemplateFromFile('Error').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
  
  //return the default config page
  if(showDevPage)
	return HtmlService.createTemplateFromFile('Index').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);

  return HtmlService.createTemplateFromFile('Hello').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//Email Error reporting Function
function sendErrorNotification(message) {
  var debugMessage;
  var msg1;
  var msg2;
  var msg3;
  
  if(message === null)
    msg1 = "true";
  else
    msg1 = "false";
  
  if(message === undefined)
    msg2 = "true";
  else
    msg2 = "false";
  
  if(!message)
    msg3 = "true";
  else
    msg3 = "false";
  
  if(!message)
  {
    debugMessage = "unknown error, caught issue with mesage: \"" + message + "\"\n\rAdditonally: [message === null: " + msg1 + ", message === undefined: " + msg2 + ", !message: " + msg3 + "]";
  }
  else
  {
    debugMessage = message;
  }
  
  MailApp.sendEmail(
    debugEmail,
    "MESSAGE from IoT Google Script",
    "ERROR MESSAGE: " + debugMessage
  );
}

//Email Message reporting Function (intended for general messages, not part of the email 'app')
function sendNotification(message) {
  var sendMessage;
  var msg1;
  var msg2;
  var msg3;
  
  if(message === null)//checking for isues with the error message itself
    msg1 = "true";
  else
    msg1 = "false";
  
  if(message === undefined)
    msg2 = "true";
  else
    msg2 = "false";
  
  if(!message)
    msg3 = "true";
  else
    msg3 = "false";
  
  if(!message)//if there is an issue, report it
  {
    sendMessage = "ERROR: caught issue with mesage: \"" + message + "\"\n\rAdditonally: [message === null: " + msg1 + ", message === undefined: " + msg2 + ", !message: " + msg3 + "]";
  }
  else
  {
    sendMessage = message;
  }
  
  MailApp.sendEmail(
    debugEmail,
    "MESSAGE from IoT Google Script",
    "MESSAGE: " + sendMessage
  );
}