import React, { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';

const STAGES = ['Capture', 'Research', 'Planning', 'Review Gate', 'Build', 'Done'];

function stageClass(idea, index) {
  if (index < idea.stage) return 'complete';
  if (index > idea.stage) return 'pending';
  return idea.stageStatus === 'complete' ? 'complete' : idea.stageStatus === 'waiting' ? 'waiting' : 'active';
}

function IdeaCard({ idea }) {
  const { reviewIdea } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const atGate = idea.stage === 3 && idea.stageStatus === 'waiting';

  return (
    <div className={`idea-card panel ${atGate ? 'gate' : ''}`}>
      <div className="idea-head" onClick={() => setExpanded((v) => !v)}>
        <strong>{idea.title}</strong>
        <span className="muted">{new Date(idea.capturedAt).toLocaleString()}</span>
      </div>

      <div className="stage-flow">
        {STAGES.map((name, i) => (
          <React.Fragment key={name}>
            <div className={`stage-bubble ${stageClass(idea, i)}`} title={name}>
              {i === 3 ? '⭐ ' : ''}
              {name}
            </div>
            {i < STAGES.length - 1 && <span className="stage-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      {idea.research && (
        <p className="idea-meta">
          📚 {idea.research.sources} sources · 🎬 {idea.research.videos} videos — {idea.research.summary}
        </p>
      )}

      {atGate && (
        <div className="review-gate">
          <h4>⭐ REVIEW GATE — human approval required</h4>
          <pre className="plan-preview">{idea.plan}</pre>
          <div className="gate-actions">
            <button className="approve" onClick={() => reviewIdea(idea.id, true)}>
              ✓ GOOD, GO AHEAD
            </button>
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="what needs to change?"
            />
            <button className="reject" onClick={() => reviewIdea(idea.id, false, feedback)}>
              ↩ NEED CHANGES
            </button>
          </div>
        </div>
      )}

      {idea.output && (
        <p className="idea-output">
          ✓ Built → <code>{idea.output}</code>
        </p>
      )}

      {expanded && (
        <div className="idea-logs">
          <h4>BUILD LOG</h4>
          {idea.buildLog.length ? (
            <pre>{idea.buildLog.join('\n')}</pre>
          ) : (
            <p className="muted">No build activity yet.</p>
          )}
          {idea.plan && !atGate && (
            <>
              <h4>PLAN</h4>
              <pre>{idea.plan}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function IdeaPipeline() {
  const { ideas, captureIdea } = useAppState();
  const [title, setTitle] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    captureIdea(title.trim());
    setTitle('');
  }

  return (
    <div className="pipeline-layout">
      <form className="capture-zone panel" onSubmit={submit}>
        <h3>CAPTURE ZONE</h3>
        <p className="muted">
          Voice: say “capture this idea: …” in the Voice Chat tab — or type it here.
        </p>
        <div className="capture-row">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="capture this idea…"
          />
          <button type="submit">+ CAPTURE</button>
        </div>
      </form>

      <div className="idea-list">
        {ideas.length === 0 ? (
          <p className="muted">No ideas in the pipeline yet.</p>
        ) : (
          [...ideas].sort((a, b) => b.capturedAt - a.capturedAt).map((idea) => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  );
}
