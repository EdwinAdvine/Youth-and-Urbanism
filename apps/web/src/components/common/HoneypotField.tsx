/**
 * HoneypotField - Anti-bot honeypot input component.
 *
 * Renders a visually hidden text field that legitimate users never fill in.
 * If the field contains any value on submit, the parent form should reject
 * the submission (bot detected).
 *
 * Usage:
 *   const [honeypot, setHoneypot] = useState('');
 *   // In handleSubmit: if (honeypot) return;
 *   <HoneypotField value={honeypot} onChange={setHoneypot} />
 */
import React from 'react';

interface HoneypotFieldProps {
  value: string;
  onChange: (v: string) => void;
}

const HoneypotField: React.FC<HoneypotFieldProps> = ({ value, onChange }) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      height: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
    tabIndex={-1}
  >
    {/* Do not fill in this field */}
    <label htmlFor="website_url">Website</label>
    <input
      type="text"
      id="website_url"
      name="website_url"
      autoComplete="off"
      tabIndex={-1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default HoneypotField;
