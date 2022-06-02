'use strict';

const AWS = require("aws-sdk");
const zlib = require('zlib');
const DOC = require("dynamodb-doc");

AWS.config.update({ region: "us-west-1" });

const awsClient = AWS.DynamoDB();
const docClient = new DOC.DynamoDB(awsClient);

const S3 = new AWS.S3();

const pfunc = (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
}

const getLogEvents = (data, err) => {
  if (err == undefined) {
    zlib.gunzip(data.Body, (error, buff) => {
      if (error != null) {
        console.log(error)
      }
      else {
        const fileData = buff.toString('utf-8');
        const recordsArray = fileData.split("\n");

        for (let i = 0; i < recordsArray.length; i++) {
          const record = recordsArray[i];
          console.log("Inserting record: " + record);

          const params = {
            Item: record,
            TableName: "nm-dt-product-feed-dev"
          };
          docClient.putItem(params, pfunc);
        }
      }
    });
  } else {
    console.log(err, err.stack);
  }

  //Do final bus logic before exiting
}


exports.fullDataLoad = (event) => {

  S3.getObject({
    Bucket: 'bizdev-account-db-tables',
    Key: 's3://bizdev-account-db-tables/AWSDynamoDB/01654185216355-429eb4be/data/',
  }, (err, data) => {

    if (err) getLogEvents(null, err); // an error occurred
    else getLogEvents(data);       // successful response

  });
};