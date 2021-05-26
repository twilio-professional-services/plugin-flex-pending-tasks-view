module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */
  if (!config.externals) {
    config.externals = {};
  }

  // Didn't work
  /*
  const pluginConfig = {
    'Config': {
      queueTaskColumns: ['language', 'location'],
      queueWorkerColumns: ['language', 'location'],
      taskColumns: ['correlationId', 'examSessionId'],
      pollFrequencyInMillis: 30000 
    }
  };

  config.externals = {
    ...config.externals,
    pluginConfig
  };
  */
/*
  config.externals = {
    ...config.externals,
    ConfigData: {
      queueTaskColumns: ['language', 'location'],
      queueWorkerColumns: ['language', 'location'],
      taskColumns: ['correlationId', 'examSessionId'],
      pollFrequencyInMillis: 30000 
    }
  };
*/
  return config;
}
