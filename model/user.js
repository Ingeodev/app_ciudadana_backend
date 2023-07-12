const { User }  = require('./schema');

let createUser = (params) => {
  return new Promise((resolve, reject) => {
    User.create(params).then((userInfo) => {
      resolve(userInfo.dataValues);
    }).catch((error) => {
      console.log(error);
      reject(null);
    });
  });
};

module.exports = {
  createUser
};


