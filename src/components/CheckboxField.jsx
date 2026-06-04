import { Fragment, h } from "../vendor/preact/preact.module.js";

const checkboxFieldStyles = `
.px-checkbox-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.px-checkbox-field__control {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--brand-blue);
}
`;

export function CheckboxField({ id, checked, onChange, label, className }) {
  const mergedClassName = `px-checkbox-field${className ? ` ${className}` : ""}`;

  return (
    <Fragment>
      <style>{checkboxFieldStyles}</style>
      <label className={mergedClassName}>
        <input
          className="px-checkbox-field__control"
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span className="px-checkbox-field__label">{label}</span>
      </label>
    </Fragment>
  );
}
