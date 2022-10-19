
export default function ActionButton({onClick, buttonText, className}) {
  return (
    <>
      <button className={className} type="button" onClick={onClick}>
        {buttonText}
      </button>
    </>
  )
}