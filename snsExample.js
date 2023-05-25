const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const client = new SNSClient({ region: 'us-east-1' });

async function publishMessage() {
  const timestamp = Date.now().toString();
  const publishParams = {
    TopicArn: 'arn:aws:sns:us-east-1:689836355730:FirstSMS.fifo',
    Message: 'Hello from Ashish Kumar!',
    MessageGroupId: timestamp,
  };

  const publishCommand = new PublishCommand(publishParams);
  try {
    const data = await client.send(publishCommand);
    console.log('Message published successfully:', data.MessageId);
  } catch (err) {
    console.log('Error publishing message:', err);
  }
}

publishMessage();


// const params = {
//   Message: 'Hello from Ashish Patidar!',
//   TopicArn: 'arn:aws:sns:us-east-1:689836355730:FirstSMS.fifo',
// };

// sns.publish(params, (err, data) => {
//   if (err) {
//     console.log('Error publishing message:', err);
//   } else {
//     console.log('Message published successfully:', data.MessageId);
//   }
// });

// const publishParams = {
//   TopicArn: 'arn:aws:sns:us-east-1:689836355730:FirstSMS.fifo',
//   Message: 'Hello from Ashish Patidar!',
// };

// const publishCommand =  new PublishCommand(publishParams);
// try {
//   const data = await client.send(publishCommand);
//   console.log('Message published successfully:', data.MessageId);
// } catch (err) {
//   console.log('Error publishing message:', err);
// }


// {
//   "Version": "2012-10-17",
//   "Statement": [
//     {
//       "Effect": "Allow",
//       "Action": "sns:Publish",
//       "Resource": "arn:aws:sns:us-east-1:689836355730:FirstSMS.fifo"
//     }
//   ]
// }
