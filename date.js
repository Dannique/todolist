//jshint esversion:6
exports.getDate =
function(){
  const today = new Date(); // complete date: Fri Nov 13 2020 20:26:52 GMT+0100 (GMT+01:00)

  const options = {
    weekday : "long",
    day : "numeric",
    month : "long",
  };

return today.toLocaleDateString('en-US', options);
};
