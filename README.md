# prgsbots
This repository contains code to write bots using Microsoft bot framework. This contains codes for three bots listed below:
* prgs_bot : answers to queries related to customer details and order details.
* warehouse_bot : answers to queries related to item sales.
* notification_bot : which triggers notification to the intended users based on some configuration

#How to run the examples
For the impatient you who would like to see things working before diving deep inside.
* Install nodejs
* Clone the [git repo] (https://github.com/officialdharam/prgsbots/)
* Each of the directories contain a textbot and a connector bot
* On your command prompt navigate to any of the text bot directory
* type : npm install and wait for successfull installation
* type : node <js filename>
* Now your bot is running, you can converse with it saying hi/hello etc

#Microsoft Bot Framework
The framework offers tools and services to build and connect intelligent bots through various messaging channels. Most of the connectivity and messaging infrastructure is already built in to the framework, yet it provides enough flexibility to write up your own logic on how to respond to the various Intents.

Refer to the [Bot Framework Documentation] (http://docs.botframework.com/)

The Framework provides integration to many messaging channels including slack, skype, FB messenger, webchat and directline (where you can write your own custom client).

You can view all possible messaging channel integration on the Bot details page.

#Getting Started
Below is the list of components or services you need to write your first real bot. A simple bot can just be created with the Microsoft Bot Framework. However, creating a real bot which can be used in context of businesses would require some coding at yoru end. 

## Step 1 - Getting acquainted with Microsoft Bot Framework
You need to have a microsoft account to register your bots and use the integration features of the framework. The framework is pretty intuitive and self guiding in how to proceed further. 

Here is the link to start with your first bot. [Developer Console] (https://dev.botframework.com/bots)

##Step 2 - Language Understanding Intelligent Services
This is the translator which understands multiple languages in their natural form and produces a formatted output which represents the Intent of the given sentence and the Entities on which the intent is targetted.

Of course it needs some training and it can be trained as per your requirements. LUIS is a separate service and you can [access it here] (https://www.luis.ai/)

You need to create an application here and train it based on your requirements. They have wonderful tutorials to get you started quickly. 

Once the application is created, you need to host it, Microsoft Azure provides easy hosting in few clicks and LUIS will guide you to do that. (You need an Azure account for this)

*Note:* You can use the Cortana prebuilt apps in case you are trying to write a personal assistant bot and hence you won't need specialized trainings.

##Step 3 - Writing your bot's brain
This is the piece where you actually require to code something. Once a user types in a sentence and LUIS resolves it into Intents and Entities then someone needs to define the actions/responses which needs to be taken based on the Intents. 

For e.g. If you ask the bot for the orders of customer ABC Corporation, then LUIS will resolve it into a possible Intent say GetOrderDetails and the Entity would be ABC Corporation. Fetching the actual order from some endpoint/datastore and serve it back to the user is what you do in this piece.

That precisely means that you can do the following here:
* Write the intent handlers here. 
* In case more information is requried to fulfil the intent, you would write the prompts here to ask for the required information. 
* Respond back to the user
* Manage information in sessions
* Make backend calls to data stores or endpoints

### Using Progress Modulus to host your bot
You can write the bot either in Node or C#. I chose to write in Node and hosted it on Modulus. To know more about node, please check out the [official website] (https://nodejs.org/en/)

Here is a link to [Progress Modulus] (https://my.modulus.io/)
Hosting a nodejs application on modulus is pretty easy as mentioned below:
* Create a modulus trial account
* Download the modulus CLI
* Write your node app (a JS file named app.js)
* Write a package.json file
* Use the CLI command to upload and start your project.

For more, refer to the [modulus docs] (https://help.modulus.io/)

Once you have hosted the bot on modulus or any other service (or your own public URL). You can link this URL to the Microsoft Bot Framework details page for your bot.

# Backend Service
This bot must answer queries based on some data stored at the backend service. In our case it reponds to the business users of an OE application. Hence, there has to be a backend hosted somewhere. 

I chose to use progress arcade to host the OE aplication as a rest service. The endpoint URL is used to make requests for queries from the Bot.

# Testing the Bot
It is good to test on dev system to skip the numerous deployment cycles. This can be done by using a Text Bot, this is essentially the same business logic with just one difference, the bot responds and interacts on command line. Also, you can use the node debugger tools with this bot.

This is good for initial level of testing. Once this is done, Microsoft Bot Framework provides an emulator, which works the same way as a messaging channel. 

You can provide the Bot's hosted URL and API Key corresponding to this bot (from the Microsoft Bot Framework) and test it in the Emulator which is a desktop client.

