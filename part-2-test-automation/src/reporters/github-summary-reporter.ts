import { appendFileSync } from 'node:fs';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter';

type DisplayStatus = 'Passed' | 'Failed' | 'Flaky' | 'Skipped';

interface TestRow {
  project: string;
  title: string;
  status: DisplayStatus;
  duration: number;
  error: string;
}

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

    const rows: TestRow[] = this.suite.allTests().map((test) => {
      const status = displayStatus(test);
      return {
        project: test.parent.project()?.name ?? 'default',
        title: testTitle(test),
        status,
        duration: totalDuration(test),
        error: firstErrorLine(test),
      };
    });

    const counts = {
      Passed: rows.filter((row) => row.status === 'Passed').length,
      Failed: rows.filter((row) => row.status === 'Failed').length,
      Flaky: rows.filter((row) => row.status === 'Flaky').length,
      Skipped: rows.filter((row) => row.status === 'Skipped').length,
    };

    const lines = [
      '## DemoQA test results',
      '',
      `**${counts.Passed} passed · ${counts.Failed} failed · ${counts.Flaky} flaky · ${counts.Skipped} skipped · ${formatDuration(result.duration)}**`,
      '',
    ];

    const problemRows = rows.filter(
      (row) => row.status === 'Failed' || row.status === 'Flaky',
    );

    if (problemRows.length > 0) {
      lines.push(`### Failed (${problemRows.length})`, '');
      lines.push('| Test | Project | Result | Error |');
      lines.push('| --- | --- | ---: | --- |');
      for (const row of problemRows) {
        lines.push(
          `| ${escapeCell(row.title)} | ${escapeCell(row.project)} | ${row.status} (${formatDuration(row.duration)}) | ${escapeCell(row.error)} |`,
        );
      }
      lines.push('');
    }

    const cleanRows = rows.filter(
      (row) => row.status === 'Passed' || row.status === 'Skipped',
    );

    if (cleanRows.length > 0) {
      lines.push('<details>');
      lines.push(
        `<summary>Show passing and skipped tests (${cleanRows.length})</summary>`,
      );
      lines.push('');
      const projects = [...new Set(cleanRows.map((row) => row.project))];
      for (const project of projects) {
        const projectRows = cleanRows.filter((row) => row.project === project);
        if (projectRows.length === 0) {
          continue;
        }
        lines.push(`**${project}**`, '');
        lines.push('| Test | Result |');
        lines.push('| --- | ---: |');
        for (const row of projectRows) {
          lines.push(
            `| ${escapeCell(row.title)} | ${row.status} (${formatDuration(row.duration)}) |`,
          );
        }
        lines.push('');
      }
      lines.push('</details>', '');
    }

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
function totalDuration(test: TestCase): number {
  return test.results.reduce((total, attempt) => total + attempt.duration, 0);
}

const ansiPattern =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: escape and SGR sequences must be stripped from Playwright error messages
  /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-z\d]*(?:;[-a-z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\da-pr-tzcf-nq-uy=><~]))/gi;

function firstErrorLine(test: TestCase): string {
  for (const result of test.results) {
    const message = result.error?.message;
    if (!message) {
      continue;
    }
    const firstLine =
      message
        .replace(ansiPattern, '')
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0) ?? '';
    return firstLine.length > 140 ? `${firstLine.slice(0, 137)}...` : firstLine;
  }
  return '';
}
function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1_000).toFixed(1)}s`;
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
}
