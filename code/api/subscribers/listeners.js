const UserService = require('../services/userService');
const mailgun = require('mailgun-js');

const DOMAIN = 'sandbox89bc353640294424bca16e4f2c621cf5.mailgun.org';
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: DOMAIN
});

console.log(process.env.MAILGUN_API_KEY);
/**
 * @returns {undefined}
 * @param {object} socket socket instance
 */
const leaderBoardUpdate = async socket => {
  console.log('hit');
  // TODO websocket payload update to all connected users
  try {
    const { arrLeaderboardData, bSuccess } = await UserService.leaderBoard();
    if (bSuccess)
      socket.emit('leaderboard', arrLeaderboardData) &&
        console.log('emited', arrLeaderboardData);
  } catch (err) {
    console.log('Failed to emit leaderboard', err);
  }
};

/**
 * @param {string} strEmail email address to send to
 * @returns {undefined}
 */
const sendWelcomeEmail = async strEmail => {
  console.log('USER SIGNED UP', strEmail);
  const data = {
    from:
      'Mailgun Sandbox postmaster@sandbox89bc353640294424bca16e4f2c621cf5.mailgun.org',
    to: 'anisiarazvan@gmail.com',
    subject: 'Welcome to TodoApp 😀',
    html:
      'Thank you for signing up with out productivity service. Please active your account by clicking <a href="http://localhost:3000">Link</a>'
  };
  mg.messages().send(data, (error, body) => {
    console.log(body);
    console.log(error);
  });
};

exports.leaderBoardUpdate = leaderBoardUpdate;
exports.sendWelcomeEmail = sendWelcomeEmail;
