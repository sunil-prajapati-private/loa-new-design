export default function Section({ id, step, title, action, children }) {
  return <section className="form-section" id={id} aria-labelledby={id + "-title"}>
    <div className="section-heading"><div className="section-heading-left"><span className="section-number">{step}</span><div><h2 id={id + "-title"}>{title}</h2></div></div>{action}</div>
    <div className="section-body">{children}</div>
  </section>;
}
