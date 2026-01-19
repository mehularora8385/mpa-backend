const AWS = require('aws-sdk');

// Configure AWS SDK with credentials from environment
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize AWS services
const rekognition = new AWS.Rekognition({
  region: process.env.S3_REGION || process.env.AWS_REGION,
  apiVersion: '2016-06-27'
});

const s3 = new AWS.S3({
  region: process.env.S3_REGION || process.env.AWS_REGION,
  apiVersion: '2006-03-01'
});

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});

const sns = new AWS.SNS({
  region: process.env.AWS_REGION,
  apiVersion: '2010-03-31'
});

module.exports = {
  AWS,
  rekognition,
  s3,
  dynamodb,
  sns
};