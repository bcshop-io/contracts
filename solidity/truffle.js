module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            gasPrice: 20000000000,
            gas:4712388,
            network_id: "999" // Match any network id
          }
    },
    solc: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
};
