const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require('./deploy.json');

async function checkAWSCLI() {
  const AWS_CLI_INSTALLED = 'aws-cli/';

  const { stdout, stderr } = await exec('aws --version');
  return stdout.includes(AWS_CLI_INSTALLED) && !stderr;
}

async function prepareBucket(bucket, profile, region) {
  try {
    await exec(
      `aws s3api create-bucket --acl public-read --bucket ${bucket} --create-bucket-configuration LocationConstraint=${region} --profile ${profile}`
    );
    console.log('Bucket created. Generating a bucket policy .. \n');
    await exec(
      `aws s3api put-bucket-policy --bucket ${bucket} --profile ${profile} --policy file://${__dirname}/bucketPolicy.json`
    );
    console.log('Creating Static website hosting for the bucket ..\n');
    await exec(
      `aws s3 website s3://${bucket}/ --index-document index.html --error-document error.html --profile ${profile}`
    );
    return true;
  } catch (e) {
    console.log('Error ', e);
    process.exit();
  }
}

async function createBucket(bucket, profile, region) {
  try {
    await exec(
      `aws s3 ls s3://${bucket} --profile ${profile} --region ${region}`
    );
    return true;
  } catch (e) {
    console.log('Specified bucket not found. Creating a new bucket ..\n');
    await prepareBucket(bucket, profile, region);
    return true;
  }
}

async function uploadFilesToS3(bucket, profile, localFolder) {
  try {
    await exec(
      `aws s3 sync ${localFolder} s3://${bucket}/ --delete --profile ${profile}`
    );
    return true;
  } catch (e) {
    console.log('Failed to upload files to s3: ', e);
    process.exit();
  }
}

async function invalidateCache(id, profile) {
  try {
    const { stdout } = await exec(
      `aws cloudfront create-invalidation --distribution-id ${id} --paths "/*" --profile ${profile}`
    );
    const invalidation = JSON.parse(stdout);
    await exec(
      `aws cloudfront wait invalidation-completed --distribution-id ${id} --id ${invalidation.Invalidation.Id} --profile ${profile}`
    );
    return true;
  } catch (e) {
    console.log('Failed to invalidate Cloudfront distribution cache: ', e);
    process.exit();
  }
}

async function createCloudfrontDistribution(profile) {
  try {
    const { stdout } = await exec(
      `aws cloudfront create-distribution --distribution-config file://${__dirname}/distributionConfig.json  --profile ${profile}`
    );
    const distribution = JSON.parse(stdout);
    await exec(
      `aws cloudfront wait distribution-deployed --id ${distribution.Distribution.Id} --profile ${profile}`
    );
    return distribution.Distribution.DomainName;
  } catch (e) {
    console.log('Failed to create Cloudfront distribution: ', e);
    process.exit();
  }
}

async function createCacheInvalidation(profile, bucketName) {
  try {
    const { stdout } = await exec(
      `aws cloudfront list-distributions --profile ${profile}`
    );
    const json = JSON.parse(stdout);
    const existingDistribution = json.DistributionList.Items.find((item) =>
      item.DefaultCacheBehavior.TargetOriginId.includes(bucketName)
    );

    if (existingDistribution) {
      console.log(
        'Existing Cloudfront distribution found. Staring Cache invalidation.'
      );
      console.log('Operation might take a while. Please wait ..\n');
      await invalidateCache(existingDistribution.Id, profile);
      return existingDistribution.DomainName;
    }

    console.log(
      'No previous Cloudfront distribution found. Creating a distribution ..'
    );
    console.log('Operation might take a while. Please wait ..\n');
    const domainName = await createCloudfrontDistribution(profile);
    return domainName;
  } catch (e) {
    console.log('Failed to create cache invalidation: ', e);
    process.exit();
  }
}

async function deploy() {
  const AWS_CLI_INSTALL_LINK =
    'https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html';
  let stage = 'dev';
  if (process.argv.length > 2 && process.argv[2] === 'prod') stage = 'prod';

  const awsCliInstalled = await checkAWSCLI();

  if (!awsCliInstalled) {
    console.log('No AWS CLI tool installed.');
    console.log(`Please install AWS CLI: ${AWS_CLI_INSTALL_LINK}\n`);
    process.exit();
  }
  console.log('AWS CLI installed. proceed with deployment ..\n');
  await createBucket(
    `${config.bucket}-${stage}`,
    config.profile,
    config.region
  );
  console.log('S3 Bucket found. Starting to upload files .. \n');
  await uploadFilesToS3(
    `${config.bucket}-${stage}`,
    config.profile,
    config.dist
  );
  console.log(
    'File upload complete. Creating Cloudfront Cache invalidation .. \n'
  );
  const url = await createCacheInvalidation(
    config.profile,
    `${config.distribution}-${stage}`
  );

  console.log('Deployment succesfully done. Your site is now deployed to:');
  console.log(`https://${url}\n`);
  process.exit();
}
deploy();
