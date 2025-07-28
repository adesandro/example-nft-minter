// scripts/deploy.js

require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting SimpleNFT deployment...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Verify environment variable NEXT_PUBLIC_API_URL is set
    const apiUrl = process.env.NEXT_PUBLIC_URL;
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_URL environment variable is not set");
    }

    // Ensure base URI ends with a slash + metadata path
    const baseUri = apiUrl.replace(/\/$/, "") + "/api/metadata/";
    console.log("Using metadata base URI:", baseUri);

    // Get the contract factory for SimpleNFT (name must match your contract)
    const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
    console.log("Contract factory initialized");

    // Deploy the contract with name, symbol, baseURI, and initialOwner
    const nft = await SimpleNFT.deploy(
      "Nexus NFT Collection", // name
      "NNFT",                // symbol
      baseUri,               // baseTokenURI
      deployer.address       // initial owner (passed to Ownable)
    );

    // Wait for deployment to be mined
    await nft.waitForDeployment();

    console.log("SimpleNFT deployed to:", nft.target);
    console.log("Transaction hash:", nft.deploymentTransaction()?.hash || "Transaction hash not available");
    // Log deployment summary
    console.log({
      contractAddress: nft.target,
      deployer: deployer.address,
      network: (await ethers.provider.getNetwork()).name,
      blockNumber: await ethers.provider.getBlockNumber(),
    });

    // Print verification command for ease of use
    console.log("\nTo verify on block explorer:");
    console.log(
      `npx hardhat verify --network nexus ${nft.address} "Nexus NFT Collection" "NNFT" "${baseUri}" "${deployer.address}"`
    );

    // Mint the first NFT token to deployer address
    const mintTx = await nft.safeMint(deployer.address);
    await mintTx.wait();

    console.log("\nFirst NFT minted to deployer");
    console.log("Metadata URL:", `${baseUri}0`);

    console.log("Deployment completed successfully");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });