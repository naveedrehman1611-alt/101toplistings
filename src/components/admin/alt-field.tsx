'use client';

import { useState } from 'react';

/**
 * The alt text box on a media card. Saves when it loses focus (or on Enter)
 * if the text changed, by submitting the surrounding updateMediaAlt form.
 * The border turns gold while the image has no alt text.
 */
export function AltField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <input
      name="alt"
      maxLength={300}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        if (value !== defaultValue) e.currentTarget.form?.requestSubmit();
      }}
      placeholder="Describe the image (alt text)"
      aria-label="Alt text"
      className="h-8 w-full rounded-md border px-2 text-[12.5px] outline-none focus:border-[#1884E7]"
      style={{ borderColor: value.trim() ? '#E2E8F0' : '#FCD34D' }}
    />
  );
}
