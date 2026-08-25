import { appendFileSync } from 'node:fs';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter';

type DisplayStatus = 'Passed' | 'Failed' | 'Flaky' | 'Skipped';

export default class GitHubSummaryReporter implements Reporter {
  private suite?: Suite;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  onEnd(result: FullResult): void {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryPath || !this.suite) {
      return;
    }

    const tests = this.suite.allTests();
    const counts: Record<DisplayStatus, number> = {
      Passed: 0,
      Failed: 0,
      Flaky: 0,
      Skipped: 0,
    };

    const testRows = tests.map((test) => {
      const status = displayStatus(test);
      counts[status] += 1;

      const duration = test.results.reduce(
        (total, attempt) => total + attempt.duration,
        0,
      );

      return [
        test.parent.project()?.name ?? 'default',
        testTitle(test),
        status,
        formatDuration(duration),
      ];
    });

    const lines = [
      '## DemoQA test results',
      '',
      `Run status: **${capitalise(result.status)}**`,
      '',
      '| Passed | Failed | Flaky | Skipped | Total | Duration |',
      '| ---: | ---: | ---: | ---: | ---: | ---: |',
      `| ${counts.Passed} | ${counts.Failed} | ${counts.Flaky} | ${counts.Skipped} | ${tests.length} | ${formatDuration(result.duration)} |`,
      '',
      '| Project | Test | Result | Duration |',
      '| --- | --- | --- | ---: |',
      ...testRows.map(
        ([project, title, status, duration]) =>
          `| ${escapeCell(project)} | ${escapeCell(title)} | ${status} | ${duration} |`,
      ),
      '',
    ];

    appendFileSync(summaryPath, lines.join('\n'), 'utf8');
  }
}

function displayStatus(test: TestCase): DisplayStatus {
  switch (test.outcome()) {
    case 'expected':
      return 'Passed';
    case 'unexpected':
      return 'Failed';
    case 'flaky':
      return 'Flaky';
    case 'skipped':
      return 'Skipped';
  }
}

function testTitle(test: TestCase): string {
  const titles = [test.title];
  let suite: Suite | undefined = test.parent;

  while (suite?.type === 'describe') {
    titles.unshift(suite.title);
    suite = suite.parent;
  }

  return titles.join(' > ');
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) {
    return `${Math.round(milliseconds)}ms`;
  }

  return `${(milliseconds / 1_000).toFixed(1)}s`;
}

function capitalise(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
}
