export default function TextInput({ className = '', ref, ...props }) {
  return <input ref={ref} className={`cdx-input ${className}`} {...props} />;
}
