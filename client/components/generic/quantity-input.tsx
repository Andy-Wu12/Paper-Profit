
export type QuantityInputProps = {
  id?: string,
  className?: string,
  defaultValue: string,
  fieldName: string,
  onChange?: () => void
}

export default function QuantityInput({id, className, defaultValue, fieldName, onChange}: QuantityInputProps) {
  return (
    <>
      <input type="number" className={className} defaultValue={defaultValue}
      id={id} name={fieldName} onChange={onChange} />
    </>
  )
}