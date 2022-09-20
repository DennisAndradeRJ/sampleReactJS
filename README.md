````
:warning: DISCLAIMER: This code is provided to you expressly as an example ("Sample Code"). It is the responsibility of the individual recipient user, in his/her sole discretion, to diligence such Sample Code for accuracy, completeness, security, and final determination for appropriateness of use.
ANY SAMPLE CODE IS PROVIDED ON AN "AS IS" IS BASIS, WITHOUT WARRANTY OF ANY KIND. FORGEROCK AND ITS LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
FORGEROCK SHALL NOT HAVE ANY LIABILITY ARISING OUT OF OR RELATING TO ANY USE, IMPLEMENTATION, INTEGRATION, OR CONFIGURATION OF ANY SAMPLE CODE IN ANY PRODUCTION ENVIRONMENT OR FOR ANY COMMERCIAL DEPLOYMENT(S).
````
# Getting Started with the sample ReactJS app

This sample ReactJS app demonstrates how to leverage the ForgeRock platform to register a new user and to login with an existing user without a password. The user will enter the email address, an email will be sent to the the user's inbox and the user will complete their registration or login process by clicking on the link.

## Pre-requisites to run this sample

Those are the pre-requisites to run this sample

### ForgeRock Platform Setup

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

### SMTP server

Make sure you have an SMTP server available so ForgeRock can send email to the users. I used [MailHog] in my lab for testing purposes.

## Running the sample

- Clone the [repo]
- Change the ForgeRock base URL to point to your ForgeRock platform server in `src/api/forgerockApi.js`
```sh
 baseURL: 'https://iam.example.com/am'
```
- Make sure the journey's name are configured as `RegisterEmail` and `LoginEmail`. If you have configured with a different name, you will have to change the constants in the following files: `src/Login.js` and `src/Register.js`
- On the root directory of this sample app, run the following command to start the development server:
```sh
 npm start
```
- In a browser, navigate to `http://localhost:3000/login`

[email for self-service]: <https://backstage.forgerock.com/docs/platform/7.2/platform-self-service/platform-configuration.html#email>
[MailHog]: <https://github.com/mailhog/MailHog>
[repo]: <https://github.com/DennisAndradeRJ/sampleReactJS>