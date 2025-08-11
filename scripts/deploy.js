const { ethers, run } = require("hardhat");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");

// Deployment configuration
const config = {
  contractName: process.env.CONTRACT_NAME || "SimpleNFT",
  name: process.env.NFT_NAME || "Nexus NFT Collection",
  symbol: process.env.NFT_SYMBOL || "NNFT",
  baseUri: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/metadata/`
    : undefined,
  initialOwner: undefined, // Set dynamically
  mint: {
    count: parseInt(process.env.MINT_COUNT) || 1,
    recipient: process.env.MINT_RECIPIENT, // Optional: defaults to deployer
  },
  allowedNetworks: process.env.ALLOWED_NETWORKS
    ? process.env.ALLOWED_NETWORKS.split(",")
    : ["sepolia", "localhost", "hardhat"],
  gasOptions: {
    gasLimit: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : undefined,
    gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : undefined,
  },
  autoVerify: process.env.AUTO_VERIFY === "true",
  dryRun: process.env.DRY_RUN === "true",
};

async function main() {
  try {
    console.log("Starting SimpleNFT deployment...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    config.initialOwner = config.initialOwner || deployer.address;

    // Validate configuration
    if (!config.baseUri) {
      throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
    }
    if (!config.baseUri.match(/^https?:\/\//)) {
      throw new Error(`Invalid NEXT_PUBLIC_API_URL: ${config.baseUri} (must be a valid URL)`);
    }

    // Validate network
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;
    if (!config.allowedNetworks.includes(networkName)) {
      throw new Error(
        `Deployment not allowed on network: ${networkName}. Allowed networks: ${config.allowedNetworks.join(", ")}`
      );
    }
    console.log("Network:", networkName);

    // Get contract factory
    const SimpleNFT = await ethers.getContractFactory(config.contractName);
    console.log("Contract factory initialized:", config.contractName);

    // Estimate gas for deployment
    const deploymentArgs = [
      config.name,
      config.symbol,
      config.baseUri,
      config.initialOwner,
    ];
    const estimatedGas = await SimpleNFT.signer.estimateGas(
      SimpleNFT.getDeployTransaction(...deploymentArgs)
    );
    console.log(`Estimated gas for deployment: ${estimatedGas.toString()}`);

    // Dry run mode
    if (config.dryRun) {
      console.log("Dry run mode: Simulating deployment only");
      console.log("Deployment arguments:", deploymentArgs);
      console.log("Deployment would succeed with estimated gas:", estimatedGas.toString());
      return;
    }

    // Deploy contract
    console.log("Deploying contract with arguments:", deploymentArgs);
    const nft = await SimpleNFT.deploy(...deploymentArgs, config.gasOptions);
    await nft.waitForDeployment();
    const contractAddress = nft.target;
    console.log(`${config.contractName} deployed to:`, contractAddress);
    console.log("Transaction hash:", nft.deploymentTransaction()?.hash || "N/A");

    // Save deployment artifacts
    const artifacts = {
      contractName: config.contractName,
      contractAddress,
      deployer: deployer.address,
      network: networkName,
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      args: deploymentArgs,
    };
    const artifactsPath = path.join(__dirname, `../artifacts/deployment-${networkName}.json`);
    await fs.writeFile(artifactsPath, JSON.stringify(artifacts, null, 2));
    console.log("Deployment artifacts saved to:", artifactsPath);

    // Automatic verification
    if (config.autoVerify && networkName !== "localhost" && networkName !== "hardhat") {
      console.log("Verifying contract on block explorer...");
      try {
        await run("verify:verify", {
          address: contractAddress,
          constructorArguments: deploymentArgs,
          contract: `contracts/${config.contractName}.sol:${config.contractName}`,
        });
        console.log("Contract verified successfully");
      } catch (error) {
        console.error("Verification failed:", error.message);
      }
    } else {
      console.log("\nTo verify on block explorer:");
      console.log(
        `npx hardhat verify --network ${networkName} ${contractAddress} "${config.name}" "${config.symbol}" "${config.baseUri}" "${config.initialOwner}"`
      );
    }

    // Batch mint NFTs
    const mintRecipient = config.mint.recipient || deployer.address;
    console.log(`Minting ${config.mint.count} NFT(s) to:`, mintRecipient);
    for (let i = 0; i < config.mint.count; i++) {
      const mintTx = await nft.safeMint(mintRecipient);
      const receipt = await mintTx.wait();
      const tokenId = receipt.logs
        .filter((log) => log.topics[0] === ethers.id("Transfer(address,address,uint256)"))
        .map((log) => ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.topics[3])[0])[0];
      console.log(`Minted NFT with tokenId ${tokenId} (Metadata URL: ${config.baseUri}${tokenId})`);
    }

    // Verify Transfer event
    const filter = nft.filters.Transfer(null, mintRecipient, null);
    const events = await nft.queryFilter(filter, artifacts.blockNumber);
    console.log(`Verified ${events.length} Transfer events emitted`);

    console.log("\nDeployment and minting completed successfully");
    console.log("Summary:", artifacts);
  } catch (error) {
    console.error("Deployment failed:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    process.exitCode = 1;
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script execution failed:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    process.exit(1);
  });
