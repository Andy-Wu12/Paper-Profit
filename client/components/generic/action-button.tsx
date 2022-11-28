export type ActionButtonProps = {
  onClick: () => void,
  buttonText: string,
  className?: string
}

export default function ActionButton({onClick, buttonText, className}: ActionButtonProps): React.ReactElement {
  return (
    <>
      <button className={className} type="button" onClick={onClick}>
        {buttonText}
      </button>
    </>
  )
}