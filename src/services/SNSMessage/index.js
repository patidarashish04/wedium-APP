const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const Message = require('../../dao/queries/model/messgae');

const sendMessage = async (req, res, next) => {
    try {
      var params = {
        PhoneNumber: req.query.phoneNumber,
        Message:  req.query.message
      };
      const response = await sns.publish(params).promise();

      const newMessage = new Message({ phoneNumber: params.PhoneNumber,message:params.Message });
       newMessage.save();

      console.log('Message sent successfully:', response.MessageId);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

module.exports = {
    sendMessage
  };