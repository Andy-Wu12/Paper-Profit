
export default function QuantityInput({id, className, defaultValue, fieldName, onChange}) {
  return (
    <>
      <input type="number" className={className} defaultValue={defaultValue}
      id={id} name={fieldName} onChange={onChange} />
    </>
  )
}