# Mockup kit

Every class here is already defined in `artifact-template.html`. Do not invent new ones and do not
restyle these with inline CSS. The point is that a mockup drawn in October looks like a mockup drawn
in September.

Everything must sit inside a `.mock` wrapper. That is what locks the product's light palette on, so
a screenshot of the product does not go dark when the reader's theme does.

## The rules that matter

1. A mockup is an illustration of the idea, not a redraw of the screen. If a part of the page is not
   what the change is about, use `.sk` skeleton lines and move on.
2. Every frame carries a `.frame-label`. Before, After, or the step name.
3. Pins mark what changed and only what changed. Three pins on an After frame is a lot. Five is too
   many, and means the execution should have been two.
4. Every pin has a matching `.legend` row, in order. Pins are absolutely positioned against
   `.frame-box`. Place them last, after the frame is drawn, and use `right` or a `%` for the
   horizontal so the pin still lands on the thing it marks when the column narrows.
5. Size a `.frame-box` with `min-height`, never `height`. Boxes in a `.compare` or a `.flowstrip`
   flex to the tallest one, so a `min-height` keeps them aligned and a `height` clips them.
6. Wide things scroll inside `.flowstrip`. The page body never scrolls sideways.
7. The widget panel radius is `--r-xxl` (20px). That is the one panel radius terminal in this
   product. Never invent another.

## Pieces

| Class | What it draws |
| --- | --- |
| `.frame` + `.frame-label` + `.frame-box` | A labelled chrome box. Everything goes in one. |
| `.compare` | Before and After side by side. Stacks under 700px. |
| `.flowstrip` + `.arrow` | A row of numbered step frames with arrows between. |
| `.shell` / `.rail` / `.nav` / `.main` | The dashboard: collapsed primary rail, secondary nav, content. |
| `.pagehead` | Page title and its meta line. |
| `.card` | The white content surface inside `Subpage`. |
| `.row` / `.row.head` / `.grow` | Table rows. |
| `.btn` / `.btn.ghost` / `.seg` / `.chip` / `.bar` | Controls and status. |
| `.sk .w70 .w50 .w35` | Skeleton lines for parts you are not illustrating. |
| `.widget` / `.wtop` / `.wbody` / `.wbar` / `.bubble` / `.pill` | The agent widget. |
| `.pin` + `.legend` | Numbered change markers and their readout. |

The nav labels, in order, matching `src/app/navConfig.tsx`: Customize (Chat, Launcher), Train
(Knowledge, Skills, Escalation), Analyze (Statistics, Conversations).

Routes: `/escalation`, `/knowledge`, `/skills`, `/statistics`, `/conversations`, `/widget.html`.

## Worked example 1: a UI change, before and after

A control added to a table on `/statistics`. Copy this and change the contents.

```html
<div class="mock">
  <div class="compare">

    <div class="frame">
      <div class="frame-label">Before</div>
      <div class="frame-box" style="min-height:190px">
        <div class="shell">
          <div class="rail"></div>
          <div class="nav">
            <b>Analyze</b><i class="on">Statistics</i><i>Conversations</i>
          </div>
          <div class="main">
            <div class="pagehead"><h4>Statistics</h4><span>Last 30 days</span></div>
            <div class="card">
              <div class="row head"><span class="grow">User</span><span>Reach</span></div>
              <div class="row"><span class="grow">marie@altior.io</span><span class="chip">Reached</span></div>
              <div class="row"><span class="grow">tom@altior.io</span><span class="chip">Reached</span></div>
              <div class="row"><span class="grow">lea@northwind.co</span><span class="chip">Not reached</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="frame">
      <div class="frame-label">After</div>
      <div class="frame-box" style="min-height:190px">
        <div class="pin" style="top:56px;right:22px">1</div>
        <div class="pin" style="top:112px;left:62%">2</div>
        <div class="shell">
          <div class="rail"></div>
          <div class="nav">
            <b>Analyze</b><i class="on">Statistics</i><i>Conversations</i>
          </div>
          <div class="main">
            <div class="pagehead"><h4>Statistics</h4><span>Last 30 days</span></div>
            <div class="card">
              <div class="row" style="justify-content:flex-end">
                <span class="seg"><span>By user</span><span class="on">By company</span></span>
              </div>
              <div class="row head"><span class="grow">Company</span><span>Reach</span></div>
              <div class="row"><span class="grow">Altior</span><span class="chip ok">41 of 48 seats</span></div>
              <div class="row"><span class="grow">Northwind</span><span class="chip bad">44 of 310</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
<ol class="legend">
  <li>A By user / By company control above the table. Grouping is derived from the users already filtered.</li>
  <li>A row is now an account, and reach reads as a rate rather than a count.</li>
</ol>
```

Notes on what makes that work. The Before frame is real: it shows the thing the ticket complains
about, not an empty box. Both frames are the same height, so the eye compares them. The pins are
absolutely positioned against `.frame-box`, which is `position: relative` for exactly that.

## Worked example 2: a flow change, step by step

One frame per beat. Label each with what the user just did.

```html
<div class="mock">
  <div class="flowstrip">

    <div class="frame">
      <div class="frame-label">1 · Asks a question</div>
      <div class="frame-box" style="min-height:150px;padding:8px;background:var(--n-100)">
        <div class="widget">
          <div class="wtop">Agent</div>
          <div class="wbody">
            <div class="bubble user">How do I export my segment?</div>
          </div>
          <div class="wbar">Thinking...</div>
        </div>
      </div>
    </div>

    <div class="arrow">&rarr;</div>

    <div class="frame">
      <div class="frame-label">2 · The wait is now visible</div>
      <div class="frame-box" style="min-height:150px;padding:8px;background:var(--n-100)">
        <div class="widget">
          <div class="wtop">Agent</div>
          <div class="wbody">
            <div class="bubble user">How do I export my segment?</div>
            <div class="pill">Reading 3 sources · 6s</div>
          </div>
          <div class="wbar">Still working</div>
        </div>
      </div>
    </div>

    <div class="arrow">&rarr;</div>

    <div class="frame">
      <div class="frame-label">3 · Step fails, and says why</div>
      <div class="frame-box" style="min-height:150px;padding:8px;background:var(--n-100)">
        <div class="widget">
          <div class="wtop">Agent</div>
          <div class="wbody">
            <div class="pill bad">Stopped at "Open Segments" · no permission</div>
            <div class="bubble agent">I could not open that page. Retry, or talk to a person?</div>
          </div>
          <div class="wbar">Retry &nbsp;·&nbsp; Get a human</div>
        </div>
      </div>
    </div>

  </div>
</div>
```

Three to five frames is the working range. More than five and the flow is really two flows, which is
a grouping problem, not a drawing problem.

## Keeping this honest

The palette in `artifact-template.html` under `.mock` is copied from `src/styles/tokens.css`. If that
file changes, update the copy. A mockup drawn in last season's blue is worse than no mockup, because
it quietly reads as a design decision.
