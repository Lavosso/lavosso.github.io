const arkheDemo = document.querySelector('#arkhe-demo');

if (arkheDemo) {
  const scenarios = {
    focus: {
      command: 'What should I focus on today?',
      match: /\b(focus|prioriti[sz]e|priorities|today|briefing|schedule|tasks|plan my day)\b/i,
      intent: 'Build a daily briefing.',
      modules: [
        ['memory', 'Memory', 'Read the fictional workspace preferences.'],
        ['tasks', 'Task Control', 'Rank the sample tasks by deadline and impact.'],
      ],
      title: 'Daily briefing',
      summary: 'Start with the work that unblocks tomorrow’s sensor tests. Leave the afternoon open for a smaller task.',
      details: [
        ['Focus first', 'Review the sensor calibration results and flag the two outliers.'],
        ['Then', 'Write a short handoff for the fictional Field Lab project.'],
        ['Defer', 'Tidy the dashboard labels after the calibration review.'],
      ],
    },
    project: {
      command: 'Analyze this project.',
      match: /\b(analy[sz]e|analysis|repo|repository|project|files|codebase|audit)\b/i,
      intent: 'Summarize a project workspace.',
      modules: [['filesystem', 'Filesystem Context', 'Inspect the bundled sample file inventory.']],
      title: 'Project overview · Field Lab',
      summary: 'Field Lab is a fictional Python workspace for cleaning and summarizing sensor readings.',
      details: [
        ['Structure', 'src/ handles CSV ingestion and summaries. tests/ covers the parser. docs/ holds the runbook.'],
        ['Gap', 'The sample test inventory has no case for missing timestamps.'],
        ['Next step', 'Add that test and document how the parser should handle incomplete rows.'],
      ],
    },
    report: {
      command: 'Create a report.',
      match: /\b(report|document|artifact|markdown|write.?up|export)\b/i,
      intent: 'Draft a report from sample notes.',
      modules: [['artifact', 'Artifact Engine', 'Assemble a Markdown report from fictional notes.']],
      title: 'Field Lab · weekly report',
      summary: 'The sample ingestion workflow is ready for a dry run. The next milestone is validating incomplete readings.',
      details: [
        ['Progress', 'Defined the input format and prepared a fictional calibration dataset.'],
        ['Open question', 'Decide whether rows with missing timestamps should be rejected or flagged.'],
        ['Next milestone', 'Run the dry run and capture the validation findings.'],
      ],
      filename: 'arkhe-sample-field-lab-report.md',
    },
  };

  const form = arkheDemo.querySelector('form');
  const input = form.elements.command;
  const status = arkheDemo.querySelector('[data-status]');
  const trace = arkheDemo.querySelector('[data-trace]');
  const route = arkheDemo.querySelector('[data-route]');
  const core = arkheDemo.querySelector('[data-core]');
  const nodes = [...arkheDemo.querySelectorAll('[data-module]')];
  const buttons = [...form.querySelectorAll('button')];
  const result = arkheDemo.querySelector('[data-result]');
  const title = result.querySelector('[data-result-title]');
  const summary = result.querySelector('[data-result-summary]');
  const details = result.querySelector('[data-result-details]');
  const download = result.querySelector('[data-download]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeScenario;

  const pause = (milliseconds) => reducedMotion.matches
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, milliseconds));

  function addTrace(message) {
    const entry = document.createElement('li');
    entry.textContent = message;
    trace.append(entry);
  }

  async function runScenario(scenario) {
    buttons.forEach((button) => { button.disabled = true; });
    input.readOnly = true;
    result.hidden = true;
    trace.replaceChildren();
    nodes.forEach((node) => { delete node.dataset.state; });
    try {
      core.dataset.state = 'active';
      status.textContent = 'Analyzing';
      route.textContent = 'Command routed to Arkhe Core.';
      addTrace('Arkhe Core · Analyze the request.');
      await pause(420);
      addTrace(`Intent · ${scenario.intent}`);
      await pause(280);
      for (const [id, name, action] of scenario.modules) {
        const node = nodes.find((item) => item.dataset.module === id);
        status.textContent = `Running ${name}`;
        route.textContent = `Arkhe Core → ${name}`;
        node.dataset.state = 'active';
        addTrace(`${name} · ${action}`);
        await pause(590);
        node.dataset.state = 'complete';
      }
      route.textContent = `${scenario.modules.map(([, name]) => name).join(' + ')} → Arkhe Core`;
      status.textContent = 'Preparing output';
      addTrace('Arkhe Core · Assemble the simulated response.');
      await pause(360);

      title.textContent = scenario.title;
      summary.textContent = scenario.summary;
      details.replaceChildren();
      for (const [label, text] of scenario.details) {
        const pair = document.createElement('div');
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = text;
        pair.append(term, description);
        details.append(pair);
      }
      activeScenario = scenario;
      download.hidden = !scenario.filename;
      core.dataset.state = 'complete';
      result.hidden = false;
      status.textContent = 'Result ready';
    } finally {
      input.readOnly = false;
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  input.addEventListener('input', () => input.setCustomValidity(''));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.readOnly) return;

    const command = input.value.trim();
    if (!command) {
      input.setCustomValidity('Enter a command or choose an example.');
      input.reportValidity();
      return;
    }

    const scenario = [scenarios.report, scenarios.project, scenarios.focus]
      .find(({ match }) => match.test(command));
    if (scenario) {
      void runScenario(scenario);
      return;
    }

    result.hidden = true;
    delete core.dataset.state;
    nodes.forEach((node) => { delete node.dataset.state; });
    trace.replaceChildren();
    addTrace('No matching simulation. Try a daily briefing, project analysis, or report.');
    route.textContent = 'No module route selected.';
    status.textContent = 'Choose a supported scenario';
  });

  form.querySelectorAll('[data-scenario]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = scenarios[button.dataset.scenario].command;
      input.setCustomValidity('');
      input.focus({ preventScroll: true });
      form.requestSubmit();
    });
  });

  download.addEventListener('click', () => {
    if (!activeScenario?.filename) return;
    const { filename, title: heading, summary: intro, details: sections } = activeScenario;
    const markdown = [
      `# ${heading}`, '', '> ARKHE portfolio simulation. All data is fictional.', '', intro, '',
      ...sections.flatMap(([label, text]) => [`## ${label}`, '', text, '']),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  arkheDemo.querySelector('[data-workspace]').hidden = false;
}
