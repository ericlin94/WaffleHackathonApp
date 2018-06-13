module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on('push', context => {
  // Code was just pushed.
  		app.log('success pushed')
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
