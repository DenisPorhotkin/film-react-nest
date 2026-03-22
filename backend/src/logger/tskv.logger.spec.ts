import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should output TSKV format with required fields', () => {
    const message = 'Hello';
    logger.log(message);
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain('level=log');
    expect(output).toContain(`message=${message}`);
    expect(output).toContain('timestamp=');
    expect(output).toMatch(/\t/);
    expect(output).toMatch(/\n$/);
  });

  it('should include optional parameters if provided', () => {
    const message = 'Hello';
    const param = { foo: 'bar' };
    logger.log(message, param);
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain('optionalParams=');
    expect(output).toContain(JSON.stringify([param]));
  });
});