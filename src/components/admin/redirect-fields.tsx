import { FormField, inputCls, selectCls } from './kit';

export const STATUS_OPTIONS = [
  { value: '301', label: '301 · Permanent (sent as 308)' },
  { value: '308', label: '308 · Permanent (keep method)' },
  { value: '302', label: '302 · Temporary (sent as 307)' },
  { value: '307', label: '307 · Temporary (keep method)' },
];

/** The fields saveRedirect reads, shared with the 404 log's "Create redirect". */
export function RedirectFields({ source = '', k = 'new' }: { source?: string; k?: string }) {
  return (
    <>
      <FormField
        label="From"
        htmlFor={`rf-${k}`}
        required
        help="A path on this site. A trailing slash is ignored."
      >
        <input
          id={`rf-${k}`}
          name="source"
          required
          defaultValue={source}
          placeholder="/old-url"
          className={inputCls}
        />
      </FormField>
      <FormField label="To" htmlFor={`rt-${k}`} required>
        <input
          id={`rt-${k}`}
          name="destination"
          required
          placeholder="/new-url or https://example.com/page"
          className={inputCls}
        />
      </FormField>
      <FormField label="Type" htmlFor={`rc-${k}`}>
        <select id={`rc-${k}`} name="status_code" defaultValue="301" className={selectCls}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
