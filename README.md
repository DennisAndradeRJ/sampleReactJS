````
DISCLAIMER: This code is provided to you expressly as an example ("Sample Code"). It is the responsibility of the individual recipient user, in his/her sole discretion, to diligence such Sample Code for accuracy, completeness, security, and final determination for appropriateness of use.
ANY SAMPLE CODE IS PROVIDED ON AN "AS IS" IS BASIS, WITHOUT WARRANTY OF ANY KIND. FORGEROCK AND ITS LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
FORGEROCK SHALL NOT HAVE ANY LIABILITY ARISING OUT OF OR RELATING TO ANY USE, IMPLEMENTATION, INTEGRATION, OR CONFIGURATION OF ANY SAMPLE CODE IN ANY PRODUCTION ENVIRONMENT OR FOR ANY COMMERCIAL DEPLOYMENT(S).
````
# Getting Started with the sample ReactJS app

This sample ReactJS app demonstrates how to leverage the ForgeRock platform to register a new user and to login with an existing user without a password. The user will enter the email address, an email will be sent to the the user's inbox and the user will complete their registration or login process by clicking on the link.

## Pre-requisites to run this sample

Those are the pre-requisites to run this sample

### ForgeRock Platform Setup

If you are running this sample using the ForgeRock Platform, follow the steps below to set it up properly:

- Configure [email for self-service]
- Configure a `Decision node script for authentication trees` like the following:
```
var objectAttributes = sharedState.get("objectAttributes");
var mail = sharedState.get("objectAttributes").get("mail");
var username = sharedState.get("objectAttributes").get("mail");
var id = sharedState.get("objectAttributes").get("_id");
objectAttributes.put("mail",mail);
objectAttributes.put("userName",username);
objectAttributes.put("sn"," ");
objectAttributes.put("givenName"," ");
sharedState.put("username",mail);
sharedState.put("objectAttributes",objectAttributes);
outcome = "true";
``` 
- Create a new email template called `Login` and change the fields as you desire. This is the text that will be sent in the subject and body of the email sent to the user

- Configure the `LoginEmail` journey:

