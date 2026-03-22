import { DevLogger } from './dev.logger';

describe('DevLogger', () => {
  let logger: DevLogger;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new DevLogger('TestContext');
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call process.stdout.write with formatted message', () => {
    const message = 'Test message';
    logger.log(message);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });
});
