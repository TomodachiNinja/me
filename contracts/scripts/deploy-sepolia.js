const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  InvoiceNFT Sepolia Deployment");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Check for required environment variables
  if (!process.env.SEPOLIA_RPC_URL || !process.env.PRIVATE_KEY) {
    console.error("❌ Missing environment variables!");
    console.error("\nPlease create a .env file with:");
    console.error("  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY");
    console.error("  PRIVATE_KEY=your_private_key_without_0x");
    console.error("\nGet free Sepolia ETH from: https://sepoliafaucet.com");
    process.exit(1);
  }

  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Network: Sepolia (chainId: 11155111)");
  console.log("Deployer:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ No Sepolia ETH! Get some from https://sepoliafaucet.com");
    process.exit(1);
  }

  // Read compiled artifacts
  const buildDir = path.join(__dirname, "../build");
  const abi = JSON.parse(
    fs.readFileSync(path.join(buildDir, "contracts_InvoiceNFT_sol_InvoiceNFT.abi"), "utf8")
  );
  const bytecode = "0x" + fs.readFileSync(
    path.join(buildDir, "contracts_InvoiceNFT_sol_InvoiceNFT.bin"), "utf8"
  );

  console.log("Deploying InvoiceNFT...");

  // Deploy
  const InvoiceNFT = new ethers.ContractFactory(abi, bytecode, wallet);
  const invoiceNFT = await InvoiceNFT.deploy();

  console.log("Transaction hash:", invoiceNFT.deploymentTransaction().hash);
  console.log("Waiting for confirmation...\n");

  await invoiceNFT.waitForDeployment();

  const contractAddress = await invoiceNFT.getAddress();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  ✅ DEPLOYMENT SUCCESSFUL!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n  Contract Address:", contractAddress);
  console.log("  Network: Sepolia");
  console.log("  Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
  console.log("\n═══════════════════════════════════════════════════════════\n");

  // Save deployment info
  const deploymentInfo = {
    contractName: "InvoiceNFT",
    contractAddress: contractAddress,
    deployer: wallet.address,
    network: "sepolia",
    chainId: 11155111,
    txHash: invoiceNFT.deploymentTransaction().hash,
    explorerUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment-sepolia.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-sepolia.json");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error.message);
    process.exit(1);
  });