![LoginEmail](https://github.com/DennisAndradeRJ/sampleReactJS/blob/main/src/images/LoginEmail.png "LoginEmail")

Set the `Attributes to Collect` and `Identity Attribute` fields in `attribute collector node` to `mail`
Set the `Email Template Name` in the `Email Suspend Node` to the newly created template `login`. note the lower case `l` in the same. It didn't work for me when I set the make as `Login`
Set the `Identifier` and `Identity Attribute` fields in the `Identify Existing User` to `mail`

- Configure the `RegisterEmail` journey:

![RegisterEmail](https://github.com/DennisAndradeRJ/sampleReactJS/blob/main/src/images/RegisterEmail.png "RegisterEmail")

Set the `Attributes to Collect` to `mail`, and `Identity Attribute` to `userName` and check the `All Attributes Required` field in `attribute collector node`
Set the `Scripted Decision node` to the script created in the step above. And the `Outcomes` to `true`
Leave all other nodes unchanged

- Open the AM native admin console and navigate to `Authentication -> Settings -> General -> External Login Page URL` and set this field to `http://localhost:3000/journeywebservice`. This is the base URL that ForgeRock will use to build the link in the email.

### ForgeRock AM/IDM standalone Setup

If you are running this sample using the AM / IDM standalone servers, we will be using IDM to register a new user and AM to login. We will leverage IDM to send emails to the users with the magic link. Follow the steps below to set it up properly:

#### User Registration in IDM

- Configure [email for self-service in IDM]
- Configure IDM mappings and reconciliation so the users created in IDM are synchronized automatically with the AM user store.
- Enable `User Registration` in IDM by navigating to the `Configure` menu, `USER REGISTRATION`. In the `Options` tab, enable `Email Validation` only. Click in the pen icon to edit the email template. Set the `Email Verification Link` to `http://localhost:3000/idmwebservice/?react=fr` where localhost is the hostname of your react app. You can also change the `Email from` and `Email Message` as needed.

#### User Login in AM

The `Email Suspend Node` is not available to use without the platform so we need to manually create the Magic Link and also leverage IDM email services to send the email to the customer. We have created two trees to accomplish the "tree suspension" functionality:

- InitMagicLink tree: This is the first tree that will generate the token, store it in the user profile and send the magic link to the user.
- CheckMagicLink tree: This tree is called once the user clicks on the magic link in their email. It will collect the username and the token, checks if it's valid, grant access or not, remove the token from the user profile.

Here is the configuration:

- Create a new script called `GenerateMagicToken` of type `Decision node script for authentication trees`. This script will generate a magic token:
```
function magicToken() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random()*16|0;
    var v = r;
    return v.toString(16);
  });
}
var magicLink = {};
magicLink.magicToken = magicToken();
magicLink.date = new Date().toJSON();
var magicLinkString = JSON.stringify(magicLink);
sharedState.put("magicToken",magicLink.magicToken);
sharedState.put("magicLink",encodeURI(magicLinkString));
outcome = "true";
``` 
- Create a new script called `SetRequiredAttributes` of type `Decision node script for authentication trees`. This script will set the `mail` attribute to the username the user entered and put it into the sharedState so we can use it later in the tree:
``` 
var mail = sharedState.get("username");
sharedState.put("mail",mail);
outcome = "true";
```
- Create a new script called `emailToUsername` of type `Decision node script for authentication trees`. This script will take the user's input for email address and try to match a user. This is the equivalent to the `Identify existing user` node in the platform setup.

``` 
var restBody = "{}";
// Get a token for amadmin to search for the end-user
var uriAM = String('http://am.example.com:8080/am/json/realms/root/authenticate');
var request = new org.forgerock.http.protocol.Request();
request.setMethod('POST');
request.setUri(encodeURI(uriAM));
request.getHeaders().add("X-OpenAM-Username","amadmin");
request.getHeaders().add("X-OpenAM-Password", "Password#1");
request.getHeaders().add("content-type","application/json");
request.getHeaders().add("Accept-API-Version","resource=2.0, protocol=1.0");
request.getEntity().setString(restBody);
var response = httpClient.send(request).get();
var jsonResult = JSON.parse(response.getEntity().getString());
// Checks if user exists in Data Store and retrieve username
var uriAMInfo = String('http://am.example.com:8080/am/json/realms/root/users?_queryFilter=mail+eq+\"' + sharedState.get("mail") + '\"&_fields=username');
var requestInfo = new org.forgerock.http.protocol.Request();
requestInfo.setMethod('GET');
requestInfo.setUri(encodeURI(uriAMInfo));
requestInfo.getHeaders().add("iPlanetDirectoryPro",jsonResult["tokenId"]);
requestInfo.getEntity().setString(restBody);
var responseInfo = httpClient.send(requestInfo).get();
var jsonResultInfo = JSON.parse(responseInfo.getEntity().getString());
if (jsonResultInfo["resultCount"] == 0) {
  action = org.forgerock.openam.auth.node.api.Action.goTo("false").withErrorMessage("Account does not exist").build()
} else if (jsonResultInfo["result"][0]["username"] != null){
  sharedState.put("username",jsonResultInfo["result"][0]["username"]);
  outcome = "true";
}else {
  outcome = "false";
}
```

- Create a new script called `SaveMagicToken` of type `Decision node script for authentication trees`. This script will save the Magic token to the user's profile. I have picked the `description` attribute to save the user's token but in a production environment you would use an attribute with a meaningful name to store it.
```
var mail = sharedState.get("mail");
var magicLink = sharedState.get ("magicLink");
idRepository.setAttribute(mail, "description", [magicLink]);

outcome = "true"
```
- Create a new script called `SendEmailViaIDM` of type `Decision node script for authentication trees`. This script will send an email to the user with the magic link in it via IDM email services.
```
var idmEndpoint = "http://idm.example.com:8080/openidm/external/email?_action=send";

var config = {
    nodeName: "***InitMagicLink"
};

var NodeOutcome = {
    PASS: "sent",
    FAIL: "noMail",
    ERROR: "error"
};

function logResponse(response) {
    logger.message(config.nodeName + ": Scripted Node HTTP Response: " + response.getStatus() + ", Body: " + response.getEntity().getString());
}
var mail = sharedState.get("mail");
var magicLink = sharedState.get ("magicLink");
var magicToken = sharedState.get ("magicToken");
var response;

try {
    var request = new org.forgerock.http.protocol.Request();
    var requestBodyJson = {
        "from": "admin@example.com",
        "to": mail,
        "subject": "Your Login With a Magic Link",
        "body": "Click on this link to authenticate: http://localhost:3000/treewebservice/?token=" + magicToken + "&username=" + mail
    };
  request.setMethod('POST');
  request.setUri(idmEndpoint);
  request.getHeaders().add("X-OpenIDM-Username","openidm-admin");
  request.getHeaders().add("X-OpenIDM-Password", "openidm-admin");        
  request.getHeaders().add("Content-Type", "application/json");
  request.setEntity(requestBodyJson);
  response = httpClient.send(request).get();
}
catch (e) {
  logger.error(config.nodeName + ": Unable to call IDM Email endpoint. Exception: " + e);
  action = org.forgerock.openam.auth.node.api.Action.goTo(NodeOutcome.ERROR).withErrorMessage("Unable to call IDM Email endpoint").build();
}
logResponse(response);

if (response.getStatus().getCode() === 200) {
  logger.message(config.nodeName + ": Email sent for user: " + mail);
  action = org.forgerock.openam.auth.node.api.Action.goTo(NodeOutcome.PASS).withErrorMessage("An email was sent to your inbox. Click on the link to login").build();
}
else if (response.getStatus().getCode() === 404) {
  logger.error(config.nodeName + " IDM Email endpoint not found. HTTP Result: " + response.getStatus() + " for idmEndpoint: " + idmEndpoint);
  action = org.forgerock.openam.auth.node.api.Action.goTo(NodeOutcome.ERROR).withErrorMessage("Error sending email: 404 not found").build();
} else {
   //Catch all error 
   logger.error(config.nodeName + ": HTTP 5xx or Unknown error occurred. HTTP Result: " + response.getStatus());
   action = org.forgerock.openam.auth.node.api.Action.goTo(NodeOutcome.ERROR).withErrorMessage("Server error occurred!").build();
}
```
Note that `idmEndpoint` is the url for the IDM server. And the `body` of the `requestBodyJson` has a link to the callback url for our react app. Also make sure you update the headers with the correct IDM admin credentials.

- Configure the `InitMagicLink` tree:

![InitMagicLink](https://github.com/DennisAndradeRJ/sampleReactJS/blob/main/src/images/InitMagicLink.png "InitMagicLink")

- Create a new script called `getUsernameAndToken` of type `Decision node script for authentication trees`. This script will parse the URI from the link clicked by the user to get the username and the token.

```
var tokenId = requestParameters.get("token").get(0);
var username = requestParameters.get("username").get(0);

if (username != null && tokenId != null){
  sharedState.put("username",username);
  sharedState.put("token",tokenId);
  outcome = "true";
} else {
  outcome="false"
}
``` 
- Create a new script called `checkMagicLink` of type `Decision node script for authentication trees`. This script will check if the user exists in the User store and validates the token stored with the one sent by the user in the link. 
```
var restBody = "{}";
// Get a token for amadmin to search for the end-user
var uriAM = String('http://am.example.com:8080/am/json/realms/root/authenticate');
var request = new org.forgerock.http.protocol.Request();
request.setMethod('POST');
request.setUri(encodeURI(uriAM));
request.getHeaders().add("X-OpenAM-Username","amadmin");
request.getHeaders().add("X-OpenAM-Password", "Password#1");
request.getHeaders().add("content-type","application/json");
request.getHeaders().add("Accept-API-Version","resource=2.0, protocol=1.0");
request.getEntity().setString(restBody);
var response = httpClient.send(request).get();
var jsonResult = JSON.parse(response.getEntity().getString());
// Checks if user exists in Data Store and retrieve the MagicToken
var uriAMInfo = String('http://am.example.com:8080/am/json/realms/root/users?_queryFilter=uid+eq+\"' + sharedState.get("username") + '\"&_fields=description');
var requestInfo = new org.forgerock.http.protocol.Request();
requestInfo.setMethod('GET');
requestInfo.setUri(encodeURI(uriAMInfo));
requestInfo.getHeaders().add("iPlanetDirectoryPro",jsonResult["tokenId"]);
requestInfo.getEntity().setString(restBody);
var responseInfo = httpClient.send(requestInfo).get();
var jsonResultInfo = JSON.parse(responseInfo.getEntity().getString());
var jsonMagicToken = JSON.parse(decodeURI(jsonResultInfo["result"][0]["description"]));

var magicToken = jsonMagicToken.magicToken;
var tokenDate = jsonMagicToken.date;

if (magicToken==sharedState.get("token")){
  var now = new Date();
  var Difference_In_Time = now.getTime() - (new Date(tokenDate)).getTime();
  if (Math.round(Difference_In_Time/(1000 * 60)) < 5){
  //If the user uses the link before 5 minutes we remove the magic
    uriAMInfo = String('http://am.example.com:8080/am/json/realms/root/users/' + sharedState.get("username"));
    requestInfo = new org.forgerock.http.protocol.Request();
    requestInfo.setMethod('PUT');
    requestInfo.setUri(encodeURI(uriAMInfo));
    requestInfo.getHeaders()
       .add("iPlanetDirectoryPro",jsonResult["tokenId"]);
    requestInfo.getHeaders()
       .add("Accept-API-Version","resource=2.0, protocol=1.0");
    requestInfo.getHeaders()
       .add("Content-Type","application/json");
    requestInfo.getEntity()
       .setString(JSON.stringify({"description":" "}));
    responseInfo = httpClient.send(requestInfo).get();
    

    outcome = "true";
  } else {
    outcome = "false";
  }
} else {
  outcome = "false";
}
``` 
- Configure the `CheckMagicLink` tree.

![CheckMagicLink](https://github.com/DennisAndradeRJ/sampleReactJS/blob/main/src/images/CheckMagicLink.png "CheckMagicLink")

- Make sure cors is setup properly in AM by adding the react app's URL to your cors configuration under `Configure -> global Services -> CORS Service -> Secondary Configurations`.


### SMTP server

Make sure you have an SMTP server available so ForgeRock can send email to the users. I used [MailHog] in my lab for testing purposes.

## Running the sample

- Clone the [repo]
- Change the ForgeRock base URL to point to your ForgeRock platform server in `src/api/forgerockApi.js`
```sh
 baseURL: 'https://iam.example.com/am'
```
- Make sure the name of the journeys are configured as `RegisterEmail` and `LoginEmail`. If you have configured with a different name, you will have to change the constants in the following files: `src/PlatformLogin.js` and `src/PlatformRegister.js`. If you are running a stadalone AM / IDM, make sure the name of the trees are set as follows: `InitMagicLink` and `CheckMagicLink`. If you have configured with a different name, you will have to change the constants in the following files: `src/AMLogin.js` and `src/TreeWebService.js`.
- Change the URLs from the files under the `src/api` directory to point to the correct server.
- On the root directory of this sample app, run the following command to start the development server:
```sh
 npm start
```
- In a browser, navigate to `http://localhost:3000/`

[email for self-service]: <https://backstage.forgerock.com/docs/platform/7.2/platform-self-service/platform-configuration.html#email>
[MailHog]: <https://github.com/mailhog/MailHog>
[repo]: <https://github.com/DennisAndradeRJ/sampleReactJS>
[email for self-service in IDM]: <https://backstage.forgerock.com/docs/idm/7.2.1/self-service-reference/uss-email-registration.html>