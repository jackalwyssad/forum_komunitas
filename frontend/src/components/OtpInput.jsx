import { useState, useRef, useEffect, Fragment } from 'react';

export default function OtpInput({ value, onChange, disabled }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  useEffect(() => {
    if (!value) setOtp(['', '', '', '', '', '']);
  }, [value]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(''));

    if (val && index < 5 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', margin: '15px 0' }}>
      {otp.map((data, index) => (
        <Fragment key={index}>
          <input
            type="text"
            maxLength="1"
            ref={(el) => (inputs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            style={{
              width: '45px',
              height: '50px',
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: '600',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              background: disabled ? 'var(--bg-card)' : 'var(--bg-input)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          {index === 2 && (
            <div style={{ width: '15px', height: '3px', background: 'var(--text-muted)', borderRadius: '2px' }} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
