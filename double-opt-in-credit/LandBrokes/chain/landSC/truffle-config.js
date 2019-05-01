const rpcHost = process.env.RPC_HOST || "127.0.0.1";

module.exports = {

  networks: {

    development: {
      host: rpcHost,
      port: 8545,
      network_id: "*",
      from: "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1",
    }

  },

  mocha: {
    enableTimeouts: false
  },

  compilers: {
    solc: {
      version: "^0.4.23",
    },
  },

  solc: {
    optimizer: { // Turning on compiler optimization that removes some local variables during compilation
      enabled: true,
      runs: 200
    }
  }

};
