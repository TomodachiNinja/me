const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying InvoiceNFT (standalone mode)...\n");

  // Create a local provider with a test account
  // Using a deterministic private key for demo purposes
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Try to connect to local node, fallback to in-memory wallet
  let deployer;
  try {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      deployer = await provider.getSigner(0);
    }
  } catch (e) {
    // No local node, use a wallet with test private key
    console.log("No local node found. Using in-memory deployment simulation...\n");

    // Simulate deployment with pre-computed address
    const buildDir = path.join(__dirname, "../build");
    const bytecode = fs.readFileSync(
      path.join(buildDir, "contracts_InvoiceNFT_sol_InvoiceNFT.bin"), "utf8"
    );

    // Generate deterministic contract address
    // For a fresh deployer with nonce 0, we can compute this
    const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Hardhat default
    const nonce = 0;

    const contractAddress = ethers.getCreateAddress({
      from: deployerAddress,
      nonce: nonce
    });

    console.log("Deployer address:", deployerAddress);
    console.log("Bytecode size:", bytecode.length / 2, "bytes");
    console.log("\n✅ Simulated Deployment Successful!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Contract Address:", contractAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nNote: This is a simulated address based on the default");
    console.log("Hardhat deployer account at nonce 0.");
    console.log("\nTo deploy for real, run: npx hardhat node");
    console.log("Then run this script again.");

    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      deployer: deployerAddress,
      network: "simulated",
      bytecodeSize: bytecode.length / 2,
      timestamp: new Date().toISOString(),
      note: "Simulated deployment - run with local node for real deployment"
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    return contractAddress;
  }

  console.log("Connected to local node!");
  console.log("Deploying with account:", await deployer.getAddress());

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

  console.log("\n✅ Deployment Successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: await deployer.getAddress(),
    network: (await provider.getNetwork()).name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to deployment.json");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
