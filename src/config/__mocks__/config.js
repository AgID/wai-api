const config = {
  matomo: {
    enabled: {
      test: {
        'API.test': 'RW',
        'API.testWrite': 'RW',
        'API.testRead': 'R',
      },
    },
    public: {
      test: {
        'API.testPublic': true,
      },
    },
  },
};

export default config;
