import { S3 } from 'aws-sdk';

export default class StoragePersistenceService {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
      region: process.env.BUCKETEER_AWS_REGION
    });
  }

  async putObject(
    bucketName: string,
    key: string,
    data: Buffer
  ): Promise<S3.PutObjectOutput> {
    return new Promise((res, rej) => {
      this.s3.putObject(
        {
          Bucket: bucketName,
          Key: key,
          Body: data
        },
        (err, output) => {
          if (err) {
            rej(err);
          } else {
            res(output);
          }
        }
      );
    });
  }

  async getObject(bucketName: string, key: string): Promise<string> {
    return new Promise((res, rej) => {
      this.s3.getObject(
        {
          Bucket: bucketName,
          Key: key
        },
        (err, output) => {
          if (err) {
            rej(err);
          } else {
            if (output.Body) {
              res(output.Body.toString());
            } else {
              rej(new Error('No body in output'));
            }
          }
        }
      );
    });
  }
}
