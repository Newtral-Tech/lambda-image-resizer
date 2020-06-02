# lambda-image-resizer

A Lambda function that resizes an image and upload it to an S3 bucket. The bucket must previously
exist in order to work with this service.

The service export two endpoints:

- A `GET` endpoint that displays a form that allow us to upload an image
- A `POST` endpoint where an image can be uploaded

OpenApi specification for the `POST` endpoint can be found at [./openapi.yaml](./openapi.yaml)

## Deployment

### npm run deploy:dev

Build and deploy the AWS functions to the development stage

### npm run deploy:prod

Build and deploy the AWS functions to the production stage
