type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};


module.exports = {
  async redirects(): Promise<Redirect[]> {
    return [
      {
        source: '/@:username',
        destination: '/:username',
        permanent: true,
      },
    ];
  },
  reactStrictMode: false,
};
