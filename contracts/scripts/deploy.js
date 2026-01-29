const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying InvoiceNFT...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Read compiled artifacts
  const buildDir = path.join(__dirname, "../build");
  const abi = JSON.parse(
    fs.readFileSync(path.join(buildDir, "contracts_InvoiceNFT_sol_InvoiceNFT.abi"), "utf8")
  );
  const bytecode = "0x" + fs.readFileSync(
    path.join(buildDir, "contracts_InvoiceNFT_sol_InvoiceNFT.bin"), "utf8"
  );

  // Create contract factory and deploy
  const InvoiceNFT = new ethers.ContractFactory(abi, bytecode, deployer);
  const invoiceNFT = await InvoiceNFT.deploy();

  await invoiceNFT.waitForDeployment();

  const contractAddress = await invoiceNFT.getAddress();
  console.log("InvoiceNFT deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Deployment successful!");
    console.log("Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
