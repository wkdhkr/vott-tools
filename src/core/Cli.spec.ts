import Cli, { default as Subject } from "./Cli";

describe(Subject.name, () => {
  let subject: Cli;
  beforeEach(() => {
    subject = new Subject();
  });
  it("parseArgs", async () => {
    expect(await subject.parseArgs()).toMatchObject({ logConfig: true });
  });
});
