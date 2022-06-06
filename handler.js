'use strict';

const AWS = require("aws-sdk");
const zlib = require('zlib');

AWS.config.update({ region: "us-west-2" });

const documentClient = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const S3 = new AWS.S3();

const unzipDataFromS3AndInsertIntoDynamodb = async (data, err) => {
  try {
    if (err == undefined) {
      zlib.gunzip(data.Body, async (error, buff) => {
        if (error != null) {
          console.log(error)
        } else {

          const fileData = buff.toString('utf-8');
          const recordsArray = fileData.split("\n");

          for (let i = 0; i < recordsArray.length; i++) {

            if (!recordsArray[i]) {
              continue;
            }

            const record = JSON.parse(recordsArray[i]);

            const params = {
              Item: record.Item,
              TableName: "nm-dt-product-feed-dev-replicate"
            };
            // documentClient.putItem(params, pfunc);
            await documentClient.putItem(params).promise();
          }
        }
      });
    } else {
      console.log(err, err.stack);
    }
  } catch (error) {
    console.log('Error while unzip data', error);
  }
}


exports.fullDataLoad = (event) => {

  try {
    let s3BucketKeys = [
      'AWSDynamoDB/01654185216355-429eb4be/data/lgfdcappiu2hlcbwopejneli5e.json.gz',
      'AWSDynamoDB/01654185216355-429eb4be/data/qqfz5cesdq2i5pxq74uw5kchru.json.gz',
      'AWSDynamoDB/01654185216355-429eb4be/data/s2sfacp6qq4tjkxbtyqdy6vbqi.json.gz',
      'AWSDynamoDB/01654185216355-429eb4be/data/unbuj6rhpa765oqk44tzx7g4eq.json.gz'
    ];

    s3BucketKeys.forEach(element => {
      S3.getObject({
        Bucket: 'bizdev-account-db-tables',
        Key: element
      }, (err, data) => {
        console.log(data, 'data from fullDataLoad');
        if (err) unzipDataFromS3AndInsertIntoDynamodb(null, err); // an error occurred
        else unzipDataFromS3AndInsertIntoDynamodb(data);       // successful response
      });
    });
    return true

  } catch (error) {
    console.log('Error while full data load', error);
  }
};