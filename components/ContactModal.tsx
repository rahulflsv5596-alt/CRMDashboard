export default function ContactModal() {
  return (
    <div className="modal-overlay" id="contact-modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title" id="modal-title">New Contact</div>
          <button className="modal-close" id="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-field full">
              <label>Name *</label>
              <input type="text" id="cf-name" placeholder="Jane Smith" />
            </div>
            <div className="form-field">
              <label>Title</label>
              <input type="text" id="cf-title" placeholder="Chief Engineer" />
            </div>
            <div className="form-field">
              <label>Organization</label>
              <input type="text" id="cf-org" placeholder="Acme Infrastructure" />
            </div>
            <div className="form-field">
              <label>State / Territory *</label>
              <select id="cf-state"></select>
            </div>
            <div className="form-field">
              <label>Category</label>
              <select id="cf-category" defaultValue="State DOT Leadership">
                <option>State DOT Leadership</option>
                <option>State DOT Staff</option>
                <option>District Engineer</option>
                <option>County / Local Official</option>
                <option>Elected Official</option>
                <option>MPO / Transit Agency</option>
                <option>Contractor</option>
                <option>Consultant / Engineering Firm</option>
                <option>Industry Association</option>
                <option>Media / Analyst</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>Influence</label>
              <select id="cf-influence" defaultValue="Medium">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="form-field">
              <label>Relationship Stage</label>
              <select id="cf-stage" defaultValue="New">
                <option>New</option>
                <option>Contacted</option>
                <option>Engaged</option>
                <option>Champion</option>
                <option>Dormant</option>
              </select>
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" id="cf-email" placeholder="jane@example.com" />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input type="tel" id="cf-phone" placeholder="(555) 123-4567" />
            </div>
            <div className="form-field full">
              <label>Tags (semicolon separated)</label>
              <input type="text" id="cf-tags" placeholder="bridge-program; key-account" />
            </div>
            <div className="form-field full">
              <label>Notes</label>
              <textarea id="cf-notes" placeholder="Context, history, preferences…"></textarea>
            </div>
            <div className="form-field">
              <label>Next Action</label>
              <input type="text" id="cf-next-action" placeholder="Send capabilities deck" />
            </div>
            <div className="form-field">
              <label>Next Action Date</label>
              <input type="date" id="cf-next-action-date" />
            </div>
          </div>
          <div className="interaction-log" id="interaction-log-section" style={{ display: 'none' }}>
            <div className="section-title" style={{ marginTop: 0 }}>Interaction Log</div>
            <div id="interaction-list"></div>
            <div className="interaction-add">
              <select id="int-type" defaultValue="Call">
                <option>Call</option>
                <option>Email</option>
                <option>Meeting</option>
                <option>Event</option>
                <option>Note</option>
              </select>
              <input type="text" id="int-note" placeholder="What happened?" />
              <button className="crm-btn" id="int-add-btn">Log</button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="crm-btn danger" id="modal-delete" style={{ display: 'none' }}>Delete</button>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button className="crm-btn" id="modal-cancel">Cancel</button>
            <button className="crm-btn primary" id="modal-save">Save Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
}
