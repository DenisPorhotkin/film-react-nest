import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should output valid JSON with level and message', () => {
    const message = 'Hello';
    logger.log(message);
    const call = consoleLogSpy.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed.level).toBe('log');
    expect(parsed.message).toBe(message);
  });

  it('should include optional parameters', () => {
    const message = 'Error';
    const param = { detail: 'something' };
    logger.error(message, param);
    const call = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed.optionalParams).toEqual([param]);
  });
});
