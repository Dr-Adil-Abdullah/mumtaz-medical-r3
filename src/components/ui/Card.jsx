export default function Card({ children, className = '' }) {
  return <div className={`glass panel-elevated rounded-[28px] p-5 shadow-soft ${className}`}>{children}</div>;
}
