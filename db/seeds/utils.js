const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

// exports.formatTopicData = (topicData) => {
//   return topicData.map(({ slug, description, img_url}) => {
//     return { slug, description, img_url};
//   });
// };


