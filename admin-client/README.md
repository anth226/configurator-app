# Shopify Configurator App Admin Client
This project is a Shopify Admin client application. It uses Shopify Polaris components for UI components.

## Installation

Make sure you have Node.js v.12+ installed.

**Install dependencies**

In project root run:
```
npm install
```

## Update environment variables
Copy or rename .env.example to .env

Update the content to real values.

REACT_APP_API_HOST should usually point to a ngrok https tunnel exposing your local backend server

## Local development
Run the client locally:
```
npm start
```

Create a ngrok tunnel pointing to your local client running (localhost:8080 by default)

## Deployment
To deploy admin-client to AWS you need to have aws-cli tool installed. The deployment will halt and instruct you to setup aws-cli tools if they are not installed in your system.

Same installation instructions are found at:

https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

Also make sure you have AWS credentials configured as follows:

Depending on your Os the aws credentials maybe stored differently. But on unix based systems you will need to create a **.aws** folder in your home directory and store your aws credentials there:

```
mkdir ~/.aws
nano ~/.aws/credentials
```

Add the following content to the **credentials** file:

```
[configurator]
aws_access_key_id=XXX
aws_secret_access_key=YYY
```

Deployment uses **deploy.json** options for deployment.

**IMPORTANT** in deploy.json the  profile need to match the aws credentials profile setup.

Deployment also uses **bucketPolicy.json** and **distributionConfig.json** settings during the deployment. These are already preconfigured son only change them if you know what you are doing and there is a specific need for changes.

To deploy to AWS (for development), simply use the following command:

```
npm run deploy
```

To deploy in production use:

```
npm run deploy prod
```

This will build your React app ready for production and then runs deploy.js npm script. This makes sure all needed AWS resources are st up correctly. The deployment script will return with an URL where your frontend is hosted after deployment.



