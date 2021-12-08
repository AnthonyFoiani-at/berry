import {WritableStreamBuffer}   from 'stream-buffers';

import {Configuration}          from '../sources/Configuration';
import {StreamReport}           from '../sources/StreamReport';
import {makeIdent, makeLocator} from '../sources/structUtils';

describe(`StreamReport`, () => {
  it(`respects the 'reportCacheMissesOnlyOnce' configuration setting`, async () => {
    const configuration = await Configuration.createFakePromise();
    const ident = makeIdent(`scope`, `package`);
    const locator = makeLocator(ident, `1.0.0`);

    {
      configuration.values.set(`reportCacheMissesOnlyOnce`, true);
      const stdout = new WritableStreamBuffer();
      const streamReport = new StreamReport({configuration, stdout});

      streamReport.reportCacheMiss(locator, `foo`);
      streamReport.reportCacheMiss(locator, `bar`);
      streamReport.reportCacheMiss(locator, `foo`);

      stdout.end();
      const output = stdout.getContentsAsString();
      expect(output).toEqual([
        `➤ YN0013: foo\n`,
        `➤ YN0013: bar\n`,
      ].join(``));
    }

    {
      configuration.values.set(`reportCacheMissesOnlyOnce`, false);
      const stdout = new WritableStreamBuffer();
      const streamReport = new StreamReport({configuration, stdout});

      streamReport.reportCacheMiss(locator, `foo`);
      streamReport.reportCacheMiss(locator, `bar`);
      streamReport.reportCacheMiss(locator, `foo`);

      stdout.end();
      const output = stdout.getContentsAsString();
      expect(output).toEqual([
        `➤ YN0013: foo\n`,
        `➤ YN0013: bar\n`,
        `➤ YN0013: foo\n`,
      ].join(``));
    }
  });
});
