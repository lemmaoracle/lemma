import { expect } from "chai";
import { ethers } from "hardhat";
import type { LemmaRegistry } from "../typechain-types";

describe("LemmaRegistry", function () {
  let registry: LemmaRegistry;
  let issuer: any;
  let subject: any;

  const docHash = ethers.zeroPadValue(ethers.toBeHex(1), 32);
  const root = ethers.zeroPadValue(ethers.toBeHex(2), 32);
  const schemaHash = ethers.zeroPadValue(ethers.toBeHex(3), 32);
  const revocationRoot = ethers.zeroPadValue(ethers.toBeHex(4), 32);

  beforeEach(async function () {
    const [_issuer, _subject] = await ethers.getSigners();
    issuer = _issuer;
    subject = _subject;

    const Factory = await ethers.getContractFactory("LemmaRegistry");
    registry = (await Factory.deploy()) as unknown as LemmaRegistry;
  });

  it("should register a document and emit DocumentRegistered", async function () {
    await expect(
      registry.registerDocument(
        docHash,
        root,
        schemaHash,
        issuer.address,
        subject.address,
        revocationRoot,
        [],
      ),
    ).to.emit(registry, "DocumentRegistered");
  });

  it("should store provenance on-chain", async function () {
    await registry.registerDocument(
      docHash,
      root,
      schemaHash,
      issuer.address,
      subject.address,
      revocationRoot,
      [],
    );

    const prov = await registry.getDocument(docHash);
    expect(prov.docHash).to.equal(docHash);
    expect(prov.attrCommitmentRoot).to.equal(root);
    expect(prov.issuer).to.equal(issuer.address);
    expect(prov.subject).to.equal(subject.address);
  });

  it("should revert when registering duplicate docHash", async function () {
    await registry.registerDocument(
      docHash,
      root,
      schemaHash,
      issuer.address,
      subject.address,
      revocationRoot,
      [],
    );

    await expect(
      registry.registerDocument(
        docHash,
        root,
        schemaHash,
        issuer.address,
        subject.address,
        revocationRoot,
        [],
      ),
    ).to.be.revertedWithCustomError(registry, "DocumentAlreadyRegistered");
  });

  it("should revert on zero docHash", async function () {
    await expect(
      registry.registerDocument(
        ethers.ZeroHash,
        root,
        schemaHash,
        issuer.address,
        subject.address,
        revocationRoot,
        [],
      ),
    ).to.be.revertedWithCustomError(registry, "InvalidDocHash");
  });

  it("should report isRegistered correctly", async function () {
    expect(await registry.isRegistered(docHash)).to.equal(false);

    await registry.registerDocument(
      docHash,
      root,
      schemaHash,
      issuer.address,
      subject.address,
      revocationRoot,
      [],
    );

    expect(await registry.isRegistered(docHash)).to.equal(true);
  });
});
