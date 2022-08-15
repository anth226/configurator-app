# Shopify Configurator App Server
This project is AWS Serverless project utilizing AWS Lambda, Api Gateway and DynamoDB managed services.

## Installation

Make sure you have Node.js v.12+ installed.

**Install Serverless globally**
For eaase of use it is recommended to install latest serverless package locally
```
npm install serverless -g
```
**Install dependencies**

In project root run:
```
npm install
```

## Update environment variables
Copy or rename .env.example to .env

Update the content to real values.
To get SHOPIFY_API_KEY and SHOPIFY_API_SECRET values, create a new developpment app through shopify partners portal:

https://partners.shopify.com/499853/apps?page=1


**NOTE:** SHOPIFY_NONCE can be any "url safe" random string. APP_TOKEN_SECRET can be any random string.

## Local development
To develop locally you need to install dynamodb locally in the infrastructure folder:
```
cd infrastructure
serverless dynamodb install
```

### Run locally
In project root run:
```
npm start
```

## Deployment
To deploy to AWS, make sure you have AWS credentials configured as follows:

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

To obtain the **aws_access_key_id** and **aws_secret_access_key** visit Woolman AWS management account.

**Stages**
AWS API Gateway uses a concept of stages. This stages are literally different stages of your api. By default we have the **dev** stage for development.

For production we plan to use versioned stages (stages act as API versions). Current production stage is **v1**. When ever we make breaking changes we can increment the stage number to offer support for older api stages and releasing something new to newer stages by incrementing the stage number.

To deploy To specific stage use the following command:

```
serverless deploy --stage dev
```


