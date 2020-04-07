const UserService = require('../services/userService');

/**
 * @returns {undefined}
 * @param socket
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

exports.leaderBoardUpdate = leaderBoardUpdate;
