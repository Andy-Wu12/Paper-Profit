
export default function ActionButton({onClick, buttonText, className}) {
  return (
    <div className={className}>
      <button type="button" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  )
}